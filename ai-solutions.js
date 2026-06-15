const solutionCategories = [
  {
    id: "assistants",
    title: "AI Assistants",
    purpose: "Help with questions, planning, drafting, summarizing, brainstorming, and general knowledge work.",
    use: "Use when the task changes often and a person can clearly prompt, review, and refine the output.",
    benefits: "Flexible, fast to test, and useful across many everyday tasks.",
    limitations: "May produce inaccurate or overconfident answers and may not provide reliable sources.",
    oversight: "A person should verify facts, calculations, decisions, and anything sent to customers or the public.",
    tools: [
      ["ChatGPT", "Beginner", "Free to premium"],
      ["Claude", "Beginner", "Free to premium"],
      ["Gemini", "Beginner", "Free to premium"],
      ["Microsoft Copilot", "Beginner", "Free to enterprise"],
      ["Perplexity", "Beginner", "Free to premium"],
    ],
    options: { beginner: "ChatGPT or Claude", intermediate: "Gemini or Microsoft Copilot inside an existing workspace", advanced: "A governed assistant connected to approved business knowledge", lowCost: "Use one paid assistant only after a free pilot", free: "Free tiers of ChatGPT, Claude, Gemini, Copilot, or Perplexity" },
  },
  {
    id: "research",
    title: "Research & Knowledge Tools",
    purpose: "Find sources, summarize research, compare evidence, and explore relationships between publications.",
    use: "Use when source quality and traceability matter more than producing polished marketing copy.",
    benefits: "Speeds discovery and can make complex evidence easier to scan.",
    limitations: "Search coverage varies, summaries can miss nuance, and access to full papers may be limited.",
    oversight: "Open and evaluate original sources; do not treat an AI summary as proof.",
    tools: [
      ["Perplexity", "Beginner", "Free to premium"],
      ["Elicit", "Intermediate", "Free to premium"],
      ["Consensus", "Beginner", "Free to premium"],
      ["Semantic Scholar", "Beginner", "Free"],
      ["Connected Papers", "Intermediate", "Free to premium"],
    ],
    options: { beginner: "Perplexity or Consensus", intermediate: "Elicit with Semantic Scholar", advanced: "A documented evidence-review workflow using multiple databases", lowCost: "Semantic Scholar plus limited free searches elsewhere", free: "Semantic Scholar" },
  },
  {
    id: "writing",
    title: "Writing & Content Creation",
    purpose: "Draft, rewrite, edit, summarize, adapt tone, and create repeatable content templates.",
    use: "Use for first drafts and revisions when a person owns the message, facts, and final voice.",
    benefits: "Reduces blank-page time and supports consistent formatting.",
    limitations: "Can sound generic, repeat errors, invent details, or weaken an authentic voice.",
    oversight: "Review claims, names, dates, tone, originality, and audience fit before publishing.",
    tools: [
      ["ChatGPT", "Beginner", "Free to premium"],
      ["Claude", "Beginner", "Free to premium"],
      ["Jasper", "Intermediate", "Paid"],
      ["Grammarly", "Beginner", "Free to premium"],
      ["Copy.ai", "Intermediate", "Free to premium"],
    ],
    options: { beginner: "Grammarly with ChatGPT or Claude", intermediate: "Jasper or Copy.ai for repeatable brand workflows", advanced: "A reviewed content system with templates, source rules, and approvals", lowCost: "One general assistant plus existing documents", free: "Free Grammarly and a free assistant tier" },
  },
  {
    id: "marketing",
    title: "Marketing & Social Media",
    purpose: "Plan campaigns, create posts, schedule content, monitor channels, and support customer outreach.",
    use: "Use when the business has a clear audience, offer, approval process, and realistic content schedule.",
    benefits: "Improves consistency and reduces repetitive production work.",
    limitations: "Automation can create repetitive, inaccurate, or poorly timed messaging.",
    oversight: "A person should approve brand claims, offers, replies, targeting, and crisis-sensitive posts.",
    tools: [
      ["Canva AI", "Beginner", "Free to premium"],
      ["Buffer AI", "Beginner", "Free to premium"],
      ["Hootsuite AI", "Intermediate", "Paid"],
      ["HubSpot AI", "Intermediate", "Free to enterprise"],
      ["Ocoya", "Intermediate", "Paid"],
    ],
    options: { beginner: "Canva AI with Buffer", intermediate: "Hootsuite AI or HubSpot AI", advanced: "A CRM-connected campaign workflow with approvals and measurement", lowCost: "Canva plus a simple scheduler", free: "Free Canva and Buffer tiers where available" },
  },
  {
    id: "images",
    title: "Image Generation",
    purpose: "Create concepts, illustrations, product scenes, advertising variations, and visual assets from instructions.",
    use: "Use when custom visuals help communicate an idea and licensing, representation, and accuracy are reviewed.",
    benefits: "Produces many visual directions quickly without a full production setup.",
    limitations: "Text, hands, products, logos, and factual details may be wrong or inconsistent.",
    oversight: "Review rights, brand accuracy, disclosure needs, representation, and every visible detail.",
    tools: [
      ["ChatGPT Image Generation", "Beginner", "Free to premium"],
      ["Midjourney", "Intermediate", "Paid"],
      ["Adobe Firefly", "Beginner", "Free to premium"],
      ["Leonardo AI", "Intermediate", "Free to premium"],
    ],
    options: { beginner: "ChatGPT Image Generation or Adobe Firefly", intermediate: "Leonardo AI or Midjourney", advanced: "A brand-controlled image workflow with editing and approval", lowCost: "Generate only final-use concepts after planning the brief", free: "Available free tiers or credits from ChatGPT, Firefly, or Leonardo" },
  },
  {
    id: "video",
    title: "Video Creation",
    purpose: "Generate presenters, avatars, clips, scenes, effects, and edited video from scripts or prompts.",
    use: "Use for explainers, training, prototypes, and campaigns when synthetic media is appropriate and disclosed.",
    benefits: "Reduces production time and allows fast revisions.",
    limitations: "Can look artificial, misrepresent people, create factual errors, or require significant editing.",
    oversight: "Secure permission for likeness and voice, verify claims, disclose synthetic media when appropriate, and review every frame.",
    tools: [
      ["Synthesia", "Beginner", "Paid"],
      ["HeyGen", "Beginner", "Free to premium"],
      ["Runway", "Intermediate", "Free to premium"],
      ["Veo", "Advanced", "Limited or paid access"],
    ],
    options: { beginner: "Synthesia or HeyGen for guided explainers", intermediate: "Runway for editing and generated clips", advanced: "Veo or a multi-tool production workflow", lowCost: "Create short clips only after approving the script and storyboard", free: "Limited free credits where offered, such as HeyGen or Runway" },
  },
  {
    id: "meetings",
    title: "Meeting & Communication Tools",
    purpose: "Record, transcribe, summarize, identify action items, and organize meeting follow-up.",
    use: "Use when participants understand recording practices and summaries will be reviewed.",
    benefits: "Reduces manual notes and makes decisions and follow-ups easier to find.",
    limitations: "Transcripts can misidentify speakers, miss context, or capture sensitive information.",
    oversight: "Obtain appropriate consent, restrict access, correct summaries, and verify commitments.",
    tools: [
      ["Otter", "Beginner", "Free to premium"],
      ["Fireflies", "Beginner", "Free to premium"],
      ["Fathom", "Beginner", "Free to premium"],
      ["Zoom AI", "Beginner", "Included or paid plan"],
    ],
    options: { beginner: "Fathom or Otter", intermediate: "Fireflies connected to approved workflows", advanced: "A governed meeting-intelligence system connected to CRM or project tools", lowCost: "Use the feature already included with the meeting platform", free: "Free tiers of Fathom, Otter, or Fireflies where available" },
  },
  {
    id: "customer-service",
    title: "Customer Service",
    purpose: "Answer common questions, route requests, summarize conversations, and assist support teams.",
    use: "Use for clear, repeatable questions with an easy path to a person.",
    benefits: "Can improve response speed and availability.",
    limitations: "May misunderstand unusual situations, frustrate customers, or provide incorrect policy information.",
    oversight: "Define escalation rules, review conversation quality, protect customer data, and keep a visible human option.",
    tools: [
      ["Intercom", "Intermediate", "Paid"],
      ["Zendesk AI", "Intermediate", "Paid"],
      ["Tidio", "Beginner", "Free to premium"],
      ["Drift", "Intermediate", "Paid"],
    ],
    options: { beginner: "Tidio for a limited FAQ pilot", intermediate: "Intercom or Zendesk AI", advanced: "A support system connected to approved knowledge and quality monitoring", lowCost: "Automate only the highest-volume questions", free: "Tidio free tier or a simple human-managed website FAQ" },
  },
  {
    id: "sales",
    title: "Sales & CRM",
    purpose: "Organize leads, research prospects, summarize activity, draft outreach, and support follow-up.",
    use: "Use when sales stages, data quality, consent, and outreach rules are already defined.",
    benefits: "Reduces administrative work and can improve follow-up consistency.",
    limitations: "Poor data can scale poor decisions; automated outreach can feel impersonal or violate expectations.",
    oversight: "Review targeting, claims, contact permissions, scoring logic, and customer-facing messages.",
    tools: [
      ["HubSpot AI", "Beginner", "Free to enterprise"],
      ["Salesforce Einstein", "Advanced", "Enterprise"],
      ["Apollo", "Intermediate", "Free to premium"],
      ["Clay", "Advanced", "Paid"],
    ],
    options: { beginner: "HubSpot AI", intermediate: "Apollo with a reviewed outreach process", advanced: "Salesforce Einstein or Clay with governed data and workflows", lowCost: "Improve one follow-up stage inside the current CRM", free: "HubSpot or Apollo free tiers where available" },
  },
  {
    id: "productivity",
    title: "Productivity & Organization",
    purpose: "Organize notes, tasks, projects, schedules, priorities, and recurring work.",
    use: "Use when the problem is remembering, prioritizing, coordinating, or finding information.",
    benefits: "Creates visible structure and reduces mental load.",
    limitations: "A complex setup can become another task to maintain.",
    oversight: "Review automated schedules and priorities; keep the system simple enough that people actually use it.",
    tools: [
      ["Notion AI", "Intermediate", "Free to premium"],
      ["ClickUp AI", "Intermediate", "Paid"],
      ["Motion", "Intermediate", "Paid"],
      ["Todoist AI", "Beginner", "Free to premium"],
    ],
    options: { beginner: "Todoist AI", intermediate: "Notion AI or ClickUp AI", advanced: "Motion or a connected workspace with clear ownership", lowCost: "Use AI inside the task tool already in use", free: "Todoist or Notion free tiers without unnecessary upgrades" },
  },
  {
    id: "data",
    title: "Data Analysis",
    purpose: "Explore spreadsheets, summarize patterns, create visuals, answer questions, and support reporting.",
    use: "Use when data definitions are clear and someone can verify formulas, assumptions, and conclusions.",
    benefits: "Makes analysis more accessible and speeds routine reporting.",
    limitations: "Incorrect fields, missing context, or weak prompts can produce misleading conclusions.",
    oversight: "Validate source data, calculations, filters, visual scales, and business interpretations.",
    tools: [
      ["Power BI Copilot", "Advanced", "Paid"],
      ["Tableau AI", "Advanced", "Paid"],
      ["Excel Copilot", "Intermediate", "Paid"],
      ["ChatGPT Advanced Data Analysis", "Intermediate", "Free to premium"],
    ],
    options: { beginner: "ChatGPT Advanced Data Analysis with a non-sensitive practice file", intermediate: "Excel Copilot", advanced: "Power BI Copilot or Tableau AI with governed datasets", lowCost: "Analyze one exported report before connecting live systems", free: "Spreadsheet formulas and limited assistant analysis with non-sensitive data" },
  },
  {
    id: "automation",
    title: "Automation Platforms",
    purpose: "Move information between applications and trigger repeatable actions without manual copying.",
    use: "Use after the underlying process is stable, documented, and has clear exception handling.",
    benefits: "Reduces repetitive transfers and missed follow-ups.",
    limitations: "A broken connection can silently duplicate, lose, or misroute information.",
    oversight: "Monitor runs, test errors and duplicates, restrict permissions, and assign an owner.",
    tools: [
      ["Zapier", "Beginner", "Free to premium"],
      ["Make", "Intermediate", "Free to premium"],
      ["n8n", "Advanced", "Free self-hosted to paid"],
      ["Relay", "Intermediate", "Free to premium"],
    ],
    options: { beginner: "Zapier", intermediate: "Make or Relay", advanced: "n8n with technical ownership", lowCost: "Automate one high-value workflow with few steps", free: "Free tiers of Zapier, Make, Relay, or self-hosted n8n" },
  },
  {
    id: "agents",
    title: "Agentic AI Platforms",
    purpose: "Coordinate multi-step AI work that can use tools, retrieve information, and complete bounded tasks.",
    use: "Use only after simpler prompts and automations are insufficient and the process has strong controls.",
    benefits: "Can coordinate complex, repeated work across several steps.",
    limitations: "More autonomy creates more opportunities for incorrect actions, cost overruns, and security failures.",
    oversight: "Use permissions, logs, approval gates, spending limits, testing, and human review before consequential actions.",
    tools: [
      ["OpenAI Agents", "Advanced", "Usage-based"],
      ["Claude Projects", "Intermediate", "Free to premium"],
      ["Microsoft Copilot Studio", "Advanced", "Paid"],
      ["CrewAI", "Advanced", "Open source to paid"],
      ["LangGraph", "Advanced", "Open source to paid"],
    ],
    options: { beginner: "Claude Projects for organized, human-directed work", intermediate: "A low-risk Copilot Studio or managed agent pilot", advanced: "OpenAI Agents, CrewAI, or LangGraph with technical governance", lowCost: "Prove the workflow manually before building an agent", free: "Open-source CrewAI or LangGraph for users with technical skills" },
  },
  {
    id: "web-development",
    title: "Website Development",
    purpose: "Generate, explain, edit, test, and deploy website code and interfaces.",
    use: "Use for prototypes and maintained websites when someone can review code, security, accessibility, and deployment.",
    benefits: "Speeds prototypes, debugging, and repetitive coding work.",
    limitations: "Generated code can contain bugs, security problems, inaccessible interfaces, or hard-to-maintain choices.",
    oversight: "Review changes, test on mobile and desktop, protect credentials, use version control, and verify deployments.",
    tools: [
      ["GitHub Copilot", "Intermediate", "Paid"],
      ["Replit", "Beginner", "Free to premium"],
      ["Lovable", "Beginner", "Free to premium"],
      ["Bolt", "Beginner", "Free to premium"],
      ["Cursor", "Intermediate", "Free to premium"],
    ],
    options: { beginner: "Lovable, Bolt, or Replit for a small prototype", intermediate: "GitHub Copilot or Cursor with version control", advanced: "A reviewed coding-agent workflow with automated tests and deployment controls", lowCost: "Improve one page in an existing repository", free: "Available free tiers of Replit, Lovable, Bolt, or Cursor" },
  },
];

