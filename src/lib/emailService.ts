import nodemailer from "nodemailer"
export const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'elian.jakubowski37@ethereal.email',
        pass: 'h3YdgqwAqJk2CsDdAE'
    }
});
