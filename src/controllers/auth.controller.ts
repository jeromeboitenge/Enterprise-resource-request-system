import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { generateOTP } from '../utils/otp.utils';
import { sendEmail } from '../utils/email.service';
import { getOtpTemplate } from '../utils/emailTemplates';


export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role, department } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const userDepartment = department || 'IT';

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'employee',
                department: {
                    connectOrCreate: {
                        where: { name: userDepartment },
                        create: { name: userDepartment }
                    }
                },
                otpCode: otp,
                otpExpiresAt
            }
        });

        await sendEmail(
            email,
            'Your Account Verification OTP',
            `Welcome to R2P! Your OTP code is: ${otp}`,
            getOtpTemplate(otp, 'signup')
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your OTP to login.',
            data: {
                user: {
                    id: user.id,
                    email: user.email
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email }, include: { department: true } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }



        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                otpCode: otp,
                otpExpiresAt
            }
        });

        await sendEmail(
            email,
            'Login Verification Code',
            `Your login OTP code is: ${otp}`,
            getOtpTemplate(otp, 'login')
        );

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please verify to complete login.',
            data: {
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

export const verifyLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { department: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }


        await prisma.user.update({
            where: { id: user.id },
            data: {
                otpCode: null,
                otpExpiresAt: null
            }
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department?.name,
            isActive: user.isActive
        };

        res.status(200).json({
            success: true,
            message: 'Login verified successfully',
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        const {
            password,
            otpVerified,
            otpCode,
            otpExpiresAt,
            ...userWithoutPassword
        } = user;

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body;

        if (email && email !== req.user.email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email is already in use'
                });
            }
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, email }
        });

        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { currentPassword, newPassword, otp } = req.body;

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }


        if (!otp) {
            const newOtp = generateOTP();
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    otpCode: newOtp,
                    otpExpiresAt
                }
            });

            await sendEmail(
                user.email,
                'Password Change Verification',
                `Your OTP for password change is: ${newOtp}`,
                getOtpTemplate(newOtp, 'password_reset')
            );

            return res.status(202).json({
                success: true,
                message: 'OTP sent to your email. Please include the OTP to confirm password change.',
                data: { requireOtp: true }
            });
        }


        if (user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }


        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otpCode: null,
                otpExpiresAt: null
            }
        });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User with this email does not exist'
            });
        }

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                otpCode: otp,
                otpExpiresAt,
                otpVerified: false
            }
        });

        await sendEmail(
            email,
            'Password Reset Request',
            `Your OTP for password reset is: ${otp}`,
            getOtpTemplate(otp, 'password_reset')
        );

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const verifyResetOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }


        await prisma.user.update({
            where: { id: user.id },
            data: { otpVerified: true }
        });

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        if (!user.otpVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify OTP first'
            });
        }


        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP Session expired. Please start over.'
            });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otpCode: null,
                otpExpiresAt: null,
                otpVerified: false
            }
        });

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now login.',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
