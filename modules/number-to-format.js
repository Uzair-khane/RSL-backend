// convert numbers to string of k,m,g,t, etc
const numberToString = async (num, digits = 2) => {
    return new Promise((resolve, reject) => {
        try {
            var si = [
                { value: 1, symbol: "" },
                { value: 1E3, symbol: "k" },
                { value: 1E6, symbol: "M" },
                { value: 1E9, symbol: "G" },
                { value: 1E12, symbol: "T" },
                { value: 1E15, symbol: "P" },
                { value: 1E18, symbol: "E" }
            ];
            var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
            var i;
            for (i = si.length - 1; i > 0; i--) {
                if (Math.abs(num) >= si[i].value) {
                    break;
                }
            }
            return resolve((Math.abs(num) / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol)
        } catch (error) {
            return  reject(error)
        }
    })
}

// Convert number to comma separated
const numberToCommaSeparated = async (num) => {
    return new Promise((resolve, reject) => {
        try {
            const formattedNumber = num.toLocaleString("en-US")
            resolve(formattedNumber)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    numberToString,
    numberToCommaSeparated
}