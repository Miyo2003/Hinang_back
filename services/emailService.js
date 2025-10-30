// services/emailService.js
const sgMail = require('@sendgrid/mail');

console.log('[emailService] Environment Check:');
console.log('- SENDGRID_API_KEY present:', !!process.env.SENDGRID_API_KEY);
console.log('- SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL);

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}
console.log('[emailService] SendGrid client initialized:', !!process.env.SENDGRID_API_KEY);

// We don't need to create API keys since we're using an existing one
async function validateSetup() {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('[emailService] No SendGrid API key available - missing API key');
    return false;
  }

  try {
    // Test the API key by sending a test email or checking API
    console.log('[emailService] SendGrid API key validation - assuming valid if set');
    return true;
  } catch (error) {
    console.error('[emailService] API key validation failed:', error.message);
    return false;
  }
}

// Validate setup when the service initializes
validateSetup().catch(console.error);

const appBaseUrl = process.env.APP_BASE_URL || 'https://hinang-back.onrender.com';

const sendVerificationEmail = async ({ to, name = 'there', token }) => {
  console.log('[emailService] Starting email verification process');
  console.log('[emailService] SENDGRID_API_KEY present:', !!process.env.SENDGRID_API_KEY);
  console.log('[emailService] SendGrid client initialized:', !!process.env.SENDGRID_API_KEY);

  const verifyUrl = `${appBaseUrl}/auth/verify-email?token=${token}`;

  // If no SendGrid client available, return a dev fallback URL so local testing can proceed
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[emailService] SENDGRID_API_KEY missing. Skipping email send.');
    // Expose verification URL in non-production environments or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' || process.env.DEV_EMAIL_FALLBACK === 'true') {
      console.log('[emailService] Returning verification URL for local testing:', verifyUrl);
      return { fallback: true, verifyUrl };
    }
    return { fallback: true };
  }

  console.log('[emailService] Configuration:', {
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'hadjirullaalraphy@gmail.com',
    appBaseUrl: appBaseUrl
  });

  try {
    console.log('[emailService] Starting email send attempt:');
    console.log('- To:', to);
    console.log('- From:', process.env.SENDGRID_FROM_EMAIL || 'hadjirullaalraphy@gmail.com');

    // Attempt to send the email using SendGrid
    const msg = {
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL || 'hadjirullaalraphy@gmail.com',
      subject: 'Verify your email',
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Hinang, ${name}!</h2>
        <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
        <p><a href="${verifyUrl}" style="background:#1f7aec;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${verifyUrl}</p>
        <p>If you didn’t create an account, you can safely ignore this email.</p>
        <p>— The Hinang Team</p>
      </div>
    `
    };

    const result = await sgMail.send(msg);

    // Log result for easier debugging. SendGrid returns an array with send details.
    try {
      console.log(`[emailService] Verification email sent to ${to}. sendGridResult=${JSON.stringify(result)}`);
    } catch (e) {
      // If result can't be stringified, just log a simple message
      console.log(`[emailService] Verification email sent to ${to}. (result logging failed)`);
    }

    return { fallback: false, result, verifyUrl };
  } catch (err) {
    console.error('[emailService] Failed to send verification email to', to, ':', err && err.message ? err.message : err);
    // In non-production expose the verification link so developers can test flows locally
    if (process.env.NODE_ENV !== 'production' || process.env.DEV_EMAIL_FALLBACK === 'true') {
      console.warn('[emailService] Sending failed but returning verification URL for local testing:', verifyUrl);
      return { fallback: true, verifyUrl };
    }
    // Rethrow in production so the caller can surface errors
    throw err;
  }
};

const sendVerificationCodeEmail = async ({ to, name = 'there', code }) => {
  console.log('[emailService] Starting email code verification process');
  console.log('- To:', to);
  console.log('- Code:', code);

  // If no SendGrid client available, return a dev fallback
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[emailService] SENDGRID_API_KEY missing. Skipping email send.');
    return { fallback: true };
  }

  try {
    console.log('[emailService] Starting email code send attempt:');
    console.log('- To:', to);
    console.log('- From:', process.env.SENDGRID_FROM_EMAIL || 'hadjirullaalraphy@gmail.com');

    const msg = {
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL || 'hadjirullaalraphy@gmail.com',
      subject: 'Your verification code',
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Hinang, ${name}!</h2>
        <p>Thanks for signing up. Please use the following verification code to complete your registration:</p>
        <div style="background:#f4f4f4;padding:20px;border-radius:6px;text-align:center;margin:20px 0;">
          <h1 style="color:#1f7aec;font-size:32px;margin:0;">${code}</h1>
        </div>
        <p>This code will expire in 24 hours.</p>
        <p>If you didn’t create an account, you can safely ignore this email.</p>
        <p>— The Hinang Team</p>
      </div>
    `
    };

    const result = await sgMail.send(msg);

    console.log(`[emailService] Verification code email sent to ${to}. sendGridResult=${JSON.stringify(result)}`);
    return { fallback: false, result };
  } catch (err) {
    console.error('[emailService] Failed to send verification code email to', to, ':', err && err.message ? err.message : err);
    throw err;
  }
};

module.exports = {
  sendVerificationEmail,
  sendVerificationCodeEmail
};
