import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
        auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Forever" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
    } catch (err) {
        console.error("Email sending failed:", err);
        throw new Error("Failed to send email");
    }
};

export default sendEmail;
