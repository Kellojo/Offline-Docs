# Offline-Docs

A simple Node.js package that you can use to create offline product documentation using Markdown. The tool embeds all content into a single output file.

![Example Docs Page](img/example.png)

## Features

- Yields a singular .html file as it's output, that is ready for offline use (0 dependencies)
    - Embeds images as base64 (with caching to avoid duplicates)
    - Embeds your md files
- Syntax highlighting for code blocks
- Supports embedding images
- Supports folders to organize your docs
- Supports linking between different pages and headings

## View Documentation & Demo

You can view the documentation for this project [here](https://kellojo.github.io/Offline-Docs/Offline%20Markdown%20Docs.html#Quickstart).

## Roadmap

- Support dark and light mode (currently only supports dark mode)
- Support infinite folder nesting (currently only supports folders on the root level)
- Switch to async fs functions and process pages in parallel
- Switch to a css preprocessor like SASS/LESS
- Add a search function (?)