import { errors, jwtVerify } from "jose";
import { defineMiddleware } from "astro:middleware";
import { TOKEN, PUBLIC_ROUTES } from "./utils/constant.ts";
import { neon } from "@neondatabase/serverless";
import { getErrorCode, GritError } from "./utils/error.ts";

const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY);
const sql = neon(import.meta.env.DATABASE_URL);


export const verifyAuth = async (token?: string) => {
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
  const token = cookies.get(TOKEN);
  const validationResult = await verifyAuth(token?.value);

  if (PUBLIC_ROUTES.includes(url.pathname) && !token) return next();

  switch (validationResult.status) {
    case "authorized":
      // Need to handle api routes
      try {

        const session = await sql`SELECT * FROM user_sessions WHERE auth_token = ${token?.value}`
        const user = await sql`SELECT u.name, u.id, u.password_hash, u.email FROM "user" u WHERE u.id = ${session[0].user_id}`;
        if (user) {
          // provide the current user.id to locals
          locals.authUser = user[0]
        }

        return next();
      } catch (error) {
        try {
                throw new GritError("Not Authorized",'UNAUTHORIZED', 401)
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

    case "error":
    // TODO Send to the error page with validation middleware error

    case "unauthorized":
      if (url.pathname.includes("/api/")) {
        // This will be where we can extend to allow other developers to build extentions
        // future improvement
        try {
                throw new GritError("Not Authorized",'UNAUTHORIZED', 401)
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
      else {
        console.log("else", url.pathname)
        try {
                throw new GritError("Not Authorized",'UNAUTHORIZED', 401)
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

    default:
      return Response.redirect(new URL("/", url));
  }
})
