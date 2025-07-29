import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { date } from "zod";

export async function CheckExists(req: Request, res: Response) {
    try {
        const admin = await prisma.admin.findFirst();

        let currentTime = new Date();

        if (
            admin?.tokenExpiresAt &&
            new Date(admin.tokenExpiresAt).getTime() < currentTime.getTime()
        ) {
            await prisma.admin.delete({
                where: {
                    id: admin.id,
                },
            });

            res.json({ exists: false, verified: false });
        }
        res.json({ exists: !!admin, verified: admin?.verified });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
}
