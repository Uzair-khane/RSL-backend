let sharp = require("sharp");
const fs = require("fs");

const fileToUpload = async (
  file,
  location,
  width,
  height,
  fitType = null,
  quality = 50
) => {
  return new Promise((resolve, reject) => {
    try {
      // let filedata = file?.name?.split(".");
      let imageUrl = `${location + new Date() / 1000 + ".webp"}`;
      sharp(file.data)
        .resize(width, height, { fit: fitType != null ? fitType : "fill" })
        .webp({ quality: quality })
        .toFile(imageUrl, (err, info) => {
          if (err) {
            return reject(err);
          } else {
            imageUrl = imageUrl.substring(9);
            return resolve(imageUrl);
          }
        });
    } catch (error) {
      return reject(error);
    }
  });
};

const imageToUploadMob = async (
  location,
  images,
  width = 800,
  height = 0,
  quality = 80
) => {
  try {
    let size = { width: width };

    if (height) {
      size.height = height;
    }

    // Process uploaded images with Sharp
    const processedImages = await Promise.all(
      images.map(async (file) => {
        filename = file.name.split(".")[0];
        const processedFile = `${location + new Date() / 1000 + filename}.webp`;

        await sharp(file.data)
          .resize(size)
          .webp({ quality: quality })
          .toFile(processedFile);
        return { image_url: processedFile.substring(9) };
      })
    );

    // Return processed images
    return { images: processedImages };
  } catch (err) {
    console.error(err);
    return false;
  }
};

const videoToUploadMob = async (location, images) => {
  try {
    // Upload files using fs
    const uploadedFiles = await Promise.all(
      images.map(async (file) => {
        const timestamp = new Date() / 1000;
        const filename = `${timestamp}-${file.name}`;

        const processedFile = `${location}${filename}`;
        await fs.promises.writeFile(processedFile, file.data);

        return { image_url: processedFile.substring(9) };
      })
    );

    // Return uploaded files
    return { images: uploadedFiles };
  } catch (err) {
    console.error(err);
    return false;
  }
};
module.exports = {
  fileToUpload,
  imageToUploadMob,
  videoToUploadMob,
};
