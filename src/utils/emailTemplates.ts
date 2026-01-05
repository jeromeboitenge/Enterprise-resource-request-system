
export const getOtpTemplate = (otp: string, type: 'signup' | 'login' | 'password_reset'): string => {
    let title = '';
    let message = '';

    switch (type) {
        case 'signup':
            title = 'Welcome to R2P!';
            message = 'Thank you for registering. Please use the verification code below to activate your account.';
            break;
        case 'login':
            title = 'Login Verify';
            message = 'We detected a login attempt. Use the code below to complete your login.';
            break;
        case 'password_reset':
            title = 'Password Change Request';
            message = 'You requested to change your password. Use the code below to confirm this change.';
            break;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #2c3e50;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
      text-align: center;
      color: #333333;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      color: #2c3e50;
      background-color: #f8f9fa;
      padding: 15px 30px;
      border-radius: 6px;
      border: 2px dashed #cbd5e0;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #7f8c8d;
    }
    .warning {
      color: #e74c3c;
      font-size: 13px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 1.5;">${message}</p>
      
      <div class="otp-code">${otp}</div>
      
      <p class="warning">This code will expire in 10 minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} R2P System. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;
};
