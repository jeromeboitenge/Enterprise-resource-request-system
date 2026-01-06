import { generateEmailHtml } from '../utils/email.templates';

console.log('--- Verifying OTP Email HTML ---');

const otp = '123456';
const content = `Please use the code below to complete your login:<br><br><div class="highlight-box">${otp}</div><br>This code will expire in 10 minutes.`;

const html = generateEmailHtml('Login Verification', content);

console.log(html);

if (html.includes('<div class="highlight-box">123456</div>') && html.includes('.highlight-box {')) {
    console.log('\nSUCCESS: OTP box structure and CSS found.');
} else {
    console.log('\nFAILURE: OTP box structure or CSS missing.');
}
