/**
 * Buffer encoding dictionary
 */
export const bufferEncodings: Set<BufferEncoding> = new Set<BufferEncoding>([
	'ascii',
	'utf8',
	'utf-8',
	'utf16le',
	'ucs2',
	'ucs-2',
	'base64',
	'base64url',
	'latin1',
	'binary',
	'hex',
]);

/**
 * File system flags
 */
export const allowedFlags: Set<string> = new Set<string>([
	'r',
	'r+',
	'rs',
	'rs+',
	'w',
	'wx',
	'w+',
	'wx+',
	'a',
	'ax',
	'a+',
	'ax+',
]);
