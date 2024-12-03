// dependencies
import type { APIRoute } from "astro"; 
import { getErrorCode, GritError } from "../../../utils/error";
import { pSql } from "../../../utils/constant";

export const POST: APIRoute = async ({request, locals, redirect}) => {
  try {
    const body = await request.formData()
    if (!locals.authUser.id) {
      throw new GritError("Not Authorized", "UNAUTHORIZED")
    }
    const nameUpdate = String(body.get('nameUpdate'))
    try {
      await pSql`
        UPDATE "user" SET name=${nameUpdate} 
        WHERE id=${locals.authUser.id}
        RETURNING *
        ` 
      return redirect("/settings?success=name", 302) 
    } catch (error) {
      console.log("error name api")
      throw new GritError("Neon Issue", "NEON_CRIT")  
    }
  } catch (error) {
    const errMsg = error instanceof GritError ? error.message : 'UNKNOWN_ERROR'
    const errCode = getErrorCode(errMsg)
    return new Response(null, {
					status: 302,
					headers: {
						'Location': `/settings?code=${errCode}`
					}
    })
  }
}