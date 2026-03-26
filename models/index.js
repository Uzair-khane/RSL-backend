const fs = require("fs");
const path = require("path");

const modelsDir = __dirname;

fs.readdirSync(modelsDir)
  .filter((file) => file.endsWith(".js") && file !== "index.js")
  .forEach((file) => {
    require(path.join(modelsDir, file));
  });

