import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWT_CONFIG } from '../constants';

interface TokenPayload {
    userId: string;
    role: string;
}

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

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId, type: 'refresh' },
        config.jwtSecret,
        { expiresIn: '7d' }
    );
};

export const generateTokenPair = (userId: string, role: string) => {
    return {
        accessToken: generateAuthToken(userId, role),
        refreshToken: generateRefreshToken(userId)
    };
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
};
