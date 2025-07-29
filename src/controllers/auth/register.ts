import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { z } from "zod";
import { hashPassword } from "../../lib/hash.js";
import { signJwt } from "../../lib/jwt.js";
import { getZodErrors } from "../../lib/utils.js";
import { randomBytes } from "crypto";
import {
    sendAdminVerificationMail,
} from "../../lib/emailService.js";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export async function Register(req: Request, res: Response) {
    try {
        const { email, password } = registerSchema.parse(req.body);
        const count = await prisma.admin.count();

        if (count > 0)
            return res.status(403).json({
                message: "Admin already exists",
            });

        const hash = await hashPassword(password);

        const secretHash = randomBytes(32).toString("hex");

        const admin = await prisma.admin.create({
            data: {
                email,
                password: hash,
                secretToken: secretHash,
                tokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
                verified: false,
            },
        });

        const verifyLink = `${process.env.FRONTEND_URL}/admin/verify?token=${secretHash}`;

        console.log("Reset link: ", verifyLink);

        sendAdminVerificationMail(verifyLink, admin.email);

        const token = signJwt({ id: admin.id, email: admin.email });
        res.json({ token });
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errors = getZodErrors(err);
            return res.status(400).json({ errors: errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}
