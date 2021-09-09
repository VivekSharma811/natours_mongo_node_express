const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // Create a Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Define Email options
    const mailOptions = {
        from: 'Natours.io <natours@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.text
    }

    // Send
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;