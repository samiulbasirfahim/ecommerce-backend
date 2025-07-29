import type { Request, Response } from "express";
import z from "zod";
import { comparePassword } from "../../lib/hash.js";
import { prisma } from "../../lib/prisma.js";
import { signJwt } from "../../lib/jwt.js";
import { getZodErrors } from "../../lib/utils.js";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export async function Login(req: Request, res: Response) {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const admin = await prisma.admin.findFirst({
            where: {
                email: email,
            },
        });


        if (!admin) return res.status(401).json({ message: "Invalid credentials" });

        if (!admin?.verified) {
            res.status(401).json({
                message: "Unverified account"
            })
        }

        const valid = await comparePassword(password, admin.password);
        if (!valid) return res.status(401).json({ message: "Invalid credentials" });

        const token = signJwt({ id: admin.id, email: email });
        res.json({ token });
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errors = getZodErrors(err);
            return res.status(400).json({ errors: errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}
