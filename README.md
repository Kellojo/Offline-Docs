# Offline-Docs
A simple Node.js package that you can use to create offline product documentation using Markdown. The tool embeds all content into a single output file.

![Example Docs Page](img/example.png)

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

## Customization
The builder uses [Pico CSS](https://picocss.com/) under the hood, which allows you to customize the color by providing a predefined scheme, that pico provides.
You can find an overview over all available color schemes here: https://picocss.com/docs/version-picker
