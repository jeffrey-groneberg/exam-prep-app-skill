import type { Domain } from '../lib/types.ts'

/**
 * The exam's skills outline: domains with their official weight ranges, skill groups and bullets.
 * English bullet text is quoted verbatim from the study guide (exam.json links.studyGuide, version
 * skillsOutlineDate); German text is a translation. Bullet ids ("1.2.3" = domain 1, group 2, bullet 3) are the
 * app's own numbering, because the study guide does not number its bullets.
 *
 * Sample: the part of the AI-103 outline ("Skills measured as of April 16, 2026") that the sample content covers.
 */
export const domains: Domain[] = [
  {
    id: 'D1',
    title: { en: 'Plan and manage an Azure AI solution', de: 'Azure-KI-Lösung planen und verwalten' },
    short: { en: 'Plan & manage', de: 'Planen & verwalten' },
    weight: [25, 30],
    icon: 'cloud',
    groups: [
      {
        id: '1.2',
        title: { en: 'Set up AI solutions in Foundry', de: 'KI-Lösungen in Foundry einrichten' },
        bullets: [
          { id: '1.2.3', en: 'Configure model and agent deployments', de: 'Modell- und Agent-Bereitstellungen konfigurieren' },
          { id: '1.2.4', en: 'Integrate Foundry projects with continuous integration and continuous deployment (CI/CD) pipelines', de: 'Foundry-Projekte in CI/CD-Pipelines integrieren' },
        ],
      },
      {
        id: '1.4',
        title: { en: 'Implement responsible AI across generative AI and agentic systems', de: 'Verantwortungsvolle KI in generativen und agentischen Systemen umsetzen' },
        bullets: [
          { id: '1.4.3', en: 'Implement auditing through trace logging, provenance metadata, and approval workflows', de: 'Auditing über Trace-Logging, Herkunftsmetadaten und Genehmigungsworkflows umsetzen' },
          { id: '1.4.4', en: 'Govern agent behavior with oversight modes, constraints, and tool-access controls', de: 'Agent-Verhalten über Aufsichtsmodi, Einschränkungen und Tool-Zugriffskontrollen steuern' },
        ],
      },
    ],
  },
  {
    id: 'D2',
    title: { en: 'Implement generative AI and agentic solutions', de: 'Generative KI und agentische Lösungen implementieren' },
    short: { en: 'GenAI & agents', de: 'GenAI & Agents' },
    weight: [30, 35],
    icon: 'brain',
    groups: [
      {
        id: '2.2',
        title: { en: 'Build agents by using Foundry', de: 'Agents mit Foundry bauen' },
        bullets: [
          { id: '2.2.1', en: 'Define agent roles, goals, conversation-tracking approach, and tool schemas', de: 'Rollen, Ziele, Gesprächsverfolgung und Tool-Schemas von Agents definieren' },
          { id: '2.2.2', en: 'Build agents that integrate retrieval, function-calling, and conversation memory', de: 'Agents mit Retrieval, Function Calling und Gesprächsgedächtnis bauen' },
          { id: '2.2.3', en: 'Integrate agent tools, including APIs, knowledge stores, search, content understanding, and custom functions', de: 'Agent-Tools integrieren: APIs, Wissensspeicher, Suche, Content Understanding und eigene Funktionen' },
          { id: '2.2.5', en: 'Build autonomous or semiautonomous workflows with safeguards and approval flow controls', de: 'Autonome oder teilautonome Workflows mit Schutzmechanismen und Genehmigungsschritten bauen' },
          { id: '2.2.6', en: 'Integrate monitoring into deployed agents, evaluate agent behavior, and perform error analysis', de: 'Bereitgestellte Agents überwachen, ihr Verhalten evaluieren und Fehler analysieren' },
        ],
      },
      {
        id: '2.3',
        title: { en: 'Optimize and operationalize generative AI systems', de: 'Generative KI-Systeme optimieren und betreiben' },
        bullets: [
          { id: '2.3.3', en: 'Set up observability by implementing tracing, token analytics, safety signals, and latency breakdowns', de: 'Observability einrichten: Tracing, Token-Analysen, Sicherheitssignale und Latenzaufschlüsselung' },
        ],
      },
    ],
  },
]
