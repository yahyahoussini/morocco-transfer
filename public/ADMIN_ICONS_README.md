# Admin PWA Icons

Due to image generation service being unavailable, you'll need to create admin-specific icons manually.

## Required Icons:
1. **icon-admin-192.png** (192x192px)
2. **icon-admin-512.png** (512x512px)

## Design Guidelines:
- Dark background (#0a0a0a)
- Gold/brass (#d4af37) symbol (shield, crown, or gear)
- Modern, minimalist design
- Should be distinct from customer app icons

## Temporary Solution:
You can copy the existing icons and rename them:
```bash
cp public/icon-192.png public/icon-admin-192.png
cp public/icon-512.png public/icon-admin-512.png
```

This will allow the admin PWA to work immediately, and you can replace with custom icons later.
