/**
 * User Data Helpers
 * 
 * Utilities for sanitizing and formatting user data to prevent sensitive information exposure.
 */

/**
 * Fields to exclude from user responses
 */
const SENSITIVE_USER_FIELDS = [
    'password',
    'loginAttempts',
    'lockUntil',
    'refreshToken',
    '__v'
] as const;

/**
 * Sanitize user data by removing sensitive fields
 * 
 * Removes password, login attempts, lock information, and other sensitive data
 * before sending user objects in API responses.
 * 
 * @param user - User document or plain object
 * @returns Sanitized user object without sensitive fields
 * 
 * @example
 * ```typescript
 * const user = await User.findById(id);
 * const safeUser = sanitizeUserData(user);
 * // safeUser does not contain password, loginAttempts, etc.
 * ```
 */
export const sanitizeUserData = (user: any) => {
    if (!user) return null;

    // Convert Mongoose document to plain object if needed
    const userObj = user.toObject ? user.toObject() : { ...user };

    // Remove sensitive fields
    SENSITIVE_USER_FIELDS.forEach(field => {
        delete userObj[field];
    });

    return userObj;
};

/**
 * Sanitize an array of user documents
 * 
 * @param users - Array of user documents
 * @returns Array of sanitized user objects
 * 
 * @example
 * ```typescript
 * const users = await User.find();
 * const safeUsers = sanitizeUserArray(users);
 * ```
 */
export const sanitizeUserArray = (users: any[]) => {
    if (!Array.isArray(users)) return [];
    return users.map(sanitizeUserData).filter(Boolean);
};

/**
 * Extract specific user fields for responses
 * 
 * Returns only the specified fields from a user object.
 * Useful for creating minimal user representations.
 * 
 * @param user - User document or object
 * @param fields - Array of field names to include
 * @returns Object with only specified fields
 * 
 * @example
 * ```typescript
 * const minimalUser = extractUserFields(user, ['_id', 'name', 'email']);
 * // Returns: { _id: '...', name: 'John', email: 'john@example.com' }
 * ```
 */
export const extractUserFields = (user: any, fields: string[]) => {
    if (!user) return null;

    const userObj = user.toObject ? user.toObject() : user;
    const extracted: any = {};

    fields.forEach(field => {
        if (userObj[field] !== undefined) {
            extracted[field] = userObj[field];
        }
    });

    return extracted;
};

/**
 * Format user for authentication response
 * 
 * Returns user data suitable for login/register responses.
 * Includes essential fields but excludes sensitive information.
 * 
 * @param user - User document
 * @returns Formatted user object for auth responses
 * 
 * @example
 * ```typescript
 * const authUser = formatUserForAuth(user);
 * return { user: authUser, token };
 * ```
 */
export const formatUserForAuth = (user: any) => {
    return extractUserFields(user, [
        '_id',
        'name',
        'email',
        'role',
        'department',
        'isActive',
        'lastLogin',
        'createdAt',
        'updatedAt'
    ]);
};

/**
 * Format user for public profile
 * 
 * Returns minimal user data for public display (e.g., in comments, approvals).
 * 
 * @param user - User document
 * @returns Minimal user object
 * 
 * @example
 * ```typescript
 * const publicUser = formatUserForPublic(user);
 * // Returns: { _id: '...', name: 'John Doe', role: 'manager' }
 * ```
 */
export const formatUserForPublic = (user: any) => {
    return extractUserFields(user, [
        '_id',
        'name',
        'email',
        'role'
    ]);
};
