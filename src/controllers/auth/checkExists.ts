import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { verifyJwt } from "../../lib/jwt.js";

export async function CheckExists(req: Request, res: Response) {
    try {
        const admin = await prisma.admin.findFirst();
        const tokenCookie = req.cookies.token_admin;

        if (!admin) {
            return res.json({
                exists: false,
                verified: false,
                authenticated: false,
            });
        }

        if (
            (!admin.verified && !admin.tokenExpiresAt) ||
            (!admin.verified &&
                admin.tokenExpiresAt &&
                new Date(admin.tokenExpiresAt).getTime() < Date.now())
        ) {
            await prisma.admin.delete({ where: { id: admin.id } });
            return res.json({
                exists: false,
                verified: false,
                authenticated: false,
            });
        }

        console.log("token", tokenCookie);

        const jwtPayload = verifyJwt(tokenCookie);
        if (typeof jwtPayload === "string" || !jwtPayload?.id) {
            return res.json({
                exists: true,
                verified: admin.verified,
                authenticated: false,
            });
        }

        const matchedAdmin = await prisma.admin.findFirst({
            where: { id: jwtPayload.id },
        });

        console.log("matched: ", matchedAdmin)

        return res.json({
            exists: true,
            verified: admin.verified,
            authenticated: !!matchedAdmin,
        });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