const implementationPathways = [
  ["Retail businesses", "Inventory, customer questions, promotions, and staff coordination.", ["Start with productivity or marketing.", "Connect sales or inventory data only after definitions are consistent.", "Add customer-service automation with a visible human handoff."]],
  ["Restaurants", "Reservations, reviews, menus, scheduling, training, and customer communication.", ["Start with writing, scheduling, or meeting tools.", "Use image and marketing tools with menu and brand review.", "Keep food safety, pricing, staffing, and customer complaints under human control."]],
  ["Contractors", "Estimates, job notes, scheduling, materials, follow-up, and documentation.", ["Start with writing, meetings, and productivity.", "Add automation between forms, calendars, and approved records.", "Keep estimates, code requirements, contracts, and safety decisions under qualified review."]],
  ["Service businesses", "Lead intake, appointments, reminders, FAQs, and repeatable customer updates.", ["Start with customer service or productivity.", "Add CRM and automation after the intake process is stable.", "Measure response time, missed appointments, and customer satisfaction."]],
  ["Professional offices", "Documents, research, meetings, analysis, intake, and internal knowledge.", ["Start with assistants, research, or meeting tools.", "Use approved data boundaries and source-verification rules.", "Do not delegate licensed, legal, financial, clinical, or personnel judgments to AI."]],
  ["Nonprofits", "Grant research, communications, volunteer coordination, reporting, and outreach.", ["Start with research, writing, and productivity.", "Use low-cost and free options before adding subscriptions.", "Protect donor, client, volunteer, and community information."]],
  ["Educational organizations", "Planning, communication, accessibility, research, and administrative workflows.", ["Start with productivity, research, or writing support.", "Define academic integrity, privacy, accessibility, and human-review rules.", "Keep grading, discipline, accommodations, and student decisions under accountable human judgment."]],
  ["Individual users", "Learning, planning, habits, decisions, creativity, job tasks, and everyday organization.", ["Start with one assistant or productivity tool.", "Practice on low-risk tasks and verify important information.", "Add specialized tools only when a repeated goal clearly needs them."]],
];

