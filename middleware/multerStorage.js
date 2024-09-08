const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const imageStorage = multer.memoryStorage();

const testcasesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/testcases"); // Destination folder to store uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req, file, cb) => {
  // Check if the file size is less than or equal to 3 megabytes
  if (file.size <= 3 * 1024 * 1024) {
    cb(null, true);
  } else {
    cb(new Error("File size exceeds the 3 megabyte limit"));
  }
};

const uploadTestCasesMulter = multer({
  storage: testcasesStorage,
  fileFilter: fileFilter,
});

const uploadImagesMulter = multer({
  storage: imageStorage,
  // fileFilter: fileFilter
}).single("image");

module.exports = { uploadTestCasesMulter, uploadImagesMulter };
