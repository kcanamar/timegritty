import { errors, jwtVerify } from "jose";
import { defineMiddleware } from "astro:middleware";
import { TOKEN, PUBLIC_ROUTES } from "./utils/constant.ts";
import { neon } from "@neondatabase/serverless";

const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY);
const sql = neon(import.meta.env.DATABASE_URL);

const verifyAuth = async (token?: string) => {
  if (!token) {
    return {
      status: "unauthorized",
      msg: "provide a request token"
    } as const;
  }

  try {
    const jwtVerifyResult = await jwtVerify(token, secret);
    return {
      status: "authorized",
      payload: jwtVerifyResult.payload,
      msg: "verification success: auth token"
    } as const;
  } catch (err) {
    if (err instanceof errors.JOSEError) {
      return { status: "error", msg: err.message } as const;
    }

    console.debug(err);
    return { status: "error", msg: "could not validate auth token"}
  }
}

export const onRequest = defineMiddleware(async ({cookies, url, locals}, next) => {
  if (PUBLIC_ROUTES.includes(url.pathname)) return next();

  const token = cookies.get(TOKEN);
  const validationResult = await verifyAuth(token?.value);

  switch (validationResult.status) {
    case "authorized":
      // check the db for the current user session
      // need to break this up into two steps to check at each step if the USER has a current session
      try {
        const session = await sql`SELECT * FROM user_sessions WHERE auth_token = ${token.value}`
        const user = await sql`SELECT u.name FROM "user" u WHERE u.id = ${session[0].user_id}`;
        if (user) {
          // provide the current user.id to locals
          locals.authUser = user[0].name
        }
      } catch (error) {
        
      }
      return next();

    case "error":
    case "unauthorized":
      if (url.pathname.includes("/api/")) {
        return new Response(JSON.stringify({ message: validationResult.msg }), { 
          status: 401 
        })
      }
      else {
        console.log("else", url.pathname)
        return Response.redirect(new URL("/", url));
      }

    default:
      return Response.redirect(new URL("/", url));
  }
})
