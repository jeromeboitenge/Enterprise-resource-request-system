
import dotenv from 'dotenv';
dotenv.config();
import { sendEmail } from '../utils/email.service';

async function testEmail() {
    console.log('Testing Email Sending...');
    console.log('User:', process.env.EMAIL_USER);


    try {
        await sendEmail(
            process.env.EMAIL_USER as string,
            'Test Email from R2P',
            'This is a test email to verify credentials.'
        );
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Email failed:', error);
        process.exit(1);
    }
}

testEmail();
