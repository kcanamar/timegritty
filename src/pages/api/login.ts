import { SignJWT } from "jose/jwt/sign";
import bcrypt from "bcryptjs";
import type { APIRoute } from "astro";
import { TOKEN } from "../../utils/constant.ts";
import { neon } from "@neondatabase/serverless";
// import { getErrorCode, GritError } from "../../utils/error.ts";
const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY);
const sql = neon(import.meta.env.DATABASE_URL)

export const POST: APIRoute = async ({ request, cookies, redirect, locals }) => {
	try {
		const existingSession = cookies.get(TOKEN)
		// if (existingSession) redirect("/protected")
		const data = await request.formData()
		// TODO tighter validation
		const formData = {
			email: data.get("email"),
			password: data.get("password"),
		}

		const userCheck = await sql`SELECT * FROM "user" WHERE email=${formData.email}`
		const findSession = await sql`SELECT * FROM user_sessions WHERE user_id=${userCheck[0].id}`
		if (userCheck && bcrypt.compareSync(String(formData.password), userCheck[0].password_hash)) {
			try {
				const token = await new SignJWT({})
					.setProtectedHeader({ alg: 'HS256' })
					.setIssuedAt()
					.setExpirationTime("2h")
					.sign(secret)
				// check if the auth_token is the current token
				const hasSession = findSession[0].auth_token === existingSession
				// check if today's date is less than invalid_at
				const isValid = new Date(findSession[0].invalid_at).getTime() > Date.now()
				if (isValid){
					if (hasSession) {
						// if the auth_token check is true update the invalid_at, update_at for the session information
						await sql`
							UPDATE user_sessions 
							SET invalid_at = CURRENT_TIMESTAMP + INTERVAL '30 days', updated_at = CURRENT_TIMESTAMP
							WHERE session_id = ${findSession[0].session_id}
						`
					} else {
						await sql`
							UPDATE user_sessions 
							SET invalid_at = CURRENT_TIMESTAMP + INTERVAL '30 days', updated_at = CURRENT_TIMESTAMP, auth_token = ${token}
							WHERE session_id = ${findSession[0].session_id}
						`
					}
				} else {
					await sql`
						INSERT INTO user_sessions (user_id, auth_token)
						VALUES (${userCheck[0].id}, ${token})
					`
				}
				if (userCheck[0].id) {
					// provide the current user.id to locals
					locals.authUser = userCheck[0].name
				}
				// set the cookie
				cookies.set(TOKEN, token, {
					httpOnly: true,
					path: "/",
					maxAge: 60 * 60 * 2,
				})
				return redirect("/dashboard")
			} catch (error) {
				console.debug(error);
				// TODO Return to the error page. 
				return new Response (JSON.stringify({ message: "JWT error" }), { status: 500 })
			}
		} else {
			// TODO Return to the error page
			return new Response (JSON.stringify({ message: "Invalid Email or Password, Please Try Again" }), { status: 500 })
		}
	} catch (error) {
		console.debug(error);
		// TODO Return to the error page
		return new Response (JSON.stringify({ message: "Error during login" }), { status: 500 })
	}	
}


