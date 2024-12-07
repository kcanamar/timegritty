import { SignJWT } from 'jose'
const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY)

/**
 * @param {String} duration
 * * If a string is passed as an argument it is resolved to a time span, and then added to the current unix timestamp and used as the claim.
 * * Format used for time span should be a number followed by a unit, such as "5 minutes" or "1 day".
 * * Valid units are:
 * * "sec", "secs", "second", "seconds", "s", "minute", "minutes", "min", "mins", "m", "hour", "hours", "hr", "hrs", "h", "day", "days", "d", "week", "weeks", "w", "year", "years", "yr", "yrs", and "y".
 * * It is not possible to specify months.
 * * 365.25 days is used as an alias for a year.
 * * If the string is suffixed with "ago", or prefixed with a "-", the resulting time span gets subtracted from the current unix timestamp.
 * * A "from now" suffix can also be used for readability when adding to the current unix timestamp.
 * @returns SignJWT
 */
export const createJWToken = async (duration: string) => {
    return await new SignJWT({})
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(duration)
        .sign(secret)
}

// export const validatePassword = async (password: string) :Promise<Boolean> => {

//   return false
// }
