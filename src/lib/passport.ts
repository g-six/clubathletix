import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import bcrypt from "bcryptjs"

// Define User Type
interface User {
    id: number
    username: string
    password: string
}

// Dummy user database (Replace this with a real DB)
const users: User[] = [
    {
        id: 1,
        username: "kaishahero",
        password: bcrypt.hashSync("whatever", 10), // Store hashed password
    },
]

// Configure Passport Local Strategy
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = users.find((user) => user.username === username)
            if (!user) return done(null, false, { message: "User not found" })

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return done(null, false, { message: "Invalid password" })

            return done(null, user)
        } catch (err) {
            return done(err)
        }
    })
)

// Serialize & Deserialize User
passport.serializeUser((user: any, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
    const user = users.find((user) => user.id === id)
    done(null, user || false)
})

export default passport