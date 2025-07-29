import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

import { z } from "zod";
import { hashPassword } from "../../lib/hash.js";
import { getZodErrors } from "../../lib/utils.js";

const ResetSchema = z.object({
    email: z.string().email(),
    token: z.string(),
    newPassword: z.string(),
});

export async function resetPassword(req: Request, res: Response) {
    try {
        const { email, token, newPassword } = ResetSchema.parse(req.body);
        const admin = await prisma.admin.findFirst({
            where: {
                email,
                resetToken: token,
                resetExpiresAt: { gt: new Date() },
            },
        });
        if (!admin)
            return res.status(400).json({ message: "Invalid or expired token" });

        const hashed = await hashPassword(newPassword);
        await prisma.admin.update({
            where: { id: admin.id },
            data: {
                password: hashed,
                resetToken: null,
                resetExpiresAt: null,
            },
        });

        res.json({ message: "Password reset successful" });
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errors = getZodErrors(err);
            return res.status(400).json({ errors: errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}
