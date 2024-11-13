const cloudinary = require("cloudinary").v2;
const streamifier = require('streamifier');


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

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'posts',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Error en uploadToCloudinary:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};


module.exports = {
  uploadImage, uploadToCloudinary
};
