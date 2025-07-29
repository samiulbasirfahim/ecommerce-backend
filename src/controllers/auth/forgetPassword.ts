import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

import { z } from "zod";
import { getZodErrors } from "../../lib/utils.js";
import { randomBytes } from "crypto";
import { transporter } from "../../lib/emailService.js";

const forgetSchema = z.object({
    email: z.string().email(),
});

export async function ForgetPassword(req: Request, res: Response) {
    try {
        const { email } = forgetSchema.parse(req.body);

        const admin = await prisma.admin.findFirst({
            where: { email },
        });

        if (!admin) return res.status(404).json({ message: "Email not found" });

        const token = randomBytes(32).toString("hex");

        await prisma.admin.update({
            where: { email },
            data: {
                resetToken: token,
                resetExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        console.log("Reset link: ", resetLink);
        await transporter.sendMail({
            from: 'Blah Blah Blah',
            to: email,
            subject: "Your password reset link",
            text: resetLink,
            html: resetLink,
        });

        res.json({ message: "Reset link sent" });
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errors = getZodErrors(err);
            return res.status(400).json({ errors: errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}
