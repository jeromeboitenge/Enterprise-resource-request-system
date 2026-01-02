import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWT_CONFIG } from '../constants';

/**
 * Token Generation Helpers
 * 
 * Centralized JWT token generation for consistent token creation across the application.
 */

/**
 * Token payload interface
 */
interface TokenPayload {
    userId: string;
    role: string;
}

/**
 * Generate authentication JWT token
 * 
 * Creates a JWT token with user ID and role for authentication purposes.
 * Token expires based on JWT_CONFIG.DEFAULT_EXPIRES_IN setting.
 * 
 * @param userId - User's database ID
 * @param role - User's role (employee, manager, etc.)
 * @returns Signed JWT token string
 * 
 * @example
 * ```typescript
 * const token = generateAuthToken(user._id.toString(), user.role);
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * ```
 */
export const generateAuthToken = (userId: string, role: string): string => {
    const payload: TokenPayload = {
        userId,
        role
    };

    return jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn: JWT_CONFIG.DEFAULT_EXPIRES_IN }
    );
};

/**
 * Generate refresh token for token rotation
 * 
 * Creates a long-lived refresh token for implementing token rotation.
 * Expires after 7 days.
 * 
 * @param userId - User's database ID
 * @returns Signed refresh token string
 * 
 * @example
 * ```typescript
 * const refreshToken = generateRefreshToken(user._id.toString());
 * ```
 */
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId, type: 'refresh' },
        config.jwtSecret,
        { expiresIn: '7d' }
    );
};

/**
 * Generate both access and refresh tokens
 * 
 * Convenience method to generate both tokens at once.
 * 
 * @param userId - User's database ID
 * @param role - User's role
 * @returns Object containing both tokens
 * 
 * @example
 * ```typescript
 * const { accessToken, refreshToken } = generateTokenPair(
 *   user._id.toString(),
 *   user.role
 * );
 * ```
 */
export const generateTokenPair = (userId: string, role: string) => {
    return {
        accessToken: generateAuthToken(userId, role),
        refreshToken: generateRefreshToken(userId)
    };
};

/**
 * Verify and decode JWT token
 * 
 * @param token - JWT token string
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 * 
 * @example
 * ```typescript
 * try {
 *   const payload = verifyToken(token);
 *   console.log(payload.userId, payload.role);
 * } catch (error) {
 *   console.error('Invalid token');
 * }
 * ```
 */
export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
};
