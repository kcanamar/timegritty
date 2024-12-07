import { neon } from '@neondatabase/serverless'

export const TOKEN = import.meta.env.PUBLIC_TOKEN
export const PUBLIC_ROUTES = [
    '/',
    '/404',
    '/error',
    '/signup',
    '/login',
    '/api/login',
    '/api/logout',
    '/api/signup',
]

export const SECRET = import.meta.env.JWT_SECRET
export const pSql = neon(import.meta.env.DATABASE_URL)
