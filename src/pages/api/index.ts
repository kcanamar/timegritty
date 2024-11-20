// NEON CONFIGURATION
import {neon} from "@neondatabase/serverless";
import type { APIRoute } from "astro";

export const GET:APIRoute = async ({ request }) => {
	console.log({request})
	const sql = neon(import.meta.env.DATABASE_URL);
	const response = await sql`SELECT version()`;

	return new Response(JSON.stringify(response[0]), {
		headers: { 'Content-type': 'application/json' }
	})
}
