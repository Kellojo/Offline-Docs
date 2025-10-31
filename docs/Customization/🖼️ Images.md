---
order: 2
---

# Images

Images can be added to your documentation by placing them in a folder called `images` inside your `docs` folder.
These images will then be automatically included in the final build and can be referenced in your markdown files like this:

```markdown
![Alt-Text](../images/main-banner.png)
```

Please note the `../` at the beginning of the path, is required, since this file here is located in the `Customization` subfolder of the `docs` folder.

This will render the image like this:
![Alt-Text](../images/main-banner.png)

## Banners

You can add a bit more flair to your documentation by adding banner images to the top of your markdown files.
To do this, simply add an image at the very top of your markdown file, before any other content:

```markdown
![Banner-Alt-Text](../images/banner-image.png)

# Your Documentation Title

Your documentation content goes here...
```

The recommended dimensions for banner images are `1280 x 225` pixels.
