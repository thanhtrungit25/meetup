import express from "express";
import multer from "multer";
import { handleUploadBackground } from "../controllers/uploadController.js";

const router = express.Router();

// Configure Multer for in-memory storage (up to 10MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fieldSize: 10 * 1024 * 1024 }, // 10 MB
});

router.post("/background", upload.single("image"), handleUploadBackground);

export default router;
