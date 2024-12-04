const cloudinary = require("cloudinary").v2;
const stream = require("stream");

cloudinary.config({
  cloud_name: "dxgbzpvaq",
  api_key: "678791492265236",
  api_secret: "YQln6MlQKuPEHDMiwtXIRdsyoUo",
});

const uploadImage = async (imageBuffer) => {
  const uploadResult = new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream((error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          reject(error.message);
        }
        resolve(result.secure_url);
      })
      .end(imageBuffer);
  })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw new Error(error);
    });

  return uploadResult;
};

const uploadVideo = (videoBuffer) => {
  return new Promise((resolve, reject) => {
    const passthroughStream = new stream.PassThrough();
    passthroughStream.end(videoBuffer); // Convertir el buffer en un flujo

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "video" },
      (error, result) => {
        if (error) {
          console.error("Error subiendo el video:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    passthroughStream.pipe(uploadStream); // Usar el flujo
  });
};

module.exports = {
  uploadImage,
  uploadVideo,
};
