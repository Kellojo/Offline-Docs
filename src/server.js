const express = require("express");
const builder = require("./builder");

const app = express();
const PORT = 3000;



app.get("/", (req, res) => {
    const html = builder.buildDocs({ saveToDisk: false });
    res.send(html);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
