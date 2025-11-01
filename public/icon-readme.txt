# Extension Icons

This folder should contain the extension icons in PNG format.

Required icon sizes:
- 16x16 (16.png) - Toolbar icon
- 32x32 (32.png) - Toolbar icon @2x
- 48x48 (48.png) - Extensions page
- 128x128 (128.png) - Chrome Web Store

## Creating Icons

You can create icons using:
1. **Online tools**: 
   - https://www.favicon-generator.org/
   - https://realfavicongenerator.net/

2. **Design software**:
   - Figma, Adobe Illustrator, Inkscape
   - Export in required sizes

3. **Icon libraries**:
   - Use a lightbulb icon to match the extension theme
   - Recommended: Purple/gradient colors to match the UI

## Icon Design Guidelines

- Use simple, recognizable shapes
- Ensure visibility at 16x16 size
- Use consistent style across all sizes
- Test in both light and dark browser themes
- Follow browser-specific guidelines:
  - Chrome: https://developer.chrome.com/docs/webstore/images/
  - Firefox: https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/

## Temporary Placeholder

Until you create custom icons, WXT will use default icons. The extension will work fine, but custom icons provide better branding.

## Quick Start

Replace these files with your custom icons:
- public/icon/16.png
- public/icon/32.png
- public/icon/48.png
- public/icon/128.png

Or create a single icon.png in the public folder and WXT will auto-generate all sizes.
