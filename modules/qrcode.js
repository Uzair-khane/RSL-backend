var QRCode = require('qrcode')
const fs = require('fs')
const Sharp = require('sharp')

const generateQrcode = async (data, location, fitType = null) => {
    return new Promise((resolve, reject) => {
        try {
            QRCode.toDataURL(data, { errorCorrectionLevel: 'H' }, function (err, url) {
                const dataURI = url;
                // Extract the base64 data from the data URI
                const base64Data = dataURI.split(';base64,').pop();

                // Decode the base64 data into a buffer
                const buffer = Buffer.from(base64Data, 'base64');

                let imageUrl = `${location + new Date() / 1000 + '_qrcode' }.webp`
                
                Sharp(buffer)
                    .resize(300, 300, { fit: fitType != null ? fitType : "fill" })
                    .webp({ quality: 80 })
                    .toFile(imageUrl, (err, info) => {
                        if (err) {
                            return reject(err);
                        } else {
                            imageUrl = imageUrl.substring(9)
                            return resolve(imageUrl);
                        }
                    });
            })
        } catch (error) {
            console.log(error);
            return reject(error)
        }
    })
}
module.exports = {
    generateQrcode
}