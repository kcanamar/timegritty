export class GritError extends Error {
    code: string
    statusCode: number

    constructor(message: string, code: string, statusCode: number = 400) {
        super(message)
        this.code = code
        this.statusCode = statusCode
    }
}

export function getErrorCode(error: string): string {
    console.log(error)

    //! WHEN CREATING A NEW ERROR BE SURE TO ADD THE MAPPING
    const errMap: Record<string, string> = {
        'User Already Exists': 'USER_EXISTS',
        'Invalid Credentials': 'INVALID_CREDS',
        'Error with JWT': 'JWT_COOKIE',
        'Not Authorized': 'UNAUTHORIZED',
        'Neon Issue': 'NEON_CRIT',
        'Uh uh uhh': 'THE_MAGIC_WORD',
    }
    return errMap[error] || 'UNKNOWN_ERROR'
}

//! WHEN CREATING A NEW ERROR BE SURE TO ADD THE MAPPING
export const errMessages: Record<
    string,
    { title: string; description: string }
> = {
    USER_EXISTS: {
        title: 'User Already Exists',
        description:
            'An account with this email already exists. Please try logging in instead.',
    },
    INVALID_CREDS: {
        title: 'Invalid Credentials',
        description:
            'The provided credentials are incorrect. Please try again.',
    },
    JWT_COOKIE: {
        title: 'Error with JWT',
        description:
            'The provided credentials are incorrect. Please try again.',
    },
    THE_MAGIC_WORD: {
        title: 'Uh uh uhh',
        description: 'You didn&rsquo; say the magic word',
    },
    UNAUTHORIZED: {
        title: 'Not Authorized',
        description: 'You do not have permission to perform that action.',
    },
    UNKNOWN_ERROR: {
        title: 'Something Went Wrong',
        description: 'An unexpected error occurred. Please try again later.',
    },
}
