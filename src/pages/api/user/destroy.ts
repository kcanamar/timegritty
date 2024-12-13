// dependencies
import type { APIRoute } from 'astro'
import { getErrorCode, GritError } from '../../../utils/error'
import { pSql, TOKEN } from '../../../utils/constant'

export const POST: APIRoute = async ({
    request,
    locals,
    redirect,
    cookies,
}) => {
    try {
        const body = await request.formData()
        if (!locals.authUser.id) {
            throw new GritError('Not Authorized', 'UNAUTHORIZED')
        }

        if (body.get('confirmed') === 'on') {
            cookies.set(TOKEN, '', {
                httpOnly: true,
                maxAge: 0,
                path: '/',
            })
            try {
                await pSql`
                DELETE FROM user_sessions WHERE user_id = ${locals.authUser.id};
                `
                await pSql`
                DELETE FROM "user" WHERE id = ${locals.authUser.id};
                `
                // send to thank you for using page
                return redirect('/', 302)
            } catch (error) {
                console.log(error)
                throw new GritError('Neon Issue', 'NEON_CRIT')
            }
        } else {
            throw new GritError('Uh uh uhh', 'THE_MAGIC_WORD')
        }
    } catch (error) {
        const errMsg =
            error instanceof GritError ? error.message : 'UNKNOWN_ERROR'
        const errCode = getErrorCode(errMsg)
        return new Response(null, {
            status: 302,
            headers: {
                Location: `/settings?code=${errCode}`,
            },
        })
    }
}
