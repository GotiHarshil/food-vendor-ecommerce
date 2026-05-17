const cloudinary = require("./cloudinary");
const { Readable } = require("stream");

async function uploadToCloudinary(fileBuffer, fileName, folder = "food-vendor") {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          public_id: fileName.split(".")[0],
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      Readable.from(fileBuffer).pipe(stream);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

module.exports = { uploadToCloudinary };
