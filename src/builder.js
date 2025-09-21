const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const yaml = require('yaml');
const MarkdownIt = require('markdown-it');
const mdAnchor = require('markdown-it-anchor');
const hljs = require('highlight.js');
const slugify = require('slugify');
const { performance } = require('perf_hooks');

class DocsBuilder {
    DEFAULT_DOCS_DIR = './docs';
    pagesCount = 0;
    imageCount = 0;

    constructor(config) {
        const configPath = './config.yaml';
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(
                configPath,
                yaml.stringify({ title: 'My Documentation' }),
                'utf-8'
            );
        }

        if (!config) config = yaml.parse(fs.readFileSync(configPath, 'utf-8'));

        config = config || {};
        config.docsDir = config.docsDir || this.DEFAULT_DOCS_DIR;

        this.config = config;
        this.usedCodeLanguages = new Set();
        this.imageCache = new Map();
    }

    build(options) {
        const startTime = performance.now();

        const template = this.readPackageFileSync('./src/page/index.html');
        const pages = JSON.stringify(
            this.readMdFiles(this.config.docsDir),
            null,
            4
        );
        const output = mustache.render(template, {
            title: this.config.title,
            content: pages,
            style: this.getStylesheets(),
            script: this.getScripts(),
            imageCacheScript: this.getImageCacheScript(),
            externalLink: this.getExternalLink(),
        });

        if (options.saveToDisk) {
            fs.writeFileSync(`./${this.config.title}.html`, output, 'utf-8');
        }

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        console.log(
            `📄 Processed docs with ${this.pagesCount} pages and ${this.imageCount} images in ${duration} ms.`
        );
        console.log(`📦 Output size: ${this.getStringSizeInMB(output)}`);

        return output;
    }

    readMdFiles(dir) {
        let mdContent = {};
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const isDirectory = fs.lstatSync(filePath).isDirectory();

            if (isDirectory) {
                if (file === 'images') return; // Skip images directory

                // read metadata.yaml if it exists
                let metadata = { order: 0 };
                const metadataPath = path.join(filePath, 'metadata.yaml');
                if (fs.existsSync(metadataPath)) {
                    const metadataContent = fs.readFileSync(
                        metadataPath,
                        'utf-8'
                    );
                    Object.assign(metadata, yaml.parse(metadataContent));
                }

                mdContent[file] = {
                    entries: this.readMdFiles(filePath),
                    isPage: false,
                    title: file,
                    ...metadata,
                };
            } else if (file.endsWith('.md')) {
                const page = this.parsePage(filePath);
                mdContent[page.title] = page;
            }
        });

        return mdContent;
    }
    parsePage(file) {
        this.pagesCount++;
        let content = fs.readFileSync(file, 'utf-8');

        let metadata = {
            order: 0,
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

        const md = this.getMarkdownItInstance();
        const parsedMarkdown = md.parse(content);

        parsedMarkdown.forEach((token) => {
            if (token.type === 'inline' && token.children) {
                token.children.forEach((child) => {
                    if (child.type === 'image') {
                        const src = child.attrGet('src');
                        if (src && !src.startsWith('http')) {
                            const imagePath = path.join(
                                path.dirname(file),
                                src
                            );
                            if (fs.existsSync(imagePath)) {
                                const imageData = fs.readFileSync(imagePath);
                                const ext = path.extname(imagePath).slice(1);
                                const base64 = imageData.toString('base64');
                                const dataUri = `data:image/${ext};base64,${base64}`;
                                const cacheKey = `cachedImage-${src}`;
                                if (!this.imageCache.has(cacheKey))
                                    this.imageCache.set(cacheKey, dataUri);
                                child.attrSet('src', cacheKey);

                                this.imageCount++;
                            } else {
                                console.warn(
                                    `Image file not found: ${imagePath}`
                                );
                            }
                        }
                    }
                });
            }
        });

        content = md.renderer.render(parsedMarkdown, md.options);

        const title = path.basename(file, '.md');
        return {
            id: this.getPageId(file),
            title: title,
            ...metadata,
            content: content,
            isPage: true,
        };
    }

    /**
     * Gets the pages ID based on its file path.
     * @param {string} fileName
     * @returns {string}
     * @public
     */
    getPageId(fileName) {
        const normalized = path.normalize(fileName);
        const segments = normalized.split(path.sep).filter(Boolean);
        segments[segments.length - 1] = path.basename(
            segments[segments.length - 1],
            '.md'
        );

        if (segments[0] === path.normalize(this.config.docsDir)) {
            segments.shift();
        }

        return segments.map((seg) => slugify(seg)).join('/');
    }

    getStylesheets() {
        const picoStylesheet = this.getPicoStylesheet(this.config.theme);
        const cssFiles = new Set(['./src/page/style.css', picoStylesheet]);

        this.usedCodeLanguages.forEach((lang) => {
            let langStylesheet = this.resolveHighlightJsStyleSheet(
                `./node_modules/highlight.js/styles/${lang}.min.css`
            );

            // use fallback if the specific language stylesheet doesn't exist
            if (langStylesheet === null) {
                langStylesheet = this.resolveHighlightJsStyleSheet(
                    `./node_modules/highlight.js/styles/github-dark.min.css`
                );
            }

            cssFiles.add(langStylesheet);
        });

        return Array.from(cssFiles)
            .map((file) => {
                const style = this.readPackageFileSync(file);
                return `<style>\n${style}\n</style>`;
            })
            .join('\n');
    }

    /**
     * Resolves the path to a Highlight.js stylesheet, checking both local and runtime paths.
     * @param {string} styleSheet
     * @returns {string|null}
     * @public
     */
    resolveHighlightJsStyleSheet(styleSheet) {
        if (this.packageFileExistsSync(styleSheet)) return styleSheet;
        const runtimeStyleSheet = styleSheet.replace('./node_modules/', '../');
        if (this.packageFileExistsSync(runtimeStyleSheet))
            return runtimeStyleSheet;

        return null;
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

    getScripts() {
        const scriptFiles = new Set(['./src/page/page.js']);

        return Array.from(scriptFiles)
            .map((file) => {
                const script = this.readPackageFileSync(file);
                return `<script>\n${script}\n</script>`;
            })
            .join('\n');
    }

    getImageCacheScript() {
        return `
        <script>
            window.imageCache = ${JSON.stringify(
                Object.fromEntries(this.imageCache)
            )};
        </script>
    `;
    }

    getExternalLink() {
        const link = this.config.externalLink;
        if (link && link.text && link.url) {
            return `<a href="${link.url}" target="_blank" rel="noopener">${link.text}</a>`;
        }
        return '';
    }

    getMarkdownItInstance() {
        const mdit = new MarkdownIt({
            linkify: true,
            highlight: this.syntaxHighlight.bind(this),
        });

        mdit.use(mdAnchor, {
            slugify: slugify,
        });

        return mdit;
    }

    syntaxHighlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                this.usedCodeLanguages.add(lang);
                return hljs.highlight(code, { language: lang }).value;
            } catch (error) {
                console.error(
                    `Error highlighting code for language: ${lang}`,
                    error
                );
            }
        }
        return ''; // use external default escaping
    }

    readPackageFileSync(filePath) {
        const localPath = path.join(__dirname, '..', filePath);
        return fs.readFileSync(localPath, 'utf-8');
    }

    packageFileExistsSync(filePath) {
        const localPath = path.join(__dirname, '..', filePath);
        return fs.existsSync(localPath);
    }

    getStringSizeInMB(str) {
        const bytes = Buffer.byteLength(str, 'utf8');
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
}

const buildDocs = (options) => {
    const builder = new DocsBuilder();
    return builder.build(options);
};

module.exports = { buildDocs, DocsBuilder };
