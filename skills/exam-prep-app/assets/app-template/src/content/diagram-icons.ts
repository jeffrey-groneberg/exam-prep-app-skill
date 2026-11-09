/**
 * Registry of official product icons that lesson diagrams may show beside a node label (`icon: '<id>'`).
 * The template ships none: a node without an icon centres its label, and the home thumbnail shows a Fluent UI
 * glyph for the node's tone instead.
 *
 * To use official icons (for example the Azure Architecture Icons, https://learn.microsoft.com/azure/architecture/icons/),
 * check that their terms allow your use, copy each SVG unaltered to src/assets/diagram-icons/<id>.svg, register it
 * below with its display name and source file, and list it in src/assets/diagram-icons/NOTICE.md with the terms.
 * The validator then accepts the id, budgets the icon in every label line, and tests check files, registry and notice.
 *
 *   'key-vault': { name: 'Key Vaults', source: 'security/10245-icon-service-Key-Vaults.svg' },
 */
export const DIAGRAM_ICONS = {} as const satisfies Record<string, { name: string; source: string }>

export type DiagramIconId = keyof typeof DIAGRAM_ICONS

export function isDiagramIcon(id: unknown): id is DiagramIconId {
  return typeof id === 'string' && Object.hasOwn(DIAGRAM_ICONS, id)
}
