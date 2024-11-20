import { SignJWT } from "jose/jwt/sign";
import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { TOKEN } from "../../utils/constant.ts";
import { neon } from "@neondatabase/serverless";
import { getErrorCode, GritError } from "./src/utils/error.ts";

const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY);
const sql = neon(import.meta.env.DATABASE_URL)

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {	
		const data = await request.formData()
		// TODO Tighter validation 
		const formData = {
			name: data.get("name"),
			email: data.get("email"),
			password: data.get("password"),
		}
		const hashedPassword = bcrypt.hashSync(String(formData.password))
		const userCheck = await sql`SELECT * FROM "user" WHERE email=${formData.email}`
		if (userCheck[0]) {
			try {
				throw new GritError('User Already Exists', 'USER_EXISTS', 409)
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
		const newUser = await sql`
			INSERT INTO "user"(id, name, email, password_hash) 
			VALUES (uuid_generate_v4(), ${formData.name}, ${formData.email}, ${hashedPassword})
			RETURNING *
		`
		// Send Verification email
		// TODO Resend for the email service, this will count as a transactional email.
		const token = await new SignJWT({})
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime("2h")
			.sign(secret)
		// Insert the newUser in to the session table with the matching token
		const sessionCheck = await sql`
			INSERT INTO user_sessions (user_id, auth_token)
			VALUES (${newUser[0].id}, ${token})
		`
		cookies.set(TOKEN, token, {
			httpOnly: true,
			path: "/",
			maxAge: 60 * 60 * 2,
		})
		return redirect("/protected")
	} catch (err) {
		console.debug(err);
		try {
			throw new GritError("Error with JWT",'JWT_COOKIE',500)
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
}

