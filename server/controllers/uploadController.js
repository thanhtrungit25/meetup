import cloudinary from "../config/cloudinary.js";

/**
 * Helper to upload buffer to Cloudinary using upload_stream
 */
const uploadFromBuffer = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

/**
 * Controller to upload Custom Virtual Background Wallpaper
 * Route: POST /api/upload/background
 */
export const handleUploadBackground = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No background image provided" });
  }

  try {
    const result = await uploadFromBuffer(req.file.buffer, {
      folder: "meetup/backgrounds",
      transformation: [
        { width: 1280, height: 720, crop: "fill" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Cloudinary Avatar upload error:", error);
    return res
      .status(500)
      .json({
        error: "Failed to upload avatar to Cloudinary",
        details: error.message,
      });
  }
};
