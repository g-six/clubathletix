import { createSlug } from '@/lib/string-helper'
import { getPresignedUrlWithClient } from '@/models/file'
import { createPlayer } from '@/models/player'
import { createSession } from '@/models/session'
import { prisma } from '@/prisma'
import { randomUUID } from 'crypto'
import { get } from 'http'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const created_by = cookieStore.get('user_id')?.value
  if (created_by) {
    const session = await createSession(created_by)
    return Response.json(session, {
      status: 200
    })
  }
  return Response.json({
    success: false,
    ...request,
  })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const created_by = cookieStore.get('user_id')?.value
  if (created_by) {
    let photoUrl: string | undefined = undefined
    const session = await createSession(created_by)
    if (session) {
      const { team_id, photo, jersey_number, position, ...playerInput } = await request.json()

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