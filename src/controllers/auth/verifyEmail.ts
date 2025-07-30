import type { Response, Request } from "express";
import { verifyJwt } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";

export async function VerifyEmail(req: Request, res: Response) {
    try {
        const tokenQuery = req.body.token;
        const tokenCookie = req.cookies.token_admin;
        const info = verifyJwt(tokenCookie);

        if (typeof info === "string" || !info?.id) {
            return res.status(400).json({ error: "Invalid or missing JWT payload." });
        }

        const admin = await prisma.admin.findUnique({
            where: { id: info.id },
        });

        if (!admin) return res.status(404).json({ error: "User not found" });

        if (
            admin?.tokenExpiresAt &&
            new Date(admin.tokenExpiresAt).getTime() < Date.now()
        ) {
            await prisma.admin.delete({
                where: { id: admin.id },
            });

            return res.status(410).json({
                exists: false,
                verified: false,
                message: "Token expired. Admin deleted.",
            });
        }

        if (
            !admin.verified &&
            admin?.secretToken &&
            admin.secretToken === tokenQuery
        ) {
            await prisma.admin.update({
                where: { id: admin.id },
                data: {
                    verified: true,
                    secretToken: null,
                    tokenExpiresAt: null,
                },
            });

            return res.status(200).json({
                verified: true,
                message: "Admin successfully verified.",
            });
        }

        return res.status(400).json({
            verified: false,
            message: "Invalid or expired verification token.",
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
}
