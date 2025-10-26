// services/emailService.js
const { Resend } = require('resend');

console.log('[emailService] Environment Check:');
console.log('- RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
console.log('- RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
console.log('- Using test environment (onboarding@resend.dev):', process.env.RESEND_FROM_EMAIL?.includes('onboarding@resend.dev'));

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
console.log('[emailService] Resend client initialized:', !!resend);

// We don't need to create API keys since we're using an existing one
async function validateSetup() {
  if (!resend) {
    console.error('[emailService] No Resend client available - missing API key');
    return false;
  }
  
  try {
    // Test the API key by listing existing keys
    const keys = await resend.apiKeys.list();
    console.log('[emailService] API connection test successful. Found', keys.data?.length || 0, 'API keys');
    return true;
  } catch (error) {
    console.error('[emailService] API key validation failed:', error.message);
    return false;
  }
}

// Validate setup when the service initializes
validateSetup().catch(console.error);

const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

const sendVerificationEmail = async ({ to, name = 'there', token }) => {
  console.log('[emailService] Starting email verification process');
  console.log('[emailService] RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
  console.log('[emailService] Resend client initialized:', !!resend);

  const verifyUrl = `${appBaseUrl}/verify-email?token=${token}`;

  // If no Resend client available, return a dev fallback URL so local testing can proceed
  if (!resend) {
    console.warn('[emailService] RESEND_API_KEY missing. Skipping email send.');
    // Expose verification URL in non-production environments or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' || process.env.DEV_EMAIL_FALLBACK === 'true') {
      console.log('[emailService] Returning verification URL for local testing:', verifyUrl);
      return { fallback: true, verifyUrl };
    }
    return { fallback: true };
  }

  console.log('[emailService] Configuration:', {
    fromEmail: process.env.RESEND_FROM_EMAIL || 'Hinang <no-reply@hinang.app>',
    appBaseUrl: appBaseUrl
  });

  try {
    console.log('[emailService] Starting email send attempt:');
    console.log('- To:', to);
    console.log('- From:', process.env.RESEND_FROM_EMAIL || 'Hinang <no-reply@hinang.app>');
    
    // Attempt to send the email
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Hinang <no-reply@hinang.app>',
      to,
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
    });

    // Log result for easier debugging. Resend returns an object with send details.
    try {
      console.log(`[emailService] Verification email sent to ${to}. resendResult=${JSON.stringify(result)}`);
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

  // If no Resend client available, return a dev fallback
  if (!resend) {
    console.warn('[emailService] RESEND_API_KEY missing. Skipping email send.');
    return { fallback: true };
  }

  try {
    console.log('[emailService] Starting email code send attempt:');
    console.log('- To:', to);
    console.log('- From:', process.env.RESEND_FROM_EMAIL || 'Hinang <no-reply@hinang.app>');
    
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Hinang <no-reply@hinang.app>',
      to,
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
    });

    console.log(`[emailService] Verification code email sent to ${to}. resendResult=${JSON.stringify(result)}`);
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
