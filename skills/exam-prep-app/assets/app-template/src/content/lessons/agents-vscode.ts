import type { Lesson } from '../../lib/types.ts'

export const lesson: Lesson = {
  module: 'agents-vscode',
  summary: {
    en: 'An **AI agent** is a service that uses a model to understand a request, decide which **tools** to call, and act on behalf of a user. **Foundry Agent Service** runs agents for you: a **prompt agent** is a declarative agent (model + instructions + tools, versioned in Foundry), a **hosted agent** is your own agent code in a container that Foundry runs. You build in the Foundry portal or in VS Code with the **Microsoft Foundry Toolkit**, and every saved change becomes an immutable **agent version** behind a stable endpoint. Apps call the agent through the **Responses API** (OpenAI-compatible API that returns a response object; keeps state via `previous_response_id` or a conversation), and a **conversation** is a durable item store for multi-turn state. **Tracing, monitoring and evaluation** in Application Insights show what the agent did and how well it did it.',
    de: 'Ein **KI-Agent** ist ein Dienst, der mit einem Modell eine Anfrage versteht, entscheidet, welche **Tools** er aufruft, und im Auftrag eines Nutzers handelt. **Foundry Agent Service** betreibt Agents für dich: Ein **Prompt Agent** ist ein deklarativer Agent (Modell + Anweisungen + Tools, in Foundry versioniert), ein **Hosted Agent** ist dein eigener Agent-Code in einem Container, den Foundry ausführt. Du baust im Foundry-Portal oder in VS Code mit dem **Microsoft Foundry Toolkit**, und jede gespeicherte Änderung wird zu einer unveränderlichen **Agent Version** hinter einem stabilen Endpoint. Apps rufen den Agent über die **Responses API** auf (OpenAI-kompatible API, die ein Response-Objekt liefert; hält den Zustand über `previous_response_id` oder eine Conversation), und eine **Conversation** ist ein dauerhafter Item-Speicher für Zustand über mehrere Runden. **Tracing, Monitoring und Evaluierung** in Application Insights zeigen, was der Agent getan hat und wie gut.',
  },
  examFocus: {
    en: 'Expect scenarios where you pick the agent type, put role and rules into `instructions`, choose a conversation-tracking approach (`conversation`, `previous_response_id`, `store=False`) and pin the endpoint’s `version_selector`. Observability is heavily tested: Traces view vs Monitor tab, span-level latency and token usage, which agent evaluator answers which question, continuous evaluation rules, cluster analysis, evaluation gates in GitHub Actions, and who may read sensitive trace content.',
    de: 'Rechne mit Szenarien, in denen du den Agent-Typ wählst, Rolle und Regeln in `instructions` schreibst, einen Ansatz zur Gesprächsverfolgung wählst (`conversation`, `previous_response_id`, `store=False`) und den `version_selector` des Endpoints festlegst. Observability wird intensiv geprüft: Traces-Ansicht vs. Monitor-Tab, Latenz und Token-Verbrauch auf Span-Ebene, welcher Agent-Evaluator welche Frage beantwortet, Regeln für kontinuierliche Evaluierung, Cluster-Analyse, Evaluierungs-Gates in GitHub Actions und wer sensible Trace-Inhalte lesen darf.',
  },
  diagrams: [
    {
      id: 'agent-loop',
      title: { en: 'The agent loop: from message to response', de: 'Die Agent-Schleife: von der Nachricht zur Antwort' },
      caption: {
        en: 'Your app sends input into a conversation; the agent version prompts its model deployment (an asset of the Foundry resource), which calls service-side tools or answers. Function calls come back to your app.',
        de: 'Deine App schickt Input in eine Conversation; die Agent Version promptet ihr Modell-Deployment (ein Asset der Foundry-Ressource), das serverseitige Tools aufruft oder antwortet. Function Calls kommen zu deiner App zurück.',
      },
      width: 960,
      height: 490,
      groups: [
        { id: 'g-res', x: 225, y: 10, w: 725, h: 470, label: 'Foundry resource', tone: 'platform' },
        { id: 'g-proj', x: 240, y: 60, w: 520, h: 405, label: 'Foundry project', tone: 'platform' },
      ],
      nodes: [
        { id: 'user', x: 20, y: 15, w: 170, h: 60, label: { en: 'Customer', de: 'Kunde' }, tone: 'user', shape: 'actor' },
        { id: 'app', x: 20, y: 120, w: 170, h: 80, label: { en: 'Your app', de: 'Deine App' }, sub: { en: 'responses.create()\nruns function tools', de: 'responses.create()\nführt Function Tools aus' }, tone: 'app' },
        { id: 'conv', x: 265, y: 120, w: 195, h: 80, label: 'Conversation', sub: { en: 'messages · tool items', de: 'Nachrichten · Tool-Items' }, tone: 'data', shape: 'store' },
        { id: 'agentver', x: 540, y: 120, w: 200, h: 80, label: 'Agent version', sub: { en: 'model · instructions · tools', de: 'Modell · Anweisungen · Tools' }, tone: 'platform' },
        { id: 'model', x: 815, y: 240, w: 125, h: 80, label: 'Model\ndeployment', sub: { en: 'e.g. gpt-5-mini', de: 'z. B. gpt-5-mini' }, tone: 'model' },
        { id: 'tools', x: 540, y: 360, w: 200, h: 80, label: 'Tools', sub: { en: 'file search · web search · MCP\nrun by the service', de: 'File Search · Web Search · MCP\nvom Dienst ausgeführt' }, tone: 'tool' },
        { id: 'resp', x: 255, y: 368, w: 215, h: 64, label: 'Response', sub: { en: 'output items · output_text', de: 'Output-Items · output_text' }, tone: 'model', shape: 'pill' },
      ],
      edges: [
        { id: 'e-u-a', from: 'user', to: 'app' },
        { id: 'e-a-c', from: 'app', to: 'conv', label: { en: 'input', de: 'Input' } },
        { id: 'e-c-v', from: 'conv', to: 'agentver', label: { en: 'history', de: 'Verlauf' } },
        { id: 'e-v-m', from: 'agentver', to: 'model', label: { en: 'prompt', de: 'Prompt' }, via: [[877.5, 160]] },
        { id: 'e-m-t', from: 'model', to: 'tools', label: { en: 'calls ⇄ results', de: 'Aufrufe ⇄ Ergebnisse' }, bidir: true, via: [[877.5, 400]] },
        { id: 'e-m-r', from: 'model', to: 'resp', label: { en: 'output items', de: 'Output-Items' }, via: [[505, 280], [505, 400]] },
        { id: 'e-r-a', from: 'resp', to: 'app', label: { en: 'answer / function_call', de: 'Antwort / function_call' }, via: [[105, 400]] },
        { id: 'e-r-c', from: 'resp', to: 'conv', label: { en: 'appended', de: 'angehängt' }, dashed: true },
      ],
      steps: [
        {
          title: { en: 'Message in', de: 'Nachricht kommt an' },
          text: {
            en: 'Your app receives the customer’s message and calls `responses.create(conversation=…, input=…)` on the client from `project.get_openai_client(agent_name=…)`.',
            de: 'Deine App empfängt die Nachricht des Kunden und ruft `responses.create(conversation=…, input=…)` auf dem Client aus `project.get_openai_client(agent_name=…)` auf.',
          },
          focus: ['user', 'e-u-a', 'app'],
        },
        {
          title: { en: 'Conversation supplies history', de: 'Conversation liefert den Verlauf' },
          text: {
            en: 'A conversation stores **items**: messages, tool calls and tool outputs. The whole conversation is sent as input, so follow-up questions work; if it exceeds the context window, the input is truncated but the conversation itself is not.',
            de: 'Eine Conversation speichert **Items**: Nachrichten, Tool-Aufrufe und Tool-Ausgaben. Die ganze Conversation geht als Input mit, daher funktionieren Folgefragen; überschreitet sie das Kontextfenster, wird der Input gekürzt, die Conversation selbst aber nicht.',
          },
          focus: ['e-a-c', 'conv', 'e-c-v'],
        },
        {
          title: { en: 'The agent version prompts its model', de: 'Die Agent Version promptet ihr Modell' },
          text: {
            en: 'The agent version is an immutable snapshot of model deployment, instructions and tools. It sends instructions, history and tool descriptions to its model deployment, which lives in the Foundry resource, is shared by its projects and can have any name you choose. The model decides: answer directly or call a tool.',
            de: 'Die Agent Version ist ein unveränderlicher Schnappschuss aus Modell-Deployment, Anweisungen und Tools. Sie schickt Anweisungen, Verlauf und Tool-Beschreibungen an ihr Modell-Deployment, das in der Foundry-Ressource liegt, von ihren Projekten geteilt wird und einen beliebigen Namen tragen kann. Das Modell entscheidet: direkt antworten oder ein Tool aufrufen.',
          },
          focus: ['agentver', 'e-v-m', 'model'],
        },
        {
          title: { en: 'Service-side tools act', de: 'Serverseitige Tools handeln' },
          text: {
            en: 'Tools such as file search, web search or MCP (Model Context Protocol: standard for exposing tools to agents) run on the service: the model sends tool calls and gets the results back before it answers. MCP calls first pause for approval unless `require_approval` is `never`.',
            de: 'Tools wie File Search, Web Search oder MCP (Model Context Protocol: Standard, um Agents Tools bereitzustellen) laufen im Dienst: Das Modell schickt Tool-Aufrufe und erhält die Ergebnisse, bevor es antwortet. MCP-Aufrufe pausieren zuerst für eine Freigabe, außer `require_approval` ist `never`.',
          },
          focus: ['e-m-t', 'tools'],
        },
        {
          title: { en: 'Response out, conversation updated', de: 'Antwort raus, Conversation aktualisiert' },
          text: {
            en: 'The model’s output items form the response: `output_text` for the customer, or a `function_call` item for your app. The response is appended to the same conversation, so the next turn sees it.',
            de: 'Die Output-Items des Modells bilden die Antwort: `output_text` für den Kunden oder ein `function_call`-Item für deine App. Die Antwort wird an dieselbe Conversation angehängt, sodass die nächste Runde sie sieht.',
          },
          focus: ['e-m-r', 'resp', 'e-r-a', 'e-r-c'],
        },
        {
          title: { en: 'Function tools run in your app', de: 'Function Tools laufen in deiner App' },
          text: {
            en: 'The service never runs a **function tool**: your app reads the `function_call` item, runs the code and sends a `function_call_output` as the next input in the same conversation. The loop repeats until no `function_call` is left.',
            de: 'Ein **Function Tool** führt der Dienst nie aus: Deine App liest das `function_call`-Item, führt den Code aus und schickt ein `function_call_output` als nächsten Input in dieselbe Conversation. Die Schleife wiederholt sich, bis kein `function_call` mehr kommt.',
          },
          focus: ['e-r-a', 'app', 'e-a-c'],
        },
      ],
    },
    {
      id: 'observe-improve',
      title: { en: 'Observe, evaluate, improve', de: 'Beobachten, evaluieren, verbessern' },
      caption: {
        en: 'Spans flow into Application Insights for the Traces view and the Monitor tab, continuous evaluation scores completed responses, and error analysis feeds the next version through a CI/CD evaluation gate.',
        de: 'Spans landen in Application Insights für Traces-Ansicht und Monitor-Tab, kontinuierliche Evaluierung bewertet abgeschlossene Antworten, und die Fehleranalyse speist über ein CI/CD-Evaluierungs-Gate die nächste Version.',
      },
      width: 960,
      height: 470,
      nodes: [
        { id: 'agent', x: 20, y: 40, w: 180, h: 70, label: { en: 'Deployed agent', de: 'Produktiver Agent' }, sub: { en: 'pinned version', de: 'gepinnte Version' }, tone: 'platform' },
        { id: 'appins', x: 750, y: 38, w: 190, h: 74, label: 'Application Insights', sub: { en: 'OpenTelemetry spans', de: 'OpenTelemetry-Spans' }, tone: 'data', shape: 'store' },
        { id: 'gate', x: 20, y: 210, w: 180, h: 70, label: { en: 'CI/CD eval gate', de: 'CI/CD-Eval-Gate' }, sub: { en: 'ai-agent-evals (preview)', de: 'ai-agent-evals (Preview)' }, tone: 'app' },
        { id: 'monitor', x: 405, y: 210, w: 180, h: 70, label: { en: 'Monitor tab', de: 'Monitor-Tab' }, sub: { en: 'tokens · latency · scores', de: 'Tokens · Latenz · Scores' }, tone: 'platform' },
        { id: 'traces', x: 750, y: 210, w: 190, h: 70, label: { en: 'Traces view', de: 'Traces-Ansicht' }, sub: { en: 'spans · latency · tokens', de: 'Spans · Latenz · Tokens' }, tone: 'platform' },
        { id: 'conteval', x: 405, y: 360, w: 180, h: 70, label: { en: 'Continuous eval', de: 'Kontinuierliche Eval.' }, sub: { en: 'evaluators on live traffic', de: 'Evaluatoren auf Live-Traffic' }, tone: 'safety' },
        { id: 'analysis', x: 750, y: 360, w: 190, h: 70, label: { en: 'Error analysis', de: 'Fehleranalyse' }, sub: { en: 'clusters · Insights', de: 'Cluster · Insights' }, tone: 'platform' },
      ],
      edges: [
        { id: 'e-aa', from: 'agent', to: 'appins', label: { en: 'spans', de: 'Spans' } },
        { id: 'e-at', from: 'appins', to: 'traces' },
        { id: 'e-am', from: 'appins', to: 'monitor', via: [[845, 160], [495, 160]] },
        { id: 'e-ac', from: 'agent', to: 'conteval', label: { en: 'completed responses', de: 'abgeschlossene Antworten' }, via: [[302.5, 75], [302.5, 395]] },
        { id: 'e-cm', from: 'conteval', to: 'monitor', label: { en: 'scores', de: 'Scores' } },
        { id: 'e-ca', from: 'conteval', to: 'analysis', label: { en: 'eval results', de: 'Eval-Ergebnisse' } },
        { id: 'e-ta', from: 'traces', to: 'analysis', label: { en: 'traces', de: 'Traces' } },
        { id: 'e-loop', from: 'analysis', to: 'gate', label: { en: 'fix → new version', de: 'Fix → neue Version' }, dashed: true, via: [[845, 452], [110, 452]] },
        { id: 'e-ga', from: 'gate', to: 'agent', label: { en: 'passed → pin version', de: 'bestanden → Version pinnen' } },
      ],
      steps: [
        {
          title: { en: 'Every run leaves spans', de: 'Jeder Lauf hinterlässt Spans' },
          text: {
            en: 'Connect Application Insights to the project and Foundry records **server-side traces** for prompt and hosted agents with no code change. Client-side tracing (OpenTelemetry in your app) adds spans for your own code.',
            de: 'Verbinde Application Insights mit dem Projekt, und Foundry zeichnet **serverseitige Traces** für Prompt und Hosted Agents ohne Codeänderung auf. Clientseitiges Tracing (OpenTelemetry in deiner App) ergänzt Spans für deinen eigenen Code.',
          },
          focus: ['agent', 'e-aa', 'appins'],
        },
        {
          title: { en: 'Debug one request', de: 'Eine Anfrage debuggen' },
          text: {
            en: 'A trace is a tree of spans: every model call and tool call with inputs, outputs, token counts and duration. Comparing span durations shows whether the model or a tool causes latency; the portal keeps 90 days searchable.',
            de: 'Ein Trace ist ein Baum aus Spans: jeder Modell- und Tool-Aufruf mit Input, Output, Token-Zahlen und Dauer. Der Vergleich der Span-Dauern zeigt, ob das Modell oder ein Tool die Latenz verursacht; das Portal hält 90 Tage durchsuchbar.',
          },
          focus: ['e-at', 'traces'],
        },
        {
          title: { en: 'Score live traffic', de: 'Live-Traffic bewerten' },
          text: {
            en: 'A **continuous evaluation** rule fires when a response completes and runs evaluators such as Task Adherence or Violence (see the table below) on sampled live traffic, capped by `max_hourly_runs`. These scores are your production quality and safety signals.',
            de: 'Eine Regel für **kontinuierliche Evaluierung** greift, wenn eine Antwort abgeschlossen ist, und führt Evaluatoren wie Task Adherence oder Violence (siehe Tabelle unten) auf Stichproben des Live-Traffics aus, begrenzt durch `max_hourly_runs`. Diese Scores sind deine Qualitäts- und Sicherheitssignale in der Produktion.',
          },
          focus: ['e-ac', 'conteval'],
        },
        {
          title: { en: 'Watch the whole agent', de: 'Den ganzen Agent beobachten' },
          text: {
            en: 'The agent’s **Monitor** tab aggregates token usage, latency and run success rate from Application Insights, plus evaluation scores and red-team results. Alerts (preview) flag anomalies in these signals.',
            de: 'Der **Monitor**-Tab des Agents bündelt Token-Verbrauch, Latenz und Erfolgsquote der Läufe aus Application Insights sowie Evaluierungs-Scores und Red-Team-Ergebnisse. Alerts (Preview) melden Auffälligkeiten in diesen Signalen.',
          },
          focus: ['e-am', 'e-cm', 'monitor'],
        },
        {
          title: { en: 'Analyze and ship the fix', de: 'Analysieren und Fix ausliefern' },
          text: {
            en: '**Cluster analysis** (preview) groups evaluation results with similar problems; **Insights** (preview) groups recurring trace behavior. Fix instructions or tools and save a new version; the CI/CD gate (preview) only evaluates it against the baseline — if it passes, you pin the version selector to it.',
            de: 'Die **Cluster-Analyse** (Preview) gruppiert Evaluierungsergebnisse mit ähnlichen Problemen; **Insights** (Preview) gruppiert wiederkehrendes Verhalten in Traces. Korrigiere Anweisungen oder Tools und speichere eine neue Version; das CI/CD-Gate (Preview) evaluiert sie nur gegen die Baseline – besteht sie, pinnst du den Version Selector auf sie.',
          },
          focus: ['e-ta', 'e-ca', 'analysis', 'e-loop', 'gate', 'e-ga'],
        },
      ],
    },
  ],
  concepts: [
    {
      term: 'Agent types: prompt, voice-based prompt, hosted',
      text: {
        en: 'Foundry Agent Service offers three agent types. A **prompt agent** is configuration only — model deployment, instructions, tools — and Foundry runs it without code or containers; when you create one, you can select the **Microsoft Copilot harness** (preview) as its runtime for multi-step tool, skill, file and command work, and it stays a prompt agent. A **voice-based prompt agent** (preview) talks in real time through Voice Live, and Foundry runs the voice orchestration. A **hosted agent** is your own code (for example Microsoft Agent Framework or LangGraph) shipped as a container image or .zip that Foundry runs with a managed endpoint, scaling and identity; choose it for your own framework or orchestration, custom protocols such as webhooks, control over compute or stateful work. Should the definition live in your app code, with no saved agent? Call the Responses API directly — an *ephemeral agent*, which can’t use the Copilot harness.',
        de: 'Foundry Agent Service kennt drei Agent-Typen. Ein **Prompt Agent** ist reine Konfiguration – Modell-Deployment, Anweisungen, Tools – und Foundry betreibt ihn ohne Code oder Container; beim Anlegen kannst du als Laufzeit den **Microsoft Copilot harness** (Preview) für mehrstufige Arbeit mit Tools, Skills, Dateien und Befehlen wählen, und der Agent bleibt dabei ein Prompt Agent. Ein **Voice-based Prompt Agent** (Preview) spricht in Echtzeit über Voice Live, und die Sprach-Orchestrierung betreibt Foundry. Ein **Hosted Agent** ist dein eigener Code (z. B. Microsoft Agent Framework oder LangGraph) als Container-Image oder .zip, den Foundry mit verwaltetem Endpoint, Skalierung und Identität betreibt; wähle ihn für ein eigenes Framework oder eigene Orchestrierung, eigene Protokolle wie Webhooks, Kontrolle über die Rechenleistung oder zustandsbehaftete Arbeit. Soll die Definition in deinem App-Code liegen, ohne gespeicherten Agent? Dann rufst du die Responses API direkt auf – ein *ephemeral agent*, der den Copilot harness nicht nutzen kann.',
      },
    },
    {
      term: 'Agent version',
      text: {
        en: 'An immutable snapshot of an agent’s configuration. Any saved change — even one word of the instructions — creates a new version (`create_version()` in code, **Save to Foundry** in VS Code). A call through `get_openai_client(agent_name=…)` gets the version that the endpoint’s `version_selector` serves; tools that must hit one exact version, such as the `microsoft/ai-agent-evals` GitHub Action, take `<agent_name>:<version>`. Unsaved edits can be tried in the playground, but conversation history, monitoring and full evaluations need a saved version.',
        de: 'Ein unveränderlicher Schnappschuss der Agent-Konfiguration. Jede gespeicherte Änderung – selbst ein Wort in den Anweisungen – erzeugt eine neue Version (`create_version()` im Code, **Save to Foundry** in VS Code). Ein Aufruf über `get_openai_client(agent_name=…)` erhält die Version, die der `version_selector` des Endpoints ausliefert; Tools, die genau eine Version treffen müssen, etwa die GitHub Action `microsoft/ai-agent-evals`, erwarten `<agent_name>:<version>`. Ungespeicherte Änderungen kannst du im Playground testen, aber Gesprächsverlauf, Monitoring und vollständige Evaluierungen brauchen eine gespeicherte Version.',
      },
    },
    {
      term: 'Conversations, items and responses',
      text: {
        en: 'A **response** is one run of the agent; its output is a list of **items** — messages, tool calls, tool outputs. Three ways to carry context: a **conversation** (`conversation=conv.id`) — Foundry stores every item durably; use it for multi-turn chats. `previous_response_id` — Foundry stores each response and you pass the last id; use it for quick follow-ups without a conversation object. `store=False` — nothing is stored and your app resends the history; use it when no data may stay on the service.',
        de: 'Eine **Response** ist ein Lauf des Agents; ihr Output ist eine Liste von **Items** – Nachrichten, Tool-Aufrufe, Tool-Ausgaben. Drei Wege, Kontext weiterzutragen: eine **Conversation** (`conversation=conv.id`) – Foundry speichert jedes Item dauerhaft; nutze sie für Chats über mehrere Runden. `previous_response_id` – Foundry speichert jede Antwort, und du übergibst die letzte ID; nutze das für schnelle Folgefragen ohne Conversation-Objekt. `store=False` – nichts wird gespeichert, deine App schickt den Verlauf selbst mit; nutze das, wenn keine Daten im Dienst bleiben dürfen.',
      },
    },
    {
      term: 'Microsoft Foundry Toolkit for Visual Studio Code',
      text: {
        en: 'The VS Code extension for Foundry (the new name for AI Toolkit). Prompt-agent flow: (1) **Developer Tools › Build › Create Agent** opens **Agent Builder** for name, model and instructions; (2) **Save to Foundry** saves a version; (3) test it on the **Playground** tab; (4) **Tool › + › Add tools** attaches tools whose shared connections you set up in the **Tool Catalog**, then save again; (5) **View Code** generates a client for the selected saved version. For hosted agents, **Agent Inspector** debugs local runs with breakpoints.',
        de: 'Die VS-Code-Erweiterung für Foundry (der neue Name des AI Toolkit). Ablauf für Prompt Agents: (1) **Developer Tools › Build › Create Agent** öffnet den **Agent Builder** für Name, Modell und Anweisungen; (2) **Save to Foundry** speichert eine Version; (3) teste sie im Tab **Playground**; (4) **Tool › + › Add tools** hängt Tools an, deren geteilte Verbindungen du im **Tool Catalog** einrichtest, danach erneut speichern; (5) **View Code** erzeugt einen Client für die gewählte gespeicherte Version. Für Hosted Agents debuggt **Agent Inspector** lokale Läufe mit Breakpoints.',
      },
    },
    {
      term: 'Agent endpoint and version selector',
      text: {
        en: 'Every agent has a stable endpoint from the moment it is created — no separate publish step. Its `version_selector` sends 100 % of traffic either to the latest version (default) or to one pinned version; only one version is active at a time. Callers use Microsoft Entra ID (API keys aren’t supported) and need **Foundry Agent Consumer** (least privilege) or another role with the endpoint permission, such as Foundry User. Legacy Agent Applications (deprecation planned) are different: their callers need **Foundry User** (or a custom role) on the application, and Foundry Agent Consumer doesn’t grant that.',
        de: 'Jeder Agent hat ab seiner Erstellung einen stabilen Endpoint – ohne separaten Veröffentlichungsschritt. Sein `version_selector` leitet 100 % des Traffics entweder an die neueste Version (Standard) oder an eine festgelegte Version; aktiv ist immer nur eine Version. Aufrufer nutzen Microsoft Entra ID (API-Keys werden nicht unterstützt) und brauchen **Foundry Agent Consumer** (geringste Rechte) oder eine andere Rolle mit der Endpoint-Berechtigung, etwa Foundry User. Legacy-Agent-Applications (Einstellung geplant) sind anders: Ihre Aufrufer brauchen **Foundry User** (oder eine benutzerdefinierte Rolle) auf der Application, und Foundry Agent Consumer gewährt das nicht.',
      },
    },
    {
      term: 'Agent identity',
      text: {
        en: 'Each new agent gets its own Microsoft Entra **agent identity** for its outbound calls; it starts without permissions, and roles of the project identity don’t transfer. Which identity a downstream service sees is decided by the authentication type of the tool’s **project connection** (stored endpoint + credential that tools reference instead of secrets in code): the agent identity or the project managed identity — grant roles to that one.',
        de: 'Jeder neue Agent erhält eine eigene Microsoft-Entra-**Agent-Identität** für seine ausgehenden Aufrufe; sie startet ohne Berechtigungen, und Rollen der Projektidentität werden nicht übertragen. Welche Identität ein nachgelagerter Dienst sieht, entscheidet der Authentifizierungstyp der **Projektverbindung** des Tools (gespeicherter Endpoint + Credential, auf die Tools statt Secrets im Code verweisen): Agent-Identität oder Projekt-Managed-Identity – dieser Identität gibst du die Rollen.',
      },
    },
    {
      term: 'Tracing',
      text: {
        en: 'Foundry stores OpenTelemetry **spans** — model calls, tool calls with arguments and results, token counts, durations — in the **Application Insights** resource connected to the project. Server-side tracing needs no code; client-side tracing adds your app’s spans. Viewers need **Log Analytics Reader** on that resource.',
        de: 'Foundry speichert OpenTelemetry-**Spans** – Modellaufrufe, Tool-Aufrufe mit Argumenten und Ergebnissen, Token-Zahlen, Dauern – in der mit dem Projekt verbundenen **Application Insights**-Ressource. Serverseitiges Tracing braucht keinen Code; clientseitiges Tracing ergänzt die Spans deiner App. Wer Traces ansehen will, braucht **Log Analytics Reader** auf dieser Ressource.',
      },
    },
  ],
  comparison: {
    title: { en: 'Which observability feature or evaluator answers which question?', de: 'Welches Observability-Feature oder welcher Evaluator beantwortet welche Frage?' },
    columns: [
      { en: 'Feature or evaluator', de: 'Feature oder Evaluator' },
      { en: 'Answers', de: 'Beantwortet' },
      { en: 'How you use it', de: 'So nutzt du es' },
    ],
    rows: [
      [
        { en: 'Traces view', de: 'Traces-Ansicht' },
        { en: 'Why was this one response slow or wrong? Which tool ran with which arguments?', de: 'Warum war diese eine Antwort langsam oder falsch? Welches Tool lief mit welchen Argumenten?' },
        { en: 'Spans in Application Insights (90 days in the portal)', de: 'Spans in Application Insights (90 Tage im Portal)' },
      ],
      [
        { en: 'Monitor tab', de: 'Monitor-Tab' },
        { en: 'How is the agent doing overall: tokens, latency, run success rate?', de: 'Wie läuft der Agent insgesamt: Tokens, Latenz, Erfolgsquote?' },
        { en: 'Aggregated telemetry plus evaluation and red-team results', de: 'Aggregierte Telemetrie plus Evaluierungs- und Red-Team-Ergebnisse' },
      ],
      [
        { en: 'Intent Resolution (`builtin.intent_resolution`, preview)', de: 'Intent Resolution (`builtin.intent_resolution`, Preview)' },
        { en: 'Did the agent understand what the user wanted?', de: 'Hat der Agent verstanden, was der Nutzer wollte?' },
        { en: 'Agent evaluator: 1–5 score plus pass/fail', de: 'Agent-Evaluator: Score 1–5 plus Pass/Fail' },
      ],
      [
        { en: 'Task Adherence (`builtin.task_adherence`, preview)', de: 'Task Adherence (`builtin.task_adherence`, Preview)' },
        { en: 'Did it follow its instructions and rules?', de: 'Hat er seine Anweisungen und Regeln befolgt?' },
        { en: 'Agent evaluator: pass/fail with a reason', de: 'Agent-Evaluator: Pass/Fail mit Begründung' },
      ],
      [
        'Tool Call Accuracy (`builtin.tool_call_accuracy`)',
        { en: 'Did it pick the right tools with correct arguments?', de: 'Hat er die richtigen Tools mit korrekten Argumenten gewählt?' },
        { en: 'Agent evaluator: 1–5 score plus pass/fail', de: 'Agent-Evaluator: Score 1–5 plus Pass/Fail' },
      ],
      [
        'Violence (`builtin.violence`)',
        { en: 'Is the output safe?', de: 'Ist die Ausgabe sicher?' },
        { en: 'One of the safety evaluators', de: 'Einer der Sicherheits-Evaluatoren' },
      ],
      [
        { en: 'Continuous evaluation', de: 'Kontinuierliche Evaluierung' },
        { en: 'Are live responses still good and safe?', de: 'Sind Live-Antworten weiterhin gut und sicher?' },
        { en: 'Evaluation rule on completed responses, at most `max_hourly_runs` runs per hour', de: 'Evaluierungsregel auf abgeschlossenen Antworten, höchstens `max_hourly_runs` Läufe pro Stunde' },
      ],
      [
        { en: 'Evaluation run as CI gate', de: 'Evaluierungslauf als CI-Gate' },
        { en: 'Is version N better than the baseline before release?', de: 'Ist Version N vor dem Release besser als die Baseline?' },
        { en: 'Test dataset + evaluators; GitHub Action `microsoft/ai-agent-evals` (preview)', de: 'Test-Dataset + Evaluatoren; GitHub Action `microsoft/ai-agent-evals` (Preview)' },
      ],
      [
        { en: 'Cluster analysis / Insights (preview)', de: 'Cluster-Analyse / Insights (Preview)' },
        { en: 'Which failure patterns keep recurring, and why?', de: 'Welche Fehlermuster wiederholen sich, und warum?' },
        { en: 'Evaluation results / production traces', de: 'Evaluierungsergebnisse / Produktions-Traces' },
      ],
    ],
  },
  code: [
    {
      title: { en: 'Create a prompt agent version and keep context across turns', de: 'Prompt-Agent-Version anlegen und Kontext über Runden halten' },
      code: `from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition

project = AIProjectClient(
    endpoint="https://<resource>.services.ai.azure.com/api/projects/<project>",
    credential=DefaultAzureCredential(),
    allow_preview=True,  # agent endpoint (preview); SDK reference asks for allow_preview
)

agent = project.agents.create_version(          # each call = new immutable version
    agent_name="support-agent",
    definition=PromptAgentDefinition(
        model="gpt-5-mini",                      # deployment name
        instructions=(
            "You are Fabrikam's support agent. Answer order questions politely. "
            "Never promise refunds. Ask for the order number if it is missing."
        ),
    ),
)
print(agent.name, agent.version)
openai = project.get_openai_client(agent_name=agent.name)

# A) conversation: Foundry stores every item durably
conversation = openai.conversations.create()
openai.responses.create(conversation=conversation.id, input="Where is my order?")
reply = openai.responses.create(conversation=conversation.id, input="It is FAB-1042.")
print(reply.output_text)

# B) previous_response_id: Foundry stores each response, you pass the last id
first = openai.responses.create(input="Where is order FAB-1042?")
follow_up = openai.responses.create(previous_response_id=first.id, input="When will it arrive?")
print(follow_up.output_text)

# C) store=False: nothing is stored, your app resends the history
history = [{"role": "user", "content": "Where is order FAB-1042?"}]
answer = openai.responses.create(input=history, store=False)
history += [{"role": "assistant", "content": answer.output_text},
            {"role": "user", "content": "When will it arrive?"}]
print(openai.responses.create(input=history, store=False).output_text)`,
      notes: [
        { en: '`instructions` carry the agent’s role, goals and boundaries into every turn. `gpt-5-mini` is a reasoning model, so the definition sets no `temperature` or `top_p`.', de: '`instructions` tragen Rolle, Ziele und Grenzen des Agents in jede Runde. `gpt-5-mini` ist ein Reasoning-Modell, daher setzt die Definition weder `temperature` noch `top_p`.' },
        { en: 'Alternatively, call the shared project endpoint: `project.get_openai_client()` plus `extra_body={"agent_reference": {"name": "support-agent", "type": "agent_reference"}}` (optionally with a `"version"`).', de: 'Alternativ rufst du den geteilten Projekt-Endpoint auf: `project.get_openai_client()` plus `extra_body={"agent_reference": {"name": "support-agent", "type": "agent_reference"}}` (optional mit `"version"`).' },
        { en: 'A and B keep the history on the service; with C your app owns it and must resend every earlier turn.', de: 'A und B halten den Verlauf im Dienst; bei C gehört er deiner App, die jede frühere Runde erneut mitschicken muss.' },
      ],
    },
    {
      title: { en: 'Client-side tracing to Application Insights', de: 'Clientseitiges Tracing nach Application Insights' },
      code: `import os
os.environ["AZURE_EXPERIMENTAL_ENABLE_GENAI_TRACING"] = "true"   # opt in first
os.environ["OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT"] = "true"  # development only

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.monitor.opentelemetry import configure_azure_monitor

project = AIProjectClient(
    endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
    credential=DefaultAzureCredential(),
    allow_preview=True,  # agent endpoint (preview); SDK reference asks for allow_preview
)
configure_azure_monitor(
    connection_string=project.telemetry.get_application_insights_connection_string()
)

openai = project.get_openai_client(agent_name="support-agent")
response = openai.responses.create(input="Status of order FAB-1042?")
print(response.output_text, response.usage.total_tokens)`,
      notes: [
        { en: 'Install `azure-ai-projects opentelemetry-sdk azure-core-tracing-opentelemetry azure-monitor-opentelemetry`.', de: 'Installiere `azure-ai-projects opentelemetry-sdk azure-core-tracing-opentelemetry azure-monitor-opentelemetry`.' },
        { en: 'Prompts and outputs are recorded only if `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` is `true` — set it to `true` only in development, because the spans then contain user data.', de: 'Prompts und Ausgaben werden nur aufgezeichnet, wenn `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` auf `true` steht – setze es nur in der Entwicklung auf `true`, weil die Spans dann Nutzerdaten enthalten.' },
        { en: 'Spans appear in the Traces view after a few minutes.', de: 'Die Spans erscheinen nach einigen Minuten in der Traces-Ansicht.' },
      ],
    },
  ],
  traps: [
    {
      en: 'Unsaved playground edits are not a version: to compare versions, keep conversation history, monitor or run full evaluations, save first.',
      de: 'Ungespeicherte Änderungen im Playground sind keine Version: Um Versionen zu vergleichen, Verlauf zu behalten, zu überwachen oder vollständig zu evaluieren, musst du zuerst speichern.',
    },
    {
      en: 'The default routing **Always use latest** serves a newly saved version immediately — even in Teams. Pin the `version_selector` in production; splitting traffic between versions isn’t supported.',
      de: 'Das Standard-Routing **Always use latest** liefert eine neu gespeicherte Version sofort aus – auch in Teams. Lege den `version_selector` in der Produktion fest; Traffic auf mehrere Versionen aufzuteilen wird nicht unterstützt.',
    },
    {
      en: 'A new agent identity has no permissions. Tool calls whose project connection authenticates as the agent identity fail with authorization errors until you grant that identity roles on the target service.',
      de: 'Eine neue Agent-Identität hat keine Berechtigungen. Tool-Aufrufe, deren Projektverbindung sich als Agent-Identität authentifiziert, scheitern mit Autorisierungsfehlern, bis du dieser Identität Rollen auf dem Zieldienst gibst.',
    },
    {
      en: 'No traces? Connect Application Insights to the project first and give viewers **Log Analytics Reader** (plus **Privileged Monitoring Data Reader** for protected tables).',
      de: 'Keine Traces? Verbinde zuerst Application Insights mit dem Projekt und gib Betrachtern **Log Analytics Reader** (plus **Privileged Monitoring Data Reader** für geschützte Tabellen).',
    },
    {
      en: 'The training module still lists YAML workflow agents, but declarative workflows in Foundry retire on December 1, 2026 — use Microsoft Agent Framework for new orchestration.',
      de: 'Das Trainingsmodul nennt noch YAML-Workflow-Agents, aber deklarative Workflows in Foundry werden am 1. Dezember 2026 eingestellt – nutze Microsoft Agent Framework für neue Orchestrierung.',
    },
    {
      en: 'The agent identity doesn’t pull a hosted agent’s image: the **project managed identity** does, so it needs Container Registry Repository Reader (or AcrPull) on the Azure Container Registry. The **agent identity**, created at deploy time, is what your code uses at run time to call models, tools and other Azure services, so roles on downstream services such as Storage go to it.',
      de: 'Das Image eines Hosted Agents zieht nicht die Agent-Identität, sondern die **Managed Identity des Projekts**; sie braucht daher Container Registry Repository Reader (oder AcrPull) auf der Azure Container Registry. Die beim Deployment erzeugte **Agent-Identität** nutzt dein Code zur Laufzeit, um Modelle, Tools und andere Azure-Dienste aufzurufen, also bekommt sie die Rollen auf nachgelagerten Diensten wie Storage.',
    },
  ],
  takeaways: [
    { en: 'Prompt agent = configuration; hosted agent = your code in a Foundry-managed container.', de: 'Prompt Agent = Konfiguration; Hosted Agent = dein Code in einem von Foundry verwalteten Container.' },
    { en: 'Every saved change is a new immutable version — pin the endpoint to the version you trust.', de: 'Jede gespeicherte Änderung ist eine neue, unveränderliche Version – binde den Endpoint an die Version, der du vertraust.' },
    { en: 'Multi-turn context: conversation (Foundry stores items), `previous_response_id` (Foundry stores responses) or `store=False` (your app resends history).', de: 'Kontext über Runden: Conversation (Foundry speichert Items), `previous_response_id` (Foundry speichert Antworten) oder `store=False` (deine App schickt den Verlauf mit).' },
    { en: 'Traces explain one request; the Monitor tab and continuous evaluation watch the whole agent.', de: 'Traces erklären eine Anfrage; Monitor-Tab und kontinuierliche Evaluierung beobachten den ganzen Agent.' },
    { en: 'Gate releases with evaluations in CI (`microsoft/ai-agent-evals`, preview) before you move the version selector.', de: 'Sichere Releases mit Evaluierungen in der CI (`microsoft/ai-agent-evals`, Preview) ab, bevor du den Version Selector umstellst.' },
  ],
  sources: [
    { title: 'Build with agents, conversations, and responses', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/runtime-components' },
    { title: 'Create a prompt agent with Microsoft Foundry Toolkit for Visual Studio Code', url: 'https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/create-prompt-agent-visual-studio-code' },
    { title: 'Configure and share your agent', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/configure-agent' },
    { title: 'Set up tracing in Microsoft Foundry', url: 'https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/trace-agent-setup' },
    { title: 'Agent evaluators', url: 'https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-evaluators/agent-evaluators' },
    { title: 'Agents in Microsoft Foundry', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/overview' },
    { title: 'What are hosted agents?', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents' },
    { title: 'Hosted agent permissions reference', url: 'https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agent-permissions' },
  ],
}
