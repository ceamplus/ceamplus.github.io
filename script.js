const header = document.querySelector("[data-header]");
const contactForm = document.querySelector("[data-contact-form]");
const statusMessage = document.querySelector("[data-form-status]");
const organizationSelect = document.querySelector("[data-organization-select]");
const startAssessmentButton = document.querySelector("[data-start-assessment]");
const assessmentPanel = document.querySelector("[data-assessment-panel]");
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const zapierWebhookUrl = "https://hooks.zapier.com/hooks/catch/27676700/4oizoy6/";

// CEAM+ assessment sections. Each section measures behavior and support needs in plain language.
const phases = [
  {
    id: "cognitive",
    title: "Cognitive Layer",
    description: "Notice focus patterns, overwhelm, planning needs, and what helps people complete tasks.",
  },
  {
    id: "trust",
    title: "Trust Layer",
    description: "Understand what makes tools feel clear, fair, reliable, and safe enough to use.",
  },
  {
    id: "adoption",
    title: "Adoption Layer",
    description: "Identify learning preferences, change comfort, support needs, and barriers to trying new tools.",
  },
  {
    id: "plus",
    title: "Plus Layer",
    description: "Look at motivation, feedback, consistency, and what helps progress continue over time.",
  },
  {
    id: "environment",
    title: "Environment Layer",
    description: "Spot work, learning, care, or daily-life barriers that make systems harder than they need to be.",
  },
];

const phaseIds = phases.map((phase) => phase.id);

const scaleSets = {
  agreement: { low: "Strongly disagree", high: "Strongly agree" },
  frequency: { low: "Never", high: "Always" },
  stress: { low: "Not stressful", high: "Extremely stressful" },
  difficulty: { low: "Very easy", high: "Very difficult" },
  helpfulness: { low: "Not helpful", high: "Very helpful" },
  confidence: { low: "Not confident", high: "Very confident" },
  clarity: { low: "Very unclear", high: "Very clear" },
};

const profileRules = [
  { max: 44, label: "Guided Support Preferred", tone: "low" },
  { max: 64, label: "Needs Simplified Systems", tone: "medium" },
  { max: 79, label: "Implementation Ready With Support", tone: "medium" },
  { max: 100, label: "Strong Long-Term Growth Potential", tone: "high" },
];

const profileDescriptions = {
  "Guided Support Preferred":
    "Your answers point toward a need for simple first steps, less clutter, and someone available for questions while new tools are being introduced.",
  "Needs Simplified Systems":
    "Your answers suggest that the current routine may have too many moving parts. Simplifying the day-to-day process should come before adding more technology.",
  "Implementation Ready With Support":
    "You appear ready to try AI in a practical way, especially if the first task is specific, low-pressure, and easy to review with another person.",
  "Strong Long-Term Growth Potential":
    "Your answers show useful learning habits and follow-through. The next step is choosing the right first workflow instead of trying to change everything at once.",
};

const contextCopy = {
  personal: {
    title: "Personal CEAM+ Daily Life Assessment",
    icon: "person",
    description: "Use this to understand daily routines, mental energy, planning, personal paperwork, communication, and where simple AI tools may help.",
    person: "you",
    setting: "daily routine",
    stakeholder: "you or people who support you",
    support: "someone you trust",
  },
  business: {
    title: "Work / Business AI Readiness Assessment",
    icon: "briefcase",
    description: "Use this to understand customer communication, invoices, estimates, scheduling, staffing, bookkeeping, team support, and operational barriers before trying AI.",
    person: "you or your team",
    setting: "workday",
    stakeholder: "employees or customers",
    support: "manager, coworker, or support lead",
  },
  education: {
    title: "Education AI Readiness Assessment",
    icon: "book",
    description: "Use this to understand student support, administrative workload, course tools, access needs, communication, and trust before using AI in an education setting.",
    person: "students, administrators, faculty, or staff",
    setting: "school, program, or learning routine",
    stakeholder: "students, administrators, faculty, or support staff",
    support: "administrator, instructor, advisor, or student support lead",
  },
  healthcare: {
    title: "Health / Care AI Readiness Assessment",
    icon: "cross",
    description: "Use this to understand patient communication, documentation, scheduling, privacy, care-team workload, follow-up routines, and accountability before using AI.",
    person: "the patient or care team",
    setting: "care routine",
    stakeholder: "patients or staff",
    support: "care lead, supervisor, or trusted reviewer",
  },
  rehabilitation: {
    title: "Rehabilitation / Adaptive Support AI Readiness Assessment",
    icon: "path",
    description: "Use this to understand personal goals, support routines, reminders, communication style, caregiver coordination, progress tracking, and daily-life fit.",
    person: "the person receiving support",
    setting: "daily support routine",
    stakeholder: "the person, caregiver, or support team",
    support: "caregiver, counselor, therapist, or support staff member",
  },
};

// Question templates stay behavior-based and non-diagnostic. They are adapted by category.
const questionTemplates = [
  {
    id: "current_ai_tools",
    phase: "adoption",
    type: "choice",
    label: "What AI or automation tools do you already use?",
    options: [
      "ChatGPT or another AI chat tool",
      "Email writing or reply suggestions",
      "Scheduling or reminder tools",
      "Document or note summarizers",
      "Invoice, billing, or record tools",
      "I do not use AI tools yet",
    ],
    score: [5, 4, 4, 4, 4, 2],
    indicator: "current_ai_use",
    followUp: {
      when: [
        "ChatGPT or another AI chat tool",
        "Email writing or reply suggestions",
        "Scheduling or reminder tools",
        "Document or note summarizers",
        "Invoice, billing, or record tools",
      ],
      label: "How are those tools helping right now?",
      options: ["Saving time", "Organizing information", "Writing drafts", "Remembering tasks", "Explaining things more simply"],
    },
  },
  {
    id: "many_tasks_first_response",
    phase: "cognitive",
    type: "choice",
    label: "When several things need attention at once, what usually happens first?",
    options: [
      "I pick one clear starting point",
      "I ask someone to help me sort it out",
      "I jump between tasks",
      "I pause because it feels like too much",
    ],
    score: [5, 4, 2, 1],
    indicator: "cognitive_overload",
    followUp: {
      when: ["I jump between tasks", "I pause because it feels like too much"],
      label: "What would make that moment easier?",
      options: ["A shorter list", "A clear first step", "Help from a person", "More time", "Fewer interruptions"],
    },
  },
  {
    id: "time_consuming_tasks",
    phase: "cognitive",
    type: "choice",
    label: "What takes up the most time right now?",
    options: [
      "Scheduling or appointments",
      "Emails or messages",
      "Paperwork or forms",
      "Organizing information",
      "Remembering follow-up tasks",
      "Repeated manual steps",
      "Planning what to do next",
      "Talking through the same questions",
    ],
    score: [3, 3, 2, 2, 2, 2, 3, 3],
    indicator: "time_pressure",
  },
  {
    id: "energy_draining_tasks",
    phase: "cognitive",
    type: "choice",
    label: "What drains the most mental energy?",
    options: [
      "Too many tasks at once",
      "Unclear instructions",
      "Interruptions",
      "Time pressure",
      "Forgetting details",
      "Disorganization",
      "Too many decisions",
      "Lack of support",
    ],
    score: [2, 2, 2, 2, 2, 2, 2, 1],
    indicator: "cognitive_overload",
  },
  {
    id: "unfinished_tasks",
    phase: "cognitive",
    type: "scale",
    scale: "frequency",
    label: "How often do unfinished tasks stay on your mind after the day is over?",
    indicator: "cognitive_overload",
    reverse: true,
    note: "Optional: What kinds of tasks tend to stay on your mind?",
  },
  {
    id: "focus_environment",
    phase: "cognitive",
    type: "choice",
    label: "What type of environment helps you focus best?",
    options: ["Quiet space", "Clear checklist", "Working near someone", "Short timed work sessions", "Flexible space"],
    score: [4, 5, 4, 4, 3],
    indicator: "learning_preference",
  },
  {
    id: "unclear_instructions",
    phase: "cognitive",
    type: "choice",
    label: "When instructions are unclear, what do you usually do?",
    options: ["Ask for clarification", "Look for an example", "Try to figure it out alone", "Wait because I am unsure"],
    score: [5, 5, 3, 1],
    indicator: "support_need",
  },
  {
    id: "new_system_scenario_first",
    phase: "cognitive",
    type: "choice",
    scenario:
      "Imagine a new system has many steps, several menus, and very little explanation.",
    label: "What would you most likely do first?",
    options: ["Look for a simple guide", "Try clicking through it", "Ask someone to show me", "Avoid it until I have to use it"],
    score: [5, 3, 4, 1],
    indicator: "adoption_readiness",
  },
  {
    id: "new_system_scenario_frustration",
    phase: "cognitive",
    type: "choice",
    label: "What part of that situation would feel most frustrating?",
    options: ["Too many buttons", "Unclear instructions", "Fear of mistakes", "Too much information at once", "Not knowing where to start"],
    score: [2, 2, 2, 1, 1],
    indicator: "workflow_friction",
  },
  {
    id: "trust_new_tool",
    phase: "trust",
    type: "choice",
    label: "What helps you trust a new tool?",
    options: ["Clear explanation", "A person reviews it", "Proof it works", "Privacy is explained", "Time to test it safely"],
    score: [5, 5, 4, 5, 5],
    indicator: "trust_sensitivity",
  },
  {
    id: "why_recommendation",
    phase: "trust",
    type: "scale",
    scale: "agreement",
    label: "I need to understand why a tool made a suggestion before I feel comfortable using it.",
    indicator: "trust_sensitivity",
  },
  {
    id: "unexplained_decision",
    phase: "trust",
    type: "choice",
    scenario: "A program recommends a decision, but it does not explain how it reached the answer.",
    label: "What would you most likely do next?",
    options: ["Ask for an explanation", "Check with a person", "Use it if it seems right", "Avoid using the recommendation"],
    score: [5, 5, 3, 2],
    indicator: "trust_sensitivity",
    followUp: {
      when: ["Ask for an explanation", "Check with a person", "Avoid using the recommendation"],
      label: "What would help you trust it more?",
      options: ["Step-by-step reason", "Human review", "Privacy details", "Examples", "A way to correct mistakes"],
    },
  },
  {
    id: "automated_recommendations",
    phase: "trust",
    type: "scale",
    scale: "confidence",
    label: "How confident would you feel following an automated suggestion in this setting?",
    indicator: "trust_sensitivity",
  },
  {
    id: "fairness_concern",
    phase: "trust",
    type: "choice",
    label: "What makes a system feel unfair or unreliable?",
    options: ["No explanation", "Different results for similar people", "Hard-to-fix mistakes", "Privacy concerns", "No person to ask"],
    score: [2, 1, 1, 2, 2],
    indicator: "trust_sensitivity",
  },
  {
    id: "trying_new_tools_barrier",
    phase: "adoption",
    type: "choice",
    label: "What usually gets in the way of trying a new tool?",
    options: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough time", "Not enough support"],
    score: [2, 2, 2, 2, 1],
    indicator: "adoption_barrier",
    followUp: {
      when: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough support"],
      label: "What part feels hardest?",
      options: ["Too many buttons", "Not knowing where to start", "Fear of something going wrong", "Too much information", "No one to ask"],
    },
  },
  {
    id: "tasks_to_simplify",
    phase: "adoption",
    type: "choice",
    label: "What would you most like help simplifying first?",
    options: [
      "Reminders",
      "Messages",
      "Scheduling",
      "Notes or records",
      "Planning steps",
      "Checklists",
      "Repeated questions",
      "Tracking progress",
    ],
    score: [4, 4, 4, 4, 4, 4, 4, 4],
    indicator: "quick_win_task",
  },
  {
    id: "learning_style",
    phase: "adoption",
    type: "choice",
    label: "Which way of learning usually works best?",
    options: ["Step-by-step guidance", "Video examples", "Written instructions", "Hands-on practice", "Working with someone directly"],
    score: [5, 4, 4, 5, 5],
    indicator: "learning_preference",
  },
  {
    id: "stop_when_frustrating",
    phase: "adoption",
    type: "scale",
    scale: "frequency",
    label: "How often do you stop using tools that feel frustrating?",
    reverse: true,
    indicator: "adoption_barrier",
  },
  {
    id: "support_type",
    phase: "adoption",
    type: "choice",
    label: "What support would make learning easier?",
    options: ["Short checklist", "Practice time", "A person to ask", "Examples from real life", "A help guide I can return to"],
    score: [5, 5, 5, 5, 5],
    indicator: "support_need",
  },
  {
    id: "long_term_use",
    phase: "adoption",
    type: "scale",
    scale: "helpfulness",
    label: "How helpful would regular check-ins be for keeping the tool useful over time?",
    indicator: "growth_potential",
  },
  {
    id: "motivation",
    phase: "plus",
    type: "choice",
    label: "What helps you stay motivated when learning something new?",
    options: ["Small wins", "Encouragement", "Seeing progress", "Clear reason for using it", "Time to practice"],
    score: [5, 5, 5, 5, 5],
    indicator: "growth_potential",
  },
  {
    id: "track_progress",
    phase: "plus",
    type: "choice",
    label: "How do you usually track progress toward a goal?",
    options: ["Checklist", "Notes", "Calendar reminders", "Someone checks in", "I do not track it often"],
    score: [5, 4, 4, 4, 1],
    indicator: "growth_potential",
  },
  {
    id: "feedback_type",
    phase: "plus",
    type: "choice",
    label: "What kind of feedback helps you improve most?",
    options: ["Kind and direct", "Step-by-step", "Visual examples", "Private feedback", "Quick reminders"],
    score: [5, 5, 4, 4, 4],
    indicator: "support_need",
  },
  {
    id: "small_wins",
    phase: "plus",
    type: "scale",
    scale: "helpfulness",
    label: "How helpful are small wins for keeping you going?",
    indicator: "growth_potential",
  },
  {
    id: "progress_stops",
    phase: "plus",
    type: "choice",
    label: "What usually causes progress to slow down?",
    options: ["Too many steps", "Low energy", "Unclear next step", "No feedback", "Competing priorities"],
    score: [2, 2, 1, 2, 2],
    indicator: "cognitive_overload",
  },
  {
    id: "long_term_improvements",
    phase: "plus",
    type: "choice",
    label: "What would make daily progress easier to keep up with?",
    options: [
      "Small reminders",
      "A simple routine",
      "Short checklists",
      "Someone checking in",
      "Seeing small wins",
      "Fewer steps",
      "Better instructions",
      "More time to practice",
    ],
    score: [4, 5, 5, 4, 5, 4, 4, 4],
    indicator: "growth_potential",
  },
  {
    id: "confusing_workflow",
    phase: "environment",
    type: "choice",
    label: "What part of the current routine feels most confusing?",
    options: ["Where to start", "Who to ask", "Too many apps or forms", "Unclear expectations", "Changing instructions"],
    score: [1, 2, 2, 1, 1],
    indicator: "workflow_friction",
  },
  {
    id: "daily_slowdown",
    phase: "environment",
    type: "choice",
    label: "What slows things down most during daily tasks?",
    options: ["Waiting for answers", "Searching for information", "Repeating the same steps", "Interruptions", "Tools that do not fit the routine"],
    score: [2, 2, 2, 2, 1],
    indicator: "workflow_friction",
  },
  {
    id: "repetitive_tasks",
    phase: "environment",
    type: "choice",
    label: "What gets repeated over and over?",
    options: [
      "Answering the same questions",
      "Entering the same information",
      "Finding the same files",
      "Writing similar messages",
      "Making similar plans",
      "Repeating reminders",
      "Checking the same status updates",
      "Explaining the same steps",
    ],
    score: [2, 2, 2, 3, 3, 3, 2, 2],
    indicator: "workflow_friction",
  },
  {
    id: "expectation_clarity",
    phase: "environment",
    type: "scale",
    scale: "clarity",
    label: "How clear are expectations in this setting?",
    indicator: "workflow_friction",
  },
  {
    id: "missing_support",
    phase: "environment",
    type: "choice",
    label: "What support or resource feels most missing right now?",
    options: ["Clear instructions", "Enough time", "A person to ask", "Better tool setup", "Privacy guidance"],
    score: [2, 2, 2, 2, 2],
    indicator: "support_need",
  },
  {
    id: "environment_focus",
    phase: "environment",
    type: "choice",
    label: "What makes it harder to focus or stay organized?",
    options: ["Noise", "Interruptions", "Too many tools", "Unclear priorities", "Stress outside the task"],
    score: [2, 2, 1, 1, 2],
    indicator: "environmental_barrier",
    note: "Optional: What would make the environment feel easier to work in?",
  },
];

