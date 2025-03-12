'use server'

import { prisma } from '@/prisma'
import bcrypt from 'bcryptjs'

export async function updateAccount(data: { [k: string]: string }) {
    const user = await prisma.user.findUnique({
        where: {
            user_id: data.user_id
        }
    })
    if (user && data.password) {
        const hashed_password = bcrypt.hashSync(data.password, process.env.AUTH_SALT)
        if (user.hashed_password !== hashed_password) {
            await prisma.user.update({
                where: {
                    user_id: data.user_id
                },
                data: {
                    hashed_password,
                }
            })
        }
    }
    return user
}