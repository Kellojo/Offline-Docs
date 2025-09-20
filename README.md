# Offline-Docs
A simple Node.js package that you can use to create offline product documentation using Markdown. The tool embeds all content into a single output file.

![Example Docs Page](img/example.png)


## Table of Contents
1. [Features](#features)
2. [Quickstart](#quickstart)
3. [Running a local dev server](#running-a-local-dev-server)
4. [Building the docs](#building-the-docs)
5. [Customization](#customization)
   - [Theming](#theming)
   - [Custom Sort Order](#custom-sort-order)
   - [Linking between pages](#linking-between-pages)
6. [Roadmap](#roadmap)


## Features
- Yields a singular .html file as it's output, that is ready for offline use (0 dependencies)
    - Embeds images as base64
    - Embeds your md files
- Syntax highlighting for code blocks
- Supports images and folders
- Supports linking between different pages

## Quickstart
1. Create a new folder and add a config.yaml to it with the following content:
```yaml
title: My Documentation Title
theme: cyan
```
2. Start creating new markdown files in that folder to get your documentation going
3. Run `npx ...` to open the live preview of your documentation
4. Once happy, run `npx offline-md-docs build` to build your final html file

## Running a local dev server
To run a local dev server, which shows you a live preview of your docs, run:
```
npx offline-md-docs start
```

## Building the docs
To build your documentation, run:
```
npx offline-md-docs build
```

## Customization

### Theming
The builder uses [Pico CSS](https://picocss.com/) under the hood, which allows you to customize the color by providing a predefined scheme, that pico provides.
You can find an overview over all available color schemes here: https://picocss.com/docs/version-picker

### Custom Sort Order
Entries (either folders or md files) can have a custom order assigned as follows:

**Markdown Files**
Put this yaml metadata at the top of your file:
```yaml
---
order: 1
---
```

**Folder Customization**
Add a metadata.yaml file to your folder, which contains the metadata:
```yaml
---
order: 1
---
```

### Linking between pages
You can link between different pages by using the following syntax:
```
[Link to another page](#Core-Concepts/CodeTest)
```
Where `Core-Concepts/CodeTest` is the slugified path to the page you want to link to.

You can also link to specific headings within a page by appending `?h=Heading-Name` to the URL:
```
[Link to another page with heading](#Core-Concepts/Understanding-Core-Concepts?h=Kelp-Settings-2)
```
Where `Kelp-Settings-2` is the slugified version of the heading you want to link to.

## Roadmap
- Improved image embedding (only embedd images once)
- Support infinite nesting (currently only supports folders on the root level)
- Support phones and make the pages more responsive
