import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";


export async function CheckExists(req: Request, res: Response) {

    try {
        const count = await prisma.admin.count();
        res.json({ exists: count > 0 });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }

}

