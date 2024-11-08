import { SignJWT } from "jose/jwt/sign";
import type { APIRoute } from "astro";
import { TOKEN } from "../../utils/constant.ts";
const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY);

export const POST: APIRoute = async (ctx) => {
	try {
		const token = await new SignJWT({})
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime("2h")
			.sign(secret)
		ctx.cookies.set(TOKEN, token, {
			httpOnly: true,
			path: "/",
			maxAge: 60 * 60 * 2,
		})

		return new Response(JSON.stringify({ message: "Login successful!"}), { status: 200 })
	} catch (err) {
		console.debug(err);
		return new Response (JSON.stringify({ message: "login failed" }), { status: 500 })
	}	
}
