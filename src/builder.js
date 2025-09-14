const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const yaml = require('yaml');
const MarkdownIt = require("markdown-it");

class DocsBuilder {

    constructor(config) {
        if (!config) config = yaml.parse(this.readPackageFileSync('./config.yaml'));

        config.theme = config.theme || 'cyan';

        this.config = config;
    }




    build(options) {
        const template = this.readPackageFileSync("./src/page/index.html");
        const pages = JSON.stringify(this.readMdFiles("./docs"), null, 4);
        const output = mustache.render(template, {
            title: this.config.title,
            content: pages,
            style: this.getStylesheets(),
        });

        if (options.saveToDisk) {
            fs.writeFileSync(`./${this.config.title}.html`, output, 'utf-8');
        }

        return output;
    }


    readMdFiles(dir) {
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
                    entries: this.readMdFiles(filePath),
                    isPage: false,
                    title: file,
                    ...metadata
                } 
            } else if (file.endsWith('.md')) {
                const page = this.parsePage(filePath);
                mdContent[page.title] = page;
            }
        });
        
        return mdContent;
    }
    parsePage (file) {
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
        const parsedMarkdown = md.parse(content);

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



    getStylesheets() {
        const picoStylesheet = this.getPicoStylesheet(this.config.theme);

        const cssFiles = ["./src/page/style.css", picoStylesheet];
        return cssFiles.map(file => {
            const style = this.readPackageFileSync(file);
            return `<style>\n${style}\n</style>`;
        }).join('\n');
    }

    /**
     * Returns the path to the Pico CSS stylesheet based on the theme.
     * @param {string} theme 
     * @returns {string}
     * @public
     */
    getPicoStylesheet(theme) {
        if (!theme) return `./src/page/pico/pico.min.css`;
        return `./src/page/pico/pico.${theme}.min.css`;
    }

    readPackageFileSync(filePath) {
        const localPath = path.join(__dirname, '..', filePath);
        return fs.readFileSync(localPath, 'utf-8');
    }
}

const buildDocs = (options) => {
    const builder = new DocsBuilder();
    return builder.build(options);
};

module.exports = { buildDocs, DocsBuilder };