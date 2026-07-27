const fs = require('fs');
const DriverApplication = require('../../../models/driver_application');
const { sendEmail } = require('../../../helpers/sendEmail');

/* =====================================================
   ACKNOWLEDGEMENT EMAIL (agar email diya ho)
===================================================== */
async function sendAcknowledgementEmail(email, name, type) {
    const result = await sendEmail({
        to: email,
        subject: 'RSL — Application Received',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0693E3;">Real Smart Limousine</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for your ${type === 'partner' ? 'fleet partner' : 'application'} submission. Our team will review your documents and get back to you shortly.</p>
        <hr/>
        <p style="color: #999; font-size: 12px;">Real Smart Limousine — Luxury Ride Booking</p>
      </div>
    `
    });

    if (!result.success) {
        console.warn('Acknowledgement email failed: ' + result.message);
    }
}

/* =====================================================
   SUBMIT APPLICATION (Join Our Fleet / Driver Application)
===================================================== */
const applyDriver = async (req, res) => {
    try {
        const { name, email, mobile_no, cnic, application_type, vehicle } = req.body;

        if (!name || !mobile_no || !cnic) {
            return res.send({
                success: false,
                message: 'Name, mobile number and CNIC are required.'
            });
        }

        const type = application_type === 'rider' ? 'rider' : 'partner';

        if (type === 'partner' && !vehicle) {
            return res.send({
                success: false,
                message: 'Vehicle is required for fleet partner applications.'
            });
        }

        const passport = req.files?.passport;
        const license = req.files?.license;

        if (!passport || !license) {
            return res.send({
                success: false,
                message: 'Passport/Visa copy and Driver License are required.'
            });
        }

        const uploadDir = 'uploads/driver-applications/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const passportExt = passport.name.split('.').pop();
        const passportPath = `${uploadDir}passport_${Date.now()}.${passportExt}`;
        await passport.mv(passportPath);

        const licenseExt = license.name.split('.').pop();
        const licensePath = `${uploadDir}license_${Date.now()}.${licenseExt}`;
        await license.mv(licensePath);

        const application = await DriverApplication.create({
            name,
            email: email || null,
            mobile_no,
            cnic,
            application_type: type,
            vehicle: type === 'partner' ? vehicle : null,
            passport_file: passportPath,
            license_file: licensePath,
        });

        if (email) {
            try {
                await sendAcknowledgementEmail(email, name, type);
            } catch (emailErr) {
                console.warn('Email step failed, continuing: ' + emailErr.message);
            }
        }

        return res.send({
            success: true,
            message: type === 'partner'
                ? 'Your fleet partner application has been submitted successfully.'
                : 'Your application has been submitted successfully.',
            data: { id: application.id }
        });

    } catch (error) {
        return res.send({
            success: false,
            message: 'Error: ' + error.message
        });
    }
};

module.exports = { applyDriver };