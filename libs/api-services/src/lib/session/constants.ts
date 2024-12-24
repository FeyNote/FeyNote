/**
 * The initial length of validity for a session
 * The session will expire after this time unless extended
 */
export const SESSION_VALID_DAYS = 30;

/**
 * The total length this session can maximally be valid for if extended to it's maximum time.
 * Used to force the user to re-auth at a reasonable interval
 *
 * TODO: We should consider removing this behavior as it doesn't do anything to improve security and is a bad user experience
 */
export const SESSION_MAX_VALID_DAYS = 365;

/**
 * We will only extend a session if it expires within this many days
 * Note: This should always be less than SESSION_VALID_DAYS and EXTENDED_SESSION_VALID_DAYS
 */
export const EXTEND_IF_EXPIRES_WITHIN_DAYS = 20;

/**
 * When extending a session, it will be valid for this length
 */
export const EXTENDED_SESSION_VALID_DAYS = SESSION_VALID_DAYS;

/*
 * Password reset session validity. Should be kept very short
 */
export const PASSWORD_RESET_VALIDITY_DAYS = 1;
/*
 * We do not allow sessions included in reset emails to be extended for security reasons.
 * This noop is included for clarity
 */
export const PASSWORD_RESET_EXTENDABLE_DAYS = PASSWORD_RESET_VALIDITY_DAYS;

/**
 * The length of the token (in bytes) used for session tokens
 */
export const SESSION_TOKEN_LENGTH_BYTES = 64;
