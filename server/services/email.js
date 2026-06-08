import nodemailer from 'nodemailer';

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmailForVerification = async (to, token) => {
    const verifyUrl = `${CLIENT_URL}/verify-email/${token}`;

    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: "Verify your Course Manager account",
        text: `Click to verify your email: ${verifyUrl}`,
        html: `<p>Thanks for signing up.</p><p><a href="${verifyUrl}">Verify your email</a></p>`,
    });

    console.log("Message sent: %s", info.messageId);
};

export { sendEmailForVerification };
