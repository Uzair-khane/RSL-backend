const { default: axios } = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const http = require('http');
const https = require('https');

const domain = 'https://kptourism.com';

const downloadImageFromUrl = async (fileUrl, filetype, dir, height, width) => {
    return new Promise((resolve, reject) => {
        let imageUrl = (dir + new Date() / 1000 + filetype +'.webp').replace(/ /g, '')
        let decodedFileUrl = encodeURI(fileUrl);
        axios.get(`${domain}/${decodedFileUrl}`, { responseType: 'arraybuffer' })
        .then((res) => {
            sharp(res.data)
            .resize(height, width)
            .toFile(`${imageUrl}`, (err, info) => {
                if(err) {
                    return reject(err);
                } else {
                    imageUrl = imageUrl.substring(9)
                    return resolve(imageUrl);
                }
            })
        })
        .catch((err) => {
            return reject(err)
        })
    })
}

module.exports = {
    downloadImageFromUrl
}