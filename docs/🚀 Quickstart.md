---
order: 1
---

![](/images/main-banner.png)

# Quick Start

1. Create a new folder and add a `config.yaml` to it with the following content:

```yaml
title: My Documentation Title
theme: cyan
```

3. Create a new folder called `docs`
4. Start creating new markdown files in that folder to get your documentation going
5. Run `npx ...` to open the live preview of your documentation
6. Once happy, run `npx offline-md-docs build` to build your final html file

## Running a local dev server

To run a local dev server, which shows you a live preview of your docs, run:

```sh
npx offline-md-docs start
```

This will start a local dev server, which will live reload as you make changes to your markdown files:

```sh

> offline-md-docs@1.0.51 start
> node ./src/server.js

📘 offline-md-docs v1.0.51

🚀 Server running at http://localhost:3000
👀 Watching docs/ for changes...
```

## Building the docs

To build your documentation, run:

```sh
npx offline-md-docs build
```

This will create a new html file with your documentation in the root of your project folder:

```sh
> offline-md-docs@1.0.51 build
> node ./src/build.js

📘 offline-md-docs v1.0.51

📄 Processed docs with 5 pages and 2 images in 29 ms.
📦 Output size: 0.60 MB
```
