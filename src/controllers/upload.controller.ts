import { Request, Response } from "express";
import cloudinary from "../lib/cloudinary";
import multer from "multer";

// Multer config — store in memory for Cloudinary upload
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
        }
    },
});

// POST /api/upload — Admin only
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No image file provided" });
            return;
        }

        // Upload to Cloudinary from buffer
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "primehood/products",
                    transformation: [
                        { width: 800, height: 800, crop: "limit", quality: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(req.file!.buffer);
        });

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload image" });
    }
};
