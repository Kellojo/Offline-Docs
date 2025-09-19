const express = require("express");
const builder = require("./builder");
const livereload = require("livereload");

const app = express();
const PORT = 3000;

const reloadServer = livereload.createServer({
    exts: ["md", "png", "jpg", "jpeg", "gif", "svg", "webp"],
});
reloadServer.watch("docs");

app.use(require("connect-livereload")());

app.get("/", (req, res) => {
    const html = builder.buildDocs({ saveToDisk: false });
    res.send(html);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
