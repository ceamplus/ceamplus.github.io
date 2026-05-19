const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-contact-form]");
const statusMessage = document.querySelector("[data-form-status]");
const organizationSelect = document.querySelector("[data-organization-select]");
const startAssessmentButton = document.querySelector("[data-start-assessment]");
const assessmentPanel = document.querySelector("[data-assessment-panel]");
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const readinessLevels = [
  {
    max: 49,
    level: "Needs Structure",
    tone: "low",
  },
  {
    max: 74,
    level: "Developing Readiness",
    tone: "medium",
  },
  {
    max: 100,
    level: "Ready for Guided Implementation",
    tone: "high",
  },
];

const assessments = [
  {
    id: "business",
    title: "Work / Business AI Readiness Assessment",
    icon: "briefcase",
    description:
      "Evaluate AI opportunities, job fit, workflow efficiency, personal capacity, and stakeholder readiness before scaling.",
    recommendations: {
      low: {
        nextStep: "Before choosing another AI tool, clarify the personal or work goals, affected users, workflow constraints, data conditions, and readiness signals for your own job, role, or team. Then run an overload map to identify the moments where you or others lose focus, repeat decisions, wait for approvals, switch between systems, or feel pressure to respond faster than you can think.",
        risk: "The main barrier is likely not interest in AI; it is mental bandwidth and cognitive load. If you or your team are already managing stress, unclear priorities, communication friction, confusion, or decision burden, a new AI workflow can feel like another demand instead of support.",
        implementation: "Start with a two-week guided pilot that includes communication preferences, training format choices, and a short reflection log. Ask what you or others have already tried, what helped, what created more work, and where decisions still feel unclear. Use those answers to build a simple adoption pathway with defined roles, escalation points, and a weekly adjustment rhythm.",
      },
      medium: {
        nextStep: "Choose the personal or workplace workflow with the clearest combination of value and human relief. Define what reduced overload would look like in practical terms: fewer repeated explanations, clearer handoffs, shorter search time, fewer after-hours corrections, or better confidence in routine decisions.",
        risk: "Readiness may stall if leaders focus only on efficiency metrics and miss how different people learn, communicate, and recover from overload. Some staff may need visual examples, others may need written steps, live practice, or private time to test the tool before using it in a visible workflow.",
        implementation: "Create a role-based pilot guide with three parts: what the AI tool will do, what humans still decide, and how feedback will change the process. Include office-hours support, a shared issue log, and a midpoint review that asks whether the tool is reducing mental effort or simply moving effort somewhere less visible.",
      },
      high: {
        nextStep: "Move into a guided implementation plan for one scalable personal, job, or business use case, but keep the human factors explicit. Name the process owner, decision owner, training owner, and feedback owner, then define how you will monitor overload, communication friction, confidence, and workflow value at each milestone.",
        risk: "High readiness can create pressure to scale too quickly. The risk is that early adopters adapt well while quieter teams, new employees, neurodivergent staff, or people under heavier workload pressure fall behind without saying so directly.",
        implementation: "Use CEAM+ checkpoint reviews every two to four weeks. Review workflow data alongside human signals: confusion themes, repeated questions, stress points, training gaps, and suggestions from people who were hesitant. Treat those signals as design data, not resistance, and adjust the implementation before expanding.",
      },
    },
    questions: [
      {
        layer: "Assess Context",
        label: "You or your team can clarify goals, affected users, workflow constraints, data conditions, and readiness signals before choosing where AI belongs.",
        low: "Hard to name",
        high: "Clearly named",
      },
      {
        layer: "Map Cognitive Load",
        label: "You or others can name the specific moments that cause overload, friction, confusion, decision burden, or mental stress, such as repeated approvals, unclear priorities, system switching, or urgent messages.",
        low: "Little bandwidth",
        high: "Enough bandwidth",
      },
      {
        layer: "Map Cognitive Load",
        label: "Training can match different learning styles, including written steps, visual examples, live practice, and time to try the tool privately.",
        low: "One format",
        high: "Multiple formats",
      },
      {
        layer: "Apply Ethical Checks",
        label: "Communication style differences are considered when explaining AI decisions, limits, risks, and escalation paths to stakeholders.",
        low: "Not considered",
        high: "Well considered",
      },
      {
        layer: "Apply Ethical Checks",
        label: "Customer, employee, or vendor data risks are reviewed before AI tools are tested in a real business workflow.",
        low: "Rarely reviewed",
        high: "Reviewed early",
      },
      {
        layer: "Pilot and Learn",
        label: "You or the affected people have discussed what has already been tried to improve the workflow and why those attempts did or did not reduce friction.",
        low: "Not discussed",
        high: "Clearly discussed",
      },
      {
        layer: "Pilot and Learn",
        label: "You or your team has a practical plan for handling overload during a bounded pilot, including where questions go and what work can pause if needed.",
        low: "No plan",
        high: "Clear plan",
      },
      {
        layer: "Pilot and Learn",
        label: "Feedback from the pilot can be used to measure human impact and refine process changes, training updates, or communication adjustments within the next planning cycle.",
        low: "Unlikely",
        high: "Very likely",
      },
    ],
  },
  {
    id: "education",
    title: "Learning / Education AI Readiness Assessment",
    icon: "book",
    description:
      "Support responsible learning tools, study habits, faculty adoption, accessibility, and student-centered safeguards.",
    recommendations: {
      low: {
        nextStep: "Begin with a learning-environment scan before selecting a tool. Ask where overload shows up for you, students, or educators: unclear instructions, too many platforms, anxiety about grades or performance, difficulty asking for help, accessibility barriers, or uncertainty about whether AI use is allowed. Choose one learning use case that reduces confusion rather than adding another layer.",
        risk: "The biggest barrier may be uneven emotional and cognitive safety. A person may use AI silently when overwhelmed, while an educator may avoid AI because they do not want to police it or redesign assignments without support. Without clear communication and accessible guidance, AI can widen gaps instead of supporting learning.",
        implementation: "Create a personal, classroom, or program protocol that includes acceptable use, disclosure language, accessibility checks, learning-style supports, and a low-stakes practice activity. Build in reflection about what was tried, what caused confusion, and what helped learning rather than simply completing work.",
      },
      medium: {
        nextStep: "Pilot one learning-support workflow where the purpose is specific: drafting feedback, study planning, accessibility support, tutoring practice, personal comprehension, or faculty preparation. Define how the AI tool should reduce cognitive load for the learner or educator and how you will know if it is causing confusion.",
        risk: "Adoption may fragment if each instructor creates different expectations without shared language. Students who need direct communication, visual examples, repetition, or assistive supports may experience the policy as unclear or unsafe.",
        implementation: "Use a shared rubric, sample prompts, reflection questions, and short faculty/student check-ins. Ask what has already been tried, whether it improved learning, and whether communication needs to be more direct, more visual, more scaffolded, or more flexible.",
      },
      high: {
        nextStep: "Move toward a guided implementation plan across a personal learning goal, course, program, or department, but keep the focus on learning conditions rather than tool enthusiasm. Name the learning outcome, support model, accessibility requirements, communication norms, and feedback loop before scaling.",
        risk: "High readiness can still produce inconsistent student experiences if faculty workload, student anxiety, academic integrity concerns, and accessibility needs are not reviewed together. Students may comply on the surface while remaining confused about what responsible AI use actually means.",
        implementation: "Schedule recurring CEAM+ reviews that examine learning impact, mental workload, student confidence, faculty time, accessibility, and ethical use. Update guidance during the term rather than waiting until the next academic cycle.",
      },
    },
    questions: [
      {
        layer: "Assess Context",
        label: "You, faculty, or students can clarify learning goals, affected users, accessibility constraints, data conditions, and readiness signals before AI is added.",
        low: "Hard to identify",
        high: "Clearly identified",
      },
      {
        layer: "Map Cognitive Load",
        label: "Faculty and students can identify what causes overload, friction, confusion, decision burden, or mental health stress in the learning environment, such as platform switching, unclear AI rules, assignment anxiety, or too many instructions.",
        low: "Not considered",
        high: "Actively considered",
      },
      {
        layer: "Map Cognitive Load",
        label: "The learner receives AI guidance in more than one learning style, such as examples, checklists, demonstrations, discussion, and practice prompts.",
        low: "One format",
        high: "Multiple formats",
      },
      {
        layer: "Apply Ethical Checks",
        label: "Communication style needs are addressed so students know when AI use is allowed, when it must be disclosed, and how to ask clarifying questions.",
        low: "Unclear",
        high: "Very clear",
      },
      {
        layer: "Apply Ethical Checks",
        label: "Privacy, accessibility, fairness, transparency, bias, and attribution expectations are explained before students are asked to use AI tools.",
        low: "After use",
        high: "Before use",
      },
      {
        layer: "Pilot and Learn",
        label: "Faculty have discussed what they have already tried to reduce confusion, improve feedback, or support struggling learners before adding AI.",
        low: "Not discussed",
        high: "Clearly discussed",
      },
      {
        layer: "Pilot and Learn",
        label: "There is a plan for handling overload during a bounded pilot when AI guidance confuses students, increases faculty questions, or changes assignment support needs.",
        low: "No plan",
        high: "Clear plan",
      },
      {
        layer: "Pilot and Learn",
        label: "Learner, student, or faculty feedback can be used during the term to measure human impact and refine AI instructions, examples, accessibility supports, and communication norms.",
        low: "Rarely revised",
        high: "Regularly revised",
      },
    ],
  },
  {
    id: "healthcare",
    title: "Health / Care AI Readiness Assessment",
    icon: "cross",
    description:
      "Map personal, clinical, or administrative AI use against privacy, risk, usability, compliance, and accountability needs.",
    recommendations: {
      low: {
        nextStep: "Start with a low-risk health or care workflow and complete an overload review before implementation. Ask where you, staff, patients, or caregivers experience cognitive strain: documentation backlogs, alert fatigue, unclear escalation, appointment pressure, patient communication pressure, compliance uncertainty, or emotional stress after difficult situations.",
        risk: "Health and care readiness can look higher on paper than it feels in practice. If a person, clinician, caregiver, or staff member is already managing stress, compassion fatigue, time pressure, or communication breakdowns, AI may be perceived as another monitoring system instead of a support tool.",
        implementation: "Run a structured readiness session for the person or group affected, including privacy and accountability considerations. Document what has already been tried, what failed under real workflow pressure, and what supports people need to safely question, override, or escalate AI output.",
      },
      medium: {
        nextStep: "Clarify the oversight model and test the AI workflow with a small group that represents the actual communication and learning needs of the setting. Include staff who prefer written protocols, scenario practice, visual workflows, and direct escalation examples.",
        risk: "Privacy and accountability may be understood conceptually but fail during busy clinical or administrative moments if staff do not have a clear mental model for what the AI is doing and when human judgment takes priority.",
        implementation: "Use scenario-based testing with realistic cases. Review cognitive load, usability, documentation burden, mental stress points, escalation behavior, and whether the tool improves communication among patients, staff, and accountable decision-makers.",
      },
      high: {
        nextStep: "Begin a guided implementation pilot with defined safety checks, privacy controls, human accountability points, and a staff-support plan. Treat staff wellbeing, workload, and communication clarity as implementation measures, not secondary concerns.",
        risk: "Even high-readiness healthcare settings can create risk if monitoring focuses only on technical performance. A tool can be accurate and still increase documentation burden, emotional stress, patient confusion, or hesitation to escalate concerns.",
        implementation: "Track human impact, patient or service risk, compliance fit, workflow burden, and communication breakdowns throughout the pilot. Use weekly feedback to update training, escalation language, and safeguards before expanding use.",
      },
    },
    questions: [
      {
        layer: "Assess Context",
        label: "You, clinicians, or staff can clarify care goals, affected users, clinical or personal constraints, data conditions, and readiness signals before AI enters the workflow.",
        low: "Hard to identify",
        high: "Clearly identified",
      },
      {
        layer: "Map Cognitive Load",
        label: "You, clinicians, or staff can identify what causes overload, friction, confusion, decision burden, or wellbeing pressure, such as alert fatigue, documentation pressure, unclear escalation, or competing care needs.",
        low: "Not considered",
        high: "Actively considered",
      },
      {
        layer: "Map Cognitive Load",
        label: "Training can support different learning styles through scenarios, written protocols, visual workflows, supervised practice, and quick-reference aids.",
        low: "Limited training",
        high: "Layered training",
      },
      {
        layer: "Apply Ethical Checks",
        label: "Communication style needs are addressed for explaining AI-supported decisions to patients, families, staff, and accountable leaders.",
        low: "Not addressed",
        high: "Well addressed",
      },
      {
        layer: "Apply Ethical Checks",
        label: "Privacy, consent, fairness, transparency, oversight, escalation, compliance, and data-minimization expectations are defined before AI output enters a clinical or administrative workflow.",
        low: "Undefined",
        high: "Defined",
      },
      {
        layer: "Pilot and Learn",
        label: "Frontline users have discussed what they have already tried to reduce burden, improve handoffs, or clarify decisions before adding AI.",
        low: "Not discussed",
        high: "Clearly discussed",
      },
      {
        layer: "Pilot and Learn",
        label: "There is a practical plan for handling overload during a bounded pilot if AI output conflicts with staff judgment, patient needs, or time-sensitive workflow demands.",
        low: "No plan",
        high: "Clear plan",
      },
      {
        layer: "Pilot and Learn",
        label: "Quality, compliance, staff feedback, and patient or service human impact can be reviewed together to refine the adoption plan after implementation.",
        low: "Separate reviews",
        high: "Integrated review",
      },
    ],
  },
  {
    id: "rehabilitation",
    title: "Rehabilitation / Adaptive Support AI Readiness Assessment",
    icon: "path",
    description:
      "Shape assistive and adaptive systems around personal goals, autonomy, behavior change, and care insight.",
    recommendations: {
      low: {
        nextStep: "Begin with one person-centered support scenario and map what overload looks like for the person, caregiver, job coach, educator, or care team. Consider fatigue, frustration, sensory load, memory demands, communication barriers, emotional readiness, and the point where support starts to feel like pressure.",
        risk: "Assistive or adaptive AI can unintentionally reduce autonomy if recommendations are too frequent, too complex, or disconnected from the person's communication style and lived experience. Mental health, motivation, and trust can be affected if the tool feels judgmental or hard to control.",
        implementation: "Use a small co-designed pilot with the person and any caregivers, clinicians, educators, or support partners involved. Ask what has already been tried, what helped, what felt overwhelming, and how the person prefers to receive reminders, choices, encouragement, or feedback. Build those answers into the first version.",
      },
      medium: {
        nextStep: "Refine one adaptive support workflow around a specific patient goal and the person's preferred learning and communication style. Define whether the support should be visual, verbal, step-by-step, choice-based, caregiver-mediated, or clinician-guided.",
        risk: "The system may be technically promising but difficult to sustain if stress, motivation, autonomy, caregiver workload, or behavior-change readiness is overlooked. A patient may disengage if the support feels too fast, too corrective, or too disconnected from daily life.",
        implementation: "Add structured check-ins that review patient experience, goal progress, care-team interpretation of AI suggestions, and overload signals. Adjust frequency, language, prompts, and escalation steps before expanding the use case.",
      },
      high: {
        nextStep: "Move into guided implementation with patient-goal tracking, autonomy safeguards, and multidisciplinary feedback loops. Keep the person's mental energy, confidence, preferred communication style, and sense of control visible in the implementation plan.",
        risk: "Scaling adaptive systems can create uneven experiences if personalization and oversight are not maintained over time. What supports one person may overload another, especially when cognitive fatigue, emotional readiness, disability access, or caregiver involvement differs.",
        implementation: "Use CEAM+ improvement cycles to adjust prompts, supports, escalation paths, and care-team responsibilities. Review both measurable progress and lived experience so the system remains adaptive, respectful, and clinically useful.",
      },
    },
    questions: [
      {
        layer: "Assess Context",
        label: "You or the support team can clarify personal goals, affected users, therapy or job constraints, data conditions, and readiness signals before AI support is introduced.",
        low: "Hard to identify",
        high: "Clearly identified",
      },
      {
        layer: "Map Cognitive Load",
        label: "You or the support team can identify what causes overload, friction, confusion, decision burden, or mental health strain, such as fatigue, sensory input, memory demands, frustration, or too many prompts.",
        low: "Not considered",
        high: "Actively considered",
      },
      {
        layer: "Map Cognitive Load",
        label: "The support can match the person's learning style through demonstration, repetition, visuals, verbal coaching, written steps, or caregiver modeling.",
        low: "One format",
        high: "Personalized formats",
      },
      {
        layer: "Apply Ethical Checks",
        label: "Communication style preferences are documented so prompts, feedback, and choices are presented in a way the person can understand and control.",
        low: "Not documented",
        high: "Well documented",
      },
      {
        layer: "Apply Ethical Checks",
        label: "Risk, fairness, transparency, privacy, oversight, consent, autonomy, and choice are checked when adaptive recommendations are presented to patients, caregivers, or clinicians.",
        low: "Weak safeguards",
        high: "Strong safeguards",
      },
      {
        layer: "Pilot and Learn",
        label: "You or the support team has discussed what has already been tried to support behavior change and which strategies helped, failed, or caused overload.",
        low: "Not discussed",
        high: "Clearly discussed",
      },
      {
        layer: "Pilot and Learn",
        label: "There is a plan for handling overload during a bounded pilot if prompts, tracking, caregiver involvement, or AI suggestions become stressful or disruptive.",
        low: "No plan",
        high: "Clear plan",
      },
      {
        layer: "Pilot and Learn",
        label: "Progress data and lived experience feedback can be used to measure human impact and refine supports over time without reducing patient autonomy.",
        low: "Rarely adjusted",
        high: "Continuously adjusted",
      },
    ],
  },
];