const categoryQuestionAdditions = {
  personal: [
    {
      id: "daily_life_tasks",
      phase: "environment",
      type: "choice",
      label: "Which daily-life tasks feel hardest to keep up with?",
      options: ["Routines", "Reminders", "Budgeting", "Paperwork", "Household tasks", "Communication", "Planning meals", "Goal tracking"],
      score: [2, 3, 2, 2, 2, 3, 3, 3],
      indicator: "personal_barrier",
    },
    {
      id: "personal_time_tasks",
      phase: "cognitive",
      type: "choice",
      label: "Which personal tasks take the most time each week?",
      options: ["Appointments", "Bills or budgeting", "Forms or paperwork", "Messages", "Cleaning or household tasks", "Meal planning", "Finding information", "Remembering follow-ups"],
      score: [3, 2, 2, 3, 2, 3, 2, 2],
      indicator: "time_pressure",
    },
    {
      id: "personal_overload_moments",
      phase: "cognitive",
      type: "choice",
      label: "When does daily life feel most overwhelming?",
      options: ["Morning routines", "End-of-day tasks", "Too many appointments", "Bills or deadlines", "Unexpected changes", "Too many messages", "Trying to plan ahead", "Keeping track of details"],
      score: [2, 2, 2, 2, 2, 2, 3, 2],
      indicator: "cognitive_overload",
    },
    {
      id: "personal_stress_sources",
      phase: "cognitive",
      type: "choice",
      label: "What usually makes the week feel overwhelming?",
      options: ["Too many responsibilities", "Unexpected changes", "Unfinished tasks", "Messy information", "Constant messages", "Low energy", "No clear routine", "Too many choices"],
      score: [2, 2, 2, 2, 2, 2, 1, 2],
      indicator: "cognitive_overload",
    },
    {
      id: "technology_comfort",
      phase: "trust",
      type: "choice",
      label: "What would make technology feel less stressful?",
      options: ["Simple steps", "Clear examples", "Privacy details", "A person to ask", "Time to practice", "Fewer settings", "Less information at once"],
      score: [5, 5, 5, 5, 5, 4, 4],
      indicator: "support_need",
    },
    {
      id: "personal_first_ai_use",
      phase: "adoption",
      type: "choice",
      label: "What personal task would be the easiest first AI test?",
      options: ["Writing a reminder list", "Planning a week", "Organizing appointments", "Drafting a message", "Sorting paperwork", "Making a budget checklist", "Breaking down a goal", "Preparing questions"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
      indicator: "quick_win_task",
    },
    {
      id: "personal_routine_barriers",
      phase: "plus",
      type: "choice",
      label: "What usually makes personal routines hard to keep going?",
      options: ["Low energy", "Unexpected plans", "Forgetting steps", "Too many responsibilities", "No reminder system", "Stress", "Unrealistic routines", "Lack of quiet time"],
      score: [2, 2, 2, 2, 2, 2, 1, 2],
      indicator: "growth_potential",
    },
    {
      id: "personal_privacy_concerns",
      phase: "trust",
      type: "choice",
      label: "What personal information would you want handled carefully?",
      options: ["Health details", "Money or bills", "Family information", "Messages", "Schedules", "Personal goals", "Passwords", "Location details"],
      score: [2, 2, 2, 2, 3, 3, 1, 2],
      indicator: "trust_sensitivity",
    },
    {
      id: "personal_support_style",
      phase: "adoption",
      type: "choice",
      label: "What kind of help would make daily tools easier to use?",
      options: ["A simple setup", "Examples from my life", "A short video", "A checklist", "Practice with someone", "Reminders I can change", "A way to undo mistakes", "Less clutter on screen"],
      score: [5, 5, 4, 5, 5, 4, 5, 4],
      indicator: "support_need",
    },
  ],
  business: [
    {
      id: "customer_trust",
      phase: "trust",
      type: "scale",
      scale: "agreement",
      label: "Customers should know when AI is helping with a service or decision.",
      indicator: "trust_sensitivity",
    },
    {
      id: "team_support",
      phase: "environment",
      type: "choice",
      label: "What would help the team try AI without feeling rushed?",
      options: ["Clear owner", "Short trial period", "Training time", "Simple rules", "Feedback space"],
      score: [5, 5, 5, 5, 5],
      indicator: "support_need",
    },
    {
      id: "business_time_tasks",
      phase: "environment",
      type: "choice",
      label: "Which work tasks take up the most time?",
      options: ["Invoices", "Estimates", "Customer messages", "Scheduling", "Training employees", "Organizing files", "Social media", "Bookkeeping"],
      score: [2, 2, 3, 3, 3, 2, 3, 2],
      indicator: "time_pressure",
    },
    {
      id: "business_operations_bottlenecks",
      phase: "cognitive",
      type: "choice",
      label: "Which business process gets stuck most often?",
      options: ["Customer follow-up", "Estimates or quotes", "Invoices or payments", "Scheduling jobs", "Ordering supplies", "Training staff", "Tracking tasks", "Finding records"],
      score: [2, 2, 2, 3, 3, 2, 2, 1],
      indicator: "workflow_friction",
    },
    {
      id: "business_customer_messages",
      phase: "adoption",
      type: "choice",
      label: "Which customer communication could AI help draft first?",
      options: ["FAQs", "Appointment reminders", "Estimate follow-ups", "Invoice reminders", "Service updates", "Review requests", "Welcome messages", "Policy explanations"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
      indicator: "quick_win_task",
    },
    {
      id: "business_data_trust",
      phase: "trust",
      type: "choice",
      label: "Which business information needs the most care before AI is used?",
      options: ["Customer contact details", "Payment information", "Employee information", "Vendor details", "Pricing", "Contracts", "Private messages", "Business records"],
      score: [2, 2, 2, 2, 3, 2, 2, 2],
      indicator: "trust_sensitivity",
    },
    {
      id: "business_repeated_explanations",
      phase: "environment",
      type: "choice",
      label: "Where do people repeat the same explanations most often?",
      options: ["Customer questions", "Employee training", "Process steps", "Policies", "Scheduling details", "File locations", "Payment questions"],
      score: [2, 2, 2, 3, 3, 2, 3],
      indicator: "workflow_friction",
    },
    {
      id: "business_progress_measure",
      phase: "plus",
      type: "choice",
      label: "What would show that AI is helping the business?",
      options: ["Faster replies", "Fewer missed follow-ups", "Less paperwork", "More consistent estimates", "Fewer repeated questions", "Less staff confusion", "Time saved each week", "Better recordkeeping"],
      score: [5, 5, 5, 5, 5, 5, 5, 5],
      indicator: "growth_potential",
    },
    {
      id: "business_staff_communication",
      phase: "environment",
      type: "choice",
      label: "Where does staff communication break down most often?",
      options: ["Shift updates", "Task handoffs", "Policy reminders", "Customer details", "Schedule changes", "Training questions", "File locations", "Urgent messages"],
      score: [2, 2, 3, 2, 3, 2, 2, 2],
      indicator: "workflow_friction",
    },
    {
      id: "business_manual_entry",
      phase: "environment",
      type: "choice",
      label: "What business information gets entered by hand again and again?",
      options: ["Customer details", "Invoice lines", "Estimate notes", "Appointment details", "Inventory counts", "Employee hours", "Payment updates", "Service notes"],
      score: [2, 2, 2, 3, 2, 2, 2, 3],
      indicator: "workflow_friction",
    },
    {
      id: "business_training_needs",
      phase: "adoption",
      type: "choice",
      label: "What would make AI training easier for employees?",
      options: ["Job-specific examples", "Short practice sessions", "Written steps", "A manager demo", "Time to ask questions", "Simple rules", "Private practice", "Quick reference guide"],
      score: [5, 5, 5, 4, 5, 5, 4, 5],
      indicator: "learning_preference",
    },
    {
      id: "business_first_workflow",
      phase: "cognitive",
      type: "choice",
      label: "Which work area should be simplified before adding more tools?",
      options: ["Customer intake", "Estimates", "Invoices", "Scheduling", "Staff training", "Bookkeeping", "Social media planning", "File organization"],
      score: [3, 3, 3, 4, 3, 2, 3, 2],
      indicator: "quick_win_task",
    },
  ],
  education: [
    {
      id: "student_confidence",
      phase: "cognitive",
      type: "choice",
      label: "What helps students feel more confident with a new learning tool?",
      options: ["Examples", "Practice prompts", "Teacher guidance", "Peer discussion", "Clear rules"],
      score: [5, 5, 5, 4, 5],
      indicator: "learning_preference",
    },
    {
      id: "academic_honesty",
      phase: "trust",
      type: "scale",
      scale: "clarity",
      label: "How clear are the rules for honest AI use?",
      indicator: "trust_sensitivity",
    },
    {
      id: "education_time_tasks",
      phase: "environment",
      type: "choice",
      label: "Which day-to-day education tasks take up the most time?",
      options: ["Grading or feedback", "Student emails or messages", "Attendance tracking", "LMS updates", "Assignment planning", "Advising or scheduling", "Progress reports", "Finding class resources"],
      score: [3, 2, 3, 3, 3, 3, 4, 2],
      indicator: "time_pressure",
    },
    {
      id: "student_confusion_points",
      phase: "cognitive",
      type: "choice",
      label: "Where do students most often get confused?",
      options: ["Assignment directions", "Due dates", "Where to submit work", "How grades are calculated", "Which tool to use", "How to ask for help", "Academic honesty rules", "Feedback comments"],
      score: [2, 2, 2, 2, 1, 3, 2, 3],
      indicator: "cognitive_overload",
    },
    {
      id: "admin_daily_pressure",
      phase: "cognitive",
      type: "choice",
      label: "Which administrative task creates the most daily pressure?",
      options: ["Answering repeated questions", "Updating student records", "Tracking attendance", "Following up with students", "Preparing reports", "Coordinating schedules", "Explaining policies", "Finding missing information"],
      score: [2, 2, 2, 3, 3, 3, 2, 1],
      indicator: "time_pressure",
    },
    {
      id: "admin_ai_tasks",
      phase: "adoption",
      type: "choice",
      label: "Which administrative task would be the best first AI test?",
      options: ["Student communication", "Advising notes", "Scheduling", "Policy reminders", "Progress summaries", "Resource lists", "Training guides", "Reports"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
      indicator: "quick_win_task",
    },
    {
      id: "student_ai_tasks",
      phase: "adoption",
      type: "choice",
      label: "Which student task would benefit most from simple AI support?",
      options: ["Study planning", "Breaking down assignments", "Organizing notes", "Writing practice", "Research planning", "Time management", "Understanding instructions", "Preparing questions"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
      indicator: "quick_win_task",
    },
    {
      id: "teaching_support_tasks",
      phase: "adoption",
      type: "choice",
      label: "Which teaching or course task would be easiest to improve first?",
      options: ["Creating assignment checklists", "Drafting rubrics", "Writing lesson outlines", "Summarizing readings", "Creating study guides", "Drafting feedback comments", "Making quiz review questions", "Preparing discussion prompts"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
      indicator: "quick_win_task",
    },
    {
      id: "education_privacy_comfort",
      phase: "trust",
      type: "choice",
      label: "What privacy concern should be handled before AI is used in the school setting?",
      options: ["Student records", "Grades", "Disability or accessibility information", "Family contact information", "Staff information", "Class participation data"],
      score: [2, 2, 2, 2, 2, 2],
      indicator: "trust_sensitivity",
    },
    {
      id: "admin_student_communication",
      phase: "environment",
      type: "choice",
      label: "Where does communication break down most often?",
      options: ["Students missing announcements", "Unclear assignment directions", "Slow staff responses", "Unclear policy updates", "Too many message channels", "Different instructions from different people"],
      score: [2, 2, 2, 2, 1, 1],
      indicator: "workflow_friction",
    },
    {
      id: "access_support_needs",
      phase: "trust",
      type: "choice",
      label: "What student support need should be considered before AI is used?",
      options: ["Accessibility needs", "Language support", "Different learning speeds", "Limited internet access", "Device access", "Testing accommodations", "Reading level", "Privacy comfort"],
      score: [2, 3, 3, 2, 2, 2, 3, 2],
      indicator: "trust_sensitivity",
    },
    {
      id: "education_repeated_manual_work",
      phase: "environment",
      type: "choice",
      label: "What school task is repeated manually again and again?",
      options: ["Entering grades", "Sending reminders", "Copying information between systems", "Updating spreadsheets", "Answering policy questions", "Creating similar emails", "Finding student information", "Preparing the same reports"],
      score: [2, 3, 1, 2, 3, 3, 1, 2],
      indicator: "workflow_friction",
    },
    {
      id: "term_feedback_loop",
      phase: "plus",
      type: "choice",
      label: "What should be reviewed during the term to see if AI is actually helping?",
      options: ["Student confidence", "Assignment completion", "Staff time saved", "Fewer repeated questions", "Fewer missed deadlines", "Quality of feedback", "Access issues", "Student stress"],
      score: [5, 5, 5, 5, 5, 5, 4, 4],
      indicator: "growth_potential",
    },
  ],
  healthcare: [
    {
      id: "patient_comfort",
      phase: "trust",
      type: "scale",
      scale: "confidence",
      label: "How comfortable would patients feel if AI support was clearly explained?",
      indicator: "trust_sensitivity",
    },
    {
      id: "staff_workload",
      phase: "cognitive",
      type: "scale",
      scale: "stress",
      label: "How stressful is the current paperwork or screen time?",
      reverse: true,
      indicator: "cognitive_overload",
    },
    {
      id: "healthcare_time_tasks",
      phase: "environment",
      type: "choice",
      label: "Which care tasks take the most time?",
      options: ["Documentation", "Scheduling", "Finding records", "Follow-up reminders", "Explaining instructions", "Preparing visits", "Care notes", "Insurance or billing forms"],
      score: [2, 3, 2, 3, 4, 3, 2, 2],
      indicator: "time_pressure",
    },
    {
      id: "patient_confusion_points",
      phase: "cognitive",
      type: "choice",
      label: "Where do patients or clients most often get confused?",
      options: ["Care instructions", "Medication steps", "Appointment preparation", "Follow-up tasks", "Forms", "Insurance questions", "Portal messages", "Who to contact"],
      score: [2, 2, 3, 2, 2, 2, 3, 2],
      indicator: "cognitive_overload",
    },
    {
      id: "care_team_communication",
      phase: "environment",
      type: "choice",
      label: "Where does care-team communication slow down?",
      options: ["Shift handoffs", "Patient messages", "Referral updates", "Lab or test follow-up", "Scheduling changes", "Documentation notes", "Insurance questions", "Family updates"],
      score: [2, 3, 2, 2, 3, 2, 2, 3],
      indicator: "workflow_friction",
    },
    {
      id: "healthcare_privacy_risks",
      phase: "trust",
      type: "choice",
      label: "Which information needs the most protection before AI is used?",
      options: ["Patient records", "Medication lists", "Insurance information", "Appointment notes", "Portal messages", "Care plans", "Billing information", "Staff notes"],
      score: [2, 2, 2, 2, 2, 2, 2, 3],
      indicator: "trust_sensitivity",
    },
    {
      id: "healthcare_first_ai_task",
      phase: "adoption",
      type: "choice",
      label: "Which care task would be the safest first AI test?",
      options: ["Drafting visit summaries", "Preparing checklists", "Simplifying instructions", "Organizing follow-up tasks", "Drafting reminder messages", "Summarizing non-urgent notes", "Creating staff guides", "Preparing questions"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
      indicator: "quick_win_task",
    },
    {
      id: "healthcare_progress_measure",
      phase: "plus",
      type: "choice",
      label: "What would show that AI support is helping care workflows?",
      options: ["Less documentation time", "Clearer instructions", "Fewer missed follow-ups", "Fewer repeated questions", "Better handoffs", "Less portal confusion", "More consistent checklists", "More staff confidence"],
      score: [5, 5, 5, 5, 5, 5, 5, 5],
      indicator: "growth_potential",
    },
    {
      id: "healthcare_documentation_pressure",
      phase: "cognitive",
      type: "choice",
      label: "Which documentation task creates the most pressure?",
      options: ["Visit notes", "Care summaries", "Portal messages", "Referral notes", "Medication lists", "Insurance forms", "Billing notes", "Follow-up instructions"],
      score: [2, 2, 3, 2, 2, 2, 2, 3],
      indicator: "time_pressure",
    },
    {
      id: "healthcare_patient_followup",
      phase: "adoption",
      type: "choice",
      label: "Which patient follow-up task could be made clearer first?",
      options: ["Appointment reminders", "After-visit instructions", "Medication reminders", "Referral next steps", "Portal message replies", "Test result follow-up", "Care plan checklists", "Family updates"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
      indicator: "quick_win_task",
    },
    {
      id: "healthcare_handoff_gaps",
      phase: "environment",
      type: "choice",
      label: "What information is easiest to lose during care handoffs?",
      options: ["Patient concerns", "Medication changes", "Follow-up needs", "Family questions", "Insurance updates", "Appointment changes", "Care instructions", "Staff notes"],
      score: [2, 2, 2, 3, 3, 3, 2, 2],
      indicator: "workflow_friction",
    },
    {
      id: "healthcare_human_review",
      phase: "trust",
      type: "choice",
      label: "Which AI task would need human review every time?",
      options: ["Clinical summaries", "Patient instructions", "Medication-related text", "Privacy-sensitive messages", "Billing details", "Referral notes", "Risk alerts", "Care plan drafts"],
      score: [5, 5, 5, 5, 4, 4, 5, 5],
      indicator: "trust_sensitivity",
    },
  ],
  rehabilitation: [
    {
      id: "choice_control",
      phase: "trust",
      type: "scale",
      scale: "agreement",
      label: "The person should be able to change or stop AI support when needed.",
      indicator: "trust_sensitivity",
    },
    {
      id: "caregiver_fit",
      phase: "environment",
      type: "choice",
      label: "What would help support feel respectful and easier to use?",
      options: ["Fewer reminders", "Clear choice options", "Caregiver support", "Private feedback", "Simple language"],
      score: [4, 5, 4, 5, 5],
      indicator: "support_need",
    },
    {
      id: "rehab_time_tasks",
      phase: "environment",
      type: "choice",
      label: "Which support tasks take the most time?",
      options: ["Goal tracking", "Appointment scheduling", "Reminders", "Coping plans", "Daily routines", "Progress notes", "Paperwork", "Communication"],
      score: [3, 3, 3, 3, 2, 3, 2, 3],
      indicator: "time_pressure",
    },
    {
      id: "rehab_overload_triggers",
      phase: "cognitive",
      type: "choice",
      label: "What situations make support feel stressful or overwhelming?",
      options: ["Too many reminders", "Changes in routine", "Long instructions", "Sensory distractions", "Memory demands", "Pressure to respond quickly", "Too many choices", "Unclear next steps"],
      score: [2, 2, 2, 2, 2, 2, 2, 1],
      indicator: "cognitive_overload",
    },
    {
      id: "rehab_daily_support_tasks",
      phase: "adoption",
      type: "choice",
      label: "Which support task would be easiest to improve first?",
      options: ["Appointment reminders", "Step-by-step routines", "Goal check-ins", "Coping plan reminders", "Progress notes", "Caregiver updates", "Task prompts", "Preparing questions"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
      indicator: "quick_win_task",
    },
    {
      id: "rehab_choice_privacy",
      phase: "trust",
      type: "choice",
      label: "What should be clear before AI support is used?",
      options: ["What information is used", "Who can see progress", "How reminders work", "How to pause support", "Who reviews suggestions", "How choices are changed", "When caregivers are notified", "What stays private"],
      score: [2, 2, 3, 5, 5, 5, 3, 2],
      indicator: "trust_sensitivity",
    },
    {
      id: "rehab_team_communication",
      phase: "environment",
      type: "choice",
      label: "Where does the support team lose track of information?",
      options: ["Goal updates", "Appointment changes", "Caregiver notes", "Progress tracking", "Daily routines", "Behavior support plans", "Work or school supports", "Medication or wellness reminders"],
      score: [2, 3, 3, 2, 2, 2, 3, 3],
      indicator: "workflow_friction",
    },
    {
      id: "rehab_progress_measure",
      phase: "plus",
      type: "choice",
      label: "What would show that support is working over time?",
      options: ["More independence", "Less stress", "Fewer missed appointments", "More completed routines", "Clearer communication", "Better goal tracking", "More confidence", "Fewer confusing prompts"],
      score: [5, 5, 5, 5, 5, 5, 5, 5],
      indicator: "growth_potential",
    },
    {
      id: "rehab_learning_support",
      phase: "adoption",
      type: "choice",
      label: "How should new support tools be explained?",
      options: ["Show me first", "Repeat the steps", "Use pictures", "Talk it through", "Write the steps down", "Practice together", "Use short prompts", "Let me try slowly"],
      score: [5, 5, 4, 5, 5, 5, 4, 5],
      indicator: "learning_preference",
    },
    {
      id: "rehab_reminder_fit",
      phase: "cognitive",
      type: "choice",
      label: "When do reminders become stressful instead of helpful?",
      options: ["Too many reminders", "Wrong time of day", "Unclear wording", "Repeated alerts", "No way to pause them", "Too much noise", "Feeling watched", "Not matching the routine"],
      score: [2, 3, 2, 2, 1, 2, 1, 2],
      indicator: "cognitive_overload",
    },
    {
      id: "rehab_caregiver_communication",
      phase: "environment",
      type: "choice",
      label: "What should caregivers or staff communicate more clearly?",
      options: ["Daily goals", "Schedule changes", "What helped", "What caused stress", "Medication reminders", "Appointment details", "Behavior support steps", "Progress updates"],
      score: [4, 3, 5, 5, 3, 3, 4, 5],
      indicator: "workflow_friction",
    },
    {
      id: "rehab_feedback_loop",
      phase: "plus",
      type: "choice",
      label: "What should be reviewed to keep support useful over time?",
      options: ["How the person feels", "Goal progress", "Missed appointments", "Stress from reminders", "Caregiver feedback", "Staff notes", "Routine changes", "Choice and control"],
      score: [5, 5, 4, 5, 4, 4, 4, 5],
      indicator: "growth_potential",
    },
  ],
};

const categoryQuestionOverrides = {
  personal: {
    current_ai_tools: {
      label: "What tools do you already use to make daily life easier?",
      options: [
        "ChatGPT or another AI chat tool",
        "Calendar or reminder apps",
        "Budgeting or bill tools",
        "Notes, lists, or task apps",
        "Voice-to-text tools",
        "Email or message help",
        "I do not use AI tools yet",
      ],
      score: [5, 4, 4, 4, 4, 4, 2],
      followUp: {
        when: [
          "ChatGPT or another AI chat tool",
          "Calendar or reminder apps",
          "Budgeting or bill tools",
          "Notes, lists, or task apps",
          "Voice-to-text tools",
          "Email or message help",
        ],
        label: "How are those tools helping your daily life?",
        options: ["Saving time", "Remembering tasks", "Planning my day", "Writing messages", "Feeling more organized"],
      },
    },
    many_tasks_first_response: {
      label: "When daily responsibilities pile up, what usually happens first?",
      options: ["I choose one small task", "I ask someone to help me sort it out", "I bounce between tasks", "I freeze because it feels like too much"],
      score: [5, 4, 2, 1],
      followUp: {
        when: ["I bounce between tasks", "I freeze because it feels like too much"],
        label: "What would make that moment easier at home or in daily life?",
        options: ["A shorter list", "One clear first step", "Help from someone", "More time", "Fewer interruptions"],
      },
    },
    time_consuming_tasks: {
      label: "What takes up the most time in your personal routine?",
      options: ["Appointments", "Bills or budgeting", "Forms or paperwork", "Messages", "Household tasks", "Meal planning", "Finding information", "Remembering follow-ups"],
      score: [3, 2, 2, 3, 2, 3, 2, 2],
    },
    energy_draining_tasks: {
      label: "What drains the most energy during a normal week?",
      options: ["Too many responsibilities", "Unclear plans", "Interruptions", "Time pressure", "Forgetting details", "Disorganization", "Too many choices", "Not enough help"],
      score: [2, 2, 2, 2, 2, 2, 2, 1],
    },
    unfinished_tasks: {
      label: "How often do unfinished personal tasks stay on your mind after the day is over?",
      note: "Optional: Which personal tasks tend to stay on your mind?",
    },
    focus_environment: {
      label: "What helps you focus best in your daily life?",
      options: ["Quiet time", "A simple checklist", "Someone nearby", "Short work sessions", "A flexible space"],
      score: [4, 5, 4, 4, 3],
    },
    unclear_instructions: {
      label: "When personal tasks feel unclear, what do you usually do?",
      options: ["Ask for help", "Look for an example", "Try to figure it out alone", "Wait because I feel unsure"],
      score: [5, 5, 3, 1],
    },
    new_system_scenario_first: {
      scenario: "Imagine you are trying a new app for reminders, budgeting, planning, or paperwork, and it has many steps.",
      label: "What would you most likely do first?",
      options: ["Look for a simple guide", "Try it on my own", "Ask someone to show me", "Avoid it until I need it"],
      score: [5, 3, 4, 1],
    },
    new_system_scenario_frustration: {
      label: "What part of that personal app would feel most frustrating?",
      options: ["Too many buttons", "Unclear instructions", "Fear of mistakes", "Too much information", "Not knowing where to start"],
      score: [2, 2, 2, 1, 1],
    },
    trust_new_tool: {
      label: "What helps you trust a new personal tool?",
      options: ["Simple explanation", "Someone reviews it with me", "Proof it works", "Privacy is clear", "Time to test it first"],
      score: [5, 5, 4, 5, 5],
    },
    unexplained_decision: {
      scenario: "An app gives you advice about a task, but it does not explain why.",
      label: "What would you most likely do next?",
      options: ["Look for an explanation", "Ask someone I trust", "Use it if it seems right", "Avoid using the advice"],
      score: [5, 5, 3, 2],
      followUp: {
        when: ["Look for an explanation", "Ask someone I trust", "Avoid using the advice"],
        label: "What would help you trust that advice?",
        options: ["A simple reason", "A person reviews it", "Privacy details", "Examples", "A way to fix mistakes"],
      },
    },
    automated_recommendations: {
      label: "How confident would you feel following an app suggestion for a personal task?",
    },
    fairness_concern: {
      label: "What makes a personal tool feel unreliable?",
      options: ["No explanation", "Wrong suggestions", "Hard-to-fix mistakes", "Privacy concerns", "No person to ask"],
      score: [2, 1, 1, 2, 2],
    },
    trying_new_tools_barrier: {
      label: "What usually gets in the way of trying a new personal tool?",
      options: ["Too many options", "Unclear steps", "Fear of mistakes", "Not enough time", "No one to ask"],
      score: [2, 2, 2, 2, 1],
      followUp: {
        when: ["Too many options", "Unclear steps", "Fear of mistakes", "No one to ask"],
        label: "What part feels hardest?",
        options: ["Too many buttons", "Not knowing where to start", "Fear of something going wrong", "Too much information", "No one to ask"],
      },
    },
    tasks_to_simplify: {
      label: "What part of daily life would you most like to simplify first?",
      options: ["Reminders", "Messages", "Appointments", "Paperwork", "Budgeting", "Planning the week", "Household routines", "Goal tracking"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
    },
    support_type: {
      label: "What support would make a personal tool easier to learn?",
      options: ["Short checklist", "Practice time", "Someone to ask", "Examples from my life", "A guide I can return to"],
      score: [5, 5, 5, 5, 5],
    },
    progress_stops: {
      label: "What usually causes personal progress to slow down?",
      options: ["Too many steps", "Low energy", "No clear next step", "No feedback", "Too many responsibilities"],
      score: [2, 2, 1, 2, 2],
    },
    confusing_workflow: {
      label: "What part of your daily routine feels most confusing?",
      options: ["Where to start", "Who to ask", "Too many apps or papers", "Unclear expectations", "Changing plans"],
      score: [1, 2, 2, 1, 1],
    },
    daily_slowdown: {
      label: "What slows you down most during personal tasks?",
      options: ["Waiting for answers", "Searching for information", "Repeating steps", "Interruptions", "Tools that do not fit my life"],
      score: [2, 2, 2, 2, 1],
    },
    repetitive_tasks: {
      label: "What do you repeat often in your daily life?",
      options: ["Writing reminders", "Entering the same information", "Finding the same papers", "Writing similar messages", "Making similar plans", "Repeating appointments", "Checking status updates", "Explaining the same needs"],
      score: [3, 2, 2, 3, 3, 3, 2, 2],
    },
    expectation_clarity: {
      label: "How clear are the expectations in your daily routine?",
    },
    missing_support: {
      label: "What support feels most missing in daily life right now?",
      options: ["Clear steps", "Enough time", "Someone to ask", "Better tool setup", "Privacy guidance"],
      score: [2, 2, 2, 2, 2],
    },
    environment_focus: {
      label: "What makes it harder to focus or stay organized in daily life?",
      options: ["Noise", "Interruptions", "Too many tools", "Unclear priorities", "Stress outside the task"],
      score: [2, 2, 1, 1, 2],
      note: "Optional: What would make daily life feel easier to manage?",
    },
  },
  business: {
    current_ai_tools: {
      label: "What AI or automation tools does your business already use?",
      options: [
        "ChatGPT or another AI chat tool",
        "Email writing or reply suggestions",
        "Scheduling or reminder tools",
        "Invoice, billing, or bookkeeping tools",
        "Document or note summarizers",
        "Customer service or FAQ tools",
        "I do not use AI tools yet",
      ],
      score: [5, 4, 4, 4, 4, 4, 2],
      followUp: {
        when: [
          "ChatGPT or another AI chat tool",
          "Email writing or reply suggestions",
          "Scheduling or reminder tools",
          "Invoice, billing, or bookkeeping tools",
          "Document or note summarizers",
          "Customer service or FAQ tools",
        ],
        label: "How are those tools helping the business right now?",
        options: ["Saving staff time", "Drafting messages", "Organizing records", "Answering common questions", "Tracking follow-ups"],
      },
    },
    many_tasks_first_response: {
      label: "When work tasks pile up, what usually happens first?",
      options: ["One priority gets chosen", "Someone helps sort the list", "People jump between tasks", "Work stalls because it feels like too much"],
      score: [5, 4, 2, 1],
      followUp: {
        when: ["People jump between tasks", "Work stalls because it feels like too much"],
        label: "What would make that work moment easier?",
        options: ["A shorter task list", "A clear first step", "Help from a manager or coworker", "More time", "Fewer interruptions"],
      },
    },
    time_consuming_tasks: {
      label: "What takes up the most time during the workday?",
      options: ["Customer messages", "Invoices", "Estimates", "Scheduling", "Bookkeeping", "Training employees", "Organizing files", "Repeated questions"],
      score: [3, 2, 2, 3, 2, 3, 2, 3],
    },
    energy_draining_tasks: {
      label: "What drains the most mental energy at work?",
      options: ["Too many tasks", "Unclear priorities", "Interruptions", "Urgent messages", "Finding records", "Disorganized processes", "Too many decisions", "Not enough staff support"],
      score: [2, 2, 2, 2, 2, 2, 2, 1],
    },
    unfinished_tasks: {
      label: "How often do unfinished work tasks stay on your mind after the day ends?",
      note: "Optional: Which work tasks tend to stay on your mind?",
    },
    unclear_instructions: {
      label: "When work instructions are unclear, what usually happens?",
      options: ["Someone asks for clarification", "People look for an example", "People guess and keep working", "Work waits because people are unsure"],
      score: [5, 5, 3, 1],
    },
    new_system_scenario_first: {
      scenario: "Imagine your team is asked to use a new work tool for customers, invoices, schedules, or records.",
      label: "What would people most likely do first?",
      options: ["Look for a simple guide", "Click around and try it", "Ask someone to show them", "Avoid it until required"],
      score: [5, 3, 4, 1],
    },
    new_system_scenario_frustration: {
      label: "What part of that work tool would feel most frustrating?",
      options: ["Too many buttons", "Unclear steps", "Fear of mistakes", "Too much information", "Not knowing where to start"],
      score: [2, 2, 2, 1, 1],
    },
    trust_new_tool: {
      label: "What helps employees or customers trust a new business tool?",
      options: ["Clear explanation", "A person reviews it", "Proof it works", "Privacy is explained", "Time to test it first"],
      score: [5, 5, 4, 5, 5],
    },
    unexplained_decision: {
      scenario: "A tool recommends a business decision, but it does not explain why.",
      label: "What should happen next?",
      options: ["Ask for an explanation", "Have a person review it", "Use it if it seems right", "Avoid using the recommendation"],
      score: [5, 5, 3, 2],
      followUp: {
        when: ["Ask for an explanation", "Have a person review it", "Avoid using the recommendation"],
        label: "What would help the team trust it?",
        options: ["A simple reason", "Manager review", "Privacy details", "Examples", "A way to fix mistakes"],
      },
    },
    automated_recommendations: {
      label: "How confident would the team feel following an automated suggestion at work?",
    },
    fairness_concern: {
      label: "What makes a business tool feel unfair or unreliable?",
      options: ["No explanation", "Uneven customer treatment", "Hard-to-fix mistakes", "Privacy concerns", "No person to ask"],
      score: [2, 1, 1, 2, 2],
    },
    trying_new_tools_barrier: {
      label: "What usually gets in the way of trying a new work tool?",
      options: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough time", "Not enough staff support"],
      score: [2, 2, 2, 2, 1],
      followUp: {
        when: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough staff support"],
        label: "What part feels hardest at work?",
        options: ["Too many buttons", "Not knowing where to start", "Fear of something going wrong", "Too much information", "No one to ask"],
      },
    },
    tasks_to_simplify: {
      label: "What work task would you most like to simplify first?",
      options: ["Customer messages", "Estimates", "Invoices", "Scheduling", "Bookkeeping", "Training guides", "File organization", "Repeated questions"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
    },
    support_type: {
      label: "What support would make AI easier for the team to learn?",
      options: ["Short checklist", "Practice time", "A person to ask", "Examples from real work", "A guide the team can return to"],
      score: [5, 5, 5, 5, 5],
    },
    progress_stops: {
      label: "What usually causes work improvements to slow down?",
      options: ["Too many steps", "Staff burnout", "Unclear next step", "No feedback", "Competing customer demands"],
      score: [2, 2, 1, 2, 2],
    },
    confusing_workflow: {
      label: "What part of the business workflow feels most confusing?",
      options: ["Where to start", "Who owns the task", "Too many apps or forms", "Unclear priorities", "Changing instructions"],
      score: [1, 2, 2, 1, 1],
    },
    daily_slowdown: {
      label: "What slows work down most during the day?",
      options: ["Waiting for answers", "Searching for records", "Repeating steps", "Interruptions", "Tools that do not fit the work"],
      score: [2, 2, 2, 2, 1],
    },
    repetitive_tasks: {
      label: "What gets repeated over and over at work?",
      options: ["Answering customer questions", "Entering customer details", "Finding the same files", "Writing similar messages", "Making similar estimates", "Repeating reminders", "Checking job status", "Explaining the same steps"],
      score: [2, 2, 2, 3, 3, 3, 2, 2],
    },
    expectation_clarity: {
      label: "How clear are work expectations for the team?",
    },
    missing_support: {
      label: "What support feels most missing at work right now?",
      options: ["Clear instructions", "Enough time", "A person to ask", "Better tool setup", "Privacy guidance"],
      score: [2, 2, 2, 2, 2],
    },
    environment_focus: {
      label: "What makes it harder for the team to focus or stay organized?",
      options: ["Noise", "Interruptions", "Too many tools", "Unclear priorities", "Stress outside the task"],
      score: [2, 2, 1, 1, 2],
      note: "Optional: What would make the work environment easier to manage?",
    },
  },
  education: {
    current_ai_tools: {
      label: "What AI or digital tools are students, administrators, faculty, or staff already using?",
      options: [
        "ChatGPT or another study support tool",
        "Learning management system tools",
        "Email or announcement drafting tools",
        "Scheduling or advising tools",
        "Document or lecture note summarizers",
        "Gradebook, reporting, or attendance tools",
        "I do not use AI tools yet",
      ],
      score: [5, 4, 4, 4, 4, 4, 2],
      followUp: {
        when: [
          "ChatGPT or another study support tool",
          "Learning management system tools",
          "Email or announcement drafting tools",
          "Scheduling or advising tools",
          "Document or lecture note summarizers",
          "Gradebook, reporting, or attendance tools",
        ],
        label: "How are those tools helping in the school setting?",
        options: ["Saving staff time", "Helping students organize work", "Improving communication", "Summarizing information", "Tracking deadlines"],
      },
    },
    many_tasks_first_response: {
      label: "When school tasks pile up, what usually happens first?",
      options: [
        "A clear priority gets chosen",
        "A student, staff member, or administrator asks for help",
        "People jump between tasks",
        "The task gets delayed because it feels like too much",
      ],
      score: [5, 4, 2, 1],
      followUp: {
        when: ["People jump between tasks", "The task gets delayed because it feels like too much"],
        label: "What would make that school task easier?",
        options: ["A shorter task list", "A clear first step", "Help from staff or an instructor", "More time", "Fewer platform changes"],
      },
    },
    time_consuming_tasks: {
      label: "What takes up the most time in the school day or semester?",
      options: [
        "Student emails or messages",
        "Forms or paperwork",
        "Course setup or LMS updates",
        "Assignment planning",
        "Grade, attendance, or progress records",
        "Advising or scheduling",
        "Repeated student questions",
        "Finding class resources",
      ],
      score: [3, 2, 2, 3, 2, 3, 3, 2],
    },
    energy_draining_tasks: {
      label: "What feels most mentally draining for students or administrators?",
      options: [
        "Too many platforms",
        "Unclear deadlines",
        "Repeated questions",
        "Time pressure",
        "Missing information",
        "Disorganized class materials",
        "Too many decisions",
        "Not enough support",
      ],
      score: [2, 2, 3, 2, 2, 2, 2, 1],
    },
    unfinished_tasks: {
      label: "How often do school tasks stay on your mind after the day ends?",
      note: "Optional: Which school tasks tend to stay on your mind?",
    },
    focus_environment: {
      label: "What helps students or staff focus best?",
      options: ["Quiet study or work time", "Clear checklist", "Support from another person", "Short work sessions", "Flexible options"],
      score: [4, 5, 4, 4, 3],
    },
    unclear_instructions: {
      label: "When school instructions or AI rules are unclear, what usually happens?",
      options: ["Someone asks for clarification", "People look for an example", "People try to figure it out alone", "People wait because they are unsure"],
      score: [5, 5, 3, 1],
    },
    new_system_scenario_first: {
      scenario: "Imagine students or administrators are asked to use a new school system with many steps and very little explanation.",
      label: "What would people most likely do first?",
      options: ["Look for a simple guide", "Try clicking through it", "Ask someone to show them", "Avoid it until it is required"],
      score: [5, 3, 4, 1],
    },
    new_system_scenario_frustration: {
      label: "What part of that school system would feel most frustrating?",
      options: ["Too many portals or buttons", "Unclear instructions", "Fear of mistakes", "Too much information at once", "Not knowing where to start"],
      score: [2, 2, 2, 1, 1],
    },
    trust_new_tool: {
      label: "What helps students or administrators trust a new AI tool?",
      options: ["Clear explanation", "Human review", "Proof it works", "Privacy is explained", "Time to test it safely"],
      score: [5, 5, 4, 5, 5],
    },
    why_recommendation: {
      label: "Students or administrators need to understand why an AI tool made a suggestion before relying on it.",
    },
    unexplained_decision: {
      scenario: "An AI tool recommends a school decision, but it does not explain how it reached the answer.",
      label: "What should happen next?",
      options: ["Ask for an explanation", "Have a person review it", "Use it if it seems right", "Avoid using the recommendation"],
      score: [5, 5, 3, 2],
      followUp: {
        when: ["Ask for an explanation", "Have a person review it", "Avoid using the recommendation"],
        label: "What would help people trust the result more?",
        options: ["Step-by-step reason", "Instructor or administrator review", "Privacy details", "Examples", "A way to correct mistakes"],
      },
    },
    automated_recommendations: {
      label: "How confident would students or administrators feel following an automated suggestion in this school setting?",
    },
    fairness_concern: {
      label: "What makes an education AI system feel unfair or unreliable?",
      options: ["No explanation", "Different results for similar students", "Hard-to-fix mistakes", "Privacy concerns", "No person to ask"],
      score: [2, 1, 1, 2, 2],
    },
    trying_new_tools_barrier: {
      label: "What usually gets in the way of students or administrators trying a new school tool?",
      options: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough time", "Not enough support"],
      score: [2, 2, 2, 2, 1],
      followUp: {
        when: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough support"],
        label: "What part feels hardest in the school setting?",
        options: ["Too many buttons", "Not knowing where to start", "Fear of something going wrong", "Too much information", "No one to ask"],
      },
    },
    tasks_to_simplify: {
      label: "What school task should AI help simplify first?",
      options: [
        "Assignment planning",
        "Student reminders",
        "Advising or scheduling",
        "Forms or paperwork",
        "Feedback drafts",
        "Student questions",
        "Accessibility supports",
        "Reports or summaries",
      ],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
    },
    learning_style: {
      label: "Which support helps students or staff learn a new tool best?",
      options: ["Step-by-step guidance", "Video examples", "Written instructions", "Hands-on practice", "Working with someone directly"],
      score: [5, 4, 4, 5, 5],
    },
    support_type: {
      label: "What support would make AI use easier in the school setting?",
      options: ["Short checklist", "Practice time", "A person to ask", "Examples from real school tasks", "A help guide people can return to"],
      score: [5, 5, 5, 5, 5],
    },
    long_term_use: {
      label: "How helpful would regular check-ins be for keeping the AI tool useful during the term?",
    },
    motivation: {
      label: "What helps students or staff stay motivated when learning a new tool?",
      options: ["Small wins", "Encouragement", "Seeing progress", "Clear reason for using it", "Time to practice"],
      score: [5, 5, 5, 5, 5],
    },
    track_progress: {
      label: "How is progress usually tracked in this education setting?",
      options: ["Checklist", "Notes", "Calendar reminders", "Staff or instructor check-ins", "It is not tracked often"],
      score: [5, 4, 4, 4, 1],
    },
    feedback_type: {
      label: "What kind of feedback helps students or staff improve most?",
      options: ["Kind and direct", "Step-by-step", "Visual examples", "Private feedback", "Quick reminders"],
      score: [5, 5, 4, 4, 4],
    },
    small_wins: {
      label: "How helpful are small wins for keeping students or staff engaged?",
    },
    progress_stops: {
      label: "What usually causes progress to slow down in a school setting?",
      options: ["Too many steps", "Low energy", "Unclear next step", "No feedback", "Competing deadlines"],
      score: [2, 2, 1, 2, 2],
    },
    long_term_improvements: {
      label: "What would make education workflows easier to maintain over time?",
      options: [
        "Small reminders",
        "A simple routine",
        "Short checklists",
        "Staff or instructor check-ins",
        "Visible student progress",
        "Fewer steps",
        "Better instructions",
        "More time to practice",
      ],
      score: [4, 5, 5, 4, 5, 4, 4, 4],
    },
    confusing_workflow: {
      label: "What part of the school workflow feels most confusing?",
      options: ["Where to start", "Who to ask", "Too many systems", "Unclear expectations", "Changing instructions"],
      score: [1, 2, 2, 1, 1],
    },
    daily_slowdown: {
      label: "What slows students or administrators down most?",
      options: ["Waiting for answers", "Searching for information", "Repeating the same steps", "Interruptions", "Tools that do not fit the school routine"],
      score: [2, 2, 2, 2, 1],
    },
    repetitive_tasks: {
      label: "What gets repeated over and over in the education setting?",
      options: [
        "Answering the same student questions",
        "Entering the same information",
        "Finding the same class resources",
        "Writing similar announcements",
        "Making similar study or support plans",
        "Repeating reminders",
        "Checking the same progress updates",
        "Explaining the same steps",
      ],
      score: [2, 2, 2, 3, 3, 3, 2, 2],
    },
    expectation_clarity: {
      label: "How clear are expectations for students, administrators, faculty, or staff?",
    },
    missing_support: {
      label: "What support feels most missing in the school setting right now?",
      options: ["Clear instructions", "Enough time", "A person to ask", "Better tool setup", "Privacy guidance"],
      score: [2, 2, 2, 2, 2],
    },
    environment_focus: {
      label: "What makes it harder for students or staff to focus or stay organized?",
      options: ["Noise", "Interruptions", "Too many tools", "Unclear priorities", "Stress outside the task"],
      score: [2, 2, 1, 1, 2],
      note: "Optional: What would make the school environment easier to work or learn in?",
    },
  },
  healthcare: {
    current_ai_tools: {
      label: "What AI or digital tools are already used in this care setting?",
      options: [
        "ChatGPT or another AI chat tool",
        "Patient portal message tools",
        "Scheduling or reminder tools",
        "Documentation or note tools",
        "Billing or record tools",
        "Summary or checklist tools",
        "I do not use AI tools yet",
      ],
      score: [5, 4, 4, 4, 4, 4, 2],
      followUp: {
        when: [
          "ChatGPT or another AI chat tool",
          "Patient portal message tools",
          "Scheduling or reminder tools",
          "Documentation or note tools",
          "Billing or record tools",
          "Summary or checklist tools",
        ],
        label: "How are those tools helping care work right now?",
        options: ["Saving staff time", "Organizing notes", "Drafting messages", "Remembering follow-ups", "Making instructions clearer"],
      },
    },
    many_tasks_first_response: {
      label: "When care tasks pile up, what usually happens first?",
      options: ["A priority gets chosen", "Someone helps sort the tasks", "Staff jump between tasks", "Work slows because it feels like too much"],
      score: [5, 4, 2, 1],
      followUp: {
        when: ["Staff jump between tasks", "Work slows because it feels like too much"],
        label: "What would make that care moment easier?",
        options: ["A shorter list", "A clear first step", "Help from a care lead", "More time", "Fewer interruptions"],
      },
    },
    time_consuming_tasks: {
      label: "What takes up the most time in the care routine?",
      options: ["Documentation", "Scheduling", "Finding records", "Patient messages", "Follow-up reminders", "Insurance forms", "Care notes", "Explaining instructions"],
      score: [2, 3, 2, 3, 3, 2, 2, 4],
    },
    energy_draining_tasks: {
      label: "What drains the most mental energy in the care setting?",
      options: ["Too many tasks", "Unclear instructions", "Interruptions", "Time pressure", "Missing details", "Portal confusion", "Too many decisions", "Not enough support"],
      score: [2, 2, 2, 2, 2, 2, 2, 1],
    },
    unfinished_tasks: {
      label: "How often do unfinished care tasks stay on your mind after the day ends?",
      note: "Optional: Which care tasks tend to stay on your mind?",
    },
    unclear_instructions: {
      label: "When care instructions are unclear, what usually happens?",
      options: ["Someone asks for clarification", "People look for an example", "People guess and keep moving", "Work waits because people are unsure"],
      score: [5, 5, 3, 1],
    },
    new_system_scenario_first: {
      scenario: "Imagine the care team is asked to use a new tool for notes, messages, scheduling, or follow-ups.",
      label: "What would people most likely do first?",
      options: ["Look for a simple guide", "Try clicking through it", "Ask someone to show them", "Avoid it until required"],
      score: [5, 3, 4, 1],
    },
    new_system_scenario_frustration: {
      label: "What part of that care tool would feel most frustrating?",
      options: ["Too many buttons", "Unclear steps", "Fear of mistakes", "Too much information", "Not knowing where to start"],
      score: [2, 2, 2, 1, 1],
    },
    trust_new_tool: {
      label: "What helps patients or staff trust a new care tool?",
      options: ["Clear explanation", "A person reviews it", "Proof it works", "Privacy is explained", "Time to test it first"],
      score: [5, 5, 4, 5, 5],
    },
    why_recommendation: {
      label: "Patients or staff need to understand why a care tool made a suggestion before relying on it.",
    },
    unexplained_decision: {
      scenario: "A tool recommends a care-related action, but it does not explain why.",
      label: "What should happen next?",
      options: ["Ask for an explanation", "Have a care professional review it", "Use it if it seems right", "Avoid using the recommendation"],
      score: [5, 5, 3, 2],
      followUp: {
        when: ["Ask for an explanation", "Have a care professional review it", "Avoid using the recommendation"],
        label: "What would help people trust the care suggestion?",
        options: ["A simple reason", "Human review", "Privacy details", "Examples", "A way to correct mistakes"],
      },
    },
    automated_recommendations: {
      label: "How confident would people feel following an automated suggestion in this care setting?",
    },
    fairness_concern: {
      label: "What makes a care tool feel unfair or unreliable?",
      options: ["No explanation", "Different treatment for similar patients", "Hard-to-fix mistakes", "Privacy concerns", "No person to ask"],
      score: [2, 1, 1, 2, 2],
    },
    trying_new_tools_barrier: {
      label: "What usually gets in the way of trying a new care tool?",
      options: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough time", "Not enough support"],
      score: [2, 2, 2, 2, 1],
      followUp: {
        when: ["Too many options", "Unclear instructions", "Fear of mistakes", "Not enough support"],
        label: "What part feels hardest in the care setting?",
        options: ["Too many buttons", "Not knowing where to start", "Fear of something going wrong", "Too much information", "No one to ask"],
      },
    },
    tasks_to_simplify: {
      label: "What care task would you most like to simplify first?",
      options: ["Patient messages", "Visit summaries", "Appointment reminders", "Follow-up tasks", "Care instructions", "Insurance forms", "Staff checklists", "Finding records"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
    },
    support_type: {
      label: "What support would make AI easier for care staff or patients to learn?",
      options: ["Short checklist", "Practice time", "A person to ask", "Examples from care tasks", "A guide people can return to"],
      score: [5, 5, 5, 5, 5],
    },
    progress_stops: {
      label: "What usually causes care improvements to slow down?",
      options: ["Too many steps", "Staff burnout", "Unclear next step", "No feedback", "Competing patient needs"],
      score: [2, 2, 1, 2, 2],
    },
    confusing_workflow: {
      label: "What part of the care workflow feels most confusing?",
      options: ["Where to start", "Who to ask", "Too many systems", "Unclear expectations", "Changing instructions"],
      score: [1, 2, 2, 1, 1],
    },
    daily_slowdown: {
      label: "What slows care work down most during the day?",
      options: ["Waiting for answers", "Searching for records", "Repeating steps", "Interruptions", "Tools that do not fit care work"],
      score: [2, 2, 2, 2, 1],
    },
    repetitive_tasks: {
      label: "What gets repeated over and over in care work?",
      options: ["Answering the same questions", "Entering the same information", "Finding the same records", "Writing similar messages", "Making similar checklists", "Repeating reminders", "Checking follow-up status", "Explaining the same steps"],
      score: [2, 2, 2, 3, 3, 3, 2, 2],
    },
    expectation_clarity: {
      label: "How clear are expectations for patients, staff, or the care team?",
    },
    missing_support: {
      label: "What support feels most missing in the care setting right now?",
      options: ["Clear instructions", "Enough time", "A person to ask", "Better tool setup", "Privacy guidance"],
      score: [2, 2, 2, 2, 2],
    },
    environment_focus: {
      label: "What makes it harder for patients or staff to focus or stay organized?",
      options: ["Noise", "Interruptions", "Too many tools", "Unclear priorities", "Stress outside the task"],
      score: [2, 2, 1, 1, 2],
      note: "Optional: What would make the care environment easier to manage?",
    },
  },
  rehabilitation: {
    current_ai_tools: {
      label: "What support tools are already being used?",
      options: [
        "ChatGPT or another AI chat tool",
        "Reminder apps",
        "Calendar or appointment tools",
        "Goal tracking tools",
        "Notes or progress tools",
        "Communication tools for caregivers or staff",
        "I do not use AI tools yet",
      ],
      score: [5, 4, 4, 4, 4, 4, 2],
      followUp: {
        when: [
          "ChatGPT or another AI chat tool",
          "Reminder apps",
          "Calendar or appointment tools",
          "Goal tracking tools",
          "Notes or progress tools",
          "Communication tools for caregivers or staff",
        ],
        label: "How are those tools helping support right now?",
        options: ["Remembering tasks", "Tracking goals", "Planning routines", "Sharing updates", "Explaining steps simply"],
      },
    },
    many_tasks_first_response: {
      label: "When support tasks pile up, what usually happens first?",
      options: ["One small step gets chosen", "Someone helps sort the tasks", "People jump between tasks", "The task pauses because it feels like too much"],
      score: [5, 4, 2, 1],
      followUp: {
        when: ["People jump between tasks", "The task pauses because it feels like too much"],
        label: "What would make that support moment easier?",
        options: ["A shorter list", "A clear first step", "Help from a person", "More time", "Fewer interruptions"],
      },
    },
    time_consuming_tasks: {
      label: "What support tasks take up the most time?",
      options: ["Goal tracking", "Appointment scheduling", "Reminders", "Coping plans", "Daily routines", "Progress notes", "Paperwork", "Caregiver communication"],
      score: [3, 3, 3, 3, 2, 3, 2, 3],
    },
    energy_draining_tasks: {
      label: "What feels most tiring during support routines?",
      options: ["Too many reminders", "Unclear steps", "Interruptions", "Time pressure", "Memory demands", "Sensory distractions", "Too many choices", "Not enough help"],
      score: [2, 2, 2, 2, 2, 2, 2, 1],
    },
    unfinished_tasks: {
      label: "How often do unfinished support tasks stay on people's minds after the day ends?",
      note: "Optional: Which support tasks tend to stay on people's minds?",
    },
    focus_environment: {
      label: "What helps the person focus best during support tasks?",
      options: ["Quiet space", "Clear checklist", "Support person nearby", "Short practice sessions", "Flexible timing"],
      score: [4, 5, 4, 4, 3],
    },
    unclear_instructions: {
      label: "When support instructions are unclear, what usually happens?",
      options: ["Someone asks for clarification", "People look for an example", "People try to figure it out alone", "The task waits because people are unsure"],
      score: [5, 5, 3, 1],
    },
    new_system_scenario_first: {
      scenario: "Imagine a new support tool has reminders, menus, tracking, and very little explanation.",
      label: "What would people most likely do first?",
      options: ["Look for a simple guide", "Try clicking through it", "Ask someone to show them", "Avoid it until required"],
      score: [5, 3, 4, 1],
    },
    new_system_scenario_frustration: {
      label: "What part of that support tool would feel most frustrating?",
      options: ["Too many buttons", "Unclear steps", "Fear of mistakes", "Too much information", "Not knowing where to start"],
      score: [2, 2, 2, 1, 1],
    },
    trust_new_tool: {
      label: "What helps the person or support team trust a new tool?",
      options: ["Simple explanation", "A person reviews it", "Proof it helps", "Privacy is explained", "Time to test it first"],
      score: [5, 5, 4, 5, 5],
    },
    why_recommendation: {
      label: "The person should understand why a tool made a suggestion before relying on it.",
    },
    unexplained_decision: {
      scenario: "A support tool suggests what to do next, but it does not explain why.",
      label: "What should happen next?",
      options: ["Ask for an explanation", "Have a person review it", "Use it if it seems right", "Avoid using the suggestion"],
      score: [5, 5, 3, 2],
      followUp: {
        when: ["Ask for an explanation", "Have a person review it", "Avoid using the suggestion"],
        label: "What would help the person trust it?",
        options: ["A simple reason", "Caregiver or staff review", "Privacy details", "Examples", "A way to correct mistakes"],
      },
    },
    automated_recommendations: {
      label: "How confident would people feel following an automated suggestion during support routines?",
    },
    fairness_concern: {
      label: "What makes a support tool feel unreliable?",
      options: ["No explanation", "Suggestions do not fit the person", "Hard-to-fix mistakes", "Privacy concerns", "No person to ask"],
      score: [2, 1, 1, 2, 2],
    },
    trying_new_tools_barrier: {
      label: "What usually gets in the way of trying a new support tool?",
      options: ["Too many options", "Unclear steps", "Fear of mistakes", "Not enough time", "Not enough support"],
      score: [2, 2, 2, 2, 1],
      followUp: {
        when: ["Too many options", "Unclear steps", "Fear of mistakes", "Not enough support"],
        label: "What part feels hardest during support?",
        options: ["Too many buttons", "Not knowing where to start", "Fear of something going wrong", "Too much information", "No one to ask"],
      },
    },
    tasks_to_simplify: {
      label: "What support task would you most like to simplify first?",
      options: ["Appointment reminders", "Daily routines", "Goal check-ins", "Coping plans", "Progress notes", "Caregiver updates", "Paperwork", "Preparing questions"],
      score: [4, 4, 4, 4, 4, 4, 4, 4],
    },
    support_type: {
      label: "What support would make a new tool easier to learn?",
      options: ["Short checklist", "Practice time", "A person to ask", "Examples from daily routines", "A guide people can return to"],
      score: [5, 5, 5, 5, 5],
    },
    long_term_use: {
      label: "How helpful would regular check-ins be for keeping support useful over time?",
    },
    motivation: {
      label: "What helps the person stay motivated during support routines?",
      options: ["Small wins", "Encouragement", "Seeing progress", "Clear reason for using it", "Time to practice"],
      score: [5, 5, 5, 5, 5],
    },
    track_progress: {
      label: "How is support progress usually tracked?",
      options: ["Checklist", "Notes", "Calendar reminders", "Caregiver or staff check-ins", "It is not tracked often"],
      score: [5, 4, 4, 4, 1],
    },
    progress_stops: {
      label: "What usually causes support progress to slow down?",
      options: ["Too many steps", "Low energy", "No clear next step", "No feedback", "Changes in routine"],
      score: [2, 2, 1, 2, 2],
    },
    confusing_workflow: {
      label: "What part of the support routine feels most confusing?",
      options: ["Where to start", "Who to ask", "Too many tools or papers", "Unclear expectations", "Changing instructions"],
      score: [1, 2, 2, 1, 1],
    },
    daily_slowdown: {
      label: "What slows support routines down most?",
      options: ["Waiting for answers", "Searching for information", "Repeating steps", "Interruptions", "Tools that do not fit the person"],
      score: [2, 2, 2, 2, 1],
    },
    repetitive_tasks: {
      label: "What gets repeated over and over in support routines?",
      options: ["Giving reminders", "Entering the same information", "Finding the same notes", "Writing similar updates", "Making similar plans", "Repeating appointments", "Checking progress", "Explaining the same steps"],
      score: [3, 2, 2, 3, 3, 3, 2, 2],
    },
    expectation_clarity: {
      label: "How clear are expectations for the person, caregiver, or support team?",
    },
    missing_support: {
      label: "What support feels most missing right now?",
      options: ["Clear instructions", "Enough time", "A person to ask", "Better tool setup", "Privacy guidance"],
      score: [2, 2, 2, 2, 2],
    },
    environment_focus: {
      label: "What makes it harder to focus or stay organized during support?",
      options: ["Noise", "Interruptions", "Too many tools", "Unclear priorities", "Stress outside the task"],
      score: [2, 2, 1, 1, 2],
      note: "Optional: What would make the support environment feel easier?",
    },
  },
};

const applyCategoryOverride = (categoryId, template) => {
  const override = categoryQuestionOverrides[categoryId]?.[template.id];
  if (!override) return template;

  return {
    ...template,
    ...override,
    followUp: override.followUp
      ? {
          ...(template.followUp || {}),
          ...override.followUp,
        }
      : template.followUp,
  };
};

const makeQuestion = (categoryId, template) => ({
  ...template,
  id: `${categoryId}_${template.id}`,
});

const assessments = Object.entries(contextCopy).map(([id, copy]) => ({
  id,
  version: "2.0",
  title: copy.title,
  icon: copy.icon,
  description: copy.description,
  phases: phaseIds,
  recommendations: {},
  questions: [...questionTemplates, ...(categoryQuestionAdditions[id] || [])]
    .map((question) => applyCategoryOverride(id, question))
    .map((question) => makeQuestion(id, question)),
}));

const getAssessmentById = (id) => assessments.find((assessment) => assessment.id === id);
const getScale = (question) => scaleSets[question.scale] || scaleSets.agreement;
const sliderTicksId = "ceam-slider-ticks";

const getReadinessLevel = (score) => profileRules.find((rule) => score <= rule.max) || profileRules.at(-1);

const getQuestionScore = (question, value) => {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) return null;

  if (question.type === "choice") {
    const scores = question.score || question.options.map(() => 4);
    if (Math.max(...scores) <= 3) return 3;
    const selectedValues = Array.isArray(value) ? value : [value];
    const selectedScores = selectedValues
      .map((selected) => scores[question.options.indexOf(selected)])
      .filter((score) => typeof score === "number");
    if (!selectedScores.length) return null;
    return selectedScores.reduce((sum, score) => sum + score, 0) / selectedScores.length;
  }

  const number = Number(value ?? 0);
  return question.reverse ? 5 - number : number;
};

const calculateScore = (responses, questions = []) => {
  const scoredQuestions = questions
    .filter((question) => question.type !== "text")
    .map((question) => getQuestionScore(question, responses[question.id]))
    .filter((score) => score !== null);
  if (!scoredQuestions.length) return 0;
  const total = scoredQuestions.reduce((sum, score) => sum + score, 0);
  return Math.round((total / (scoredQuestions.length * 5)) * 100);
};

const calculatePhaseScores = (assessment, responses) =>
  phases.reduce((scores, phase) => {
    const phaseQuestions = assessment.questions.filter((question) => question.phase === phase.id);
    scores[phase.id] = calculateScore(responses, phaseQuestions);
    return scores;
  }, {});

const collectIndicators = (assessment, responses) =>
  assessment.questions.reduce((indicators, question) => {
    if (!question.indicator) return indicators;
    const score = getQuestionScore(question, responses[question.id]);
    if (score === null) return indicators;
    const current = indicators[question.indicator] || { total: 0, count: 0 };
    indicators[question.indicator] = { total: current.total + score, count: current.count + 1 };
    return indicators;
  }, {});

const summarizeIndicators = (indicators) =>
  Object.entries(indicators)
    .map(([id, value]) => ({ id, score: Math.round((value.total / (value.count * 5)) * 100) }))
    .sort((a, b) => a.score - b.score);

const indicatorLabels = {
  cognitive_overload: "Some tasks may feel mentally heavy",
  workflow_friction: "Parts of the routine may feel harder than they need to be",
  trust_sensitivity: "Trust and transparency matter here",
  learning_preference: "Learning preferences are important",
  adoption_barrier: "Trying new tools may feel easier with support",
  support_need: "Support should be planned before starting",
  growth_potential: "Long-term growth potential is present",
  environmental_barrier: "The environment may be making focus harder",
  current_ai_use: "Current AI use can shape the next step",
  time_pressure: "Time-consuming tasks are a good place to start",
  quick_win_task: "A simple first task is already visible",
  personal_barrier: "Daily routines may need simpler support",
};

const answerInsightRules = [
  {
    match: ["I do not use AI tools yet"],
    message: "The user may be new to AI tools, so recommendations should start with very simple examples and low-risk practice.",
  },
  {
    match: ["ChatGPT or another AI chat tool"],
    message: "The user already has some experience with AI chat tools, so prompts, drafts, and planning templates may be a good next step.",
  },
  {
    match: ["Email writing or reply suggestions"],
    message: "The user already uses writing support, so email drafts, client messages, and follow-up notes may be a practical starting point.",
  },
  {
    match: ["Scheduling or reminder tools"],
    message: "The user already uses reminder or scheduling support, so AI can build on routines, follow-ups, and planning.",
  },
  {
    match: ["Document or note summarizers"],
    message: "The user already uses summarizing support, so record summaries, meeting notes, and checklist creation may be useful.",
  },
  {
    match: ["I pause because it feels like too much", "Too much information at once", "Not knowing where to start"],
    message: "The user may need fewer steps and a clear first action before adding more tools.",
  },
  {
    match: ["Fear of mistakes", "Fear of something going wrong"],
    message: "The user may need a low-pressure practice step and reassurance that mistakes can be corrected.",
  },
  {
    match: ["No explanation", "Ask for an explanation", "Clear explanation"],
    message: "Clear explanations will matter. The AI should show what it used, what it suggested, and what a person should review.",
  },
  {
    match: ["Working with someone directly", "A person to ask", "Help from a person"],
    message: "The user may benefit from guided help or a trusted person during setup.",
  },
  {
    match: ["Small wins", "Seeing progress", "Checklist"],
    message: "Progress tracking and small wins may help the user keep going.",
  },
  {
    match: ["Noise", "Interruptions", "Too many tools", "Unclear priorities"],
    message: "The environment may need small changes before AI feels easy to use.",
  },
];

const flattenResponseValues = (responses) =>
  Object.values(responses).flatMap((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return [value];
    return [];
  });

const analyzeSelectedAnswers = (responses) => {
  const values = flattenResponseValues(responses);
  const insights = answerInsightRules
    .filter((rule) => rule.match.some((answer) => values.includes(answer)))
    .map((rule) => rule.message);

  return {
    responses,
    selectedAnswerCount: values.length,
    currentAiTools: values.filter((value) =>
      [
        "ChatGPT or another AI chat tool",
        "Email writing or reply suggestions",
        "Scheduling or reminder tools",
        "Document or note summarizers",
        "Invoice, billing, or record tools",
        "I do not use AI tools yet",
      ].includes(value)
    ),
    insights: [...new Set(insights)].slice(0, 6),
  };
};

const getProfileTags = (score, indicatorSummary) => {
  const tags = [getReadinessLevel(score).label];
  indicatorSummary.slice(0, 3).forEach((indicator) => {
    if (indicator.score <= 64 && indicatorLabels[indicator.id]) tags.push(indicatorLabels[indicator.id]);
  });
  return [...new Set(tags)];
};

const getLayerSummary = (phaseScores) =>
  phases.map((phase) => ({
    title: phase.title,
    score: phaseScores[phase.id],
    message:
      phaseScores[phase.id] >= 75
        ? "Your answers point to useful habits in this area."
        : phaseScores[phase.id] >= 55
          ? "A few practical changes could make this part easier to use."
          : "This is a good place to simplify before adding more tools.",
  }));

const aiStartingPoints = {
  personal: {
    label: "Personal use",
    task: "Start with routines, reminders, planning, budgeting, organizing paperwork, or goal tracking.",
    examples: ["organize reminders", "plan a routine", "sort paperwork", "draft messages", "track goals"],
  },
  business: {
    label: "Business use",
    task: "Start with customer messages, estimates, invoices, scheduling, FAQs, training guides, or recordkeeping.",
    examples: ["draft customer replies", "summarize notes", "create invoice checklists", "organize schedules", "write training guides"],
  },
  education: {
    label: "Education use",
    task: "Start with study plans, assignment breakdowns, note summaries, tutoring prompts, or time management.",
    examples: ["break down assignments", "summarize notes", "make study plans", "create tutoring prompts", "organize due dates"],
  },
  healthcare: {
    label: "Health or care use",
    task: "Start with note summaries, appointment preparation, checklist drafts, reminder planning, or plain-language instructions.",
    examples: ["summarize records", "draft appointment notes", "create checklists", "simplify instructions", "organize follow-up tasks"],
  },
  rehabilitation: {
    label: "Support use",
    task: "Start with goal tracking, appointment reminders, step-by-step planning, coping plans, or support check-ins.",
    examples: ["track goals", "create reminders", "write step-by-step plans", "draft coping plans", "prepare support check-ins"],
  },
};

const supportLevels = [
  {
    max: 44,
    label: "Hands-On Consulting",
    message: "Direct help would make this easier. A consultant can help set up simple tools, forms, prompts, and first workflows with you.",
  },
  {
    max: 59,
    label: "Guided Implementation",
    message: "Step-by-step support is recommended. You may benefit from a guided walkthrough before using AI for bigger tasks.",
  },
  {
    max: 72,
    label: "Light Support",
    message: "You can start small with examples, templates, and occasional check-ins.",
  },
  {
    max: 86,
    label: "Self-Guided",
    message: "You may be ready to try a simple AI task independently while keeping human review in place.",
  },
  {
    max: 100,
    label: "Training Recommended",
    message: "You may be ready for broader use. A short AI basics session can help a team use tools more consistently.",
  },
];

const taskKeywords = [
  "Scheduling or appointments",
  "Emails or messages",
  "Paperwork or forms",
  "Organizing information",
  "Remembering follow-up tasks",
  "Repeated manual steps",
  "Planning what to do next",
  "Talking through the same questions",
  "Reminders",
  "Messages",
  "Scheduling",
  "Notes or records",
  "Planning steps",
  "Checklists",
  "Repeated questions",
  "Tracking progress",
  "Invoices",
  "Estimates",
  "Customer messages",
  "Training employees",
  "Organizing files",
  "Social media",
  "Bookkeeping",
  "Studying",
  "Organizing notes",
  "Planning assignments",
  "Research",
  "Writing",
  "Managing due dates",
  "Student emails or messages",
  "Course setup or LMS updates",
  "Grading or feedback",
  "Attendance tracking",
  "LMS updates",
  "Progress reports",
  "Grade, attendance, or progress records",
  "Advising or scheduling",
  "Repeated student questions",
  "Assignment directions",
  "Due dates",
  "Where to submit work",
  "How grades are calculated",
  "Academic honesty rules",
  "Feedback comments",
  "Answering repeated questions",
  "Updating student records",
  "Tracking attendance",
  "Following up with students",
  "Preparing reports",
  "Coordinating schedules",
  "Explaining policies",
  "Finding missing information",
  "Student communication",
  "Advising notes",
  "Policy reminders",
  "Progress summaries",
  "Resource lists",
  "Training guides",
  "Reports",
  "Study planning",
  "Breaking down assignments",
  "Writing practice",
  "Research planning",
  "Time management",
  "Understanding instructions",
  "Preparing questions",
  "Creating assignment checklists",
  "Drafting rubrics",
  "Writing lesson outlines",
  "Summarizing readings",
  "Creating study guides",
  "Drafting feedback comments",
  "Making quiz review questions",
  "Preparing discussion prompts",
  "Entering grades",
  "Sending reminders",
  "Copying information between systems",
  "Updating spreadsheets",
  "Creating similar emails",
  "Finding student information",
  "Preparing the same reports",
  "Assignment completion",
  "Staff time saved",
  "Fewer repeated questions",
  "Fewer missed deadlines",
  "Quality of feedback",
  "Access issues",
  "Student stress",
  "Documentation",
  "Finding records",
  "Follow-up reminders",
  "Explaining instructions",
  "Goal tracking",
  "Appointment scheduling",
  "Coping plans",
  "Daily routines",
  "Progress notes",
  "Routines",
  "Budgeting",
  "Household tasks",
  "Communication",
  "Planning meals",
  "Appointments",
  "Bills or budgeting",
  "Forms or paperwork",
  "Cleaning or household tasks",
  "Finding information",
  "Morning routines",
  "End-of-day tasks",
  "Personal goals",
  "Health details",
  "Money or bills",
  "Writing a reminder list",
  "Planning a week",
  "Organizing appointments",
  "Making a budget checklist",
  "Household routines",
  "Customer follow-up",
  "Estimates or quotes",
  "Invoices or payments",
  "Scheduling jobs",
  "Ordering supplies",
  "Tracking tasks",
  "FAQs",
  "Appointment reminders",
  "Estimate follow-ups",
  "Invoice reminders",
  "Service updates",
  "Review requests",
  "Welcome messages",
  "Customer details",
  "Invoice lines",
  "Estimate notes",
  "Inventory counts",
  "Employee hours",
  "Payment updates",
  "Service notes",
  "Customer intake",
  "Staff training",
  "File organization",
  "Patient messages",
  "Visit summaries",
  "Patient records",
  "Medication lists",
  "Insurance information",
  "Appointment notes",
  "Portal messages",
  "Care plans",
  "Billing information",
  "Staff notes",
  "Visit notes",
  "Care summaries",
  "Referral notes",
  "After-visit instructions",
  "Medication reminders",
  "Referral next steps",
  "Test result follow-up",
  "Care plan checklists",
  "Family updates",
  "Patient concerns",
  "Medication changes",
  "Follow-up needs",
  "Care instructions",
  "Clinical summaries",
  "Risk alerts",
  "Care plan drafts",
  "Staff checklists",
  "Goal check-ins",
  "Caregiver updates",
  "Task prompts",
  "Goal updates",
  "Appointment changes",
  "Caregiver notes",
  "Progress tracking",
  "Behavior support plans",
  "Work or school supports",
  "Medication or wellness reminders",
  "More completed routines",
  "Better goal tracking",
  "Daily goals",
  "What helped",
  "What caused stress",
  "Behavior support steps",
  "Choice and control",
];

const makeNaturalList = (items) => {
  const unique = [...new Set(items)].filter(Boolean);
  if (!unique.length) return "";
  if (unique.length === 1) return unique[0].toLowerCase();
  if (unique.length === 2) return `${unique[0].toLowerCase()} and ${unique[1].toLowerCase()}`;
  return `${unique.slice(0, -1).map((item) => item.toLowerCase()).join(", ")}, and ${unique.at(-1).toLowerCase()}`;
};

const getSelectedTasks = (responses) =>
  flattenResponseValues(responses)
    .filter((value) => taskKeywords.includes(value))
    .slice(0, 8);

const getAiToolSuggestions = (assessmentId, selectedTasks = [], answerAnalysis = {}) => {
  const values = [...selectedTasks, ...(answerAnalysis.currentAiTools || [])];
  const suggestions = [];
  const add = (name, reason) => {
    if (!suggestions.some((item) => item.name === name)) suggestions.push({ name, reason });
  };

  if (values.some((item) => /message|email|writing|customer/i.test(item))) {
    add("ChatGPT or Grammarly", "for drafting messages, rewriting unclear text, and creating a first version you can review.");
  }
  if (values.some((item) => /schedule|appointment|due date|reminder|routine/i.test(item))) {
    add("Google Calendar or reminder apps", "for turning plans into reminders so fewer details have to stay in your head.");
  }
  if (values.some((item) => /paperwork|forms|documentation|records|notes|files|information/i.test(item))) {
    add("ChatGPT, Notion, or document summarizers", "for turning long notes, forms, or records into shorter checklists and summaries.");
  }
  if (values.some((item) => /progress|goal|habit|tracking/i.test(item))) {
    add("Todoist, Trello, or a habit tracker", "for showing progress in small steps without needing a complicated system.");
  }
  if (values.some((item) => /social|visual|examples|communication/i.test(item))) {
    add("Canva", "for making simple visual guides, plans, and communication materials.");
  }
  if (values.some((item) => /training|explaining|questions|steps/i.test(item))) {
    add("ChatGPT", "for creating repeatable guides, simple instructions, and answers to common questions.");
  }
  if (assessmentId === "personal") {
    add("Voice-to-text tools", "for capturing thoughts quickly when typing or organizing ideas feels like too much.");
  }
  if (!suggestions.length) {
    add("ChatGPT", "for organizing ideas, creating checklists, and testing one simple task before using more advanced tools.");
    add("Google Calendar", "for reminders, routines, appointments, and follow-up tasks.");
  }

  return suggestions.slice(0, 5);
};

const buildLayerNarratives = (phaseScores, indicatorSummary, selectedTasks = [], answerAnalysis = {}) => {
  const lowIndicators = new Set(indicatorSummary.filter((item) => item.score < 65).map((item) => item.id));
  const taskText = makeNaturalList(selectedTasks.slice(0, 4));

  return phases.map((phase) => {
    const score = phaseScores[phase.id] || 0;
    const observations = [];
    const barriers = [];
    const recommendations = [];
    const tools = [];
    const implementation = [];

    if (phase.id === "cognitive") {
      observations.push(
        score >= 70
          ? "You seem to do better when tasks have a clear order and a realistic starting point."
          : "Mental energy may get used up quickly when too many steps or choices show up at once."
      );
      if (taskText) observations.push(`You pointed to ${taskText} as areas that take time or attention.`);
      barriers.push("Trying to manage too many details mentally can make simple tasks feel heavier than they need to be.");
      recommendations.push("Choose one repeated task and turn it into a short checklist before adding a new tool.");
      tools.push("ChatGPT can turn scattered notes into a simple plan or checklist.");
      implementation.push("Spend 15 minutes testing one task, then write down what felt easier and what still felt confusing.");
    }

    if (phase.id === "trust") {
      observations.push(
        answerAnalysis.insights.some((item) => /explanation/i.test(item))
          ? "You seem to trust tools more when the reason behind a suggestion is easy to see."
          : "Trust will grow faster when the tool is clear about what it can do and what still needs a person."
      );
      barriers.push("Confidence can drop when a tool gives an answer without showing how it got there.");
      recommendations.push("Use AI for drafts, summaries, and planning first, then have a person review anything important.");
      tools.push("ChatGPT is useful when you ask it to explain its steps or list what should be checked by a person.");
      implementation.push("For the first few uses, compare the AI answer with your own judgment before relying on it.");
    }

    if (phase.id === "adoption") {
      observations.push(
        answerAnalysis.currentAiTools?.includes("I do not use AI tools yet")
          ? "You may be starting from the beginning with AI, so the first tool should be simple and low-pressure."
          : "You already have some tool experience, so the next step can build from what feels familiar."
      );
      barriers.push("Learning something new can become frustrating when there are too many features before the basic steps feel clear.");
      recommendations.push("Pick one tool, one task, and one short practice window instead of trying several tools at once.");
      tools.push("Templates and examples can make ChatGPT, calendars, or task apps easier to use at the beginning.");
      implementation.push("Practice the same small task three times before deciding whether the tool is useful.");
    }

    if (phase.id === "plus") {
      observations.push("Small wins and visible progress are important for keeping momentum after the first try.");
      barriers.push("Progress often slows when routines are too complicated or when feedback comes too late.");
      recommendations.push("Track one simple measure, such as time saved, fewer missed steps, or more confidence.");
      tools.push("Todoist, Trello, or a habit tracker can make progress visible without a heavy setup.");
      implementation.push("Review what changed after one week, then adjust the routine before adding another task.");
    }

    if (phase.id === "environment") {
      observations.push(
        lowIndicators.has("workflow_friction")
          ? "The surrounding routine may be creating extra work through repeated steps, unclear handoffs, or too many places to look."
          : "The environment can support AI use better when instructions, roles, and routines are easy to find."
      );
      if (taskText) observations.push(`The quickest improvement is likely connected to ${taskText}.`);
      barriers.push("If the routine is already messy, adding AI can create more confusion instead of reducing it.");
      recommendations.push("Clean up the most confusing step first, then use AI to draft, organize, remind, or summarize.");
      tools.push("Notion, Trello, or shared checklists can keep repeated steps in one place.");
      implementation.push("Create one shared example of the new process so people know what good use looks like.");
    }

    return {
      title: phase.title,
      score,
      observations: observations.slice(0, 4),
      barriers: barriers.slice(0, 3),
      recommendations: recommendations.slice(0, 4),
      tools: tools.slice(0, 3),
      implementation: implementation.slice(0, 3),
    };
  });
};

const getSupportLevel = (score, indicatorSummary) => {
  const highNeed = indicatorSummary.some((indicator) =>
    ["cognitive_overload", "support_need", "adoption_barrier"].includes(indicator.id) && indicator.score < 55
  );
  if (highNeed && score < 75) return supportLevels.find((level) => level.label === "Guided Implementation");
  return supportLevels.find((level) => score <= level.max) || supportLevels.at(-1);
};

const getImplementationPath = (assessmentId, indicatorSummary, answerAnalysis = {}) => {
  const start = aiStartingPoints[assessmentId] || aiStartingPoints.business;
  const steps = [
    `Choose one repeated task first, such as ${start.examples.slice(0, 2).join(" or ")}.`,
    "Use AI to make a first draft, summary, checklist, reminder, or plan. Treat it as a helper, not the final answer.",
    "Have a person review the AI suggestion before using it for anything important.",
    "Track simple results: time saved, mistakes reduced, confidence gained, and steps completed.",
  ];

  const firstBarrier = indicatorSummary[0]?.id;
  if (firstBarrier === "trust_sensitivity") {
    steps.splice(2, 0, "Clearly explain how the AI works, what information it uses, and who people can contact for help.");
  } else if (firstBarrier === "cognitive_overload") {
    steps.unshift("Start by simplifying the most frustrating part of the day before adding a new AI tool.");
  } else if (firstBarrier === "workflow_friction") {
    steps.unshift("Pick the task that wastes the most time each week and make that task easier first.");
  }

  if (answerAnalysis.currentAiTools?.includes("I do not use AI tools yet")) {
    steps.unshift("Begin with a simple AI practice task that does not affect clients, grades, records, money, or care decisions.");
  } else if (answerAnalysis.currentAiTools?.length) {
    steps.unshift("Build from the AI tools already being used instead of introducing too many new tools at once.");
  }

  return [...new Set(steps)].slice(0, 5);
};

const getPlainBarrier = (indicatorId) => {
  const barriers = {
    cognitive_overload: "Too many steps, interruptions, or unclear choices can make the day feel heavier than it needs to be.",
    workflow_friction: "The routine has places where repeated steps, unclear handoffs, or scattered information can slow things down.",
    trust_sensitivity: "Trust depends on seeing what the tool used, why it made a suggestion, and who reviews important decisions.",
    learning_preference: "Learning will work better when people can use examples, practice, written steps, or a person to ask.",
    adoption_barrier: "New tools can become frustrating when the first steps are rushed or unclear.",
    support_need: "A named person, guide, or help option should be easy to find when questions come up.",
    environmental_barrier: "Noise, interruptions, unclear priorities, or missing resources can make focus harder.",
    time_pressure: "Time-consuming tasks are taking attention away from higher-value work or daily priorities.",
    quick_win_task: "There are clear starter tasks that can be simplified before trying anything advanced.",
    personal_barrier: "Daily routines may need simpler reminders, planning, or organization before adding more tools.",
  };
  return barriers[indicatorId] || "Nothing here means failure. It points to the part of the process that deserves attention first.";
};

// Recommendations are generated from the same result data used for on-screen output and email templates.
const getRecommendation = (assessmentId, score, phaseScores = {}, indicatorSummary = [], answerAnalysis = {}) => {
  const copy = contextCopy[assessmentId] || contextCopy.business;
  const profile = getReadinessLevel(score);
  const topIndicator = indicatorSummary[0]?.id;
  const startingPoint = aiStartingPoints[assessmentId] || aiStartingPoints.business;
  const supportLevel = getSupportLevel(score, indicatorSummary);
  const selectedTasks = getSelectedTasks(answerAnalysis.responses || {});
  const taskText = makeNaturalList(selectedTasks.slice(0, 4));
  const aiTools = getAiToolSuggestions(assessmentId, selectedTasks, answerAnalysis);
  const layerNarratives = buildLayerNarratives(phaseScores, indicatorSummary, selectedTasks, answerAnalysis);

  const recommendations = [
    taskText
      ? `Start with ${taskText}. Those answers point to tasks where AI could reduce repeated work without changing everything at once.`
      : `Start with one simple task, like ${startingPoint.examples.slice(0, 3).join(", ")}.`,
    "Use AI to create a first draft, summary, checklist, reminder, or plan. Review it before using it for anything important.",
    "Keep the first test small. One task, one tool, and one week of practice will teach more than a large rollout.",
    "Explain what the tool does, what information it uses, and when a person should review the result.",
  ];

  if (topIndicator === "cognitive_overload") {
    recommendations.unshift("Simplify the most mentally tiring step before adding a new tool.");
  }
  if (topIndicator === "trust_sensitivity") {
    recommendations.unshift("Choose tools that explain their answers and keep human review visible.");
  }
  if (topIndicator === "workflow_friction") {
    recommendations.unshift("Fix one repeated or confusing task before trying to automate a larger process.");
  }
  if (topIndicator === "time_pressure" || selectedTasks.length) {
    recommendations.unshift("Look for the task that wastes the most time each week and make that task easier first.");
  }

  const observations = [
    score >= 75
      ? "You seem ready to try AI in a practical way, especially when the first use is specific and easy to review."
      : "Your answers point to a need for simpler steps before adding too many tools.",
    taskText
      ? `You mentioned ${taskText}, which gives a realistic place to begin instead of guessing where AI belongs.`
      : "The strongest next step is to choose one real task from the day and test whether AI makes it easier.",
    answerAnalysis.currentAiTools?.includes("I do not use AI tools yet")
      ? "Because AI is still new here, the first experience should be calm, clear, and easy to undo."
      : "Because some tools are already familiar, the next step can improve what is already being used.",
  ];

  const barriers = [
    getPlainBarrier(topIndicator),
    "Trying to change too much at once can make a good idea feel stressful or hard to maintain.",
    "People are more likely to keep using a tool when the first result solves a real daily problem.",
  ];

  const implementationPlan = [
    {
      title: "Week 1",
      steps: [
        taskText ? `Choose one task from your answers, such as ${taskText}.` : `Choose one small task, such as ${startingPoint.examples[0]}.`,
        "Test one AI tool for 15 to 20 minutes at a time.",
        "Write down what felt easier, what felt confusing, and what still needed human review.",
      ],
    },
    {
      title: "Week 2",
      steps: [
        "Turn the best result into a repeatable checklist, prompt, reminder, or template.",
        "Use the same process several times before adding another tool.",
        "Track simple wins like time saved, fewer missed steps, or more confidence.",
      ],
    },
    {
      title: "Week 3",
      steps: [
        "Keep what worked, remove what added confusion, and adjust the instructions.",
        "Expand only if the first task feels manageable.",
      ],
    },
  ];

  return {
    profile: profile.label,
    description: profileDescriptions[profile.label],
    observations: [...new Set(observations)],
    barriers: [...new Set(barriers)],
    recommendations: [...new Set(recommendations)].slice(0, 4),
    implementationPath: getImplementationPath(assessmentId, indicatorSummary, answerAnalysis),
    implementationPlan,
    startingPoint,
    supportLevel,
    aiTools,
    selectedTasks,
    layerNarratives,
    nextStep: taskText
      ? `Start with ${taskText}. Try one small version with ${copy.support} before using it for bigger tasks.`
      : `Start with one simple task, like ${startingPoint.examples[0]} or ${startingPoint.examples[1]}. Try it with ${copy.support} before using it for bigger tasks.`,
    barrier: getPlainBarrier(topIndicator),
    layerSummary: getLayerSummary(phaseScores),
  };
};

const buildAssessmentResult = (assessment, responses, participant = {}) => {
  const score = calculateScore(responses, assessment.questions);
  const readiness = getReadinessLevel(score);
  const phaseScores = calculatePhaseScores(assessment, responses);
  const indicatorSummary = summarizeIndicators(collectIndicators(assessment, responses));
  const answerAnalysis = analyzeSelectedAnswers(responses);
  const recommendation = getRecommendation(assessment.id, score, phaseScores, indicatorSummary, answerAnalysis);
  const answeredCount = assessment.questions.filter((question) => responses[question.id] !== undefined).length;

  return {
    resultId: `${assessment.id}-${Date.now()}`,
    assessmentId: assessment.id,
    assessmentTitle: assessment.title,
    version: assessment.version,
    submittedAt: new Date().toISOString(),
    participant,
    responses,
    score,
    answeredCount,
    questionCount: assessment.questions.length,
    readinessLevel: readiness.label,
    readinessTone: readiness.tone,
    phaseScores,
    indicators: indicatorSummary,
    answerAnalysis,
    profileTags: getProfileTags(score, indicatorSummary),
    recommendation,
  };
};

const calculateAssessmentResult = (values, questionCount, assessment) => {
  const responses = {};
  const questions = assessment?.questions?.slice(0, questionCount) || [];
  values.forEach((value, index) => {
    if (questions[index]) responses[questions[index].id] = value;
  });
  return buildAssessmentResult(assessment, responses);
};

const formatResponsesForEmail = (result) => {
  const assessment = getAssessmentById(result.assessmentId);

  return Object.entries(result.responses || {})
    .map(([responseId, value]) => {
      const isNote = responseId.endsWith("_note");
      const isFollowUp = responseId.endsWith("_followup");
      const questionId = responseId.replace(/_(note|followup)$/, "");
      const question = assessment?.questions.find((item) => item.id === questionId);
      const suffix = isNote ? " - additional note" : isFollowUp ? " - follow-up" : "";
      const label = question ? `${question.label}${suffix}` : responseId;
      const answer = Array.isArray(value) ? value.join(", ") : String(value);
      return `${label}: ${answer}`;
    })
    .join("\n");
};

const emailTemplates = {
  client(result) {
    const name = result.participant.firstName || "there";
    return {
      to: result.participant.email,
      subject: `Your CEAM+ ${result.assessmentTitle} Results`,
      body: `Hi ${name},\n\nThank you for completing the ${result.assessmentTitle}.\n\nReadiness profile: ${result.recommendation.profile}\n\n${result.recommendation.description}\n\nWhat we noticed:\n${result.recommendation.observations.map((item) => `- ${item}`).join("\n")}\n\nWhat may be getting in the way:\n${result.recommendation.barriers.map((item) => `- ${item}`).join("\n")}\n\nTasks you selected:\n${result.recommendation.selectedTasks.join(", ") || "No task selections yet"}\n\nAI tools already used:\n${result.answerAnalysis.currentAiTools.join(", ") || "None selected"}\n\nAI tools that may fit:\n${result.recommendation.aiTools.map((tool) => `- ${tool.name}: ${tool.reason}`).join("\n")}\n\nRecommended support level: ${result.recommendation.supportLevel.label}\n${result.recommendation.supportLevel.message}\n\nRecommended AI steps:\n${result.recommendation.implementationPath.map((item) => `- ${item}`).join("\n")}\n\nNext step: ${result.recommendation.nextStep}\n\nYour full answers:\n${formatResponsesForEmail(result) || "No answers were recorded."}\n\nYour results will be reviewed if you request follow-up support.\n`,
    };
  },
  admin(result) {
    return {
      to: "briggsfaye@icloud.com",
      subject: `New CEAM+ Assessment: ${result.assessmentTitle}`,
      body: `Client: ${result.participant.firstName} ${result.participant.lastName}\nEmail: ${result.participant.email}\nPhone: ${result.participant.phone || "Not provided"}\nOrganization: ${result.participant.organization || "Not provided"}\nAssessment: ${result.assessmentTitle}\nSubmitted: ${result.submittedAt}\nResult ID: ${result.resultId}\nProfile: ${result.recommendation.profile}\nSupport level: ${result.recommendation.supportLevel.label}\nMain barrier: ${result.recommendation.barrier}\nSelected tasks: ${result.recommendation.selectedTasks.join(", ") || "None selected"}\nTop support needs: ${result.profileTags.join(", ")}\nAI tools already used: ${result.answerAnalysis.currentAiTools.join(", ") || "None selected"}\nObservations: ${result.recommendation.observations.join(" | ")}\nAnswer insights: ${result.answerAnalysis.insights.join(" | ") || "No single pattern stood out yet."}\n\nRecommended AI steps:\n${result.recommendation.implementationPath.map((item) => `- ${item}`).join("\n")}\n\nFull assessment responses:\n${formatResponsesForEmail(result) || "No answers were recorded."}`,
    };
  },
  supportAdmin(result, supportRequest) {
    return {
      to: "briggsfaye@icloud.com",
      subject: `CEAM+ Support Request: ${supportRequest.supportOption}`,
      body: `Client: ${supportRequest.firstName} ${supportRequest.lastName}\nEmail: ${supportRequest.email}\nPhone: ${supportRequest.phone}\nOrganization: ${supportRequest.organization}\nAssessment: ${result.assessmentTitle}\nProfile: ${result.recommendation.profile}\nSupport option: ${supportRequest.supportOption}\nMain goal: ${supportRequest.mainGoal}\nBiggest challenge: ${supportRequest.biggestChallenge}\nBest time to contact: ${supportRequest.bestTime}\nResult ID: ${result.resultId}`,
    };
  },
  supportClient(result, supportRequest) {
    return {
      to: supportRequest.email,
      subject: "Your CEAM+ support request was received",
      body: `Hi ${supportRequest.firstName},\n\nThank you. Your request was received. We will review your results and follow up with next steps.\n\nSelected support option: ${supportRequest.supportOption}\nAssessment summary: ${result.recommendation.profile}\nSuggested first AI step: ${result.recommendation.nextStep}\n\nYour results will be reviewed for follow-up support.\n`,
    };
  },
};

const buildZapierAssessmentFields = (result) => {
  const clientEmail = emailTemplates.client(result);
  const adminEmail = emailTemplates.admin(result);

  return {
    requestType: "assessment-submission",
    resultId: result.resultId,
    assessmentTitle: result.assessmentTitle,
    readinessProfile: result.recommendation.profile,
    readinessLevel: result.readinessLevel,
    score: result.score,
    phaseScores: JSON.stringify(result.phaseScores),
    clientName: `${result.participant.firstName} ${result.participant.lastName}`.trim(),
    clientEmailAddress: result.participant.email,
    clientPhone: result.participant.phone,
    organization: result.participant.organization,
    submittedAt: result.submittedAt,
    selectedTasks: result.recommendation.selectedTasks.join(", "),
    observations: result.recommendation.observations.join(" | "),
    recommendations: result.recommendation.recommendations.join(" | "),
    implementationPath: result.recommendation.implementationPath.join(" | "),
    fullAnswers: formatResponsesForEmail(result),
    clientEmailTo: clientEmail.to,
    clientEmailSubject: clientEmail.subject,
    clientEmailBody: clientEmail.body,
    adminEmailTo: adminEmail.to,
    adminEmailSubject: adminEmail.subject,
    adminEmailBody: adminEmail.body,
  };
};

const sendAssessmentEmails = async (result) => {
  const payload = {
    clientEmail: emailTemplates.client(result),
    adminEmail: emailTemplates.admin(result),
    result,
  };

  // Zapier receives the payload and sends the actual emails in the Zap.
  // Keep private email/API credentials inside Zapier or a backend, never in this frontend file.
  if (!zapierWebhookUrl) {
    console.info("CEAM+ email payload ready for email service configuration:", payload);
    return { configured: false, payload };
  }

  try {
    const formPayload = new URLSearchParams({
      ...buildZapierAssessmentFields(result),
      clientEmail: JSON.stringify(payload.clientEmail),
      adminEmail: JSON.stringify(payload.adminEmail),
      result: JSON.stringify(payload.result),
    });

    const response = await fetch(zapierWebhookUrl, {
      method: "POST",
      mode: "no-cors",
      body: formPayload,
    });

    return { configured: true, sent: true, status: response.status || "submitted", payload };
  } catch (error) {
    console.error("CEAM+ Zapier submission failed:", error);
    return { configured: true, sent: false, error: error.message, payload };
  }
};

const sendSupportRequest = async (result, supportRequest) => {
  const payload = {
    requestType: "consultant-support-request",
    supportRequest,
    clientEmail: emailTemplates.supportClient(result, supportRequest),
    adminEmail: emailTemplates.supportAdmin(result, supportRequest),
    result,
  };

  try {
    const formPayload = new URLSearchParams({
      requestType: payload.requestType,
      supportRequest: JSON.stringify(payload.supportRequest),
      clientEmail: JSON.stringify(payload.clientEmail),
      adminEmail: JSON.stringify(payload.adminEmail),
      result: JSON.stringify(payload.result),
      clientName: `${supportRequest.firstName} ${supportRequest.lastName}`.trim(),
      clientEmailAddress: supportRequest.email,
      supportOption: supportRequest.supportOption,
      assessmentTitle: result.assessmentTitle,
      readinessProfile: result.recommendation.profile,
      resultId: result.resultId,
    });

    await fetch(zapierWebhookUrl, {
      method: "POST",
      mode: "no-cors",
      body: formPayload,
    });

    return { sent: true, payload };
  } catch (error) {
    console.error("CEAM+ support request submission failed:", error);
    return { sent: false, error: error.message, payload };
  }
};

const supportOptions = [
  "I want to try this myself first",
  "I want step-by-step written instructions",
  "I want a guided walkthrough",
  "I want hands-on setup help",
  "I want training for my team",
  "I want help choosing the best AI tools",
  "I want help creating prompts, templates, or workflows",
  "I want help tracking results and progress",
];

const getIconMarkup = (icon) => {
  const paths = {
    briefcase:
      '<path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"></path><path d="M4 12h16"></path>',
    book:
      '<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z"></path><path d="M5 4v12"></path><path d="M9 8h6"></path>',
    cross:
      '<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3Z"></path>',
    path:
      '<path d="M5 19c5-1 3-7 8-7 4 0 4-5 7-7"></path><path d="M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M20 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M13 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>',
    person:
      '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path d="M4 21a8 8 0 0 1 16 0"></path>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[icon]}</svg>`;
};

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const renderParticipantFields = (assessment) => `
  <fieldset class="participant-fields">
    <legend>Your contact information</legend>
    <p>These details help prepare your result summary and follow-up message.</p>
    <div class="field-grid">
      <label>First name<input name="firstName" autocomplete="given-name" required></label>
      <label>Last name<input name="lastName" autocomplete="family-name" required></label>
      <label>Email address<input type="email" name="email" autocomplete="email" required></label>
      <label>Phone number<input type="tel" name="phone" autocomplete="tel" required></label>
      <label>Business or organization name<input name="organization" autocomplete="organization" required></label>
      <label>Assessment type<input name="assessmentType" value="${assessment.title}" readonly></label>
    </div>
  </fieldset>
`;

const renderQuestion = (question, index) => {
  const wrapper = document.createElement("div");
  wrapper.className = "guided-question";
  wrapper.dataset.questionId = question.id;

  const inputMarkup =
    question.type === "choice"
      ? `<div class="choice-list">${question.options
          .map(
            (option) => `
              <label class="choice-option">
                <input type="checkbox" name="${question.id}" value="${option}">
                <span>${option}</span>
              </label>
            `
          )
          .join("")}</div>`
      : `<input id="${question.id}" name="${question.id}" data-question-id="${question.id}" type="range" min="0" max="5" value="0" step="1" list="${sliderTicksId}">
        <div class="range-ticks" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="range-numbers" aria-hidden="true">
          <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        </div>
        <div class="scale-labels" aria-hidden="true">
          <span>${getScale(question).low}</span>
          <span>${getScale(question).high}</span>
        </div>`;

  wrapper.innerHTML = `
    <div class="question-meta">
      <span>Question ${index + 1}</span>
      ${question.type === "scale" ? `<output for="${question.id}" data-output>Selected: 0</output>` : ""}
    </div>
    ${question.scenario ? `<p class="scenario">${question.scenario}</p>` : ""}
    <label class="question-label" for="${question.id}">${question.label}</label>
    ${inputMarkup}
    ${question.note ? `<label class="optional-note">${question.note}<textarea name="${question.id}_note" rows="2"></textarea></label>` : ""}
    ${question.followUp ? `<div class="follow-up" data-follow-up hidden></div>` : ""}
  `;

  return wrapper;
};

const renderPhase = (phase, phaseQuestions, questionOffset = 0, isOpen = false) => {
  const phaseCard = document.createElement("details");
  phaseCard.className = "phase-card";
  phaseCard.open = isOpen;
  phaseCard.innerHTML = `
    <summary>
      <span>${phase.title}</span>
      <small>${phaseQuestions.length} questions</small>
    </summary>
    <p>${phase.description}</p>
    <div class="phase-questions"></div>
  `;

  const phaseQuestionList = phaseCard.querySelector(".phase-questions");
  phaseQuestions.forEach((question, index) => {
    phaseQuestionList.appendChild(renderQuestion(question, questionOffset + index));
  });

  return phaseCard;
};

const getResponsesFromPanel = (panel, assessment) =>
  assessment.questions.reduce((responses, question) => {
    if (question.type === "choice") {
      const selected = [...panel.querySelectorAll(`input[name="${question.id}"]:checked`)].map((input) => input.value);
      if (selected.length) responses[question.id] = selected;
    } else {
      responses[question.id] = Number(panel.querySelector(`[name="${question.id}"]`)?.value ?? 0);
    }
    const note = panel.querySelector(`[name="${question.id}_note"]`)?.value.trim();
    if (note) responses[`${question.id}_note`] = note;
    const followUp = [...panel.querySelectorAll(`[name="${question.id}_followup"]:checked`)].map((input) => input.value);
    if (followUp.length) responses[`${question.id}_followup`] = followUp;
    return responses;
  }, {});

const getParticipantFromForm = (formElement) => {
  const formData = new FormData(formElement);
  return {
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    organization: String(formData.get("organization") || "").trim(),
    assessmentType: String(formData.get("assessmentType") || "").trim(),
  };
};

const updateFollowUp = (question, wrapper) => {
  if (!question.followUp) return;
  const selected = [...wrapper.querySelectorAll(`input[name="${question.id}"]:checked`)].map((input) => input.value);
  const followUp = wrapper.querySelector("[data-follow-up]");
  const shouldShow = selected.some((value) => question.followUp.when.includes(value));
  const currentFollowUp = [...wrapper.querySelectorAll(`input[name="${question.id}_followup"]:checked`)].map((input) => input.value);

  followUp.hidden = !shouldShow;
  if (!shouldShow) {
    followUp.innerHTML = "";
    followUp.dataset.rendered = "false";
    return;
  }

  if (followUp.dataset.rendered === "true") return;

  followUp.innerHTML = `
      <p>${question.followUp.label}</p>
      <div class="choice-list compact">
        ${question.followUp.options
          .map(
            (option, index) => `
              <label class="choice-option">
                <input type="checkbox" name="${question.id}_followup" value="${option}" ${currentFollowUp.includes(option) ? "checked" : ""}>
                <span>${option}</span>
              </label>
            `
          )
          .join("")}
      </div>
    `;
  followUp.dataset.rendered = "true";
};

const renderResult = (resultBox, result) => {
  resultBox.hidden = false;
  resultBox.className = `guided-result ${result.readinessTone}`;
  resultBox.innerHTML = `
    <div class="result-heading">
      <span>${result.recommendation.profile}</span>
      <strong>${result.score}% support readiness</strong>
    </div>
    <section class="result-section">
      <h4>Your Readiness Summary</h4>
      <p>${result.answeredCount} of ${result.questionCount} questions answered.</p>
      <p>${result.recommendation.description}</p>
    </section>
    <div class="profile-tags">
      ${result.profileTags.map((tag) => `<span>${tag}</span>`).join("")}
    </div>
    <section class="result-section">
      <h4>What We Noticed</h4>
      <ul>${result.recommendation.observations.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section class="result-section">
      <h4>What May Be Making Things Harder</h4>
      <ul>${result.recommendation.barriers.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section class="result-section">
      <h4>CEAM+ Layer Details</h4>
      <div class="layer-summary">
        ${result.recommendation.layerNarratives
          .map(
            (layer) => `
              <article>
                <strong>${layer.title}</strong>
                <span>${layer.score}%</span>
                <p>${layer.observations[0]}</p>
                <ul>${layer.recommendations.map((item) => `<li>${item}</li>`).join("")}</ul>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
    <section class="result-section">
      <h4>What Your Answers Point To</h4>
      ${
        result.answerAnalysis.insights.length
          ? `<ul>${result.answerAnalysis.insights.map((item) => `<li>${item}</li>`).join("")}</ul>`
          : "<p>Your selected answers did not point to one major pattern yet. Answering more questions can make this section more specific.</p>"
      }
      <p><strong>AI tools already used:</strong> ${
        result.answerAnalysis.currentAiTools.length ? result.answerAnalysis.currentAiTools.join(", ") : "None selected yet"
      }</p>
    </section>
    <section class="result-section">
      <h4>Recommended AI Implementation Path</h4>
      <ol>${result.recommendation.implementationPath.map((item) => `<li>${item}</li>`).join("")}</ol>
    </section>
    <section class="result-section">
      <h4>Best Starting Point</h4>
      <p>${
        result.recommendation.selectedTasks.length
          ? `You selected ${makeNaturalList(result.recommendation.selectedTasks.slice(0, 5))}. Start with one of these before changing the full routine.`
          : result.recommendation.startingPoint.task
      }</p>
    </section>
    <section class="result-section">
      <h4>AI Tools That May Fit You</h4>
      <ul>
        ${result.recommendation.aiTools.map((tool) => `<li><strong>${tool.name}:</strong> ${tool.reason}</li>`).join("")}
      </ul>
    </section>
    <section class="result-section support-level">
      <h4>Recommended Support Level</h4>
      <strong>${result.recommendation.supportLevel.label}</strong>
      <p>${result.recommendation.supportLevel.message}</p>
    </section>
    <section class="result-section">
      <h4>Recommended First Steps</h4>
      <ul>${result.recommendation.recommendations.map((item) => `<li>${item}</li>`).join("")}</ul>
      <p><strong>Simple next step:</strong> ${result.recommendation.nextStep}</p>
    </section>
    <section class="result-section">
      <h4>Simple 3-Week Plan</h4>
      <div class="implementation-plan">
        ${result.recommendation.implementationPlan
          .map(
            (week) => `
              <article>
                <strong>${week.title}</strong>
                <ul>${week.steps.map((step) => `<li>${step}</li>`).join("")}</ul>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
    <section class="consultant-cta">
      <h4>Need Help Getting Started?</h4>
      <p>Want help turning these results into a real implementation plan?</p>
      <div class="result-actions">
        <button class="button primary" type="button" data-show-support>Contact a Consultant</button>
        <button class="button secondary" type="button" data-support-shortcut="I want a guided walkthrough">Guided Setup Help</button>
        <button class="button secondary" type="button" data-support-shortcut="I want training for my team">Team Training</button>
        <button class="button secondary" type="button" data-support-shortcut="I want step-by-step written instructions">Step-by-Step Help</button>
        <button class="button secondary" type="button" data-email-results>Email My Results</button>
        <button class="button secondary" type="button" data-download-results>Download My Results</button>
      </div>
    </section>
    <section class="support-request" data-support-request hidden>
      <h4>Guided Implementation Options</h4>
      <form data-support-form>
        <div class="choice-list">
          ${supportOptions
            .map(
              (option, index) => `
                <label class="choice-option">
                  <input type="radio" name="supportOption" value="${option}" ${index === 0 ? "checked" : ""}>
                  <span>${option}</span>
                </label>
              `
            )
            .join("")}
        </div>
        <div class="field-grid">
          <label>First name<input name="firstName" value="${result.participant.firstName || ""}" required></label>
          <label>Last name<input name="lastName" value="${result.participant.lastName || ""}" required></label>
          <label>Email<input type="email" name="email" value="${result.participant.email || ""}" required></label>
          <label>Phone number<input type="tel" name="phone" value="${result.participant.phone || ""}" required></label>
          <label>Business or organization name<input name="organization" value="${result.participant.organization || ""}" required></label>
          <label>Assessment type<input name="assessmentType" value="${result.assessmentTitle}" readonly></label>
        </div>
        <label>Main goal<textarea name="mainGoal" rows="3" required></textarea></label>
        <label>Biggest challenge<textarea name="biggestChallenge" rows="3" required></textarea></label>
        <label>Best time to contact<input name="bestTime" placeholder="Example: Weekday afternoons" required></label>
        <button class="button primary" type="submit">Request Support</button>
        <p class="form-status" data-support-status role="status"></p>
      </form>
    </section>
  `;

  const supportSection = resultBox.querySelector("[data-support-request]");
  const supportForm = resultBox.querySelector("[data-support-form]");
  const supportStatus = resultBox.querySelector("[data-support-status]");

  const showSupportForm = (option = "") => {
    supportSection.hidden = false;
    if (option) {
      const selected = supportForm.querySelector(`input[name="supportOption"][value="${option}"]`);
      if (selected) selected.checked = true;
    }
    supportSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
  };

  resultBox.querySelector("[data-show-support]")?.addEventListener("click", () => showSupportForm());
  resultBox.querySelectorAll("[data-support-shortcut]").forEach((button) => {
    button.addEventListener("click", () => showSupportForm(button.dataset.supportShortcut));
  });

  resultBox.querySelector("[data-email-results]")?.addEventListener("click", async () => {
    await sendAssessmentEmails(result);
    supportStatus.textContent = "Your results were sent to the email automation.";
  });

  resultBox.querySelector("[data-download-results]")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ceam-results-${result.resultId}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  supportForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(supportForm);
    const supportRequest = Object.fromEntries(formData.entries());
    const response = await sendSupportRequest(result, supportRequest);
    supportStatus.textContent = response.sent
      ? "Thank you. Your request was received. We will review your results and follow up with next steps."
      : "Thank you. Your request was saved on screen, but the email automation needs to be checked.";
    supportForm.reset();
  });
};

const updateGuidedAssessment = (panel, assessment) => {
  const responses = getResponsesFromPanel(panel, assessment);
  const result = buildAssessmentResult(assessment, responses);
  const answered = assessment.questions.filter((question) => responses[question.id] !== undefined).length;
  const progressPercent = Math.min(100, Math.round((answered / assessment.questions.length) * 100));
  const score = panel.querySelector("[data-score]");
  const progress = panel.querySelector("[data-progress]");
  const progressText = panel.querySelector("[data-progress-text]");
  const progressBar = panel.querySelector(".guided-progress");
  const resultBox = panel.querySelector("[data-result]");

  score.textContent = `${result.score}%`;
  progress.style.width = `${progressPercent}%`;
  progressBar.setAttribute("aria-valuenow", progressPercent);
  progressText.textContent = `${Math.min(answered, assessment.questions.length)} of ${assessment.questions.length} questions answered`;

  if (resultBox.dataset.submitted === "true") renderResult(resultBox, result);
};

const renderAssessment = (assessment) => {
  if (!assessmentPanel) return;
  assessmentPanel.hidden = false;
  assessmentPanel.classList.add("is-visible");
  assessmentPanel.innerHTML = `
    <article class="guided-assessment-card ${assessment.id}">
      <datalist id="${sliderTicksId}">
        <option value="0"></option>
        <option value="1"></option>
        <option value="2"></option>
        <option value="3"></option>
        <option value="4"></option>
        <option value="5"></option>
      </datalist>
      <header class="guided-assessment-header">
        <span class="category-icon">${getIconMarkup(assessment.icon)}</span>
        <div>
          <h3>${assessment.title}</h3>
          <p>${assessment.description}</p>
        </div>
        <strong data-score>0%</strong>
      </header>
      <div class="guided-progress-wrap">
        <div class="guided-progress" role="progressbar" aria-label="${assessment.title} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span data-progress></span>
        </div>
        <p data-progress-text>0 of ${assessment.questions.length} questions answered</p>
      </div>
      <form data-assessment-form>
        ${renderParticipantFields(assessment)}
        <div class="guided-questions"></div>
        <button class="button primary" type="submit">Show My CEAM+ Profile</button>
      </form>
      <div class="guided-result" data-result hidden></div>
    </article>
  `;

  const questionList = assessmentPanel.querySelector(".guided-questions");
  let questionOffset = 0;
  phases.forEach((phase, phaseIndex) => {
    const phaseQuestions = assessment.questions.filter((question) => question.phase === phase.id);
    if (!phaseQuestions.length) return;
    questionList.appendChild(renderPhase(phase, phaseQuestions, questionOffset, phaseIndex === 0));
    questionOffset += phaseQuestions.length;
  });

  assessment.questions.forEach((question) => {
    const wrapper = assessmentPanel.querySelector(`[data-question-id="${question.id}"]`);
    if (!wrapper) return;
    updateFollowUp(question, wrapper);
    wrapper.addEventListener("input", () => {
      const output = wrapper.querySelector("[data-output]");
      const slider = wrapper.querySelector('input[type="range"]');
      if (output && slider) output.textContent = `Selected: ${slider.value}`;
      updateFollowUp(question, wrapper);
      updateGuidedAssessment(assessmentPanel, assessment);
    });
    wrapper.addEventListener("change", () => {
      updateFollowUp(question, wrapper);
      updateGuidedAssessment(assessmentPanel, assessment);
    });
  });

  assessmentPanel.querySelector("[data-assessment-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const resultBox = assessmentPanel.querySelector("[data-result]");
    const responses = getResponsesFromPanel(assessmentPanel, assessment);
    const participant = getParticipantFromForm(event.currentTarget);
    const result = buildAssessmentResult(assessment, responses, participant);
    resultBox.dataset.submitted = "true";
    renderResult(resultBox, result);
    await sendAssessmentEmails(result);
    resultBox.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
  });

  updateGuidedAssessment(assessmentPanel, assessment);
};

const handleOrganizationChange = () => {
  const selected = organizationSelect?.value;
  if (startAssessmentButton) startAssessmentButton.disabled = !selected;
  if (assessmentPanel) {
    assessmentPanel.hidden = true;
    assessmentPanel.classList.remove("is-visible");
    assessmentPanel.innerHTML = "";
  }
};

window.CEAMAssessments = {
  assessments,
  phases,
  buildZapierAssessmentFields,
  buildAssessmentResult,
  calculateAssessmentResult,
  calculatePhaseScores,
  calculateScore,
  emailTemplates,
  formatResponsesForEmail,
  getAssessmentById,
  getReadinessLevel,
  getRecommendation,
  renderAssessment,
  renderPhase,
  renderQuestion,
  sendAssessmentEmails,
  sendSupportRequest,
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

organizationSelect?.addEventListener("change", handleOrganizationChange);
startAssessmentButton?.addEventListener("click", () => {
  const selectedContext = organizationSelect?.value;
  const assessment = getAssessmentById(selectedContext);
  if (!assessment) {
    if (assessmentPanel) {
      assessmentPanel.hidden = false;
      assessmentPanel.classList.add("is-visible");
      assessmentPanel.innerHTML = `
        <article class="guided-assessment-card">
          <header class="guided-assessment-header">
            <div>
              <h3>Assessment file needs updating</h3>
              <p>
                This category is in the page menu, but the matching assessment
                data was not found in script.js. Upload or replace script.js in
                the root of the GitHub branch, then refresh the page.
              </p>
            </div>
          </header>
        </article>
      `;
      assessmentPanel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
    return;
  }
  renderAssessment(assessment);
  assessmentPanel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
});

if (contactForm && statusMessage) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "Thanks").trim();
    statusMessage.textContent = `${name}, your inquiry is ready to send once this site is connected to an email or form service.`;
    contactForm.reset();
  });
}
