import { Router } from "express";
import { z } from "zod";
import { login, getMe } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { authLimiter } from "../middleware/rate-limit";

const router = Router();

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    }),
});

router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authenticate, getMe);

export default router;
