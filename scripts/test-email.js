require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const testEmail = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    return;
  }

  console.log('📧 Testing email send with:');
  console.log('API Key:', process.env.RESEND_API_KEY.substring(0, 8) + '...');
  console.log('From:', process.env.RESEND_FROM_EMAIL);

  sgMail.setApiKey(process.env.RESEND_API_KEY);

  try {
    // Replace this with your email address that you used to sign up for SendGrid
    // or an email you've added as a test email in SendGrid dashboard
    const TEST_EMAIL = 'miyoaydol@gmail.com'; // <-- Change this!

    const msg = {
      to: TEST_EMAIL,
      from: process.env.RESEND_FROM_EMAIL || 'hadjirullaalraphy@gmail.com',
      subject: 'Test Email from Hinang',
      html: '<p>If you see this, email sending is working! 🎉</p>'
    };

    const result = await sgMail.send(msg);

    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    if (error.message.includes('unauthorized')) {
      console.log('\n💡 Tips:');
      console.log('1. Check if your RESEND_API_KEY is correct');
      console.log('2. Make sure the recipient email is either:');
      console.log('   - The email you used to sign up for SendGrid');
      console.log('   - Added as a test email in your SendGrid dashboard');
      console.log('3. Or verify your domain in SendGrid dashboard to send to any email');
    }
  }
};

testEmail();
