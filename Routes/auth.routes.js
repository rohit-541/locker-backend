import { Router } from "express";
import AuthController from "../Controllers/auth.js";
import { onboardingGaurd } from "../Middlewares/onboarding_gaurd.js";
import { authMiddleware } from "../Middlewares/auth.middleware.js";

const authRouter  = Router();

authRouter.post("/send-otp", AuthController.sendOTP);
authRouter.post("/verify-otp", AuthController.verifyOTP);
authRouter.post("/register",onboardingGaurd, AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.get("/logout", AuthController.logout);
authRouter.get("/me", authMiddleware, AuthController.me);

export default authRouter;  