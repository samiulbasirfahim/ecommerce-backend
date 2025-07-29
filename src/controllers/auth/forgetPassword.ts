import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

import { z } from "zod";
import { getZodErrors } from "../../lib/utils.js";
import { randomBytes } from "crypto";
import {
    sendAdminPasswordResetMail,
    transporter,
} from "../../lib/emailService.js";

const forgetSchema = z.object({
    email: z.string().email(),
});

export async function ForgetPassword(req: Request, res: Response) {
    try {
        const { email } = forgetSchema.parse(req.body);

        const admin = await prisma.admin.findFirst({
            where: { email },
        });

        console.log(email);

        if (!admin) return res.status(404).json({ message: "Email not found" });

        const token = randomBytes(32).toString("hex");

        await prisma.admin.update({
            where: { email },
            data: {
                secretToken: token,
                tokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        sendAdminPasswordResetMail(resetLink, admin.email);

        res.json({ message: "Reset link sent" });
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errors = getZodErrors(err);
            return res.status(400).json({ errors: errors });
        }
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
}
