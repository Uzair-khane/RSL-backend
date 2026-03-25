module.exports = {
    isNumeric: (value) => {
        return /^-?\d+$/.test(value);
    },
    // Defining middleware function to validate uploaded images
    validateImages: (images) => {

        // images = Array.isArray(images) ? images: [images];

        for (const image of images) {
            // if (image.size > 1000000) { // 1MB
            //     return res.status(400).json({ message: `Image ${image.name} size exceeds limit of 1MB` });
            // }
            if (!['image/jpg', 'image/jpeg', 'image/png', 'image/webp'].includes(image.mimetype)) {
                return false;
            }
        }
        return true;
    },
    validateVideo: (videos) => {

        for (const video of videos) {
            // if (image.size > 1000000) { // 1MB
            //     return res.status(400).json({ message: `Image ${image.name} size exceeds limit of 1MB` });
            // }
            if (!['video/mp4', 'video/quicktime'].includes(video.mimetype)) {
                return false;
            }
        }
        return true;
    }

}