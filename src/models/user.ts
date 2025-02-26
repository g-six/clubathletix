import { prisma } from '@/prisma'
import { Prisma, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { createSession } from './session'

export async function inviteUser(payload: User & { imageUrl?: string; organization_id: string; team_id?: string; player_id?: string; role: string }) {
    const cookieJar = await cookies()
    const created_by = cookieJar.get('user_id')?.value
    if (!created_by) {
        console.error('Unable to invite user because user_id cookie is missing')
        return
    }
    const session = await createSession(created_by)
    if (!session?.user?.first_name) {
        console.error('Unable to invite user because session does not have a first_name')
        return
    }

    const { timezone, organization_id, team_id, role, player_id, phone, imageUrl, ...input } = payload
    const passwd = [
        organization_id.substring(0, 3),
        input.first_name.substring(0, 5),
        new Date().getHours()
    ].join('-')
    const hashed_password = bcrypt.hashSync(passwd, process.env.AUTH_SALT)
    const data = {
        ...input,
        hashed_password,
        password_rest_token: hashed_password,
        phone: phone || '',
        timezone,
    }

    const user = await prisma.user.create({
        data
    })


    if (user && organization_id) {
        const team = await prisma.teamMember.create({
            data: {
                organization_id,
                team_id,
                user_id: user.user_id,
                role: role || 'Parent',
                created_by,
            } as Prisma.TeamMemberUncheckedCreateInput
        })
        const org = await prisma.userOrganization.create({
            data: {
                organization_id,
                user_id: user.user_id,
                role: role || 'Parent',
                created_by,
            } as Prisma.TeamMemberUncheckedCreateInput
        })
        const { POSTMARK_SERVER_TOKEN, POSTMARK_ENTRYPOINT, } = process.env as { [k: string]: string }
        const sender = [
            session.user.first_name || 'Club Athletix',
            session.user.last_name || ''].filter(Boolean).join(' ')
        const emailData = {
            From: 'Club Athletix <rey@clubathletix.com>',
            To: `${user.email}`,
            TemplateId: 39180237,
            TemplateModel: {
                player: "your player's",
                name: input.first_name,
                action_url: `https://clubathletix.com/invitations/accept/${user.user_id}`,
                passwd,
                product_name: 'Club Athletix',
                sender,


            }
        }
        const postMarkHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN,
        }

        const mail = await fetch(`${POSTMARK_ENTRYPOINT}/withTemplate`, {
            method: 'POST',
            headers: postMarkHeaders,
            body: JSON.stringify(emailData)
        })
        return {
            ...user,
            mail,
            role,
            team_id,
            team,
            timezone,
            player_id,
            imageUrl,
            organization_id,
        }
    }
}

export async function createTeam(payload: Prisma.TeamUncheckedCreateInput): Promise<Prisma.TeamUncheckedCreateInput | undefined> {
    console.log(payload)
    const data = await prisma.team.create({
        data: payload
    })

    if (data) {
        const {
            organization_id,
            name,
            age_group,
            division,
            league_id,
            created_by,
            team_id
        } = data

        await prisma.teamMember.create({
            data: {
                organization_id,
                team_id,
                user_id: created_by,
                role: 'owner',
                created_by,
            }
        })

        return {
            league_id,
            organization_id,
            name,
            age_group,
            division
        } as Prisma.TeamUncheckedCreateInput
    }
}

type Player = Prisma.Args<typeof prisma.player, 'create'>['data']
type TeamPlayer = Prisma.Args<typeof prisma.player, 'create'>['data']
type Team = Prisma.Args<typeof prisma.team, 'create'>['data'] & {
    players?: (TeamPlayer & { player: Player })[]
}