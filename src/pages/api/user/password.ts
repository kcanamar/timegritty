// dependencies
import type { APIRoute } from 'astro'
import { getErrorCode, GritError } from '../../../utils/error'
import { pSql } from '../../../utils/constant'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request, locals, redirect }) => {
    const body = await request.formData()
    if (!locals.authUser.id) {
        throw new GritError('Not Authorized', 'UNAUTHORIZED')
    }
    try {
        const currentNewPassword = {
            current: String(body.get('currentPassword')),
            newPass: String(body.get('newPassword')),
        }
        if (
            bcrypt.compareSync(
                currentNewPassword.current,
                locals.authUser.password_hash
            )
        ) {
            const newHash = bcrypt.hashSync(currentNewPassword.newPass)
            try {
                await pSql`
            UPDATE "user" 
            SET password_hash=${newHash} 
            WHERE id=${locals.authUser.id}
          `
            } catch (error) {
                throw new GritError('Neon Issue', 'NEON_CRIT')
            }
            return redirect('/settings?success=password', 302)
        } else {
            throw new GritError('Invalid Credentials', 'INVALID_CREDS')
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
