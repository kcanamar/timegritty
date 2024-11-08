import type { APIRoute } from "astro";
import { TOKEN } from "../../utils/constant.ts";

export const POST: APIRoute = async (ctx) => {
	try {
		ctx.cookies.set(TOKEN, "", {
			httpOnly: true,
			maxAge: 0,
			path: "/",
		})
		return new Response(JSON.stringify({ message: "Login success"}), { status: 200 })
	} catch (err) {
		console.debug(err);
		return new Response(JSON.stringify({ message: "Logout fail"}), { status: 500 })
	}
}
