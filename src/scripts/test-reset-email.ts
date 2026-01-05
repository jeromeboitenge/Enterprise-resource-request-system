
import dotenv from 'dotenv';
dotenv.config();
import { sendEmail } from '../utils/email.service';
import { getOtpTemplate } from '../utils/emailTemplates';

async function testResetEmail() {
    console.log('Testing Password Reset Email...');
    const otp = '987654';
    const email = process.env.EMAIL_USER;

    try {
        await sendEmail(
            email as string,
            'Password Reset Verification Test',
            `OTP: ${otp}`,
            getOtpTemplate(otp, 'password_reset')
        );
        console.log('Reset Password Email sent successfully!');
    } catch (error) {
        console.error('Email failed:', error);
        process.exit(1);
    }
}

testResetEmail();
