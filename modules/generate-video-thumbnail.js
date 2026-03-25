// const ffmpeg = require('ffmpeg-static')
// const genThumbnail = require('simple-thumbnail')

const thumbnailGenerator = async (file, location, width, height) => {
    return new Promise((resolve, reject) => {
        // genThumbnail(file, (location + new Date()/1000) +'_thumbnail.webp', '300x200', {
        //     path: ffmpeg.path
        // })
        // .then((result) => {
        //     console.log(result)
        //     resolve(result)
        // })
        // .catch((err) => {
        //     console.log(err)
        //     reject(err)
        // })
    })
}

module.exports = {
    thumbnailGenerator
}