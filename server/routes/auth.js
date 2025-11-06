const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');

// Get current user info
router.get('/me', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
      user: {
        id: req.user._id,
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      userId: req.userId,
      userRole: req.userRole
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info', message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'client'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Google OAuth - Get redirect URL
router.get('/google/url', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  // Frontend callback URL (not backend)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const redirectUri = `${frontendUrl}/auth/google/callback`;
  const scope = 'openid email profile';
  const responseType = 'code';
  
  if (!clientId) {
    return res.status(500).json({ error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID environment variable.' });
  }
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=${responseType}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  res.json({ authUrl });
});

// Google OAuth - Callback (Exchange code for token)
router.post('/google/callback', async (req, res) => {
  try {
    const { code, role } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUri = `${frontendUrl}/auth/google/callback`;

    // Check if credentials are configured
    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured');
      return res.status(500).json({ 
        error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
        details: {
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          frontendUrl: frontendUrl,
          redirectUri: redirectUri
        }
      });
    }

    console.log('Exchanging code for token:', {
      redirectUri: redirectUri,
      hasCode: !!code,
      codeLength: code?.length,
      clientId: clientId ? `${clientId.substring(0, 20)}...` : 'MISSING',
      hasClientSecret: !!clientSecret
    });

    // Exchange code for access token
    const tokenRequestParams = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    };

    console.log('Token request params:', {
      code: code?.substring(0, 20) + '...',
      client_id: clientId ? `${clientId.substring(0, 20)}...` : 'MISSING',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(tokenRequestParams)
    });

    let tokenData;
    try {
      const responseText = await tokenResponse.text();
      console.log('Token response status:', tokenResponse.status);
      console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));
      console.log('Token response text:', responseText);
      
      tokenData = JSON.parse(responseText);
      console.log('Token response data (parsed):', tokenData);
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse Google response', 
        details: { parseError: parseError.message }
      });
    }
    
    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', {
        status: tokenResponse.status,
        error: tokenData.error,
        error_description: tokenData.error_description,
        error_uri: tokenData.error_uri
      });
      
      let hint = 'Please check your Google OAuth configuration.';
      if (tokenData.error === 'invalid_grant') {
        hint = 'The authorization code may have expired or already been used. Please try logging in again.';
      } else if (tokenData.error === 'redirect_uri_mismatch') {
        hint = `Redirect URI mismatch. Expected: ${redirectUri}. Make sure this exact URL is added to Authorized redirect URIs in Google Cloud Console. Current redirect URIs must match exactly.`;
      } else if (tokenData.error === 'invalid_client') {
        hint = 'Invalid client credentials. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file. Make sure there are no extra spaces or characters.';
      } else if (tokenData.error_description) {
        hint = tokenData.error_description;
      }
      
      return res.status(400).json({ 
        error: 'Failed to exchange code for token', 
        details: tokenData,
        hint: hint,
        redirectUri: redirectUri,
        sentClientId: clientId ? `${clientId.substring(0, 20)}...` : 'MISSING',
        sentRedirectUri: redirectUri
      });
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const googleUser = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      return res.status(400).json({ error: 'Failed to get user info from Google' });
    }

    // Find or create user
    let user = await User.findOne({ googleId: googleUser.id });
    
    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email: googleUser.email.toLowerCase().trim() });
      
      if (user) {
        // Link Google account to existing user (if not already linked)
        if (!user.googleId) {
          user.googleId = googleUser.id;
          try {
            await user.save();
          } catch (error) {
            // If duplicate googleId error, find the user with this googleId
            if (error.code === 11000 && error.keyPattern && error.keyPattern.googleId) {
              user = await User.findOne({ googleId: googleUser.id });
              if (!user) {
                throw new Error('Failed to link Google account');
              }
            } else {
              throw error;
            }
          }
        }
      } else {
        // Create new user
        try {
          user = new User({
            name: googleUser.name,
            email: googleUser.email.toLowerCase().trim(),
            googleId: googleUser.id,
            role: role || 'client'
          });
          await user.save();
        } catch (error) {
          // If duplicate email error, user was created between our check and save
          if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            // Try to find the user again
            user = await User.findOne({ email: googleUser.email.toLowerCase().trim() });
            if (user && !user.googleId) {
              // Link Google account
              user.googleId = googleUser.id;
              await user.save();
            } else if (!user) {
              throw new Error('Failed to create user account');
            }
          } else {
            throw error;
          }
        }
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Google login failed', message: error.message });
  }
});

// Forgot Password - Request reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // In production, send email with reset link
    // For now, return the token (in production, send via email)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
    
    console.log('Password reset URL:', resetUrl); // For development only
    
    // TODO: Send email with resetUrl using nodemailer
    // For now, we'll return it in development mode
    if (process.env.NODE_ENV !== 'production') {
      res.json({ 
        message: 'Password reset token generated',
        resetUrl: resetUrl // Only in development
      });
    } else {
      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent to your email.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request', message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({ error: 'Token, email, and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password', message: error.message });
  }
});

module.exports = router;

