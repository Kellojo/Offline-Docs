# Offline-Docs

A simple Node.js package that you can use to create offline product documentation using Markdown. The tool embeds all content into a single output file.

![Example Docs Page](img/example.png)

## Features

- Yields a singular .html file as it's output, that is ready for offline use (0 dependencies)
    - Embeds images as base64 (with caching to avoid duplicates)
    - Embeds your md files
- Syntax highlighting for code blocks
- Supports images and folders
- Supports linking between different pages and headings

## View Documentation & Demo
You can view the documentation for this project [here](tbd).

## Roadmap<>

- Support dark and light mode (currently only supports dark mode)
- Support infinite folder nesting (currently only supports folders on the root level)
- Support phones and make the pages more responsive
- Switch to async fs functions and process pages in parallel
