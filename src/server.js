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
    try {
        const html = builder.buildDocs({ saveToDisk: false });
    res.send(html);
    } catch (error) {
        const html = `
            <h1>Error building docs</h1>
            <span>This is likely due to a syntax error in your markdown files.</span>
            <pre>${error.message}</pre>
            <pre>${error.stack}</pre>

            <script>
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            </script>
        `;
        res.send(html);
    }

    
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
