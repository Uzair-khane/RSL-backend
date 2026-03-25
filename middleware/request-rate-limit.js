const rateLimit = require('express-rate-limit');

const _calculateRemainingTime = async (timeLimit) => {
    const currentTime = new Date().getTime();
    const resetTime = new Date(timeLimit).getTime();
    const timeRemaining = resetTime - currentTime;

    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return `${ minutes < 10 ? '0'+minutes+' min':minutes+' min' } : ${ seconds < 10 ? '0'+seconds+' sec':seconds+' sec' }`;
}


// Login try Rate Limit
const apLoginRateLimit = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 5, // limit each IP requests per windowMs
    keyGenerator: function (req) {
        // Generate a unique key based on username
        return req.body.username;
    },
    handler: async (req, res, next) => {
        if (req.rateLimit.remaining === 0) {
            const timeRemaining = await _calculateRemainingTime(req.rateLimit.resetTime); 
            req.flash('error',`You have exceeded the maximum ${req.rateLimit.limit} login attempts, please try again after <span class="badge bg-default text-danger">${timeRemaining}</span>`)
            return res.redirect('/ap/auth/login')
        }
        next();
    }
});

// Form Submit Rate Limit
const formSubmitRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    handler: async (req, res, next) => {
        if (req.rateLimit.remaining === 0) {
            const timeRemaining = await _calculateRemainingTime(req.rateLimit.resetTime);
            return res.send({
                success: false,
                message: `Too many requests from the same IP address, please try again after ${timeRemaining}.`
            })
        }
        next();
    }
});


module.exports = {
    apLoginRateLimit,
    formSubmitRateLimit
}