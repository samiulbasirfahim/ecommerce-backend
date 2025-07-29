import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        type: "OAuth2",
        user: "samiulbasirfahim.rxen@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
    },
});

const generateBaseEmail = (
    title: string,
    message: string,
    linkText: string,
    url: string,
    footerNote?: string,
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #333;">${title}</h2>
    <p style="color: #555;">${message}</p>
    <p style="margin: 16px 0;">
      <a target="_blank" href="${url}" style="background-color: #4f46e5; color: white; padding: 10px 16px; text-decoration: none; border-radius: 4px;">${linkText}</a>
    </p>
    <p style="font-size: 14px; color: #999;">${footerNote || "If you didn’t request this, you can safely ignore this email."}</p>
  </div>
`;

export const sendAdminVerificationMail = async (
    verificationUrl: string,
    recipientEmail: string,
): Promise<void> => {
    const html = generateBaseEmail(
        "Admin Account Verification",
        "You requested to create a new admin account. Please verify your email to continue.",
        "Verify Admin Account",
        verificationUrl,
        "This link will expire in 5 minutes. If you didn’t request this, please ignore this email.",
    );

    await transporter.sendMail({
        to: recipientEmail,
        subject: "Verify Your Admin Account",
        html,
    });
};

export const sendAdminPasswordResetMail = async (
    resetUrl: string,
    recipientEmail: string,
): Promise<void> => {
    const html = generateBaseEmail(
        "Reset Your Admin Password",
        "We received a request to reset your admin account password.",
        "Reset Password",
        resetUrl,
        "This link will expire in 5 minutes. If you didn’t request a password reset, no action is needed.",
    );

    await transporter.sendMail({
        to: recipientEmail,
        subject: "Admin Password Reset Request",
        html,
    });
};

export const sendUserVerificationMail = async (
    verificationUrl: string,
    recipientEmail: string,
): Promise<void> => {
    const html = generateBaseEmail(
        "Verify Your Account",
        "Welcome! Please verify your email address to activate your account.",
        "Verify Account",
        verificationUrl,
        "This verification link is only valid for a limited time.",
    );

    await transporter.sendMail({
        to: recipientEmail,
        subject: "Verify Your Account",
        html,
    });
};

export const sendUserPasswordResetMail = async (
    resetUrl: string,
    recipientEmail: string,
): Promise<void> => {
    const html = generateBaseEmail(
        "Reset Your Password",
        "We received a request to reset your password. You can do so by clicking the button below.",
        "Reset Password",
        resetUrl,
        "If you didn’t request this, just ignore this email — your account is safe.",
    );

    await transporter.sendMail({
        to: recipientEmail,
        subject: "Password Reset Request",
        html,
    });
};