const solutionList = document.querySelector("[data-solution-list]");
const solutionSearch = document.querySelector("[data-solution-search]");
const solutionFilter = document.querySelector("[data-solution-filter]");
const solutionCount = document.querySelector("[data-solution-count]");
const pathwayList = document.querySelector("[data-pathway-list]");

const optionLabels = [
  ["Beginner option", "beginner"],
  ["Intermediate option", "intermediate"],
  ["Advanced option", "advanced"],
  ["Low-cost option", "lowCost"],
  ["Free option", "free"],
];

const renderTool = (tool, category) => `
  <details class="tool-profile">
    <summary>
      <span>${tool[0]}</span>
      <small>${tool[1]} · ${tool[2]}</small>
    </summary>
    <div class="tool-profile-body">
      <dl>
        <div><dt>What it does</dt><dd>${tool[0]} is a ${category.title.toLowerCase()} option designed to ${category.purpose.charAt(0).toLowerCase()}${category.purpose.slice(1)}</dd></div>
        <div><dt>When to use it</dt><dd>${category.use}</dd></div>
        <div><dt>Benefits</dt><dd>${category.benefits}</dd></div>
        <div><dt>Limitations</dt><dd>${category.limitations}</dd></div>
        <div><dt>Cost considerations</dt><dd>${tool[2]}. Include training, setup, usage limits, integrations, and maintenance when comparing total cost.</dd></div>
        <div><dt>Human oversight</dt><dd>${category.oversight}</dd></div>
        <div><dt>Recommended skill level</dt><dd>${tool[1]}</dd></div>
      </dl>
    </div>
  </details>
`;

