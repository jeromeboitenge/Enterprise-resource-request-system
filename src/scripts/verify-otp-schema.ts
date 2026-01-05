
import { PrismaClient } from '@prisma/client';
import { generateOTP } from '../utils/otp.utils';

// Mock sendEmail to avoid spamming real email during test or just verify via DB
// Since we can't easily mock imports in this script without jest, we will inspect the DB for OTP code.

const prisma = new PrismaClient();

async function verifyOTPFlow() {
    console.log('Starting OTP Flow Verification...');
    const timestamp = Date.now();
    const testEmail = `otp_test_${timestamp}@example.com`;
    const testPassword = 'Password123!';
    let userId: string;

    try {
        // 1. Signup (Should generate OTP)
        console.log('1. Signup...');
        // We can't call controller directly easily, so we mimic logic or check effect.
        // But verifying CONTROLLER logic requires integration test structure. 
        // I will assume controller calls service. I will check via DB after running the logic manually 
        // OR I can use the same logic here to verify my assumptions about Prisma fields works.

        // Actually, best way is to use axios/fetch against running server?
        // But I don't know if server is running.
        // I will call the functions if I export them, but they use req/res.
        // I will verify the DB schema accepts the OTP fields, which is the root dependency.

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const user = await prisma.user.create({
            data: {
                name: 'OTP Test User',
                email: testEmail,
                password: 'hashed_password_placeholder',
                role: 'employee',
                otpCode: otp,
                otpExpiresAt: otpExpiresAt
            }
        });
        userId = user.id;
        console.log('User created with OTP:', user.otpCode);

        if (!user.otpCode) throw new Error('OTP not saved during creation');

        // 2. Login Flow Simulation
        console.log('2. Login OTP Update...');
        const newOtp = generateOTP();
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                otpCode: newOtp,
                otpExpiresAt: new Date(Date.now() + 600000)
            }
        });
        console.log('User updated with Login OTP:', updatedUser.otpCode);
        if (updatedUser.otpCode === user.otpCode) throw new Error('OTP did not update');

        // 3. Verify (Clear OTP)
        console.log('3. Verify Login (Clear OTP)...');
        const verifiedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                otpCode: null,
                otpExpiresAt: null
            }
        });
        if (verifiedUser.otpCode !== null) throw new Error('OTP not cleared');
        console.log('OTP cleared successfully.');

        console.log('VERIFICATION SUCCESSFUL: Schema supports OTP fields.');

    } catch (error) {
        console.error('FAILED:', error);
        process.exit(1);
    } finally {
        if (userId!) {
            await prisma.user.delete({ where: { id: userId } });
        }
        await prisma.$disconnect();
    }
}

verifyOTPFlow();
