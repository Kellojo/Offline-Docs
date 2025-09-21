const builder = require("./builder");
var pjson = require("../package.json");

console.log(`📘 offline-md-docs ${pjson.version}`);
builder.buildDocs({ saveToDisk: true });
