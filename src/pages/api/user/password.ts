// dependencies
import type { APIRoute } from "astro"; 
import { getErrorCode, GritError } from "../../../utils/error";
// import { pSql } from "../../../utils/constant";

export const POST: APIRoute = async ({request, locals, redirect}) => {
  try {
    const body = await request.formData()
    console.log('Here we are in the api', {body, locals})
    if (!locals.authUser.id) {
      throw new GritError("There is not user_id provided to the api", "API_ERROR")
    }

    try {

      return redirect("/settings", 302) 
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
  } catch (error) {
    const errMsg = error instanceof GritError ? error.message : 'UNKNOWN_ERROR'
    const errCode = getErrorCode(errMsg)
    return new Response(null, {
					status: 302,
					headers: {
						'Location': `/error?code=${errCode}`
					}
        })
  }
}