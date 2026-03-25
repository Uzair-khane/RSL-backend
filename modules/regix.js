// Replace everything except Numbers and Letters

const replaceString = async (str) => {
    const regex = /[^A-Za-z0-9]/g;
    let result = str.replace(regex, "-").toLowerCase();
    return result;
}

module.exports = { replaceString }