import type { CourseModule, LearningPath } from '../lib/types.ts'

/**
 * The official course as the Microsoft Learn Catalog API lists it: learning paths in course order, each with its
 * modules (official English titles, URLs, minutes and unit titles) and the skills-outline bullets each module
 * teaches. Generate a draft with the skill's learn-catalog.mjs script; `npm run check:learn` reports drift.
 *
 * Sample: the first three modules of the learning path "Develop AI agents on Azure" of course AI-103T00,
 * retrieved 2026-11-06.
 */
export const CATALOG_RETRIEVED = '2026-11-06'

export const learningPaths: LearningPath[] = [
  {
    id: "agents",
    uid: "learn.wwl.develop-ai-agents-azure",
    title: "Develop AI agents on Azure",
    url: "https://learn.microsoft.com/en-us/training/paths/develop-ai-agents-azure/",
    modules: ["agents-vscode", "custom-tools", "mcp-tools"],
  },
]

export const modules: CourseModule[] = [
  {
    id: "agents-vscode",
    uid: "learn.wwl.develop-ai-agents-azure-vs-code",
    title: "Develop AI agents with Microsoft Foundry and Visual Studio Code",
    url: "https://learn.microsoft.com/en-us/training/modules/develop-ai-agents-azure-vs-code/",
    minutes: 95,
    pathId: "agents",
    units: [
      "Introduction",
      "Understand AI agents and Microsoft Foundry Agent Service",
      "Explore development approaches",
      "Build your first agent in Microsoft Foundry",
      "Set up Visual Studio Code for agent development",
      "Configure and manage agents in Visual Studio Code",
      "Extend agent capabilities with tools",
      "Test, deploy, and integrate agents",
      "Exercise - Build and deploy an AI agent",
      "Knowledge check",
      "Summary",
    ],
    skills: ["2.2.1", "2.2.6", "2.3.3", "1.2.3", "1.2.4", "1.4.3"],
  },
  {
    id: "custom-tools",
    uid: "learn.wwl.build-agent-with-custom-tools",
    title: "Integrate custom tools into your agent",
    url: "https://learn.microsoft.com/en-us/training/modules/build-agent-with-custom-tools/",
    minutes: 53,
    pathId: "agents",
    units: [
      "Introduction",
      "Why use custom tools",
      "Options for implementing custom tools",
      "How to integrate custom tools",
      "Exercise - Build an agent with custom tools",
      "Module assessment",
      "Summary",
    ],
    skills: ["2.2.1", "2.2.2", "2.2.3"],
  },
  {
    id: "mcp-tools",
    uid: "learn.wwl.connect-agent-to-mcp-tools",
    title: "Integrate MCP Tools with Azure AI Agents",
    url: "https://learn.microsoft.com/en-us/training/modules/connect-agent-to-mcp-tools/",
    minutes: 51,
    pathId: "agents",
    units: [
      "Introduction",
      "Understand MCP tool discovery",
      "Integrate agent tools using an MCP server and client",
      "Use Azure AI agents with MCP servers",
      "Exercise - Connect MCP tools to Azure AI Agents",
      "Module assessment",
      "Summary",
    ],
    skills: ["2.2.3", "2.2.5", "1.4.3", "1.4.4"],
  },
]
