# Offline-Docs
A simple Node.js package that you can use to create offline product documentation using Markdown. The tool embeds all content into a single output file.


## Features:
- Embedds images as base64
- Embedds your md files
- Yields a singular .html file as it's output, that is ready for offline use

## Quickstart
1. Create a new folder and add a config.yaml to it with the following content:
```yaml
title: My Documentation Title
```
2. Start creating new markdown files in that folder to get your documentation going
3. Run `npx ...` to open the live preview of your documentation
4. Once happy, run `npx offline-md-docs build` to build your final html file

## Running a loal dev server
To run a local dev server, which shows you a live preview of your docs, run:
```
npx offline-md-docs start
```

