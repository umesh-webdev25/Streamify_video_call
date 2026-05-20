import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";
import multer from "multer";

const createCloudinaryStorage = (folder, getPublicId) =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: getPublicId(req, file),
    }),
  });

const storage = createCloudinaryStorage("profile", (req) => {
  return `${req.user._id}_profile`;
});

const contactStorage = createCloudinaryStorage("contacts", (req) => {
  const contactName = req.body.name || "contact";
  const sanitizedName = contactName.replace(/[^a-z0-9_-]/gi, "");

  return `${req.user._id}_${sanitizedName || "contact"}_${Date.now()}`;
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    console.error("Upload rejected: invalid file type", {
      fieldName: file?.fieldname,
      originalName: file?.originalname,
      mimeType: file?.mimetype,
    });
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadContact = multer({
  storage: contactStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export { upload, uploadContact };
export default upload;
