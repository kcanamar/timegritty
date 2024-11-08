import { errors, jwtVerify } from "jose";
import { defineMiddleware } from "astro:middleware";
import { TOKEN, PUBLIC_ROUTES } from "./utils/constant.ts";

const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY);

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

export const onRequest = defineMiddleware(async (context, next) => {
  if (PUBLIC_ROUTES.includes(context.url.pathname)) return next();

  const token = context.cookies.get(TOKEN);
  const validationResult = await verifyAuth(token?.value);

  switch (validationResult.status) {
    case "authorized":
      return next();

    case "error":
    case "unauthorized":
      if (context.url.pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ message: validationResult.msg }), { 
          status: 401 
        })
      }
      else {
        return Response.redirect(new URL("/", context.url));
      }

    default:
      return Response.redirect(new URL("/", context.url));
  }
})
