import type { APIRoute } from 'astro'
import bcrypt from 'bcryptjs'
import { TOKEN, pSql } from '../../utils/constant.ts'
import { getErrorCode, GritError } from '../../utils/error.ts'
import { createJWToken } from '../../lib/auth.ts'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    try {
        const data = await request.formData()
        // TODO Tighter validation
        const formData = {
            name: data.get('name'),
            email: data.get('email'),
            password: data.get('password'),
        }
        const hashedPassword = bcrypt.hashSync(String(formData.password))
        const userCheck =
            await pSql`SELECT * FROM "user" WHERE email=${formData.email}`
        if (userCheck[0]) {
            try {
                throw new GritError('User Already Exists', 'USER_EXISTS', 409)
            } catch (error) {
                const errMsg =
                    error instanceof GritError ? error.message : 'UNKNOWN_ERROR'
                const errCode = getErrorCode(errMsg)

                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: `/error?code=${errCode}`,
                    },
                })
            }
        }
        const newUser = await pSql`
			INSERT INTO "user"(id, name, email, password_hash) 
			VALUES (uuid_generate_v4(), ${formData.name}, ${formData.email}, ${hashedPassword})
			RETURNING *
		`
        // Send Verification email
        // TODO Resend for the email service, this will count as a transactional email.
        const token = await createJWToken('2d')
        await pSql`
			INSERT INTO user_sessions (user_id, auth_token)
			VALUES (${newUser[0].id}, ${token})
		`
        cookies.set(TOKEN, token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 2,
        })
        return redirect('/dashboard')
    } catch (err) {
        console.debug(err)
        try {
            throw new GritError('Error with JWT', 'JWT_COOKIE', 500)
        } catch (error) {
            const errMsg =
                error instanceof GritError ? error.message : 'UNKNOWN_ERROR'
            const errCode = getErrorCode(errMsg)

            return new Response(null, {
                status: 302,
                headers: {
                    Location: `/error?code=${errCode}`,
                },
            })
        }
    }
}
