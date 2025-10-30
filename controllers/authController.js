// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const verificationService = require('../services/verificationService');
const emailService = require('../services/emailService');
const locationVerificationService = require('../services/locationVerificationService');
const { isFeatureEnabled } = require('../utils/featureToggle');

const sanitizeUser = (user) => {
  if (!user) return null;
  const {
    password,
    resetToken,
    resetTokenExpiresAt,
    ...safe
  } = user;
  return safe;
};

const emailVerificationService = require('../services/emailVerificationService');

const register = async (req, res) => {
  try {
    console.log('[authController] Register request body:', {
      ...req.body,
      password: req.body.password ? '[REDACTED]' : undefined
    });

    const {
      email,
      password,
      confirmPassword,
      username,  // Make sure we extract username
      firstName,
      middleName,
      familyName,
      role = 'client',
      address,
      latitude,
      longitude,
      phone,
      phoneNumber,
      gender,
      age,
      status
    } = req.body;

    // Validate required fields
    // Log what we received for required fields
    console.log('[authController] Required fields check:', {
      hasEmail: !!email,
      hasPassword: !!password,
      hasUsername: !!username
    });

    if (!email || !password || !username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and username are required',
        missingFields: {
          email: !email,
          password: !password,
          username: !username
        }
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    // Check if email already exists
    const existing = await userModel.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email is already registered' 
      });
    }

    // Check if username already exists
    const existingUsername = await userModel.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username is already taken' 
      });
    }

    // Verify email using Abstract API
    try {
      const emailVerification = await emailVerificationService.verifyEmail(email);
      
      if (!emailVerification.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email address. Please provide a valid email.',
          details: emailVerification.details.deliverability
        });
      }

      if (!emailVerificationService.isEmailSafe(emailVerification)) {
        return res.status(400).json({
          success: false,
          message: 'This email address cannot be used for registration due to security concerns.',
          details: {
            quality: emailVerification.details.quality,
            risk: emailVerification.details.risk,
            breaches: emailVerification.details.breaches
          }
        });
      }
    } catch (verificationError) {
      console.error('Email verification error:', verificationError);
      // Continue with registration if verification service is unavailable
      console.warn('Email verification service unavailable, continuing with registration');
    }

    let verifiedLocation = null;
    if (isFeatureEnabled('locationVerificationEnabled') && (address || (latitude && longitude))) {
      try {
        verifiedLocation = await locationVerificationService.verifyAddress({ address, latitude, longitude });
        if (!verifiedLocation.isValid) {
          return res.status(400).json({ success: false, message: verifiedLocation.reason || 'Invalid location provided' });
        }
      } catch (error) {
        console.warn('[authController] Location verification failed:', error.message);
        // Continue without location verification
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userPayload = {
      email,
      password: hashedPassword,
      username,  // Add username to the payload
      firstName,
      middleName,
      familyName,
      role: role || 'client',
      phoneNumber: phone || phoneNumber, // Support both phone and phoneNumber
      gender,
      age,
      status,
      emailVerified: !isFeatureEnabled('emailVerificationEnabled'),
      address: verifiedLocation?.formattedAddress || address || null,
      latitude: verifiedLocation?.latitude || latitude || null,
      longitude: verifiedLocation?.longitude || longitude || null,
      placeId: verifiedLocation?.placeId || null
    };

    console.log('[authController] Creating user with payload:', {
      ...userPayload,
      password: '[REDACTED]' // Don't log the actual password
    });
    
    const user = await userModel.createUser(userPayload);
    console.log('[authController] User created:', user);
    
    const requiresVerification = isFeatureEnabled('emailVerificationEnabled');

    console.log('[authController] Feature check - emailVerificationEnabled:', isFeatureEnabled('emailVerificationEnabled'));
    console.log('[authController] User role:', role);

    let verificationLink = null;
    let verificationCode = null;

    if (requiresVerification) {
      try {
        console.log('[authController] Creating email verification token for user:', user.id);
        const token = await verificationService.createEmailToken(user.id);
        console.log('[authController] Token created:', token);

        console.log('[authController] Attempting to send verification email to:', user.email);
        const sendResult = await emailService.sendVerificationEmail({
          to: user.email,
          name: user.firstName || user.lastName || '',
          token
        });

        // If emailService returned a dev fallback with a verifyUrl, expose it in the response
        if (sendResult && sendResult.fallback && sendResult.verifyUrl) {
          verificationLink = sendResult.verifyUrl;
          console.log('[authController] Using dev verification link:', verificationLink);
        }

        console.log('[authController] Verification email send result:', !!verificationLink);
      } catch (error) {
        console.error('[authController] Error in email verification process:', error);
        // Still create the user but log the error
      }
    } else {
      console.log('[authController] Email verification not required');
    }

    const responsePayload = {
      success: true,
      user: sanitizeUser(user),
      requiresEmailVerification: requiresVerification,
      emailVerificationStatus: requiresVerification ? 'pending' : 'verified'
    };

    if (verificationLink) {
      responsePayload.verificationLink = verificationLink;
    }

    res.status(201).json(responsePayload);
  } catch (err) {
    console.error('Error in register:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ success: false, message: 'Email, password, and username are required' });
    }

    const user = await userModel.getUserByEmail(email);
    if (!user || user.username !== username) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check email verification if feature is enabled
    if (isFeatureEnabled('emailVerificationEnabled') && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email before logging in.',
        requiresEmailVerification: true,
        email: user.email
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Shortened for security; use refresh
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1h in seconds
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { id: payload.id, role: payload.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      success: true,
      accessToken,
      expiresIn: 3600
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const user = await verificationService.consumeEmailToken(token);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
          }
          .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #28a745;
            margin-bottom: 20px;
          }
          p {
            color: #666;
            margin-bottom: 30px;
          }
          .button {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Verified Successfully!</h1>
          <p>You can close this window and login in the app.</p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error verifying email:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifyEmailCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Verification code is required' });
    }

    const user = await verificationService.consumeEmailCode(code);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('Error verifying email code:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    if (!isFeatureEnabled('emailVerificationEnabled')) {
      return res.status(400).json({ success: false, message: 'Email verification is disabled' });
    }

    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const token = await verificationService.createEmailToken(user.id);
    await emailService.sendVerificationEmail({
      to: user.email,
      name: user.firstName || user.lastName || '',
      token
    });

    res.json({ success: true, message: 'Verification email resent successfully' });
  } catch (err) {
    console.error('Error resending verification email:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  verifyEmail,
  verifyEmailCode,
  resendVerificationEmail
};
