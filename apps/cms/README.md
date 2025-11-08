# CMS (Strapi)

## What it is

Strapi CMS used to manage content for the application at the hackathon.

## Prerequisites

- Node 22+ (check project .nvmrc in root folder)

## Create db dump

```bash
npm run strapi export -- --no-encrypt --no-compress -f src/data/data
```

## Restore db dump

```bash
npm run strapi import -- -f src/data/data.tar --exclude files
```
