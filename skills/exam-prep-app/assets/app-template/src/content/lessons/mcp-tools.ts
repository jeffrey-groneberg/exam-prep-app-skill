import type { Lesson } from '../../lib/types.ts'

export const lesson: Lesson = {
  module: 'mcp-tools',
  summary: {
    en: 'The **Model Context Protocol (MCP)** is an open standard for exposing tools to agents. An **MCP server** publishes tools with names, descriptions and input schemas; an **MCP client** discovers them at runtime and calls them, so you can add or change tools on the server without touching the agent — “integrate once”. In Foundry Agent Service you attach a remote server to a **prompt agent** (declarative agent: model + instructions + tools, versioned in Foundry) with the **MCP tool** (`server_label`, `server_url`), restrict what the model may use with `allowed_tools`, keep a human in the loop with `require_approval`, and keep credentials in a **project connection** (stored endpoint + credential that tools reference instead of secrets in code). Alternatively, your own code acts as the MCP client and hands the server’s tools to the agent as function tools.',
    de: 'Das **Model Context Protocol (MCP)** ist ein offener Standard, um Agents Tools bereitzustellen. Ein **MCP-Server** veröffentlicht Tools mit Namen, Beschreibungen und Eingabeschemas; ein **MCP-Client** entdeckt sie zur Laufzeit und ruft sie auf – so änderst du Tools auf dem Server, ohne den Agent anzufassen („einmal integrieren“). In Foundry Agent Service bindest du einen Remote-Server mit dem **MCP-Tool** (`server_label`, `server_url`) an einen **Prompt Agent** (deklarativer Agent: Modell + Anweisungen + Tools, in Foundry versioniert), schränkst mit `allowed_tools` ein, was das Modell nutzen darf, hältst mit `require_approval` einen Menschen in der Schleife und legst Zugangsdaten in einer **Projektverbindung** ab (gespeicherter Endpoint + Credential, auf die Tools statt Secrets im Code verweisen). Alternativ agiert dein eigener Code als MCP-Client und reicht die Server-Tools als Function Tools an den Agent weiter.',
  },
  examFocus: {
    en: 'Expect questions on server vs client roles, why new server tools appear without redeploying, the MCP tool parameters (`server_label`, `server_url`, `allowed_tools`, `require_approval`, `project_connection_id`), the approval round trip (`mcp_approval_request` → `mcp_approval_response` with `approval_request_id` in the same conversation — the durable item store for multi-turn state), the trap that an empty `allowed_tools` list allows everything, authentication choices, remote-only endpoints, and governance with toolboxes or an AI gateway.',
    de: 'Rechne mit Fragen zu den Rollen von Server und Client, warum neue Server-Tools ohne Redeployment erscheinen, zu den Parametern des MCP-Tools (`server_label`, `server_url`, `allowed_tools`, `require_approval`, `project_connection_id`), zur Freigabeschleife (`mcp_approval_request` → `mcp_approval_response` mit `approval_request_id` in derselben Conversation – dem dauerhaften Item-Speicher für Zustand über mehrere Runden), zur Falle, dass eine leere `allowed_tools`-Liste alles erlaubt, zu Authentifizierungsoptionen, reinen Remote-Endpoints sowie zur Governance mit Toolboxes oder einem AI Gateway.',
  },
  diagrams: [
    {
      id: 'mcp-approval-flow',
      title: { en: 'Agent ↔ MCP server: discovery, allowlist, approval', de: 'Agent ↔ MCP-Server: Discovery, Allowlist, Freigabe' },
      caption: {
        en: 'The service discovers the server’s tools and filters them with allowed_tools; the model picks a tool call, which pauses for a human decision before it reaches the server with credentials from a project connection.',
        de: 'Der Dienst entdeckt die Tools des Servers und filtert sie mit allowed_tools; das Modell wählt einen Tool-Aufruf, der auf eine menschliche Entscheidung wartet, bevor er mit Zugangsdaten aus einer Projektverbindung den Server erreicht.',
      },
      width: 960,
      height: 500,
      groups: [{ id: 'g-fas', x: 250, y: 20, w: 450, h: 470, label: 'Microsoft Foundry', tone: 'platform' }],
      nodes: [
        { id: 'reviewer', x: 20, y: 40, w: 190, h: 64, label: { en: 'Human reviewer', de: 'Prüfende Person' }, tone: 'user', shape: 'actor' },
        { id: 'app', x: 20, y: 200, w: 190, h: 74, label: { en: 'Your app', de: 'Deine App' }, sub: { en: 'approval UI + loop', de: 'Freigabe-UI + Schleife' }, tone: 'app' },
        { id: 'agent', x: 275, y: 60, w: 400, h: 70, label: 'Agent version', sub: 'MCPTool(server_label, server_url)', tone: 'platform' },
        { id: 'filter', x: 272, y: 180, w: 136, h: 70, label: 'allowed_tools', sub: { en: 'listed tools only', de: 'nur gelistete Tools' }, tone: 'safety' },
        { id: 'model', x: 513, y: 180, w: 168, h: 70, label: 'Model deployment', sub: { en: 'picks tool + arguments', de: 'wählt Tool + Argumente' }, tone: 'model' },
        { id: 'gate', x: 513, y: 300, w: 168, h: 70, label: { en: 'Approval?', de: 'Freigabe?' }, sub: 'require_approval', tone: 'safety', shape: 'diamond' },
        { id: 'conn', x: 275, y: 420, w: 400, h: 56, label: 'Project connection', sub: { en: 'keys, tokens or Entra identity', de: 'Keys, Tokens oder Entra-Identität' }, tone: 'safety' },
        { id: 'server', x: 750, y: 298, w: 190, h: 74, label: 'MCP server', sub: { en: 'remote endpoint', de: 'Remote-Endpoint' }, tone: 'external' },
      ],
      edges: [
        { id: 'e-review', from: 'reviewer', to: 'app', label: { en: 'review', de: 'prüfen' }, bidir: true },
        { id: 'e-request', from: 'app', to: 'agent', label: 'responses.create', via: [[230, 237], [230, 95]] },
        { id: 'e-discover', from: 'agent', to: 'server', label: 'tools/list', via: [[845, 95]] },
        { id: 'e-filter', from: 'agent', to: 'filter', label: { en: 'tool list', de: 'Tool-Liste' }, via: [[475, 155], [340, 155]] },
        { id: 'e-pick', from: 'filter', to: 'model', label: { en: 'allowed tools', de: 'erlaubte Tools' } },
        { id: 'e-gate', from: 'model', to: 'gate', label: { en: 'tool call', de: 'Tool-Aufruf' } },
        { id: 'e-approval', from: 'gate', to: 'app', label: { en: 'request ⇄ response', de: 'Anfrage ⇄ Antwort' }, bidir: true, via: [[597.5, 400], [115, 400]] },
        { id: 'e-call', from: 'gate', to: 'server', label: 'tools/call' },
        { id: 'e-auth', from: 'conn', to: 'server', label: { en: 'auth', de: 'Auth' }, dashed: true, via: [[845, 448]] },
      ],
      steps: [
        {
          title: { en: 'Connect and discover', de: 'Verbinden und entdecken' },
          text: {
            en: 'The MCP tool in the agent version names the server: a `server_label` that is unique within the agent and a `server_url`. When your app sends a request, the service lists the server’s tools — no per-tool code in the agent.',
            de: 'Das MCP-Tool in der Agent Version benennt den Server: ein innerhalb des Agents eindeutiges `server_label` und eine `server_url`. Wenn deine App eine Anfrage sendet, listet der Dienst die Tools des Servers – ohne Code pro Tool im Agent.',
          },
          focus: ['app', 'e-request', 'agent', 'e-discover', 'server'],
        },
        {
          title: { en: 'Allow only what is needed', de: 'Nur Nötiges erlauben' },
          text: {
            en: '`allowed_tools` narrows the list the model may call. A non-empty list is an allowlist; omitting it or passing `[]` exposes every tool on the server.',
            de: '`allowed_tools` schränkt die Liste ein, die das Modell aufrufen darf. Eine nicht leere Liste ist eine Allowlist; fehlt sie oder ist sie `[]`, ist jedes Tool des Servers verfügbar.',
          },
          focus: ['e-filter', 'filter'],
        },
        {
          title: { en: 'The model picks a call', de: 'Das Modell wählt einen Aufruf' },
          text: {
            en: 'The model deployment sees only the allowed tools. It picks one and generates the arguments — this tool call is what the approval step checks.',
            de: 'Das Modell-Deployment sieht nur die erlaubten Tools. Es wählt eines und erzeugt die Argumente – genau dieser Tool-Aufruf wird bei der Freigabe geprüft.',
          },
          focus: ['e-pick', 'model', 'e-gate'],
        },
        {
          title: { en: 'Pause for approval', de: 'Für die Freigabe anhalten' },
          text: {
            en: 'With `require_approval` (default `always`) the response contains an `mcp_approval_request` with server label, tool name and arguments. Your app shows it to a human reviewer.',
            de: 'Mit `require_approval` (Standard `always`) enthält die Antwort ein `mcp_approval_request` mit Server-Label, Tool-Name und Argumenten. Deine App zeigt es einer prüfenden Person.',
          },
          focus: ['gate', 'e-approval', 'app', 'e-review', 'reviewer'],
        },
        {
          title: { en: 'Decide and run', de: 'Entscheiden und ausführen' },
          text: {
            en: 'The app sends an `mcp_approval_response` — `approve` true or false, `approval_request_id` set to the request item’s `id` — as input in the same conversation. Only approved calls reach the server through `tools/call`; repeat while new approval requests arrive.',
            de: 'Die App sendet ein `mcp_approval_response` – `approve` true oder false, `approval_request_id` gleich der `id` des Anfrage-Items – als Input in derselben Conversation. Nur freigegebene Aufrufe erreichen den Server über `tools/call`; wiederhole das, solange neue Freigabeanfragen kommen.',
          },
          focus: ['e-approval', 'gate', 'e-call', 'server'],
        },
        {
          title: { en: 'Keep secrets out of code', de: 'Secrets aus dem Code halten' },
          text: {
            en: 'Credentials live in a project connection referenced by `project_connection_id`. Its authentication type decides which identity the server sees — a shared key, the agent identity, the project managed identity, or each user (see the table below).',
            de: 'Zugangsdaten liegen in einer Projektverbindung, auf die `project_connection_id` verweist. Ihr Authentifizierungstyp entscheidet, welche Identität der Server sieht – ein geteilter Key, die Agent-Identität, die Projekt-Managed-Identity oder jeder einzelne Nutzer (siehe Tabelle unten).',
          },
          focus: ['conn', 'e-auth'],
        },
      ],
    },
    {
      id: 'mcp-two-ways',
      title: { en: 'Two ways to consume MCP tools', de: 'Zwei Wege, MCP-Tools zu nutzen' },
      caption: {
        en: 'Either Foundry is the MCP client (server-side MCP tool), or your code is the client: it turns the server’s tools into function tools for an agent and runs every call itself.',
        de: 'Entweder ist Foundry der MCP-Client (serverseitiges MCP-Tool), oder dein Code ist der Client: Er macht aus den Server-Tools Function Tools für einen Agent und führt jeden Aufruf selbst aus.',
      },
      width: 960,
      height: 470,
      groups: [
        { id: 'g-server', x: 10, y: 10, w: 940, h: 170, label: { en: 'Server-side: Foundry MCP tool', de: 'Serverseitig: Foundry-MCP-Tool' }, tone: 'platform' },
        { id: 'g-client', x: 10, y: 210, w: 940, h: 250, label: { en: 'Client-side: MCP client in your code', de: 'Clientseitig: MCP-Client in deinem Code' }, tone: 'app' },
      ],
      nodes: [
        { id: 'a1', x: 30, y: 60, w: 200, h: 70, label: 'Agent version', sub: { en: 'MCPTool + approvals', de: 'MCPTool + Freigaben' }, tone: 'platform' },
        { id: 'a2', x: 378, y: 60, w: 203, h: 70, label: { en: 'Agent Service runtime', de: 'Agent-Service-Runtime' }, sub: { en: 'acts as MCP client', de: 'agiert als MCP-Client' }, tone: 'platform' },
        { id: 'a3', x: 730, y: 60, w: 200, h: 70, label: { en: 'Remote MCP server', de: 'Remote-MCP-Server' }, sub: { en: 'Container Apps or Functions', de: 'Container Apps oder Functions' }, tone: 'external' },
        { id: 'b2', x: 30, y: 270, w: 200, h: 70, label: 'Agent version', sub: { en: 'FunctionTools from\nMCP schemas', de: 'FunctionTools aus\nMCP-Schemas' }, tone: 'platform' },
        { id: 'b1', x: 378, y: 350, w: 203, h: 70, label: { en: 'Your app', de: 'Deine App' }, sub: { en: 'MCP client session', de: 'MCP-Client-Session' }, tone: 'app' },
        { id: 'b3', x: 730, y: 270, w: 200, h: 70, label: { en: 'Any MCP server', de: 'Beliebiger MCP-Server' }, sub: { en: 'local or remote', de: 'lokal oder remote' }, tone: 'external' },
      ],
      edges: [
        { id: 'ea1', from: 'a1', to: 'a2', label: { en: 'per request', de: 'pro Anfrage' } },
        { id: 'ea2', from: 'a2', to: 'a3', label: 'tools/list + call' },
        { id: 'eb-mcp', from: 'b1', to: 'b3', label: 'list_tools() · call_tool()', bidir: true, via: [[830, 385]] },
        { id: 'eb-reg', from: 'b1', to: 'b2', label: { en: 'FunctionTool schemas', de: 'FunctionTool-Schemas' }, via: [[480, 305]] },
        { id: 'eb-loop', from: 'b2', to: 'b1', label: { en: 'function_call ⇄ output', de: 'function_call ⇄ Output' }, bidir: true, via: [[130, 385]] },
      ],
      steps: [
        {
          title: { en: 'Server-side: Foundry is the client', de: 'Serverseitig: Foundry ist der Client' },
          text: {
            en: 'Add an `MCPTool` to the agent and the service discovers tools, applies `allowed_tools` and approvals, and authenticates through project connections. The server must be a remote endpoint that Foundry can reach.',
            de: 'Füge dem Agent ein `MCPTool` hinzu, und der Dienst entdeckt Tools, wendet `allowed_tools` und Freigaben an und authentifiziert sich über Projektverbindungen. Der Server muss ein Remote-Endpoint sein, den Foundry erreicht.',
          },
          focus: ['g-server', 'a1', 'ea1', 'a2', 'ea2', 'a3'],
        },
        {
          title: { en: 'Client-side: your code discovers', de: 'Clientseitig: dein Code entdeckt' },
          text: {
            en: 'Your code opens an MCP client session, calls `list_tools()` on the server and registers each tool on an agent version as a `FunctionTool` (name, description and `input_schema`) — the pattern of the module’s exercise.',
            de: 'Dein Code öffnet eine MCP-Client-Session, ruft `list_tools()` auf dem Server auf und registriert jedes Tool als `FunctionTool` (Name, Beschreibung und `input_schema`) in einer Agent Version – das Muster aus der Übung des Moduls.',
          },
          focus: ['g-client', 'b1', 'eb-mcp', 'b3', 'eb-reg', 'b2'],
        },
        {
          title: { en: 'Client-side: your code calls', de: 'Clientseitig: dein Code ruft auf' },
          text: {
            en: 'The agent returns `function_call` items; for each one your code runs `call_tool()` on the MCP server and sends the text result back as `function_call_output`, looping until no calls are left. Use this for local servers that Foundry can’t reach, or when your app must control every call.',
            de: 'Der Agent liefert `function_call`-Items; für jedes führt dein Code `call_tool()` auf dem MCP-Server aus und schickt das Textergebnis als `function_call_output` zurück, in einer Schleife, bis keine Aufrufe mehr kommen. Nutze das für lokale Server, die Foundry nicht erreicht, oder wenn deine App jeden Aufruf kontrollieren muss.',
          },
          focus: ['b2', 'eb-loop', 'b1', 'eb-mcp', 'b3'],
        },
      ],
    },
  ],
  concepts: [
    {
      term: 'MCP server and MCP client',
      text: {
        en: 'The server hosts tools — functions with names, descriptions and input schemas. A client connects, lists the tools and calls them. For a Foundry prompt agent the Agent Service runtime is the client; in your own code an MCP client session or Microsoft Agent Framework’s MCP tools play that role.',
        de: 'Der Server hostet Tools – Funktionen mit Namen, Beschreibungen und Eingabeschemas. Ein Client verbindet sich, listet die Tools und ruft sie auf. Für einen Foundry-Prompt-Agent ist die Agent-Service-Runtime der Client; in deinem eigenen Code übernimmt eine MCP-Client-Session oder die MCP-Tools von Microsoft Agent Framework diese Rolle.',
      },
    },
    {
      term: 'Dynamic tool discovery',
      text: {
        en: 'The client asks the server for its current tool list at runtime instead of hard-coding each tool. Tools added or updated on the server appear without redeploying the agent, unless `allowed_tools` filters them out.',
        de: 'Der Client fragt den Server zur Laufzeit nach seiner aktuellen Tool-Liste, statt jedes Tool fest einzuprogrammieren. Auf dem Server ergänzte oder geänderte Tools erscheinen ohne Redeployment des Agents – außer `allowed_tools` filtert sie heraus.',
      },
    },
    {
      term: 'MCP tool (MCPTool)',
      text: {
        en: '`MCPTool` in `azure.ai.projects.models` attaches one remote server to a prompt agent: `server_label` (unique per agent) and `server_url`, plus optional `allowed_tools`, `require_approval`, `project_connection_id` and `headers`. Add several servers as separate tools.',
        de: '`MCPTool` in `azure.ai.projects.models` bindet einen Remote-Server an einen Prompt Agent: `server_label` (eindeutig pro Agent) und `server_url`, dazu optional `allowed_tools`, `require_approval`, `project_connection_id` und `headers`. Mehrere Server fügst du als separate Tools hinzu.',
      },
    },
    {
      term: 'allowed_tools',
      text: {
        en: 'A non-empty list restricts the model to those tool names — the core tool-access control. Omitting it, or passing an empty list `[]`, exposes **all** tools of the server.',
        de: 'Eine nicht leere Liste beschränkt das Modell auf diese Tool-Namen – die zentrale Tool-Zugriffskontrolle. Fehlt sie oder ist sie leer (`[]`), sind **alle** Tools des Servers verfügbar.',
      },
    },
    {
      term: 'require_approval',
      text: {
        en: 'Defaults to `always`: each call first returns an `mcp_approval_request` (server label, tool name, arguments) and waits for an `mcp_approval_response` (`approve`, `approval_request_id`). `never` skips approval. A per-tool policy names the tools: `{"never": {"tool_names": ["get_order_status"]}, "always": {"tool_names": ["issue_refund"]}}` — in the SDK `MCPToolRequireApproval(never=MCPToolFilter(tool_names=[…]), always=…)`. Give every tool in `allowed_tools` an explicit entry so none depends on a default.',
        de: 'Standard ist `always`: Jeder Aufruf liefert zuerst ein `mcp_approval_request` (Server-Label, Tool-Name, Argumente) und wartet auf ein `mcp_approval_response` (`approve`, `approval_request_id`). `never` überspringt die Freigabe. Eine Richtlinie pro Tool benennt die Tools: `{"never": {"tool_names": ["get_order_status"]}, "always": {"tool_names": ["issue_refund"]}}` – im SDK `MCPToolRequireApproval(never=MCPToolFilter(tool_names=[…]), always=…)`. Gib jedem Tool aus `allowed_tools` einen expliziten Eintrag, damit keines von einem Standardwert abhängt.',
      },
    },
    {
      term: 'Project connection authentication',
      text: {
        en: 'Store keys or tokens in a project connection and reference it with `project_connection_id` (the samples pass the connection name). The connection’s authentication type decides which identity the server sees — see the table. Prefer Microsoft Entra when the server supports it: no secrets to manage and automatic token rotation.',
        de: 'Speichere Keys oder Tokens in einer Projektverbindung und verweise mit `project_connection_id` darauf (die Beispiele übergeben den Verbindungsnamen). Der Authentifizierungstyp der Verbindung entscheidet, welche Identität der Server sieht – siehe Tabelle. Bevorzuge Microsoft Entra, wenn der Server es unterstützt: keine Secrets zu verwalten und automatische Token-Rotation.',
      },
    },
    {
      term: 'Toolbox and AI gateway',
      text: {
        en: 'A Foundry **toolbox** bundles tools — MCP servers, OpenAPI tools, file search and more — behind one versioned, MCP-compatible endpoint with central authentication (a new version serves only after you promote it); choose it to reuse one curated tool set across agents and frameworks. Its `require_approval` is metadata that the consuming runtime must enforce. An **AI gateway** (preview) is an Azure API Management instance connected to the Foundry resource: new MCP tools created in the portal route through it, so API Management policies enforce rate limits, IP filters and logging without changing servers or agent code; choose it when MCP traffic must be centrally governed.',
        de: 'Eine Foundry-**Toolbox** bündelt Tools – MCP-Server, OpenAPI-Tools, File Search und mehr – hinter einem versionierten, MCP-kompatiblen Endpoint mit zentraler Authentifizierung (eine neue Version wird erst nach dem Hochstufen ausgeliefert); wähle sie, um einen kuratierten Tool-Satz in mehreren Agents und Frameworks wiederzuverwenden. Ihr `require_approval` ist eine Metainformation, die die nutzende Runtime durchsetzen muss. Ein **AI Gateway** (Preview) ist eine mit der Foundry-Ressource verbundene Azure-API-Management-Instanz: Neue MCP-Tools, die du im Portal anlegst, laufen darüber, sodass API-Management-Richtlinien Ratenlimits, IP-Filter und Logging durchsetzen, ohne Server oder Agent-Code zu ändern; wähle es, wenn MCP-Traffic zentral gesteuert werden muss.',
      },
    },
    {
      term: 'Toolbox: tool search, guardrail and sign-in',
      text: {
        en: '**Tool search** (`{"type": "toolbox_search"}`; Python `ToolSearchToolboxTool()`) hides the toolbox’s tools from `tools/list` and offers two meta-tools: `tool_search` returns the tools that match a plain-language request, and `call_tool` runs one by name; `pin` keeps critical tools listed. Turn it on above roughly 10–15 tools to save tokens and avoid wrong picks. A **guardrail** on a toolbox version screens tool inputs and outputs at the toolbox layer, independent of model-level content filters. Agents connect to the consumer endpoint `…/toolboxes/<name>/mcp` with a Microsoft Entra token (API keys aren’t supported); it serves the default version — the first one automatically, later ones once you promote them.',
        de: '**Tool Search** (`{"type": "toolbox_search"}`; in Python `ToolSearchToolboxTool()`) blendet die Tools der Toolbox in `tools/list` aus und bietet zwei Meta-Tools: `tool_search` liefert die Tools, die zu einer Anfrage in Alltagssprache passen, und `call_tool` ruft eines per Name auf; mit `pin` bleiben wichtige Tools sichtbar. Ab etwa 10–15 Tools lohnt sich das: weniger Tokens, weniger Fehlgriffe. Ein **Guardrail** auf einer Toolbox-Version prüft Tool-Ein- und -Ausgaben auf Toolbox-Ebene, unabhängig von Inhaltsfiltern des Modells. Agents verbinden sich mit einem Microsoft-Entra-Token (API-Keys werden nicht unterstützt) mit dem Consumer-Endpoint `…/toolboxes/<name>/mcp`; er liefert die Standardversion aus – die erste automatisch, spätere erst nach dem Hochstufen.',
      },
    },
  ],
  comparison: {
    title: { en: 'Which MCP authentication option?', de: 'Welche MCP-Authentifizierungsoption?' },
    columns: [
      { en: 'Option', de: 'Option' },
      { en: 'Identity the MCP server sees', de: 'Identität, die der MCP-Server sieht' },
      { en: 'Choose it when', de: 'Wähle sie, wenn' },
    ],
    rows: [
      [{ en: 'Key-based', de: 'Key-basiert' }, { en: 'One shared key or token for all users', de: 'Ein geteilter Key oder Token für alle Nutzer' }, { en: 'The server needs an API key or token and no per-user context', de: 'Der Server einen API-Key oder Token und keinen Nutzerkontext braucht' }],
      [{ en: 'Microsoft Entra – agent identity', de: 'Microsoft Entra – Agent-Identität' }, { en: 'The agent’s own Entra identity', de: 'Die eigene Entra-Identität des Agents' }, { en: 'Agents need different access levels to the same server', de: 'Agents unterschiedliche Zugriffsstufen auf denselben Server brauchen' }],
      [{ en: 'Microsoft Entra – project managed identity', de: 'Microsoft Entra – Projekt-Managed-Identity' }, { en: 'The project’s managed identity, shared by its agents', de: 'Die Managed Identity des Projekts, geteilt von seinen Agents' }, { en: 'All agents in the project may share one access level', de: 'Alle Agents im Projekt dieselbe Zugriffsstufe teilen dürfen' }],
      [{ en: 'Microsoft Entra client user delegation', de: 'Microsoft Entra Client User Delegation' }, { en: 'The calling user, taken from the incoming Entra token', de: 'Der aufrufende Nutzer, aus dem eingehenden Entra-Token' }, { en: 'A supported server must act in the user’s context without a second sign-in', de: 'Ein unterstützter Server im Kontext des Nutzers ohne zweite Anmeldung handeln muss' }],
      [{ en: 'OAuth identity passthrough', de: 'OAuth Identity Passthrough' }, { en: 'Each user, after a separate sign-in to the MCP provider', de: 'Jeder Nutzer, nach eigener Anmeldung beim MCP-Anbieter' }, { en: 'Each user must consent with their own account', de: 'Jeder Nutzer mit seinem eigenen Konto zustimmen muss' }],
      [{ en: 'Unauthenticated', de: 'Ohne Authentifizierung' }, { en: 'Anonymous', de: 'Anonym' }, { en: 'Only for servers that require no authentication', de: 'Nur bei Servern, die keine Authentifizierung verlangen' }],
    ],
  },
  code: [
    {
      title: { en: 'Foundry MCP tool with an allowlist and per-tool approval', de: 'Foundry-MCP-Tool mit Allowlist und Freigabe pro Tool' },
      code: `from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import MCPTool, MCPToolFilter, MCPToolRequireApproval, PromptAgentDefinition
from openai.types.responses.response_input_param import McpApprovalResponse

def ask_reviewer(tool: str, args) -> bool:               # your approval UI
    return input(f"Approve {tool}({args})? [y/N] ").strip().lower() == "y"

project = AIProjectClient(endpoint="https://<resource>.services.ai.azure.com/api/projects/<project>",
                          credential=DefaultAzureCredential(),
                          allow_preview=True)  # agent endpoint (preview); SDK reference asks for allow_preview
orders = MCPTool(
    server_label="orders",
    server_url="https://<your-mcp-server>/mcp",
    allowed_tools=["get_order_status", "issue_refund"],    # everything else stays hidden
    require_approval=MCPToolRequireApproval(               # without it: "always" for every call
        never=MCPToolFilter(tool_names=["get_order_status"]),
        always=MCPToolFilter(tool_names=["issue_refund"]),
    ),
    project_connection_id="orders-mcp-connection",        # credentials live here
)
agent = project.agents.create_version(
    agent_name="support-agent",
    definition=PromptAgentDefinition(model="gpt-5-mini",  # deployment name
                                     instructions="Use MCP tools for orders.", tools=[orders]),
)
openai = project.get_openai_client(agent_name=agent.name)
conv = openai.conversations.create()
response = openai.responses.create(conversation=conv.id, input="Refund order FAB-1042.")

while approvals := [                                       # repeat while new requests arrive
    McpApprovalResponse(type="mcp_approval_response", approval_request_id=item.id,
                        approve=ask_reviewer(item.name, item.arguments))
    for item in response.output if item.type == "mcp_approval_request"
]:
    response = openai.responses.create(conversation=conv.id, input=approvals)  # same conversation
print(response.output_text)`,
      notes: [
        { en: '`approval_request_id` must be the `id` of the `mcp_approval_request` item, not the response id. A denied call (`approve=False`) never reaches the MCP server.', de: '`approval_request_id` muss die `id` des `mcp_approval_request`-Items sein, nicht die Response-ID. Ein abgelehnter Aufruf (`approve=False`) erreicht den MCP-Server nie.' },
        { en: 'For prompt agents, send the approvals as input in the same conversation — the documented flow. Log tool name, arguments, reviewer and decision for auditing.', de: 'Bei Prompt Agents schickst du die Freigaben als Input in derselben Conversation – so beschreibt es die Doku. Protokolliere Tool-Name, Argumente, prüfende Person und Entscheidung für das Audit.' },
        { en: '`model=` takes your deployment name — a deployment can have any name.', de: '`model=` erwartet deinen Deployment-Namen – ein Deployment kann beliebig heißen.' },
      ],
    },
    {
      title: { en: 'Client-side bridge: MCP tools as function tools (MCP Python SDK 2.x)', de: 'Clientseitige Brücke: MCP-Tools als Function Tools (MCP Python SDK 2.x)' },
      code: `import asyncio
import json
import httpx2
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import FunctionTool, PromptAgentDefinition
from openai.types.responses.response_input_param import FunctionCallOutput

MCP_URL = "http://localhost:8000/mcp"           # e.g. a local MCP server that Foundry can't reach

async def main():
    project = AIProjectClient(endpoint="https://<resource>.services.ai.azure.com/api/projects/<project>",
                              credential=DefaultAzureCredential(), allow_preview=True)  # agent endpoint (preview)
    http_client = httpx2.AsyncClient()          # pass headers={...} if the server needs auth
    async with http_client, streamable_http_client(MCP_URL, http_client=http_client) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            listed = await session.list_tools()                      # 1) discover
            tools = [FunctionTool(name=t.name, description=t.description or "",
                                  parameters=t.input_schema, strict=False) for t in listed.tools]
            agent = project.agents.create_version(agent_name="mcp-bridge-agent", definition=PromptAgentDefinition(
                model="gpt-5-mini", instructions="Use the tools for order questions.", tools=tools))
            openai = project.get_openai_client(agent_name=agent.name)
            conv = openai.conversations.create()
            response = openai.responses.create(conversation=conv.id, input="Status of order FAB-1042?")
            while calls := [item for item in response.output if item.type == "function_call"]:
                outputs = []
                for call in calls:                                    # 2) execute on the MCP server
                    result = await session.call_tool(call.name, arguments=json.loads(call.arguments))
                    text = " ".join(block.text for block in result.content if block.type == "text")
                    outputs.append(FunctionCallOutput(type="function_call_output",
                                                      call_id=call.call_id, output=text))  # errors arrive as text too
                response = openai.responses.create(conversation=conv.id, input=outputs)
            print(response.output_text)

asyncio.run(main())`,
      notes: [
        { en: 'Install `"mcp>=2"`: in SDK 2.x `streamable_http_client` takes an `http_client` and yields `(read, write)`. Older samples still show the 1.x helper `streamablehttp_client(url, headers=…)`.', de: 'Installiere `"mcp>=2"`: In SDK 2.x erhält `streamable_http_client` einen `http_client` und liefert `(read, write)`. Ältere Beispiele zeigen noch den 1.x-Helfer `streamablehttp_client(url, headers=…)`.' },
        { en: 'Each MCP tool becomes a `FunctionTool` with its name, description and `input_schema` (`inputSchema` in JSON; SDK 2.x uses snake_case fields); `strict=False` accepts the server’s schemas as they are, and tool names must be valid function names.', de: 'Jedes MCP-Tool wird zu einem `FunctionTool` mit Name, Beschreibung und `input_schema` (`inputSchema` im JSON; SDK 2.x nutzt Felder in snake_case); `strict=False` übernimmt die Schemas des Servers unverändert, und Tool-Namen müssen gültige Funktionsnamen sein.' },
        { en: 'Discovery runs at startup, so tools added on the server appear on the next run without any code change.', de: 'Die Discovery läuft beim Start, daher erscheinen auf dem Server ergänzte Tools beim nächsten Lauf ohne Codeänderung.' },
      ],
    },
  ],
  traps: [
    {
      en: '`allowed_tools=[]` does **not** block tools — it allows all of them. Use a non-empty list, or remove the MCP tool from the agent.',
      de: '`allowed_tools=[]` blockiert **keine** Tools – es erlaubt alle. Nutze eine nicht leere Liste oder entferne das MCP-Tool aus dem Agent.',
    },
    {
      en: '`require_approval` defaults to `always`, so the first response may contain only an `mcp_approval_request` and no answer until your app responds.',
      de: '`require_approval` ist standardmäßig `always`, daher kann die erste Antwort nur ein `mcp_approval_request` und keinen Text enthalten, bis deine App antwortet.',
    },
    {
      en: 'Send the approval in the **same conversation** and set `approval_request_id` to the request item’s `id` — otherwise the agent never continues.',
      de: 'Schick die Freigabe in **derselben Conversation** und setze `approval_request_id` auf die `id` des Anfrage-Items – sonst setzt der Agent nie fort.',
    },
    {
      en: 'Foundry Agent Service accepts only remote MCP endpoints: a server on `localhost` or stdio must first be hosted, for example on Azure Container Apps or Azure Functions. A synchronous MCP tool call fails after 100 seconds; for longer tools run the agent in background mode (preview: `background=True`, then poll the response) with a supporting model such as `gpt-5.4` and a server that implements MCP tasks — or split the work.',
      de: 'Foundry Agent Service akzeptiert nur Remote-MCP-Endpoints: Ein Server auf `localhost` oder über stdio muss zuerst gehostet werden, etwa in Azure Container Apps oder Azure Functions. Ein synchroner MCP-Tool-Aufruf scheitert nach 100 Sekunden; für längere Tools führst du den Agent im Background Mode aus (Preview: `background=True`, dann die Antwort abfragen) – mit einem unterstützten Modell wie `gpt-5.4` und einem Server, der MCP Tasks implementiert – oder teilst die Arbeit auf.',
    },
    {
      en: 'Tool descriptions and results from third-party servers are untrusted input (indirect prompt injection). Instructions are not an access control — `allowed_tools`, approvals and identity permissions are.',
      de: 'Tool-Beschreibungen und Ergebnisse fremder Server sind nicht vertrauenswürdiger Input (indirekte Prompt Injection). Anweisungen sind keine Zugriffskontrolle – `allowed_tools`, Freigaben und Identitätsberechtigungen schon.',
    },
    {
      en: 'A toolbox can’t hold every tool: function calling (it runs client-side), Azure Functions, SharePoint, Grounding with Bing, Fabric data agent, image generation and computer use must be attached to the agent directly, while MCP, Web search and Fabric IQ do fit in a toolbox.',
      de: 'Eine Toolbox nimmt nicht jedes Tool auf: Function Calling (läuft clientseitig), Azure Functions, SharePoint, Grounding with Bing, Fabric Data Agent, Bildgenerierung und Computer Use hängst du direkt an den Agent; MCP, Web Search und Fabric IQ passen dagegen in eine Toolbox.',
    },
  ],
  takeaways: [
    { en: 'The server publishes, the client discovers and calls — tools change without redeploying the agent.', de: 'Der Server veröffentlicht, der Client entdeckt und ruft auf – Tools ändern sich ohne Redeployment des Agents.' },
    { en: 'Least privilege = a non-empty `allowed_tools` list plus approvals for write operations.', de: 'Minimale Rechte = eine nicht leere `allowed_tools`-Liste plus Freigaben für schreibende Operationen.' },
    { en: 'Approval loop: `mcp_approval_request` → human review → `mcp_approval_response` in the same conversation, repeated while new requests arrive.', de: 'Freigabeschleife: `mcp_approval_request` → menschliche Prüfung → `mcp_approval_response` in derselben Conversation, wiederholt, solange neue Anfragen kommen.' },
    { en: 'Credentials belong in a project connection (`project_connection_id`), preferably Entra-based.', de: 'Zugangsdaten gehören in eine Projektverbindung (`project_connection_id`), möglichst Entra-basiert.' },
    { en: 'For reuse and central governance, put MCP servers in a toolbox or route them through an AI gateway (preview).', de: 'Für Wiederverwendung und zentrale Governance gehören MCP-Server in eine Toolbox oder hinter ein AI Gateway (Preview).' },
  ],
  sources: [
    { title: 'Connect agents to Model Context Protocol servers', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol' },
    { title: 'Set up authentication for Model Context Protocol (MCP) tools', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/mcp-authentication' },
    { title: 'Create and manage a toolbox in Foundry', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/toolbox' },
    { title: 'Govern MCP tools by using an AI gateway (preview)', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/governance' },
    { title: 'Using MCP tools with Agents (Microsoft Agent Framework)', url: 'https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools' },
    { title: 'What is Toolbox in Foundry?', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/toolbox-overview' },
    { title: 'Enable tool search in a toolbox', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/tool-search' },
    { title: 'Authentication and authorization in Microsoft Foundry', url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/authentication-authorization-foundry' },
  ],
}
