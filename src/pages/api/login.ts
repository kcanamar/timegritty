import bcrypt from 'bcryptjs'
import type { APIRoute } from 'astro'
import { TOKEN, pSql } from '../../utils/constant.ts'
import { createJWToken } from '../../lib/auth.ts'
import { getErrorCode, GritError } from '../../utils/error.ts'

export const POST: APIRoute = async ({
    request,
    cookies,
    redirect,
    locals,
}) => {
    try {
        console.log('here I am')
        const existingSession = cookies.get(TOKEN)
        const data = await request.formData()
        // TODO tighter validation
        const formData = {
            email: data.get('email'),
            password: data.get('password'),
        }

        const userCheck =
            await pSql`SELECT * FROM "user" WHERE email=${formData.email}`
        if (
            userCheck[0] &&
            bcrypt.compareSync(
                String(formData.password),
                userCheck[0].password_hash
            )
        ) {
            try {
                const findSession =
                    await pSql`SELECT * FROM user_sessions WHERE user_id=${userCheck[0].id}`
                const token = await createJWToken('2d')
                const hasSession =
                    findSession[0]?.auth_token === existingSession
                const isValid =
                    new Date(findSession[0]?.invalid_at).getTime() > Date.now()
                if (isValid) {
                    if (hasSession) {
                        await pSql`
							UPDATE user_sessions 
							SET invalid_at = CURRENT_TIMESTAMP + INTERVAL '30 days', updated_at = CURRENT_TIMESTAMP
							WHERE session_id = ${findSession[0].session_id}
						`
                    } else {
                        await pSql`
							UPDATE user_sessions 
							SET invalid_at = CURRENT_TIMESTAMP + INTERVAL '30 days', updated_at = CURRENT_TIMESTAMP, auth_token = ${token}
							WHERE session_id = ${findSession[0].session_id}
						`
                    }
                } else {
                    await pSql`
						INSERT INTO user_sessions (user_id, auth_token)
						VALUES (${userCheck[0].id}, ${token})
					`
                }
                if (userCheck[0].id) {
                    locals.authUser = userCheck[0].name
                }
                cookies.set(TOKEN, token, {
                    httpOnly: true,
                    path: '/',
                    maxAge: 60 * 60 * 2,
                })
                return redirect('/dashboard')
            } catch (error) {
                throw new GritError('Error with JWT', 'JWT_ERROR')
            }
        } else {
            throw new GritError('Invalid Credentials', 'INVALID_CREDS')
        }
    } catch (error) {
        console.log(error)
        const errMsg =
            error instanceof GritError ? error.message : 'UNKNOWN_ERROR'
        const errCode = getErrorCode(errMsg)
        console.log(errCode)
        return new Response(null, {
            status: 302,
            headers: {
                Location: `/error?code=${errCode}`,
            },
        })
    }
}
