// Email template for password reset
const generatePasswordResetEmail = (name, resetUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - RMT Medical Store</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #036372 0%, #1fa9be 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header .subtitle {
            margin-top: 8px;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #036372;
            font-weight: 500;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #036372 0%, #1fa9be 100%);
            color: white;
            text-decoration: none;
            padding: 15px 35px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .security-note {
            background: #f8f9fa;
            border-left: 4px solid #1fa9be;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .security-note h4 {
            margin: 0 0 8px 0;
            color: #036372;
            font-size: 14px;
            font-weight: 600;
        }
        .security-note p {
            margin: 0;
            font-size: 13px;
            color: #666;
        }
        .footer {
            background: #f8f9fa;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #eee;
        }
        .footer p {
            margin: 5px 0;
            font-size: 13px;
            color: #666;
        }
        .link-backup {
            background: #f8f9fa;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .link-backup p {
            margin: 5px 0;
            font-size: 13px;
            color: #666;
        }
        .link-backup code {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            word-break: break-all;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 0;
            }
            .content {
                padding: 25px 20px;
            }
            .header {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
            <div class="subtitle">Secure your RMT Medical Store account</div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${name},</div>
            
            <div class="message">
                We received a request to reset your password for your RMT Medical Store account. 
                No worries - this happens to the best of us! Click the button below to create a new password.
            </div>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="cta-button">Reset My Password</a>
            </div>
            
            <div class="security-note">
                <h4>🛡️ Security Information</h4>
                <p>This password reset link will expire in <strong>15 minutes</strong> for your security. If you didn't request this reset, please ignore this email or contact our support team.</p>
            </div>
            
            <div class="link-backup">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <code>${resetUrl}</code>
            </div>
            
            <div class="message">
                <p><strong>Why am I receiving this?</strong><br>
                Someone (hopefully you) requested a password reset for the email address ${name.toLowerCase().includes('@') ? name : 'associated with this account'}. 
                If this wasn't you, please secure your account by contacting us immediately.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>RMT Medical Store</strong></p>
            <p>Your trusted healthcare partner since 2005</p>
            <p style="margin-top: 15px;">📧 Contact us: rmtmedical2005@gmail.com</p>
            <p>🔒 This email was sent securely. Never share your password with anyone.</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Plain text version for email clients that don't support HTML
const generatePasswordResetText = (name, resetUrl) => {
  return `
Password Reset - RMT Medical Store

Hello ${name},

We received a request to reset your password for your RMT Medical Store account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 15 minutes for your security.

If you didn't request this password reset, please ignore this email or contact our support team.

Security Information:
- This link can only be used once
- The link will expire in 15 minutes
- Never share your password with anyone

Contact us: rmtmedical2005@gmail.com

Best regards,
RMT Medical Store Team
Your trusted healthcare partner since 2005
  `;
};

module.exports = {
  generatePasswordResetEmail,
  generatePasswordResetText
};