const builder = require("./builder");
var pjson = require("../package.json");

console.log(`📘 offline-md-docs v${pjson.version}`);
console.log("");
builder.buildDocs({ saveToDisk: true });
