import { Router } from "express";
import { upload, uploadImage } from "../controllers/upload.controller";
import { authenticate, requireAdmin } from "../middleware/auth";
import { uploadLimiter } from "../middleware/rate-limit";

const router = Router();

router.post("/", authenticate, requireAdmin, uploadLimiter, upload.single("image"), uploadImage);

export default router;
