import express, { type Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import AdminRoutes from "./routes/admin.routes.js";

dotenv.config();
const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(cookieParser());

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }),
);
app.use(express.json());

app.use("/admin", AdminRoutes);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
