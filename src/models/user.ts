import { prisma } from '@/prisma'
import { Organization, Prisma, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { createSession } from './session'
import { getPresignedUrlWithClient } from './file'
import { randomUUID } from 'crypto'
import { createEmailNotification } from './notifications'

export async function inviteUser(payload: User & { imageUrl?: string; organization_id: string; team_id?: string; team_name?: string; player_id?: string; role: string }) {
    const cookieJar = await cookies()
    const created_by = cookieJar.get('user_id')?.value
    let passwd: string | undefined = undefined
    if (!created_by) {
        console.error('Unable to invite user because user_id cookie is missing')
        return
    }
    const session = await createSession(created_by)
    if (!session?.user?.first_name) {
        console.error('Unable to invite user because session does not have a first_name')
        return
    }
    let TemplateId = 39188601

    let user = await prisma.user.findUnique({
        where: {
            email: payload.email
        },
        include: {
            organizations: {
                include: {
                    organization: true
                }
            },
            team_members: {
                include: {
                    team: true
                }
            },
            players: {
                include: {
                    teams: true
                }
            },
        }
    })
    const { timezone, organization_id, team_id, team_name, role, player_id, phone, imageUrl, ...input } = payload

    if (!user?.email) {
        TemplateId = 39180237
        passwd = [
            organization_id.substring(0, 3),
            input.first_name.substring(0, 5),
            new Date().getHours()
        ].join('-')
        const hashed_password = bcrypt.hashSync(passwd, process.env.AUTH_SALT)
        let image: string | undefined = undefined
        if (imageUrl) {
            const imageType = imageUrl.split(';')[0].replace('data:', '')
            const fileExtension = `${imageType.split('/')[1].toLowerCase()}`
            if (['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)) {
                const buf = Buffer.from(imageUrl.replace(/^data:image\/\w+;base64,/, ""), 'base64')
                const Key = `users/${input.last_name}/profile-${randomUUID()}.${fileExtension}`.toLowerCase()
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
                    image = Key
                }
            }
        }

        const data = {
            ...input,
            image,
            hashed_password,
            password_reset_token: hashed_password,
            phone: phone || '',
            timezone,
        }

        await prisma.user.create({
            data
        })
        user = await prisma.user.findUnique({
            where: {
                email: payload.email
            },
            include: {
                organizations: {
                    include: {
                        organization: true
                    }
                },
                team_members: {
                    include: {
                        team: true
                    }
                },
                players: {
                    include: {
                        teams: true
                    }
                },
            }
        })
    }

    if (user && organization_id && session.user?.email) {
        const {
            organizations,
            team_members,
            user_id,
        } = user
        const orgMember = organizations
            .filter(org => Boolean(org.organization))
            .find(org => org.organization_id === organization_id)

        if (orgMember) {
            console.log('Already', ['o', 'a', 'e', 'u', 'i'].includes(orgMember.role[0].toLowerCase()) ? 'an' : 'a', orgMember.role.toLowerCase(), 'of', orgMember.organization?.name)
        } else {

            await prisma.userOrganization.create({
                data: {
                    organization_id,
                    user_id,
                    role,
                    created_by,
                }
            })
        }


        if (team_id) {
            const teamMembership = team_members
                .filter(rec => Boolean(rec.team))
                .find(rec => rec.team_id === team_id)
            if (teamMembership) {
                console.log('Already', ['o', 'a', 'e', 'u', 'i'].includes(teamMembership.role[0].toLowerCase()) ? 'an' : 'a', teamMembership.role.toLowerCase(), 'of', teamMembership.team?.name)
            } else {

                await prisma.teamMember.create({
                    data: {
                        organization_id,
                        team_id,
                        user_id,
                        role,
                        created_by,
                    }
                })
            }
        }

        if (!user_id) return

        if (TemplateId) {
            await createEmailNotification({
                sender: {
                    email: session.user.email,
                    name: [session.user.first_name, session.user.last_name].join(' '),
                },
                receiver: {
                    email: payload.email,
                    name: [payload.first_name, payload.last_name].join(' '),
                },
                TemplateId,
                TemplateModel: {
                    sender: session.user.first_name,
                    name: payload.first_name,
                    player: "your child's",
                    team: payload.team_name || "team",
                    product_name: "Club Athletix",
                    passwd,
                    action_url: `https://clubathletix.com/invitations/accept/${user_id}?team=${team_id}`
                }
            })
        }
        const team = team_id ? await prisma.team.findUnique({
            where: {
                team_id,
            }
        }) as unknown as Team : undefined
        return {
            ...user,
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

export async function resetPassword(email: string) {
    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    })
    if (user) {
        const uniqueId = randomUUID()
        const passwd = [
            user.first_name.length < 3 ? user.first_name : user.first_name.substring(0, user.first_name.length - 2),
            uniqueId.split('-').slice(1, 4).map(str => str.substring(1, 5)).join(''),
            user.last_name.substring(user.last_name.length - 3, user.last_name.length),
        ].join('-')

        const password_reset_token = bcrypt.hashSync(passwd, process.env.AUTH_SALT)
        await prisma.user.update({
            where: {
                email,
            },
            data: {
                password_reset_token,
            }
        })
        return await createEmailNotification({
            sender: {
                email: 'rey@clubathletix.com',
                name: 'Club Athletix',
            },
            receiver: {
                email,
                name: user.first_name,
            },
            TemplateId: 39191621,
            TemplateModel: {
                name: user.first_name,
                passwd,
                action_url: 'https://clubathletix.com/login',
                product_name: 'Club Athletix'
            }
        })
    }
}

export async function createTeam(payload: Prisma.TeamUncheckedCreateInput): Promise<Prisma.TeamUncheckedCreateInput | undefined> {
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