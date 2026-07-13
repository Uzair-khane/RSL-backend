

const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

async function sendEmail({ to, subject, html, text }) {
    if (!emailUser || !emailPass) {
        console.warn('⚠️ Email skipped: EMAIL_USER or EMAIL_PASS missing in .env');

        return {
            success: false,
            message: 'EMAIL_USER or EMAIL_PASS missing'
        };
    }

    if (!to) {
        console.warn('⚠️ Email skipped: receiver email missing');

        return {
            success: false,
            message: 'Receiver email missing'
        };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Real Smart Limousine" <${emailUser}>`,
            to,
            subject,
            text: text || '',
            html: html || text || ''
        });

        console.log(`✅ Email sent to ${to}: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('❌ Nodemailer Error:', error.message);

        return {
            success: false,
            message: error.message
        };
    }
}

module.exports = {
    sendEmail
};