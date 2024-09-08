const { uploadImagesMulter } = require("../middleware/multerStorage");
const bucket = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");

exports.uploadImage = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadImagesMulter(req, res, (err) => {
      if (err) {
        reject(err);
      } else if (!req.file) {
        reject(new Error("No file uploaded."));
      } else {
        const file = req.file;
        const fileName = `${uuidv4()}-${file.originalname}`;
        const blob = bucket.file(fileName);

        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        blobStream.on("error", (err) => {
          reject(err);
        });

        blobStream.on("finish", () => {
          resolve(fileName);
        });

        blobStream.end(file.buffer);
      }
    });
  });
};

exports.getImage = async (avatarFileName) => {
  if (!avatarFileName) {
    throw new Error("User does not have an avatar.");
  }

  const file = bucket.file(avatarFileName);

  try {
    const signedUrl = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // Set an appropriate expiration time (15 minutes)
    });

    return signedUrl[0];
  } catch (err) {
    throw new Error("Error retrieving file.");
  }
};
