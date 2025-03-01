import { auth } from '@/auth'
import { createSlug } from '@/lib/string-helper'
import { getAuthForOperation } from '@/models/auth'
import { getPresignedUrlWithClient } from '@/models/file'
import { createPlayer, findPlayers } from '@/models/player'
import { getUserByEmail } from '@/models/user'
import { prisma } from '@/prisma'
import { randomUUID } from 'crypto'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(
    new URLSearchParams(url.search).entries()
  )

  const session = await auth()
  if (session?.user?.email) {
    const user = await getUserByEmail(session.user.email)
    const created_by = user?.user_id

    if (created_by && (searchParams.first_name || searchParams.last_name)) {
      const players = await findPlayers(searchParams)
      return Response.json(players, {
        status: 200
      })
    }
  }
  return Response.json({
    success: false,
    ...request,
  })

}

export async function POST(request: Request) {
  const session = await getAuthForOperation()

  if (session?.user_id) {
    const created_by = session?.user_id
    if (created_by) {
      let photoUrl: string | undefined = undefined
      const { team_id, photo, jersey_number, position, parent, ...playerInput } = await request.json()

      if (photo) {
        try {
          const imageType = photo.split(';')[0].replace('data:', '')
          const buf = Buffer.from(photo.replace(/^data:image\/\w+;base64,/, ""), 'base64')
          const Key: string = [
            createSlug(playerInput.last_name || ''),
            createSlug(playerInput.first_name || ''),
            `${randomUUID()}.${imageType.split('/')[1].toLowerCase()}`
          ].join('/')

          const putObjCommandUrl = await getPresignedUrlWithClient(Key, 'PUT')

          const uploaded = await fetch(putObjCommandUrl, {
            method: 'PUT',
            body: buf,
            headers: {
              'Content-Encoding': 'base64',
              'Content-Type': imageType
            }
          })

          if (uploaded.ok) {
            photoUrl = Key
          }

        } catch (error) {
          console.log('Error in photo')
        }
      }

      const input = {
        ...playerInput,
        photo: photoUrl,
        created_by
      }
      const player = await createPlayer(input)
      if (player) {
        if (team_id) {
          const organization = await prisma.team.findUnique({
            where: {
              team_id
            }
          })
          if (organization?.organization_id)
            await prisma.teamPlayer.create({
              data: {
                organization_id: organization?.organization_id,
                team_id,
                player_id: player.player_id,
                created_by,
                jersey_number,
                position
              }
            })
        }
        return Response.json(player, {
          status: 201
        })
      }
    }
    return Response.json(session, {
      status: 400
    })
  }
  return Response.json({
    success: false,
    ...request,
  })
}