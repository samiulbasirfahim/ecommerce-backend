import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

import { z } from "zod";
import { hashPassword } from "../../lib/hash.js";
import { getZodErrors } from "../../lib/utils.js";
import { signJwt } from "../../lib/jwt.js";

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
                secretToken: token,
                tokenExpiresAt: { gt: new Date() },
            },
        });
        if (!admin)
            return res.status(400).json({ message: "Invalid or expired token" });

        const hashed = await hashPassword(newPassword);
        await prisma.admin.update({
            where: { id: admin.id },
            data: {
                password: hashed,
                secretToken: null,
                tokenExpiresAt: null,
            },
        });

        const jwtToken = signJwt({ id: admin.id, email: admin.email });
        return res
            .cookie("token_admin", jwtToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({
                message: "Password reseted succesfully",
            });
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errors = getZodErrors(err);
            return res.status(400).json({ errors: errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}
