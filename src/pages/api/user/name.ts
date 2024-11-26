// dependencies
import type { APIRoute } from "astro"; 
import { getErrorCode, GritError } from "../../../utils/error";
import { pSql } from "../../../utils/constant";

export const PUT: APIRoute = async ({request, locals, redirect}) => {
  try {
    console.log('Here we are in the api')
    const body = await request.json()
    if (!locals.authUser.id) {
      throw new GritError("There is not user_id provided to the api", "API_ERROR")
    }

    try {
      const updateUserName = await pSql`
        UPDATE "user" SET name=${body.name} 
        WHERE id=${locals.authUser.id}
        RETURNING *
        ` 
      console.log(updateUserName)
      if(!updateUserName) {
        throw new GritError("There was an issue with updating the username with postgres", "API_ERROR")
      }

      return new Response(JSON.stringify({user: updateUserName[0]}), {
        headers: {
          'Content-Type': 'application/json',
        }
      })
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