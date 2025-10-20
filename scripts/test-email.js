require('dotenv').config();
const { Resend } = require('resend');

const testEmail = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    return;
  }

  console.log('📧 Testing email send with:');
  console.log('API Key:', process.env.RESEND_API_KEY.substring(0, 8) + '...');
  console.log('From:', process.env.RESEND_FROM_EMAIL);

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Replace this with your email address that you used to sign up for Resend
    // or an email you've added as a test email in Resend dashboard
    const TEST_EMAIL = 'your-email@example.com'; // <-- Change this!

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: TEST_EMAIL,
      subject: 'Test Email from Hinang',
      html: '<p>If you see this, email sending is working! 🎉</p>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    if (error.message.includes('unauthorized')) {
      console.log('\n💡 Tips:');
      console.log('1. Check if your RESEND_API_KEY is correct');
      console.log('2. Make sure the recipient email is either:');
      console.log('   - The email you used to sign up for Resend');
      console.log('   - Added as a test email in your Resend dashboard');
      console.log('3. Or verify your domain in Resend dashboard to send to any email');
    }
  }
};

testEmail();