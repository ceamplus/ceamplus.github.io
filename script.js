const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-contact-form]");
const statusMessage = document.querySelector("[data-form-status]");
const assessmentsRoot = document.querySelector("[data-assessments-root]");
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const readinessLevels = [
  {
    max: 44,
    level: "Foundational",
    tone: "low",
    recommendation:
      "Start with one narrow AI use case, reduce decision load, and add simple supports before asking people to change core workflows.",
  },
  {
    max: 74,
    level: "Developing",
    tone: "medium",
    recommendation:
      "You have useful readiness signals. Focus next on shared criteria, guided practice, and clear human review points before scaling.",
  },
  {
    max: 100,
    level: "Ready",
    tone: "high",
    recommendation:
      "You are positioned for a structured pilot. Keep feedback visible, monitor cognitive load, and document ethical checkpoints as adoption grows.",
  },
];

const assessments = [
  {
    id: "cognitive",
    title: "Cognitive Readiness",
    summary: "Measures overload, decision fatigue, workflow clarity, technology confidence, and information processing comfort.",
    accent: "blue",
    questions: [
      {
        label: "Overwhelm is manageable when new AI tools are introduced.",
        low: "Overwhelming",
        high: "Manageable",
        type: "scale",
      },
      {
        label: "Decision fatigue is low enough for people to evaluate AI output carefully.",
        low: "High fatigue",
        high: "Low fatigue",
        type: "scale",
      },
      {
        label: "Current workflows are clear enough to identify where AI should fit.",
        low: "Unclear",
        high: "Clear",
        type: "scale",
      },
      {
        label: "People feel confident learning and using new technology.",
        low: "Low confidence",
        high: "High confidence",
        type: "scale",
      },
      {
        label: "Information from systems, teams, and tools is easy to process.",
        low: "Hard to process",
        high: "Easy to process",
        type: "scale",
      },
    ],
  },
  {
    id: "ethical",
    title: "Ethical Readiness",
    summary: "Measures trust, transparency, privacy concerns, human oversight preferences, and ethical comfort.",
    accent: "gold",
    questions: [
      {
        label: "People trust AI enough to test it in a bounded, transparent setting.",
        low: "Low trust",
        high: "High trust",
        type: "scale",
      },
      {
        label: "The team understands how AI-assisted decisions should be explained.",
        low: "Opaque",
        high: "Transparent",
        type: "scale",
      },
      {
        label: "Privacy risks and sensitive data boundaries are clearly understood.",
        low: "Unclear",
        high: "Clear",
        type: "scale",
      },
      {
        label: "Human oversight expectations are defined before AI recommendations are used.",
        low: "Undefined",
        high: "Defined",
        type: "scale",
      },
      {
        label: "People feel ethically comfortable with the proposed AI use case.",
        low: "Uneasy",
        high: "Comfortable",
        type: "scale",
      },
    ],
  },
  {
    id: "adoption",
    title: "Adoption Readiness",
    summary: "Measures willingness to adopt AI, organizational support, training readiness, usefulness, and ease-of-use expectations.",
    accent: "coral",
    questions: [
      {
        label: "People are willing to try AI when the purpose and limits are clear.",
        low: "Resistant",
        high: "Willing",
        type: "scale",
      },
      {
        label: "Leadership and peers provide practical support for responsible AI adoption.",
        low: "Limited support",
        high: "Strong support",
        type: "scale",
      },
      {
        label: "Training time and materials can be made available before rollout.",
        low: "Not ready",
        high: "Ready",
        type: "scale",
      },
      {
        label: "The proposed AI use case is clearly useful to the people doing the work.",
        low: "Low usefulness",
        high: "High usefulness",
        type: "scale",
      },
      {
        label: "The AI tool is expected to be easy enough to use without adding friction.",
        low: "Adds friction",
        high: "Easy to use",
        type: "scale",
      },
    ],
  },
  {
    id: "plus",
    title: "Plus / Ongoing Improvement Readiness",
    summary: "Measures adaptability, learning mindset, feedback usage, long-term implementation interest, and continuous improvement habits.",
    accent: "green",
    questions: [
      {
        label: "The team adapts well when workflows change.",
        low: "Rigid",
        high: "Adaptable",
        type: "scale",
      },
      {
        label: "People approach AI adoption with a learning mindset rather than a one-time launch mindset.",
        low: "Fixed",
        high: "Learning",
        type: "scale",
      },
      {
        label: "Feedback from users is regularly collected and used to improve tools.",
        low: "Rarely used",
        high: "Actively used",
        type: "scale",
      },
      {
        label: "There is interest in long-term AI implementation beyond a single experiment.",
        low: "Short term",
        high: "Long term",
        type: "scale",
      },
      {
        label: "Continuous improvement habits are already part of team practice.",
        low: "Occasional",
        high: "Consistent",
        type: "scale",
      },
    ],
  },
];