const renderCategory = (category, open = false) => `
  <details class="solution-category" data-category="${category.id}" ${open ? "open" : ""}>
    <summary>
      <div>
        <span>${String(solutionCategories.indexOf(category) + 1).padStart(2, "0")}</span>
        <h3>${category.title}</h3>
      </div>
      <p>${category.purpose}</p>
    </summary>
    <div class="solution-category-body">
      <div class="category-evaluation">
        <div><strong>Use it when</strong><p>${category.use}</p></div>
        <div><strong>Benefits</strong><p>${category.benefits}</p></div>
        <div><strong>Limitations</strong><p>${category.limitations}</p></div>
        <div><strong>Human oversight</strong><p>${category.oversight}</p></div>
      </div>
      <div class="option-levels">
        ${optionLabels.map(([label, key]) => `<div><strong>${label}</strong><p>${category.options[key]}</p></div>`).join("")}
      </div>
      <div class="tool-list">
        ${category.tools.map((tool) => renderTool(tool, category)).join("")}
      </div>
    </div>
  </details>
`;

const renderSolutions = () => {
  if (!solutionList) return;
  const query = solutionSearch?.value.trim().toLowerCase() || "";
  const selected = solutionFilter?.value || "all";
  const visible = solutionCategories.filter((category) => {
    const categoryMatch = selected === "all" || category.id === selected;
    const haystack = [
      category.title,
      category.purpose,
      category.use,
      category.benefits,
      category.limitations,
      ...category.tools.flat(),
      ...Object.values(category.options),
    ].join(" ").toLowerCase();
    return categoryMatch && (!query || haystack.includes(query));
  });

  solutionList.innerHTML = visible.length
    ? visible.map((category, index) => renderCategory(category, index === 0 || visible.length <= 2)).join("")
    : '<p class="empty-solutions">No categories match that search. Try a broader goal or choose all categories.</p>';
  if (solutionCount) solutionCount.textContent = `${visible.length} of ${solutionCategories.length} categories shown`;
};

const initializeAiSolutions = () => {
  if (solutionFilter && !solutionFilter.dataset.loaded) {
    solutionCategories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.title;
      solutionFilter.append(option);
    });
    solutionFilter.dataset.loaded = "true";
    solutionFilter.addEventListener("change", renderSolutions);
  }

  solutionSearch?.addEventListener("input", renderSolutions);

  if (pathwayList) {
    pathwayList.innerHTML = implementationPathways
      .map(
        ([title, focus, steps]) => `
          <article>
            <h3>${title}</h3>
            <p>${focus}</p>
            <ol>${steps.map((step) => `<li>${step}</li>`).join("")}</ol>
          </article>
        `
      )
      .join("");
  }

  renderSolutions();
};

if (document.body?.dataset.requiresApproval === "true") {
  if (solutionCount) solutionCount.textContent = "Sign in and receive approval to explore all categories.";
  if (document.body.dataset.authApproved === "true") {
    initializeAiSolutions();
  } else {
    document.addEventListener("ceamplus:auth-approved", initializeAiSolutions, { once: true });
  }
} else {
  initializeAiSolutions();
}
