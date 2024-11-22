import { neon } from "@neondatabase/serverless";
 
export const TOKEN = "Bearer";
export const PUBLIC_ROUTES = ["/", "/404", "/error", "/api/login", "/api/logout", "/api/signup"];

export const SECRET = import.meta.env.JWT_SECRET
export const pSql = neon(import.meta.env.DATABASE_URL)
