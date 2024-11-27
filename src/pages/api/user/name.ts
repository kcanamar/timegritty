// dependencies
import type { APIRoute } from "astro"; 
import { getErrorCode, GritError } from "../../../utils/error";
import { pSql } from "../../../utils/constant";

export const POST: APIRoute = async ({request, locals, redirect}) => {
  try {
    const body = await request.formData()
    console.log('Here we are in the api', {body, locals})
    if (!locals.authUser.id) {
      throw new GritError("There is not user_id provided to the api", "API_ERROR")
    }

    try {
      const nameUpdate = body.get('nameUpdate')
      if (!nameUpdate) {
        throw new GritError("No name update provided", "API_ERROR")
      }
      const updateUserName = await pSql`
        UPDATE "user" SET name=${nameUpdate} 
        WHERE id=${locals.authUser.id}
        RETURNING *
        ` 
      console.log(updateUserName)
      if(!updateUserName) {
        throw new GritError("There was an issue with updating the username with postgres", "API_ERROR")
      }

      return redirect("/settings", 302) 
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