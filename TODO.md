# TODO: Replace Email Verification Service with ZeroBounce

## Tasks
- [x] Update `services/emailVerificationService.js` to use ZeroBounce API instead of Abstract API
- [x] Update `.env` file to replace `ABSTRACT_API_KEY` with `ZEROBOUNCE_API_KEY`
- [x] Test the email verification functionality after changes

## Details
- Change API endpoint from Abstract API to ZeroBounce (https://api.zerobounce.net/v2/validate)
- Adjust response parsing to match ZeroBounce's response format
- Update safety checks in `isEmailSafe` method based on ZeroBounce data
- Ensure backward compatibility with existing code in `authController.js`
- Email sending (Resend) is separate and still functional
