
export class GritError extends Error {
	code: string;
	statusCode: number;

	constructor(message: string, code: string, statusCode: number = 400) {
		super(message);
		this.code = code;
		this.statusCode = statusCode;
	}
}

export function getErrorCode(error: string): string {
	console.log(error)

	//! WHEN CREATING A NEW ERROR BE SURE TO ADD THE MAPPING
	const errMap: Record<string, string> = {
		'User Already Exists': 'USER_EXISTS',
                'Invalid Credentials': 'INVALID_CREDS',
		'Error with JWT': 'JWT_COOKIE',
                'Not Authorized': 'UNAUTORIZED'
	}
	return errMap[error] || 'UNKNOWN_ERROR'
}