const getAssessmentById = (id) => assessments.find((assessment) => assessment.id === id);

const calculateAssessmentResult = (values, questionCount, assessment) => {
  const total = values.reduce((sum, value) => sum + Number(value), 0);
  const maximum = questionCount * 5;
  const score = Math.round((total / maximum) * 100);
  const readiness = readinessLevels.find((level) => score <= level.max);
  return {
    score,
    level: readiness.level,
    tone: readiness.tone,
    ...assessment.recommendations[readiness.tone],
  };
};

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
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[icon]}</svg>`;
};

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const createQuestion = (assessment, question, index) => {
  const questionId = `${assessment.id}-question-${index}`;
  const wrapper = document.createElement("div");
  wrapper.className = "guided-question";
  wrapper.innerHTML = `
    <div class="question-meta">
      <span>${question.layer}</span>
      <output for="${questionId}" data-output>3</output>
    </div>
    <label for="${questionId}">${question.label}</label>
    <input id="${questionId}" name="${questionId}" type="range" min="1" max="5" value="3" step="1">
    <div class="scale-labels" aria-hidden="true">
      <span>${question.low}</span>
      <span>${question.high}</span>
    </div>
  `;
  return wrapper;
};

const updateGuidedAssessment = (panel, assessment) => {
  const values = [...panel.querySelectorAll('input[type="range"]')].map((input) => input.value);
  const result = calculateAssessmentResult(values, assessment.questions.length, assessment);
  const answered = values.filter((value) => Number(value) !== 3).length;
  const progressPercent = Math.round((answered / assessment.questions.length) * 100);
  const score = panel.querySelector("[data-score]");
  const progress = panel.querySelector("[data-progress]");
  const progressText = panel.querySelector("[data-progress-text]");
  const progressBar = panel.querySelector(".guided-progress");
  const resultBox = panel.querySelector("[data-result]");

  score.textContent = `${result.score}%`;
  progress.style.width = `${progressPercent}%`;
  progressBar.setAttribute("aria-valuenow", progressPercent);
  progressText.textContent = `${answered} of ${assessment.questions.length} responses adjusted`;

  if (resultBox.dataset.submitted === "true") {
    resultBox.hidden = false;
    resultBox.className = `guided-result ${result.tone}`;
    resultBox.innerHTML = `
      <div>
        <span>${result.level}</span>
        <strong>${result.score}% readiness</strong>
      </div>
      <dl>
        <dt>Practical next step</dt>
        <dd>${result.nextStep}</dd>
        <dt>Risk or barrier observation</dt>
        <dd>${result.risk}</dd>
        <dt>Implementation suggestion</dt>
        <dd>${result.implementation}</dd>
      </dl>
    `;
  }
};

const renderGuidedAssessment = (assessment) => {
  if (!assessmentPanel) return;
  assessmentPanel.hidden = false;
  assessmentPanel.classList.add("is-visible");
  assessmentPanel.innerHTML = `
    <article class="guided-assessment-card ${assessment.id}">
      <header class="guided-assessment-header">
        <span class="category-icon">${getIconMarkup(assessment.icon)}</span>
        <div>
          <h3>${assessment.title}</h3>
          <p>${assessment.description}</p>
        </div>
        <strong data-score>60%</strong>
      </header>
      <div class="guided-progress-wrap">
        <div class="guided-progress" role="progressbar" aria-label="${assessment.title} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span data-progress></span>
        </div>
        <p data-progress-text>0 of ${assessment.questions.length} responses adjusted</p>
      </div>
      <form>
        <div class="guided-questions"></div>
        <button class="button primary" type="submit">Calculate Readiness</button>
      </form>
      <div class="guided-result" data-result hidden></div>
    </article>
  `;

  const questionList = assessmentPanel.querySelector(".guided-questions");
  assessment.questions.forEach((question, index) => {
    questionList.appendChild(createQuestion(assessment, question, index));
  });

  assessmentPanel.querySelectorAll('input[type="range"]').forEach((input) => {
    const output = input.closest(".guided-question").querySelector("[data-output]");
    input.addEventListener("input", () => {
      output.textContent = input.value;
      updateGuidedAssessment(assessmentPanel, assessment);
    });
  });

  assessmentPanel.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const resultBox = assessmentPanel.querySelector("[data-result]");
    resultBox.dataset.submitted = "true";
    updateGuidedAssessment(assessmentPanel, assessment);
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
  calculateAssessmentResult,
  getAssessmentById,
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

organizationSelect?.addEventListener("change", handleOrganizationChange);
startAssessmentButton?.addEventListener("click", () => {
  const assessment = getAssessmentById(organizationSelect.value);
  if (!assessment) return;
  renderGuidedAssessment(assessment);
  assessmentPanel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
});

if (form && statusMessage) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get("name") || "Thanks").trim();
    statusMessage.textContent = `${name}, your inquiry is ready to send once this site is connected to an email or form service.`;
    form.reset();
  });
}
