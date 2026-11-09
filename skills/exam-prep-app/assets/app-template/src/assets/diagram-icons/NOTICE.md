# Diagram icons

This folder holds official product icons that lesson diagrams show beside node labels. The template ships none.

## Adding official icons

1. Download the icon set from its official source, for example the [Azure Architecture Icons](https://learn.microsoft.com/azure/architecture/icons/).
2. Read the icon terms on that page and make sure your use is covered. At the time of writing, Microsoft permits the Azure Architecture Icons in architectural diagrams, training materials and documentation, and reserves all other rights. Follow the published guidelines: keep the product name next to the icon, and don't crop, flip, rotate, distort or recolour it, or use it to represent your own app.
3. Copy each SVG **unaltered** to `src/assets/diagram-icons/<id>.svg`. Only the file name may change.
4. Register the id in `src/content/diagram-icons.ts` with the product name and the source file inside the downloaded set.
5. Set `icon: '<id>'` on the diagram nodes that show that product, then run `npm run validate`: label lines need 24 px more room with an icon, and the validator reports nodes that must grow.
6. Fill in the section below. `npm test` checks that every registered icon has a file, appears in this notice and is used by a diagram.

## Icons in this app

Icon set: _name, version and download URL_

Terms: _quote the terms that apply_

| id | Icon | Source file in the set |
|---|---|---|
