'use server'
import { cookies } from 'next/headers'
import { prisma } from '@/prisma'
import bcrypt from 'bcryptjs'

export async function login(payload: { [k: string]: string }) {

    const hashed_password = bcrypt.hashSync(payload.password, process.env.AUTH_SALT)
    const {
        email,
    } = payload


    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    })
    const success = user ? bcrypt.compareSync(user.hashed_password, hashed_password) : false
    console.log({ success })
    if (success) {
        const hoursBeforeExpiry = 0.5
        const cookieStore = await cookies()
        Object.keys(user).forEach(name => {
            const cookie = {
                name,
                value: user[name],
                expires: new Date(Date.now() + 60 * 60 * hoursBeforeExpiry * 1000),
                path: '/',
            }
            console.log({ cookie })
            cookieStore.set(cookie)
        })
        return {
            success,
            user,
        }
    }
    return {
        success,
        ...payload
    }
}

// const user = await prisma.user.create({
//     data: {
//         email,
//         hashed_password,
//     },
// })