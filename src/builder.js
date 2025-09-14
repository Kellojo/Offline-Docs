const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const yaml = require('yaml');
const MarkdownIt = require("markdown-it");


const getStylesheets = () => {
    const cssFiles = ["./src/page/style.css", "./src/page/pico.min.css", "./src/page/pico.colors.min.css"];
    return cssFiles.map(file => {
        const style = readPackageFileSync(file);
        return `<style>\n${style}\n</style>`;
    }).join('\n');
}

const readPackageFileSync = (filePath) => {
    const localPath = path.join(__dirname, '..', filePath);
    return fs.readFileSync(localPath, 'utf-8');
}

const readMdFiles = (dir) => {
    let mdContent = {};
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const isDirectory = fs.lstatSync(filePath).isDirectory();

        if (isDirectory) {
            if (file === "images") return; // Skip images directory

            // read metadata.yaml if it exists
            let metadata = { order: 0};
            const metadataPath = path.join(filePath, 'metadata.yaml');
            if (fs.existsSync(metadataPath)) {
                const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
                Object.assign(metadata, yaml.parse(metadataContent));
            }

            mdContent[file] = {
                entries: readMdFiles(filePath),
                isPage: false,
                title: file,
                ...metadata
            } 
        } else if (file.endsWith('.md')) {
            const page = parsePage(filePath);
            mdContent[page.title] = page;
        }
    });
    
    return mdContent;
}
const parsePage = (file) => {
    let content = fs.readFileSync(file, 'utf-8');

    let metadata = {
        order: 0
    };
    const containsPropertiesBlock = content.startsWith('---');
    if (containsPropertiesBlock) {
        const endOfPropertiesIndex = content.indexOf('---', 2);
        const metadataStr = content.slice(3, endOfPropertiesIndex).trim();

        try {
            metadata = yaml.parse(metadataStr);
            content = content.slice(endOfPropertiesIndex + 3).trim();
        } catch (error) {
            console.log(`Error parsing YAML metadata in ${file}:`, error);
        }
    }

    const md = new MarkdownIt({
        linkify: true,
    });
    parsedMarkdown = md.parse(content);

    parsedMarkdown.forEach(token => {
        if (token.type === 'inline' && token.children) {

            token.children.forEach(child => {
                if (child.type === 'image') {
                
                    const src = child.attrGet('src');
                    if (src && !src.startsWith('http')) {
                        const imagePath = path.join(path.dirname(file), src);
                        if (fs.existsSync(imagePath)) {
                            const imageData = fs.readFileSync(imagePath);
                            const ext = path.extname(imagePath).slice(1);
                            const base64 = imageData.toString('base64');
                            const dataUri = `data:image/${ext};base64,${base64}`;
                            child.attrSet('src', dataUri);
                            console.log(`Embedded image: ${imagePath}`);
                        } else {
                            console.warn(`Image file not found: ${imagePath}`);
                        }
                    }
                }
            });
        }
    });

    content = md.renderer.render(parsedMarkdown, {});


    return {
        title: path.basename(file, '.md'),
        ... metadata,
        content: content,
        isPage: true,
    };
}

const buildDocs = (options) => {
    const config = yaml.parse(readPackageFileSync('./config.yaml'));

    const template = readPackageFileSync("./src/page/index.html");
    const pages = JSON.stringify(readMdFiles("./docs"), null, 4);
    const output = mustache.render(template, { 
        title: config.title, 
        content: pages,
        style: getStylesheets(),
    });

    if (options.saveToDisk) {
        fs.writeFileSync(`./${config.title}.html`, output, 'utf-8');
    }

    return output;
};

module.exports = { buildDocs };