import type { APIRoute } from "astro";
import { TOKEN } from "../../utils/constant.ts";

export const POST: APIRoute = async ({ cookies, redirect }) => {
	try {
		cookies.set(TOKEN, "", {
			httpOnly: true,
			maxAge: 0,
			path: "/",
		})
		return redirect("/") 
	} catch (err) {
		console.debug(err);

		// TODO Return to the login page with the following message for the login astro component
		return new Response(JSON.stringify({ message: "Logout fail"}), { status: 500 })
	}
}