const calculateAssessmentResult = (values, questionCount) => {
  const total = values.reduce((sum, value) => sum + Number(value), 0);
  const maximum = questionCount * 5;
  const score = Math.round((total / maximum) * 100);
  const readiness = readinessLevels.find((level) => score <= level.max);
  return {
    score,
    level: readiness.level,
    tone: readiness.tone,
    recommendation: readiness.recommendation,
  };
};

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const createQuestion = (assessment, question, index) => {
  const questionId = `${assessment.id}-question-${index}`;
  const wrapper = document.createElement("div");
  wrapper.className = "assessment-question";
  wrapper.innerHTML = `
    <label for="${questionId}">
      <span>${question.label}</span>
      <output for="${questionId}" data-output>${3}</output>
    </label>
    <input id="${questionId}" name="${questionId}" type="range" min="1" max="5" value="3" step="1">
    <div class="scale-labels" aria-hidden="true">
      <span>${question.low}</span>
      <span>${question.high}</span>
    </div>
  `;
  return wrapper;
};

const updateAssessmentCard = (card, assessment) => {
  const values = [...card.querySelectorAll('input[type="range"]')].map((input) => input.value);
  const result = calculateAssessmentResult(values, assessment.questions.length);
  const progressBar = card.querySelector(".assessment-progress");
  const progress = card.querySelector("[data-progress]");
  const score = card.querySelector("[data-score]");
  const resultBox = card.querySelector("[data-result]");

  progress.style.width = `${result.score}%`;
  progressBar.setAttribute("aria-valuenow", result.score);
  score.textContent = `${result.score}%`;

  if (resultBox.dataset.submitted === "true") {
    resultBox.hidden = false;
    resultBox.className = `assessment-result ${result.tone}`;
    resultBox.innerHTML = `
      <strong>${result.level} readiness: ${result.score}%</strong>
      <p>${result.recommendation}</p>
    `;
  }
};

const createAssessmentCard = (assessment) => {
  const card = document.createElement("article");
  card.className = `assessment-card ${assessment.accent}`;
  card.innerHTML = `
    <div class="assessment-card-header">
      <div>
        <h3>${assessment.title}</h3>
        <p>${assessment.summary}</p>
      </div>
      <span data-score>60%</span>
    </div>
    <div class="assessment-progress" role="progressbar" aria-label="${assessment.title} score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60">
      <span data-progress></span>
    </div>
    <form>
      <div class="assessment-questions"></div>
      <button class="button primary" type="submit">View Recommendation</button>
    </form>
    <div class="assessment-result" data-result hidden></div>
  `;

  const questionList = card.querySelector(".assessment-questions");
  assessment.questions.forEach((question, index) => {
    questionList.appendChild(createQuestion(assessment, question, index));
  });

  card.querySelectorAll('input[type="range"]').forEach((input) => {
    const output = input.closest(".assessment-question").querySelector("[data-output]");
    input.addEventListener("input", () => {
      output.textContent = input.value;
      updateAssessmentCard(card, assessment);
    });
  });

  card.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const resultBox = card.querySelector("[data-result]");
    resultBox.dataset.submitted = "true";
    updateAssessmentCard(card, assessment);
    resultBox.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
  });

  updateAssessmentCard(card, assessment);
  return card;
};

const renderAssessments = () => {
  if (!assessmentsRoot) return;
  assessments.forEach((assessment) => {
    assessmentsRoot.appendChild(createAssessmentCard(assessment));
  });
};

window.CEAMAssessments = {
  assessments,
  calculateAssessmentResult,
};

updateHeader();
renderAssessments();
window.addEventListener("scroll", updateHeader, { passive: true });

if (form && statusMessage) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get("name") || "Thanks").trim();
    statusMessage.textContent = `${name}, your inquiry is ready to send once this site is connected to an email or form service.`;
    form.reset();
  });
}
