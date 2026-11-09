import type { Lesson } from '../../lib/types.ts'

export const lesson: Lesson = {
  module: 'custom-tools',
  summary: {
    en: 'Built-in tools cover search, files and code, but a real agent must also reach **your** systems — an order database, a pricing engine, a ticketing API. A **custom tool** describes such a capability to the model with a name, a description and a JSON schema; the model decides on its own when to use it, so clear names and descriptions matter more than clever code. Foundry Agent Service gives you four ways to plug one in: **function calling** (your app runs the code), the **OpenAPI tool** (the service calls your REST API with credentials from a **project connection** — a stored endpoint + credential that tools reference instead of secrets in code), the **Azure Functions tool** (queue-based serverless code) and the **MCP tool** (MCP = Model Context Protocol: standard for exposing tools to agents), which is also how low-code **Azure Logic Apps** workflows reach today’s agents. With **file search** for RAG (retrieve relevant content and ground the answer in it), a **conversation** (durable item store for multi-turn state) and **memory** for returning users, a chat model becomes an agent that acts on fresh data.',
    de: 'Integrierte Tools decken Suche, Dateien und Code ab, aber ein echter Agent muss auch **deine** Systeme erreichen – eine Bestelldatenbank, eine Preis-Engine, eine Ticket-API. Ein **Custom Tool** beschreibt dem Modell eine solche Fähigkeit mit Name, Beschreibung und JSON-Schema; das Modell entscheidet selbst, wann es sie nutzt, daher zählen klare Namen und Beschreibungen mehr als cleverer Code. Foundry Agent Service bietet vier Wege zur Anbindung: **Function Calling** (deine App führt den Code aus), das **OpenAPI-Tool** (der Dienst ruft deine REST-API mit Zugangsdaten aus einer **Projektverbindung** auf – gespeicherter Endpoint + Credential, auf die Tools statt Secrets im Code verweisen), das **Azure-Functions-Tool** (Queue-basierter Serverless-Code) und das **MCP-Tool** (MCP = Model Context Protocol: Standard, um Agents Tools bereitzustellen), über das heute auch Low-Code-Workflows aus **Azure Logic Apps** an Agents kommen. Mit **File Search** für RAG (relevante Inhalte abrufen und die Antwort darauf stützen), einer **Conversation** (dauerhafter Item-Speicher für Zustand über mehrere Runden) und **Memory** für wiederkehrende Nutzer wird aus einem Chatmodell ein Agent, der mit aktuellen Daten handelt.',
  },
  examFocus: {
    en: 'Expect a system description followed by “which custom tool option fits?”, code that defines a `FunctionTool` (schema, `strict`, `required`, `additionalProperties`) or loops over `function_call` items and returns `function_call_output` with the same `call_id`, OpenAPI requirements (`operationId`, `securitySchemes`, project connections), the Azure Functions queue contract (`CorrelationId`, standard agent setup), and conversation history versus long-term memory.',
    de: 'Rechne mit einer Systembeschreibung und der Frage „Welche Custom-Tool-Option passt?“, mit Code, der ein `FunctionTool` definiert (Schema, `strict`, `required`, `additionalProperties`) oder `function_call`-Items verarbeitet und `function_call_output` mit derselben `call_id` zurückgibt, mit OpenAPI-Anforderungen (`operationId`, `securitySchemes`, Projektverbindungen), dem Queue-Vertrag des Azure-Functions-Tools (`CorrelationId`, Standard-Agent-Setup) sowie mit Gesprächsverlauf vs. Langzeitgedächtnis.',
  },
  diagrams: [
    {
      id: 'function-calling-round-trip',
      title: { en: 'Function calling: the round trip', de: 'Function Calling: der Hin- und Rückweg' },
      caption: {
        en: 'The schema lives in the agent, the code lives in your app. The function_call arrives in response.output; your app runs the code and sends a function_call_output with the same call_id through responses.create, and the model then answers or asks again.',
        de: 'Das Schema liegt im Agent, der Code in deiner App. Das function_call kommt in response.output an; deine App führt den Code aus und schickt über responses.create ein function_call_output mit derselben call_id zurück, dann antwortet das Modell oder fragt erneut.',
      },
      width: 960,
      height: 460,
      groups: [
        { id: 'g-app', x: 10, y: 15, w: 250, h: 425, label: { en: 'Your app (Python)', de: 'Deine App (Python)' }, tone: 'app' },
        { id: 'g-svc', x: 700, y: 15, w: 250, h: 425, label: 'Microsoft Foundry', tone: 'platform' },
      ],
      nodes: [
        { id: 'client', x: 25, y: 55, w: 220, h: 80, label: { en: 'Agent client', de: 'Agent-Client' }, sub: 'responses.create()', tone: 'app' },
        { id: 'fco', x: 35, y: 210, w: 200, h: 64, label: 'function_call_output', sub: { en: 'same call_id', de: 'gleiche call_id' }, tone: 'app', shape: 'pill' },
        { id: 'func', x: 25, y: 340, w: 220, h: 80, label: 'get_order_status()', sub: { en: 'your code, your network', de: 'dein Code, dein Netzwerk' }, tone: 'tool' },
        { id: 'agent', x: 715, y: 55, w: 220, h: 80, label: 'Agent version', sub: { en: 'model + FunctionTool schema', de: 'Modell + FunctionTool-Schema' }, tone: 'platform' },
        { id: 'model', x: 715, y: 340, w: 220, h: 80, label: 'Model deployment', sub: { en: 'decides: call tool or answer', de: 'entscheidet: Tool oder Antwort' }, tone: 'model' },
        { id: 'fc', x: 380, y: 348, w: 200, h: 64, label: 'function_call', sub: 'name · arguments · call_id', tone: 'model', shape: 'pill' },
      ],
      edges: [
        { id: 'e-prompt', from: 'client', to: 'agent', label: { en: 'prompt ⇄ answer', de: 'Prompt ⇄ Antwort' }, bidir: true },
        { id: 'e-run', from: 'agent', to: 'model' },
        { id: 'e-call', from: 'model', to: 'fc', label: 'in response.output' },
        { id: 'e-parse', from: 'fc', to: 'func', label: { en: 'parse arguments', de: 'Argumente parsen' } },
        { id: 'e-result', from: 'func', to: 'fco', label: { en: 'result', de: 'Ergebnis' } },
        { id: 'e-back', from: 'fco', to: 'client', label: 'responses.create' },
      ],
      steps: [
        {
          title: { en: 'Describe the function', de: 'Funktion beschreiben' },
          text: {
            en: 'The agent version holds a `FunctionTool`: a name, a description and a JSON schema for the parameters. The model only ever sees this schema — never your Python code.',
            de: 'Die Agent Version enthält ein `FunctionTool`: Name, Beschreibung und ein JSON-Schema für die Parameter. Das Modell sieht nur dieses Schema – nie deinen Python-Code.',
          },
          focus: ['agent'],
        },
        {
          title: { en: 'Send the prompt', de: 'Prompt senden' },
          text: {
            en: 'Your app calls `responses.create` — the Responses API (OpenAI-compatible API that returns a response object; keeps state via `previous_response_id` or a conversation) — in a conversation. The model reads the request together with the tool schemas and decides that it needs `get_order_status`.',
            de: 'Deine App ruft `responses.create` auf – die Responses API (OpenAI-kompatible API, die ein Response-Objekt liefert; hält den Zustand über `previous_response_id` oder eine Conversation) – in einer Conversation. Das Modell liest die Anfrage zusammen mit den Tool-Schemas und entscheidet, dass es `get_order_status` braucht.',
          },
          focus: ['client', 'e-prompt', 'agent', 'e-run', 'model'],
        },
        {
          title: { en: 'Receive a function_call', de: 'function_call empfangen' },
          text: {
            en: 'Instead of an answer, `response.output` contains a `function_call` item with the function name, the arguments as a JSON string and a `call_id`. The run expires 10 minutes after it was created — submit the output before then.',
            de: 'Statt einer Antwort enthält `response.output` ein `function_call`-Item mit Funktionsname, den Argumenten als JSON-String und einer `call_id`. Der Lauf verfällt 10 Minuten nach seiner Erstellung – reiche den Output vorher ein.',
          },
          focus: ['e-call', 'fc'],
        },
        {
          title: { en: 'Run your code', de: 'Deinen Code ausführen' },
          text: {
            en: 'Your app — the code around the agent client — parses the arguments, validates them (they are untrusted input) and runs the function inside your network, with your permissions.',
            de: 'Deine App – der Code rund um den Agent-Client – parst die Argumente, validiert sie (sie sind nicht vertrauenswürdiger Input) und führt die Funktion in deinem Netzwerk mit deinen Berechtigungen aus.',
          },
          focus: ['client', 'e-parse', 'func'],
        },
        {
          title: { en: 'Return the result', de: 'Ergebnis zurückgeben' },
          text: {
            en: 'Wrap the result in a `function_call_output` with the same `call_id` and send it with `responses.create` in the same conversation. The model uses it and either writes the final `output_text` or asks for another `function_call` — so your app loops until a response contains no more calls.',
            de: 'Verpacke das Ergebnis in ein `function_call_output` mit derselben `call_id` und schick es mit `responses.create` in derselben Conversation. Das Modell nutzt es und schreibt entweder den finalen `output_text` oder fordert ein weiteres `function_call` an – deine App wiederholt die Schleife also, bis eine Antwort keine Aufrufe mehr enthält.',
          },
          focus: ['e-result', 'fco', 'e-back', 'client', 'e-prompt'],
        },
      ],
    },
    {
      id: 'custom-tool-options',
      title: { en: 'Four ways to add a custom tool — and where the code runs', de: 'Vier Wege zum Custom Tool – und wo der Code läuft' },
      caption: {
        en: 'All four are entries in the agent’s tools list. They differ in who executes the code and how the agent reaches it.',
        de: 'Alle vier sind Einträge in der Tool-Liste des Agents. Sie unterscheiden sich darin, wer den Code ausführt und wie der Agent ihn erreicht.',
      },
      width: 960,
      height: 460,
      groups: [{ id: 'g-def', x: 10, y: 5, w: 510, h: 450, label: { en: 'Agent definition (tools list)', de: 'Agent-Definition (Tool-Liste)' }, tone: 'platform' }],
      nodes: [
        { id: 'agent', x: 30, y: 200, w: 200, h: 74, label: 'Agent version', sub: 'tools=[…]', tone: 'platform' },
        { id: 'fn', x: 300, y: 40, w: 200, h: 64, label: 'Function tool', sub: 'FunctionTool', tone: 'tool' },
        { id: 'oa', x: 300, y: 150, w: 200, h: 64, label: 'OpenAPI tool', sub: 'OpenApiTool', tone: 'tool' },
        { id: 'af', x: 300, y: 260, w: 200, h: 64, label: 'Azure Functions tool', sub: 'AzureFunctionTool', tone: 'tool' },
        { id: 'mc', x: 300, y: 370, w: 200, h: 64, label: 'MCP tool', sub: 'MCPTool', tone: 'tool' },
        { id: 's1', x: 610, y: 40, w: 320, h: 64, label: { en: 'Your app runs it', de: 'Deine App führt aus' }, sub: { en: 'returns function_call_output', de: 'liefert function_call_output' }, tone: 'app' },
        { id: 's2', x: 610, y: 150, w: 320, h: 64, label: { en: 'Your REST API', de: 'Deine REST-API' }, sub: { en: 'OpenAPI 3.0/3.1 spec + connection', de: 'OpenAPI-3.0/3.1-Spec + Verbindung' }, tone: 'external' },
        { id: 's3', x: 610, y: 260, w: 320, h: 64, label: { en: 'Function app via queues', de: 'Function App über Queues' }, sub: { en: 'input/output queue · CorrelationId', de: 'Ein-/Ausgabe-Queue · CorrelationId' }, tone: 'external' },
        { id: 's4', x: 610, y: 370, w: 320, h: 64, label: { en: 'Remote MCP server', de: 'Remote-MCP-Server' }, sub: { en: 'tools discovered at runtime', de: 'Tools zur Laufzeit entdeckt' }, tone: 'external' },
      ],
      edges: [
        { id: 'b1', from: 'agent', to: 'fn', via: [[265, 237], [265, 72]] },
        { id: 'b2', from: 'agent', to: 'oa', via: [[265, 237], [265, 182]] },
        { id: 'b3', from: 'agent', to: 'af', via: [[265, 237], [265, 292]] },
        { id: 'b4', from: 'agent', to: 'mc', via: [[265, 237], [265, 402]] },
        { id: 'x1', from: 'fn', to: 's1', label: 'function_call' },
        { id: 'x2', from: 'oa', to: 's2', label: 'HTTPS' },
        { id: 'x3', from: 'af', to: 's3', label: { en: 'via queue', de: 'über Queue' } },
        { id: 'x4', from: 'mc', to: 's4', label: 'tools/call' },
      ],
      steps: [
        {
          title: { en: 'Function calling', de: 'Function Calling' },
          text: {
            en: 'The schema lives in the agent, the code in your app. The service hands you a `function_call` and waits for your output — the right choice when the logic must run in your process or network.',
            de: 'Das Schema liegt im Agent, der Code in deiner App. Der Dienst übergibt dir ein `function_call` und wartet auf deinen Output – die richtige Wahl, wenn die Logik in deinem Prozess oder Netzwerk laufen muss.',
          },
          focus: ['b1', 'fn', 'x1', 's1'],
        },
        {
          title: { en: 'OpenAPI tool', de: 'OpenAPI-Tool' },
          text: {
            en: 'The service calls your HTTPS API itself, guided by an OpenAPI 3.0 or 3.1 spec in which every operation has an `operationId`. Anonymous, API-key and project-managed-identity auth are all configured through a project connection.',
            de: 'Der Dienst ruft deine HTTPS-API selbst auf, gesteuert durch eine OpenAPI-3.0- oder -3.1-Spec, in der jede Operation eine `operationId` hat. Anonyme, API-Key- und Projekt-Managed-Identity-Authentifizierung laufen alle über eine Projektverbindung.',
          },
          focus: ['b2', 'oa', 'x2', 's2'],
        },
        {
          title: { en: 'Azure Functions tool', de: 'Azure-Functions-Tool' },
          text: {
            en: 'The agent puts a message on a Storage input queue; a queue-triggered function answers on an output queue with the same `CorrelationId`. Asynchronous and retry-friendly — it needs the standard agent setup (your own Storage, AI Search and Cosmos DB).',
            de: 'Der Agent legt eine Nachricht in eine Storage-Eingabe-Queue; eine Queue-getriggerte Function antwortet über eine Ausgabe-Queue mit derselben `CorrelationId`. Asynchron und mit Wiederholungen – erfordert das Standard-Agent-Setup (eigenes Storage, AI Search und Cosmos DB).',
          },
          focus: ['b3', 'af', 'x3', 's3'],
        },
        {
          title: { en: 'MCP tool', de: 'MCP-Tool' },
          text: {
            en: 'A remote MCP server publishes reusable tools that any MCP client can discover at runtime. Choose it when many agents or frameworks share the same tools; the next module covers it in depth.',
            de: 'Ein Remote-MCP-Server veröffentlicht wiederverwendbare Tools, die jeder MCP-Client zur Laufzeit entdecken kann. Wähle ihn, wenn viele Agents oder Frameworks dieselben Tools teilen; das nächste Modul vertieft das.',
          },
          focus: ['b4', 'mc', 'x4', 's4'],
        },
      ],
    },
  ],
  concepts: [
    {
      term: 'Function tool (FunctionTool)',
      text: {
        en: 'A JSON-schema description of a function that your app implements: `name`, `description`, `parameters` and `strict`. The model never sees your code — only this schema — so describe the purpose and every parameter precisely. Add or change function definitions with the SDK or REST API; the portal can’t edit them and never executes your function code.',
        de: 'Eine JSON-Schema-Beschreibung einer Funktion, die deine App implementiert: `name`, `description`, `parameters` und `strict`. Das Modell sieht nie deinen Code – nur dieses Schema –, also beschreibe Zweck und jeden Parameter präzise. Funktionsdefinitionen fügst du per SDK oder REST API hinzu oder änderst sie dort; das Portal kann sie nicht bearbeiten und führt deinen Funktionscode nie aus.',
      },
    },
    {
      term: 'Strict mode',
      text: {
        en: 'With `strict=True` the generated arguments must match the schema exactly. List every property in `required`, make a field optional with a `null` union such as `"type": ["string", "null"]`, and set `additionalProperties` to `false` in every object.',
        de: 'Mit `strict=True` müssen die erzeugten Argumente exakt zum Schema passen. Führe jede Eigenschaft in `required` auf, mach ein Feld über eine Union mit `null` optional, etwa `"type": ["string", "null"]`, und setze `additionalProperties` in jedem Objekt auf `false`.',
      },
    },
    {
      term: 'function_call and function_call_output',
      text: {
        en: 'When the model needs your function, the response output contains a `function_call` item with `name`, `arguments` (a JSON string) and `call_id`. Your app runs the function and sends a `function_call_output` with the same `call_id` in the same conversation. The next response may contain another `function_call`, so loop until none is left.',
        de: 'Braucht das Modell deine Funktion, enthält der Response-Output ein `function_call`-Item mit `name`, `arguments` (ein JSON-String) und `call_id`. Deine App führt die Funktion aus und schickt ein `function_call_output` mit derselben `call_id` in derselben Conversation. Die nächste Antwort kann ein weiteres `function_call` enthalten, also wiederhole die Schleife, bis keines mehr kommt.',
      },
    },
    {
      term: 'OpenAPI tool',
      text: {
        en: 'Connects the agent to an HTTP API described by an OpenAPI 3.0 or 3.1 spec; the service calls the API itself. Every operation needs an `operationId` (letters, `-` and `_` only). The secret lives only in a project connection (anonymous, API key or project managed identity); for an API key the spec just declares how it is sent — `components.securitySchemes` plus a top-level `security` entry (see the code). The tool takes the connection’s full resource ID, `project.connections.get(name).id`.',
        de: 'Verbindet den Agent mit einer HTTP-API, die eine OpenAPI-3.0- oder -3.1-Spec beschreibt; der Dienst ruft die API selbst auf. Jede Operation braucht eine `operationId` (nur Buchstaben, `-` und `_`). Das Secret liegt nur in einer Projektverbindung (anonym, API-Key oder Projekt-Managed-Identity); bei einem API-Key legt die Spec nur fest, wie er gesendet wird – `components.securitySchemes` plus ein `security`-Eintrag auf oberster Ebene (siehe Code). Das Tool erwartet die vollständige Ressourcen-ID der Verbindung, `project.connections.get(name).id`.',
      },
    },
    {
      term: 'Azure Functions tool',
      text: {
        en: '`AzureFunctionTool` runs queue-triggered code in four steps: (1) the agent writes `function_args` and a `CorrelationId` to a Storage input queue; (2) the queue trigger starts your function; (3) the function writes `{"Value": …, "CorrelationId": …}` to an output queue; (4) the agent matches the reply by `CorrelationId`. It needs the **standard agent setup** (your own Azure Storage, Azure AI Search and Azure Cosmos DB for NoSQL keep agent data in your tenant) for its queue resources and managed network integration; the **basic setup**, where Foundry manages agent state storage, doesn’t support it.',
        de: '`AzureFunctionTool` führt Queue-getriggerten Code in vier Schritten aus: (1) Der Agent schreibt `function_args` und eine `CorrelationId` in eine Storage-Eingabe-Queue; (2) der Queue-Trigger startet deine Function; (3) die Function schreibt `{"Value": …, "CorrelationId": …}` in eine Ausgabe-Queue; (4) der Agent ordnet die Antwort über die `CorrelationId` zu. Es braucht das **Standard-Agent-Setup** (eigenes Azure Storage, Azure AI Search und Azure Cosmos DB for NoSQL halten Agent-Daten in deinem Tenant) wegen dessen Queue-Ressourcen und verwalteter Netzwerkintegration; das **Basic-Setup**, in dem Foundry die Speicherung des Agent-Zustands verwaltet, unterstützt es nicht.',
      },
    },
    {
      term: 'Retrieval with file search',
      text: {
        en: 'The file search tool indexes uploaded documents in a vector store and retrieves the relevant chunks at answer time — RAG without building your own search pipeline.',
        de: 'Das File-Search-Tool indexiert hochgeladene Dokumente in einem Vector Store und ruft beim Antworten die passenden Abschnitte ab – RAG ohne eigene Such-Pipeline.',
      },
    },
    {
      term: 'Conversation memory',
      text: {
        en: 'A conversation keeps the turn-by-turn history of one session (short-term memory). A **memory store** (preview) adds long-term memory: it extracts facts such as user preferences from conversations and makes them available in future sessions.',
        de: 'Eine Conversation hält den Verlauf einer Sitzung Runde für Runde (Kurzzeitgedächtnis). Ein **Memory Store** (Preview) ergänzt ein Langzeitgedächtnis: Er extrahiert Fakten wie Nutzerpräferenzen aus Gesprächen und stellt sie in künftigen Sitzungen bereit.',
      },
    },
  ],
  comparison: {
    title: { en: 'Which custom tool option?', de: 'Welche Custom-Tool-Option?' },
    columns: [
      { en: 'Option', de: 'Option' },
      { en: 'Where the code runs', de: 'Wo der Code läuft' },
      { en: 'Choose it when', de: 'Wähle sie, wenn' },
      { en: 'Watch out', de: 'Achtung' },
    ],
    rows: [
      [
        'Function calling',
        { en: 'In your app (client-side)', de: 'In deiner App (clientseitig)' },
        { en: 'Logic must stay in your process or private network', de: 'Logik in deinem Prozess oder privaten Netz bleiben muss' },
        { en: 'Runs expire 10 minutes after creation; not available in toolboxes', de: 'Läufe verfallen 10 Minuten nach ihrer Erstellung; nicht in Toolboxes verfügbar' },
      ],
      [
        'OpenAPI tool',
        { en: 'The service calls your HTTPS API', de: 'Der Dienst ruft deine HTTPS-API auf' },
        { en: 'The API already has an OpenAPI 3.0/3.1 description', de: 'Die API bereits eine OpenAPI-3.0/3.1-Beschreibung hat' },
        { en: '`operationId` per operation; one API-key scheme per tool', de: '`operationId` je Operation; ein API-Key-Schema pro Tool' },
      ],
      [
        'Azure Functions tool',
        { en: 'Function app, triggered via Storage queues', de: 'Function App, ausgelöst über Storage-Queues' },
        { en: 'Work is asynchronous and needs reliable delivery with retries', de: 'Arbeit asynchron ist und zuverlässige Zustellung mit Wiederholungen braucht' },
        { en: 'Standard agent setup; reply must carry the `CorrelationId`. Need a synchronous call? Host an MCP server in the function app or expose an HTTP-triggered function through the OpenAPI tool', de: 'Standard-Agent-Setup; Antwort muss die `CorrelationId` tragen. Synchroner Aufruf nötig? Einen MCP-Server in der Function App hosten oder eine HTTP-getriggerte Function über das OpenAPI-Tool bereitstellen' },
      ],
      [
        'MCP tool',
        { en: 'A remote MCP server', de: 'Ein Remote-MCP-Server' },
        { en: 'Many agents or frameworks share the same tools', de: 'Viele Agents oder Frameworks dieselben Tools teilen' },
        { en: 'Remote endpoints only; approvals default to `always`', de: 'Nur Remote-Endpoints; Freigaben standardmäßig `always`' },
      ],
      [
        { en: 'Azure Logic Apps (low-code)', de: 'Azure Logic Apps (Low-Code)' },
        { en: 'A Standard logic app: workflows or connector actions (1,400+ connectors)', de: 'Eine Standard-Logic-App: Workflows oder Connector-Aktionen (über 1.400 Connectors)' },
        { en: 'You want integrations without code, and the workflow should handle retries and long-running steps', de: 'Du Integrationen ohne Code willst und der Workflow Wiederholungen und lang laufende Schritte übernehmen soll' },
        { en: 'In the current Foundry, agents reach it through MCP: connector actions or a Standard workflow become an MCP server (preview) that you add as an MCP tool. The Logic Apps agent action works only with Foundry (classic) agents, which retire on March 31, 2027', de: 'Im aktuellen Foundry erreichen Agents sie über MCP: Connector-Aktionen oder ein Standard-Workflow werden zu einem MCP-Server (Preview), den du als MCP-Tool hinzufügst. Die Logic-Apps-Agent-Aktion funktioniert nur mit Agents in Foundry (classic), die am 31. März 2027 eingestellt werden' },
      ],
    ],
  },
  code: [
    {
      title: { en: 'Function calling: define, receive, execute, return', de: 'Function Calling: definieren, empfangen, ausführen, zurückgeben' },
      code: `import json
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import FunctionTool, PromptAgentDefinition
from openai.types.responses.response_input_param import FunctionCallOutput

def get_order_status(order_id: str) -> str:          # runs in YOUR app
    return json.dumps({"order_id": order_id, "status": "shipped"})

project = AIProjectClient(endpoint="https://<resource>.services.ai.azure.com/api/projects/<project>",
                          credential=DefaultAzureCredential(),
                          allow_preview=True)  # agent endpoint (preview); SDK reference asks for allow_preview
tool = FunctionTool(
    name="get_order_status",
    description="Get the shipping status of a Fabrikam order.",
    parameters={"type": "object",
                "properties": {"order_id": {"type": "string", "description": "Order number, e.g. FAB-1042"}},
                "required": ["order_id"], "additionalProperties": False},
    strict=True,
)
agent = project.agents.create_version(
    agent_name="order-agent",
    definition=PromptAgentDefinition(model="gpt-5-mini",  # deployment name
                                     instructions="Use tools for order questions.", tools=[tool]),
)
openai = project.get_openai_client(agent_name=agent.name)
conv = openai.conversations.create()
response = openai.responses.create(conversation=conv.id, input="Where is order FAB-1042?")

while True:                                          # the model may ask for another call
    outputs = []
    for item in response.output:
        if item.type != "function_call":
            continue
        args = json.loads(item.arguments)            # untrusted input: validate before use
        if item.name == "get_order_status" and str(args.get("order_id", "")).startswith("FAB-"):
            result = get_order_status(args["order_id"])
        else:
            result = json.dumps({"error": "unknown function or invalid order_id"})
        outputs.append(FunctionCallOutput(type="function_call_output", call_id=item.call_id, output=result))
    if not outputs:                                  # no calls left: this is the final answer
        break
    response = openai.responses.create(conversation=conv.id, input=outputs)
print(response.output_text)`,
      notes: [
        { en: '`arguments` is a JSON string from the model — validate it like user input and answer an invalid call with an error output instead of skipping it.', de: '`arguments` ist ein JSON-String vom Modell – validiere ihn wie Nutzereingaben und beantworte einen ungültigen Aufruf mit einem Fehler-Output, statt ihn auszulassen.' },
        { en: 'The `call_id` links each output to its call; all outputs of one response go back together, in the same conversation.', de: 'Die `call_id` verknüpft jeden Output mit seinem Aufruf; alle Outputs einer Antwort gehen gemeinsam zurück, in derselben Conversation.' },
        { en: 'The loop ends when a response contains no `function_call`; submit outputs before the run expires (10 minutes after creation). `model=` names your deployment, which can have any name.', de: 'Die Schleife endet, wenn eine Antwort kein `function_call` mehr enthält; reiche Outputs ein, bevor der Lauf verfällt (10 Minuten nach der Erstellung). `model=` nennt dein Deployment, das beliebig heißen kann.' },
      ],
    },
    {
      title: { en: 'OpenAPI tool authenticated through a project connection', de: 'OpenAPI-Tool mit Authentifizierung über eine Projektverbindung' },
      code: `import jsonref
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    OpenApiFunctionDefinition, OpenApiProjectConnectionAuthDetails,
    OpenApiProjectConnectionSecurityScheme, OpenApiTool, PromptAgentDefinition,
)

project = AIProjectClient(endpoint="https://<resource>.services.ai.azure.com/api/projects/<project>",
                          credential=DefaultAzureCredential())
# The spec only declares HOW the key is sent; the connection "order-api" stores the key itself:
#   "components": {"securitySchemes": {"apiKeyHeader": {"type": "apiKey", "name": "x-api-key", "in": "header"}}},
#   "security": [{"apiKeyHeader": []}]
with open("order_history_openapi.json") as f:
    spec = jsonref.loads(f.read())

connection = project.connections.get("order-api")   # .id = full resource ID .../connections/order-api
order_api = OpenApiTool(
    openapi=OpenApiFunctionDefinition(
        name="order_history",
        spec=spec,
        description="Look up a customer's past orders.",
        auth=OpenApiProjectConnectionAuthDetails(
            security_scheme=OpenApiProjectConnectionSecurityScheme(project_connection_id=connection.id)
        ),
    )
)
project.agents.create_version(
    agent_name="order-agent",
    definition=PromptAgentDefinition(model="gpt-5-mini", instructions="Use order_history for past orders.",
                                     tools=[order_api]),
)`,
      notes: [
        { en: 'The connection’s auth type (none, API key, or project managed identity) decides how the service calls the API. The OpenAPI tool needs the full resource ID; the MCP tool samples pass just the connection name.', de: 'Der Auth-Typ der Verbindung (keine, API-Key oder Projekt-Managed-Identity) bestimmt, wie der Dienst die API aufruft. Das OpenAPI-Tool braucht die vollständige Ressourcen-ID; die Beispiele zum MCP-Tool übergeben nur den Verbindungsnamen.' },
        { en: 'For an API key, the key name in the connection must equal the scheme’s `name` (`x-api-key`), and the spec needs both `securitySchemes` and `security`.', de: 'Bei einem API-Key muss der Schlüsselname in der Verbindung dem `name` des Schemas entsprechen (`x-api-key`), und die Spec braucht sowohl `securitySchemes` als auch `security`.' },
        { en: 'No client loop needed: the service calls the API and feeds the result to the model.', de: 'Keine Client-Schleife nötig: Der Dienst ruft die API auf und gibt das Ergebnis ans Modell.' },
      ],
    },
    {
      title: { en: 'Azure Functions tool: the queue contract', de: 'Azure-Functions-Tool: der Queue-Vertrag' },
      code: `from azure.ai.projects.models import (AzureFunctionBinding, AzureFunctionDefinition,
    AzureFunctionDefinitionFunction, AzureFunctionStorageQueue, AzureFunctionTool)
QUEUES = "https://<storage-account>.queue.core.windows.net"   # queue service endpoint
warranty_tool = AzureFunctionTool(azure_function=AzureFunctionDefinition(
    input_binding=AzureFunctionBinding(storage_queue=AzureFunctionStorageQueue(
        queue_name="warranty-input", queue_service_endpoint=QUEUES)),
    output_binding=AzureFunctionBinding(storage_queue=AzureFunctionStorageQueue(
        queue_name="warranty-output", queue_service_endpoint=QUEUES)),
    function=AzureFunctionDefinitionFunction(name="open_warranty_claim", description="Open a warranty claim.",
        parameters={"type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]}),
))
# The function replies on warranty-output with {"Value": result, "CorrelationId": msg["CorrelationId"]}`,
      notes: [
        { en: 'Attach it like any tool (`PromptAgentDefinition(..., tools=[warranty_tool])`) in a project with the standard agent setup.', de: 'Häng es wie jedes Tool an (`PromptAgentDefinition(..., tools=[warranty_tool])`), in einem Projekt mit Standard-Agent-Setup.' },
        { en: 'The function reads `msg["function_args"]` and must echo the incoming `CorrelationId`, or the agent can’t match the reply to its call.', de: 'Die Function liest `msg["function_args"]` und muss die eingehende `CorrelationId` zurückgeben, sonst kann der Agent die Antwort nicht seinem Aufruf zuordnen.' },
        { en: 'Grant **Storage Queue Data Contributor** to both the project’s and the function app’s managed identity.', de: 'Vergib **Storage Queue Data Contributor** an die Managed Identity des Projekts und an die der Function App.' },
      ],
    },
  ],
  traps: [
    {
      en: 'The model can’t read your code. Vague names or descriptions cause missed or wrong calls — improve the schema text before blaming the model.',
      de: 'Das Modell kann deinen Code nicht lesen. Vage Namen oder Beschreibungen führen zu ausgelassenen oder falschen Aufrufen – verbessere den Schema-Text, bevor du dem Modell die Schuld gibst.',
    },
    {
      en: 'Function tools need your app in the loop: without a `function_call_output` there is no final answer, and the run expires 10 minutes after it was created. For slow work, return a status immediately and let the user poll.',
      de: 'Function Tools brauchen deine App in der Schleife: Ohne `function_call_output` gibt es keine finale Antwort, und der Lauf verfällt 10 Minuten nach seiner Erstellung. Für langsame Arbeit gibst du sofort einen Status zurück und lässt den Nutzer nachfragen.',
    },
    {
      en: 'The Foundry portal shows agents with function tools but can’t add or edit function definitions and doesn’t execute your functions — configure and test function calling with the SDK or REST API.',
      de: 'Das Foundry-Portal zeigt Agents mit Function Tools an, kann aber keine Funktionsdefinitionen hinzufügen oder bearbeiten und führt deine Funktionen nicht aus – konfiguriere und teste Function Calling per SDK oder REST API.',
    },
    {
      en: 'API key not sent? The OpenAPI spec needs both `components.securitySchemes` and a top-level `security` section, and only one API-key scheme fits in one OpenAPI tool.',
      de: 'API-Key wird nicht gesendet? Die OpenAPI-Spec braucht sowohl `components.securitySchemes` als auch einen `security`-Abschnitt auf oberster Ebene, und pro OpenAPI-Tool passt nur ein API-Key-Schema.',
    },
    {
      en: 'The queue-based Azure Functions tool isn’t supported in the basic agent setup, and a reply without the original `CorrelationId` can’t be matched to its tool call.',
      de: 'Das Queue-basierte Azure-Functions-Tool wird im Basic-Agent-Setup nicht unterstützt, und eine Antwort ohne die ursprüngliche `CorrelationId` lässt sich keinem Tool-Aufruf zuordnen.',
    },
  ],
  takeaways: [
    { en: 'Must run in your process → function calling; existing REST API with a spec → OpenAPI tool; asynchronous queue work → Azure Functions tool; shared tool server → MCP.', de: 'Muss in deinem Prozess laufen → Function Calling; bestehende REST-API mit Spec → OpenAPI-Tool; asynchrone Queue-Arbeit → Azure-Functions-Tool; geteilter Tool-Server → MCP.' },
    { en: 'Strict schemas: every property in `required`, `additionalProperties: false`.', de: 'Strikte Schemas: jede Eigenschaft in `required`, `additionalProperties: false`.' },
    { en: 'Answer each `function_call` with a `function_call_output` carrying the same `call_id`, in the same conversation.', de: 'Beantworte jedes `function_call` mit einem `function_call_output` mit derselben `call_id` in derselben Conversation.' },
    { en: 'Secrets live in project connections — never in specs, prompts or code.', de: 'Secrets gehören in Projektverbindungen – nie in Specs, Prompts oder Code.' },
    { en: 'Conversation = this session’s history; memory store (preview) = what to remember next time.', de: 'Conversation = Verlauf dieser Sitzung; Memory Store (Preview) = was beim nächsten Mal erinnert werden soll.' },
  ],
  sources: [
    { title: 'Use function calling with Microsoft Foundry agents', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/function-calling' },
    { title: 'Connect agents to OpenAPI tools', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/openapi' },
    { title: 'Use Azure Functions with Foundry Agent Service', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/azure-functions' },
    { title: 'What is Toolbox in Foundry?', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/toolbox-overview' },
    { title: 'What is Memory?', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/what-is-memory' },
    { title: 'Add agent tools in Foundry backed by connector actions in Azure Logic Apps (preview)', url: 'https://learn.microsoft.com/en-us/azure/logic-apps/add-agent-tools-connector-actions' },
    { title: 'Create remote Model Context Protocol (MCP) servers from Standard workflows (preview)', url: 'https://learn.microsoft.com/en-us/azure/logic-apps/create-model-context-protocol-server-standard' },
    { title: 'Run workflows in Azure Logic Apps from agents in Foundry Agent Service (preview)', url: 'https://learn.microsoft.com/en-us/azure/logic-apps/add-agent-action-create-run-workflow' },
  ],
}
