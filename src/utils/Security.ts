import * as bcrypt from "bcryptjs"
import { config } from "../config";
import * as jwt from "jsonwebtoken";

export const hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, 12)

};
export interface generateTokenPayload {
    id: string,
    role: string
}
export const comparePassword = async (
    password: string, db_password: string): Promise<boolean> => {
    return bcrypt.compare(password, db_password)
}

export const generateToken = async ({ id, role }: generateTokenPayload) => {
    return jwt.sign(
        {
            sub: id,
            role,
        },
        config.jwtSecret,
        { expiresIn: "1hr" }
    );
};

export const generateOTP = (): string => {

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};
import jwt from 'jsonwebtoken';
import { config } from '../config';

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
        { expiresIn: '1d' } // 1 day expiration
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

