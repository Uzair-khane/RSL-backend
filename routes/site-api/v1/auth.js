const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const User = require('../../../models/user');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// OTP generate karne ka function
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email bhejna ka function
async function sendOTPEmail(email, name, otp) {
    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'RSL — Your Verification Code',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0693E3;">Real Smart Limousine</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your verification code is:</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="color: #0693E3; font-size: 40px; letter-spacing: 10px; margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you did not register on RSL, please ignore this email.</p>
            <hr/>
            <p style="color: #999; font-size: 12px;">Real Smart Limousine — Luxury Ride Booking</p>
        </div>
        `
    };
    await sgMail.send(msg);
}

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, username, email, password, mobile_no } = req.body;

        // Validation
        if (!name || !username || !email || !password) {
            return res.send({ success: false, message: 'All fields are required.' });
        }

        // Check username
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.send({ success: false, message: 'Username already taken.' });
        }

        // Check email
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.send({ success: false, message: 'Email already registered.' });
        }

        // OTP generate karo
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // User banao (is_active = 0, verify hone tak)
        const user = await User.create({
            name,
            username,
            email,
            password,
            mobile_no,
            user_type: 'user',
            register_from: 'site',
            verify_otp: otp,
            verify_token: otpExpiry.toISOString(),
            is_active: 0,
            status: 1
        });

        // Email bhejo
        await sendOTPEmail(email, name, otp);

        return res.send({
            success: true,
            message: 'Account created! Please check your email for OTP.',
            email: email
        });

    } catch (error) {
        return res.send({ success: false, message: 'Error: ' + error.message });
    }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ where: { email, isDeleted: 0 } });
        if (!user) {
            return res.send({ success: false, message: 'User not found.' });
        }

        // Already verified?
        if (user.is_active === 1) {
            return res.send({ success: false, message: 'Account already verified. Please login.' });
        }

        // OTP check
        if (user.verify_otp !== otp) {
            return res.send({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        // Expiry check
        const expiry = new Date(user.verify_token);
        if (new Date() > expiry) {
            return res.send({ success: false, message: 'OTP expired. Please register again.' });
        }

        // Account activate karo
        await user.update({
            is_active: 1,
            verify_otp: null,
            verify_token: null
        });

        // JWT token banao aur seedha login
        const token = jwt.sign(
            { id: user.id, email: user.email, type: 'customer' },
            process.env.JWT_SECRET || 'rsl_secret_key',
            { expiresIn: '7d' }
        );

        return res.send({
            success: true,
            message: 'Account verified successfully!',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                mobile_no: user.mobile_no
            }
        });

    } catch (error) {
        return res.send({ success: false, message: 'Error: ' + error.message });
    }
});

// RESEND OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email, isDeleted: 0 } });
        if (!user) {
            return res.send({ success: false, message: 'Email not found.' });
        }

        if (user.is_active === 1) {
            return res.send({ success: false, message: 'Account already verified.' });
        }

        // Naya OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({
            verify_otp: otp,
            verify_token: otpExpiry.toISOString()
        });

        await sendOTPEmail(email, user.name, otp);

        return res.send({ success: true, message: 'New OTP sent to your email.' });

    } catch (error) {
        return res.send({ success: false, message: 'Error: ' + error.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email, status: 1, isDeleted: 0 } });
        if (!user) {
            return res.send({ success: false, message: 'Email not found.' });
        }

        // Verified check
        if (user.is_active === 0) {
            return res.send({
                success: false,
                message: 'Please verify your email first.',
                needsVerification: true,
                email: email
            });
        }

        // Password check
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.send({ success: false, message: 'Wrong password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, type: 'customer' },
            process.env.JWT_SECRET || 'rsl_secret_key',
            { expiresIn: '7d' }
        );

        return res.send({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                mobile_no: user.mobile_no
            }
        });

    } catch (error) {
        return res.send({ success: false, message: 'Error: ' + error.message });
    }
});

module.exports = router;