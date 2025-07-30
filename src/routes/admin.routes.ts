import express, { type Router } from "express";
import { CheckExists } from "../controllers/auth/checkExists.js";
import { Register } from "../controllers/auth/register.js";
import { Login } from "../controllers/auth/login.js";
import { ForgetPassword } from "../controllers/auth/forgetPassword.js";
import { resetPassword } from "../controllers/auth/resetPassword.js";
import { VerifyEmail } from "../controllers/auth/verifyEmail.js";

const router: Router = express.Router();

router.post("/login", Login);
router.post("/init", Register);
router.get("/check", CheckExists);
router.post("/forget", ForgetPassword);
router.post("/reset", resetPassword);
router.post("/verify", VerifyEmail);

export default router;
