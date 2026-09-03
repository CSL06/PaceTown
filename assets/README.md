# PaceTown Asset Library

This folder is the asset handoff for the next implementation pass.

## Start here

1. Read [NEXT_IMPLEMENTATION.md](NEXT_IMPLEMENTATION.md) for the recommended import order and source selection.
2. Use [PACETOWN_ASSET_COMPLETION_CHECKLIST.md](PACETOWN_ASSET_COMPLETION_CHECKLIST.md) as the authoritative source for what is complete, what must be assembled, and what still needs custom generation.
3. Read [third-party/ASSET_MANIFEST.md](third-party/ASSET_MANIFEST.md) before copying assets into the application.
4. Read [generated/README.md](generated/README.md) for approved custom character art and draft warnings.
5. Use [production/character-redesign-v3/README.md](production/character-redesign-v3/README.md) for the exact-grid character sprites, atlases, and animations.
6. Use [production/style-checks/README.md](production/style-checks/README.md) to verify character/world scale, palette, and pack boundaries.
7. Use [production/character-redesign-v3/README.md](production/character-redesign-v3/README.md) for the improved portrait-faithful character bases. The older `production/characters/` bundle has been removed as deprecated.
6. Prefer assets under `third-party/cc0/` because they are the simplest to use and redistribute.
7. Treat `third-party/custom-license/` as local source material that must not be republished as a standalone asset pack.
8. Do not use `third-party/cc-by-sa-4.0/` until the project owner accepts the share-alike requirement.

## Folder layout

```text
assets/
├── README.md
├── NEXT_IMPLEMENTATION.md
├── generated/                   Custom PaceTown art and generation handoff
├── production/                  Exact-grid runtime assets and manifests
└── third-party/
    ├── ASSET_MANIFEST.md
    ├── _archives/                 Original downloaded archives
    ├── cc0/                       Preferred, permissive sources
    ├── custom-license/            Usable in-game; raw redistribution restricted
    └── cc-by-sa-4.0/              Quarantined pending license decision
```

The source archives are retained for provenance. Do not ship `_archives/` inside the web application.
