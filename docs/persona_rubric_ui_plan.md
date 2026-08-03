# Persona & Scoring Rubric UI Plan

## Endpoints Reference

### Shared bootstrap call (load once on mount)

```
GET /api/interview-configs/options
```

Returns everything needed to build dropdowns and pre-fill forms:

```json
{
  "persona": {
    "tone": [
      { "value": "calm_respectful",        "label": "Calm and respectful",      "prompt_text": "calm, respectful, and technically rigorous" },
      { "value": "friendly_conversational", "label": "Friendly conversational",  "prompt_text": "friendly, conversational, and encouraging" },
      { "value": "professional_formal",     "label": "Professional formal",       "prompt_text": "professional, formal, and concise" },
      { "value": "warm_encouraging",        "label": "Warm encouraging",          "prompt_text": "warm, encouraging, and patient" },
      { "value": "technical_rigorous",      "label": "Technically rigorous",      "prompt_text": "technically rigorous, precise, and evidence-focused" },
      { "value": "neutral_objective",       "label": "Neutral objective",         "prompt_text": "neutral, objective, and structured" }
    ],
    "pace": [
      { "value": "extra_slow",   "label": "Extra slow",      "prompt_text": "extra slow and very clear" },
      { "value": "slow_measured","label": "Slow and measured","prompt_text": "slow and measured" },
      { "value": "normal",       "label": "Normal",           "prompt_text": "normal and clear" },
      { "value": "brisk_clear",  "label": "Brisk but clear",  "prompt_text": "brisk but clear" }
    ],
    "strictness_level": [
      { "value": "easy",       "label": "Easy" },
      { "value": "balanced",   "label": "Balanced" },
      { "value": "strict",     "label": "Strict" },
      { "value": "very_strict","label": "Very strict" },
      { "value": "senior_bar", "label": "Senior bar" }
    ],
    "follow_up_style": [
      { "value": "adaptive",                    "label": "Adaptive" },
      { "value": "one_follow_up_only",          "label": "One follow-up only" },
      { "value": "deep_probe",                  "label": "Deep probe" },
      { "value": "structured",                  "label": "Structured" },
      { "value": "resume_verification_heavy",   "label": "Resume verification heavy" },
      { "value": "practical_experience_heavy",  "label": "Practical experience heavy" },
      { "value": "debugging_heavy",             "label": "Debugging heavy" },
      { "value": "system_design_heavy",         "label": "System design heavy" },
      { "value": "minimal_follow_up",           "label": "Minimal follow-up" }
    ],
    "opening_disclosure": [
      { "value": "standard_ai_disclosure",               "label": "Standard AI disclosure",           "text": "This is an AI-led technical interview and the discussion may be transcribed for evaluation." },
      { "value": "short_ai_disclosure",                  "label": "Short AI disclosure",              "text": "This is an AI-led technical interview." },
      { "value": "recording_and_transcription_disclosure","label": "Recording and transcription",      "text": "This is an AI-led technical interview. The discussion may be recorded and transcribed for evaluation." },
      { "value": "no_disclosure",                        "label": "No disclosure",                    "text": "" }
    ],
    "closing_message": [
      { "value": "standard_thank_you",   "label": "Standard thank you",    "text": "Thank you for your time. The team will review the discussion and get back to you." },
      { "value": "short_thank_you",      "label": "Short thank you",       "text": "Thank you for your time. The team will get back to you." },
      { "value": "formal_review_message","label": "Formal review message", "text": "Thank you for completing the interview. The hiring team will review the evaluation and share next steps." }
    ],
    "language_policy": [
      { "value": "clear_indian_english",        "label": "Clear Indian English" },
      { "value": "english_only",                "label": "English only" },
      { "value": "hindi_english_mixed",         "label": "Hindi-English mixed" },
      { "value": "candidate_preferred_language","label": "Candidate preferred" },
      { "value": "simple_global_english",       "label": "Simple global English" }
    ]
  },
  "scoring_rubric": {
    "criteria": [
      { "criterion_key": "correctness",         "label": "Correctness",         "description": "Technical accuracy of answers." },
      { "criterion_key": "depth",               "label": "Depth",               "description": "Ability to explain tradeoffs and underlying concepts." },
      { "criterion_key": "practical_experience","label": "Practical Experience", "description": "Evidence of hands-on production or project work." },
      { "criterion_key": "problem_solving",     "label": "Problem Solving",      "description": "Debugging, reasoning, and approach quality." },
      { "criterion_key": "communication",       "label": "Communication",        "description": "Clarity and structure of explanation." },
      { "criterion_key": "ownership",           "label": "Ownership",            "description": "Accountability, decision-making, and delivery maturity." },
      { "criterion_key": "collaboration",       "label": "Collaboration",        "description": "Working with peers and cross-functional teams." },
      { "criterion_key": "system_design",       "label": "System Design",        "description": "Architecture, scaling, reliability, and component design." },
      { "criterion_key": "debugging_ability",   "label": "Debugging Ability",    "description": "Ability to diagnose failures and reason through issues." },
      { "criterion_key": "tradeoff_reasoning",  "label": "Tradeoff Reasoning",   "description": "Ability to compare alternatives and risks." },
      { "criterion_key": "learning_agility",    "label": "Learning Agility",     "description": "Ability to learn, adapt, and reason with new information." },
      { "criterion_key": "leadership",          "label": "Leadership",           "description": "Guiding people and creating direction." },
      { "criterion_key": "values_alignment",    "label": "Values Alignment",     "description": "Alignment with company values and expected behaviors." },
      { "criterion_key": "must_have_match",     "label": "Must-Have Match",      "description": "Match against required role criteria." },
      { "criterion_key": "security_awareness",  "label": "Security Awareness",   "description": "Basic security, data protection, auth, and threat awareness." }
    ]
  },
  "interview_type_criteria": {
    "technical":     [ { "criterion_key": "correctness", "label": "Correctness", "description": "...", "weight_percent": 30 }, "..." ],
    "behavioral":    [ { "criterion_key": "ownership",   "label": "Ownership",   "description": "...", "weight_percent": 25 }, "..." ],
    "hr":            [ "..." ],
    "communication": [ "..." ],
    "managerial":    [ "..." ],
    "cultural_fit":  [ "..." ],
    "screening":     [ "..." ]
  },
  "system_personas": [
    { "id": "sys_persona_balanced",     "name": "Balanced Interviewer (Default)", "display_name": "Priya AI Interviewer", "description": "Calm and balanced..." },
    { "id": "sys_persona_professional", "name": "Professional Formal",            "display_name": "Alex AI Interviewer",  "description": "Professional and structured..." },
    { "id": "sys_persona_friendly",     "name": "Warm and Friendly",              "display_name": "Sam AI Interviewer",   "description": "Warm and encouraging..." }
  ],
  "defaults": {
    "persona": { "display_name": "Priya AI Interviewer", "tone": "calm_respectful", "..." },
    "scoring_rubrics_by_type": {
      "technical":  { "interview_type": "technical", "passing_score": 70, "strong_hire_score": 85, "human_review_min": 55, "human_review_max": 69, "criteria": [ "..." ] },
      "behavioral": { "..." },
      "...": {}
    }
  }
}
```

---

## PAGE 1 — Persona Library

**Route:** `/settings/personas`

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ AI Interviewer Personas                         [+ New Persona]  │
│ Configure the bot's voice, tone, and conversation style.         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SYSTEM PRESETS (read-only, clone to customise)                  │
│  ┌────────────────────┐ ┌────────────────────┐ ┌──────────────┐ │
│  │ Priya AI           │ │ Alex AI            │ │ Sam AI       │ │
│  │ Balanced (Default) │ │ Professional Formal│ │ Warm Friendly│ │
│  │ calm · balanced    │ │ formal · strict    │ │ warm · easy  │ │
│  │ [System] [Active]  │ │ [System] [Active]  │ │ [System]     │ │
│  │        [Clone]     │ │        [Clone]     │ │    [Clone]   │ │
│  └────────────────────┘ └────────────────────┘ └──────────────┘ │
│                                                                   │
│  YOUR PERSONAS                                                    │
│  ┌──────────────────────────────────────────────┐               │
│  │ My Custom Priya       [Default] [Active]      │               │
│  │ tone: warm · pace: slow · strictness: strict  │               │
│  │ Disclosure: Standard AI  ·  Closing: Formal   │               │
│  │              [Edit]  [Set Default]  [Archive] │               │
│  └──────────────────────────────────────────────┘               │
│                                                                   │
│  No more personas. [+ Create new persona]                        │
└─────────────────────────────────────────────────────────────────┘
```

### Endpoints used

| Action | Endpoint |
|--------|----------|
| Load personas | `GET /api/interview-configs/personas?tenant_id=xxx` |
| Set as default | `POST /api/interview-configs/personas/{id}/set-default?tenant_id=xxx` |
| Clone preset | `POST /api/interview-configs/personas/{id}/clone?tenant_id=xxx&new_name=My+Custom+Priya` |
| Archive | `POST /api/interview-configs/personas/{id}/archive?tenant_id=xxx` |

### System vs. tenant card distinction

Check `record.tenant_id === 'system'` in the list response:
- **System persona**: Show `[System]` badge, hide Edit/Archive, show only `[Clone]`
- **Tenant persona**: Show Edit, Set Default, Archive. Show `[Default]` badge if `is_default === true`

### Sample list response

```json
[
  {
    "id": "sys_persona_balanced",
    "tenant_id": "system",
    "name": "Balanced Interviewer (Default)",
    "display_name": "Priya AI Interviewer",
    "config": {
      "display_name": "Priya AI Interviewer",
      "tone": "calm, respectful, and technically rigorous",
      "pace": "slow and measured",
      "strictness_level": "balanced",
      "follow_up_style": "adaptive",
      "max_reply_words": 40,
      "opening_disclosure": "This is an AI-led technical interview and the discussion may be transcribed for evaluation.",
      "closing_message": "Thank you for your time. The team will review the discussion and get back to you.",
      "language_policy": "clear Indian English"
    },
    "is_default": true,
    "status": "active"
  },
  {
    "id": "aip_abc123",
    "tenant_id": "tenant_xyz",
    "name": "My Custom Priya",
    "display_name": "Priya AI Interviewer",
    "config": { "..." },
    "is_default": true,
    "status": "active"
  }
]
```

---

## PAGE 2 — Persona Create / Edit Form

**Route:** `/settings/personas/new` | `/settings/personas/:id/edit`

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back   New Persona / Edit "My Custom Priya"                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  BOT IDENTITY                                                     │
│  Config name*  [________________________]                         │
│                Internal label for this persona                    │
│  Bot display name*  [____________________]                        │
│                     What the bot says its name is                │
│                                                                   │
│  CONVERSATION STYLE                                               │
│  Tone*          [Calm and respectful         ▼]                  │
│                 Preview: "calm, respectful, and technically..."   │
│  Speaking pace* [Slow and measured          ▼]                   │
│  Strictness*    [Balanced                   ▼]                   │
│  Follow-up style* [Adaptive                 ▼]                   │
│  Max reply words* [40] (12–120 words)                            │
│  Language policy* [Clear Indian English     ▼]                   │
│                                                                   │
│  OPENING DISCLOSURE                                               │
│  What the bot says when introducing itself                        │
│  [Standard AI disclosure                    ▼]                   │
│  Preview: "This is an AI-led technical interview and the         │
│           discussion may be transcribed for evaluation."          │
│                                                                   │
│  CLOSING MESSAGE                                                  │
│  What the bot says when ending the interview                      │
│  [Standard thank you                        ▼]                   │
│  Preview: "Thank you for your time. The team will review the     │
│           discussion and get back to you."                        │
│                                                                   │
│  ☐ Set as default persona for all interviews                     │
│                                                                   │
│  [Cancel]                              [Save Persona]            │
└─────────────────────────────────────────────────────────────────┘
```

### Endpoints used

| Action | Endpoint | Body |
|--------|----------|------|
| Load options | `GET /api/interview-configs/options` | — |
| Load existing | `GET /api/interview-configs/personas/{id}?tenant_id=xxx` | — |
| Create | `POST /api/interview-configs/personas` | See below |
| Update | `PUT /api/interview-configs/personas/{id}?tenant_id=xxx` | See below |

### Create request body

```json
{
  "tenant_id": "tenant_xyz",
  "name": "My Custom Priya",
  "display_name": "Priya AI Interviewer",
  "is_default": false,
  "status": "active",
  "config": {
    "display_name": "Priya AI Interviewer",
    "tone": "calm_respectful",
    "pace": "slow_measured",
    "strictness_level": "balanced",
    "follow_up_style": "adaptive",
    "max_reply_words": 40,
    "opening_disclosure": "standard_ai_disclosure",
    "closing_message": "standard_thank_you",
    "language_policy": "clear_indian_english"
  }
}
```

### Update request body

```json
{
  "name": "My Custom Priya (Updated)",
  "display_name": "Priya AI Interviewer",
  "is_default": true,
  "config": {
    "display_name": "Priya AI Interviewer",
    "tone": "warm_encouraging",
    "pace": "slow_measured",
    "strictness_level": "easy",
    "follow_up_style": "one_follow_up_only",
    "max_reply_words": 45,
    "opening_disclosure": "short_ai_disclosure",
    "closing_message": "formal_review_message",
    "language_policy": "clear_indian_english"
  }
}
```

### Field validations

| Field | Rule |
|-------|------|
| `name` | Required, 3–100 chars |
| `display_name` | Required, 2–60 chars |
| `tone` | Must be one of the option set values |
| `pace` | Must be one of the option set values |
| `strictness_level` | Must be one of the option set values |
| `follow_up_style` | Must be one of the option set values |
| `max_reply_words` | Integer, 12–120 |
| `opening_disclosure` | Must be one of the option set values |
| `closing_message` | Must be one of the option set values |
| `language_policy` | Must be one of the option set values |

### Clone flow

When user clicks "Clone" on a system preset or any existing persona:

1. Show a modal: `Clone "Balanced Interviewer"` with a `New name` text input pre-filled as `"Copy of Balanced Interviewer"`
2. Call `POST /api/interview-configs/personas/{source_id}/clone?tenant_id=xxx&new_name=Copy+of+Balanced+Interviewer`
3. On success (201), redirect to the edit form for the new clone

---

## PAGE 3 — Scoring Rubric Library

**Route:** `/settings/rubrics`

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Scoring Rubrics                                  [+ New Rubric]  │
│ Define how the AI evaluates and scores candidates.               │
├──────────────────────────────────────────────────────────────────
│ [Technical] [Behavioral] [HR] [Communication]                    │
│ [Managerial] [Cultural Fit] [Screening]                          │
├──────────────────────────────────────────────────────────────────
│                                                                   │
│  TECHNICAL — ACTIVE RUBRICS                                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Default Technical Rubric           [Default] [Active]    │    │
│  │ Pass ≥ 70  ·  Strong hire ≥ 85  ·  Review 55–69          │    │
│  │ Correctness 30% · Depth 20% · Practical 20%             │    │
│  │ Problem Solving 15% · Communication 15%                  │    │
│  │           [Edit]  [Clone]  [Set Default]  [Archive]      │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Senior Engineer Rubric                      [Active]     │    │
│  │ Pass ≥ 75  ·  Strong hire ≥ 90  ·  Review 60–74          │    │
│  │ Correctness 25% · System Design 25% · Depth 20% ...      │    │
│  │           [Edit]  [Clone]  [Set Default]  [Archive]      │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Endpoints used

| Action | Endpoint |
|--------|----------|
| Load rubrics by type | `GET /api/interview-configs/scoring-rubrics?tenant_id=xxx&interview_type=technical` |
| Set as default | `POST /api/interview-configs/scoring-rubrics/{id}/set-default?tenant_id=xxx` |
| Clone | `POST /api/interview-configs/scoring-rubrics/{id}/clone?tenant_id=xxx&new_name=My+Clone` |
| Archive | `POST /api/interview-configs/scoring-rubrics/{id}/archive?tenant_id=xxx` |

### Tab behaviour

- On tab switch, fetch `?interview_type=<selected_type>` (lazy load per tab)
- Each tab shows rubrics for that interview type from tenant's DB
- If no rubrics exist for a type → show "No custom rubric yet" with a `[Create for this type]` button that opens the form pre-filled with that interview type

### Sample rubric list item response

```json
{
  "id": "aisr_abc123",
  "tenant_id": "tenant_xyz",
  "name": "Default Technical Rubric",
  "display_name": null,
  "config": {
    "interview_type": "technical",
    "name": "Default Technical Rubric",
    "passing_score": 70,
    "strong_hire_score": 85,
    "human_review_min": 55,
    "human_review_max": 69,
    "criteria": [
      { "criterion_key": "correctness",         "label": "Correctness",         "description": "Technical accuracy of answers.",                       "weight_percent": 30 },
      { "criterion_key": "depth",               "label": "Depth",               "description": "Ability to explain tradeoffs and underlying concepts.", "weight_percent": 20 },
      { "criterion_key": "practical_experience","label": "Practical Experience", "description": "Evidence of hands-on production or project work.",     "weight_percent": 20 },
      { "criterion_key": "problem_solving",     "label": "Problem Solving",      "description": "Debugging, reasoning, and approach quality.",          "weight_percent": 15 },
      { "criterion_key": "communication",       "label": "Communication",        "description": "Clarity and structure of explanation.",                "weight_percent": 15 }
    ]
  },
  "is_default": true,
  "status": "active"
}
```

---

## PAGE 4 — Scoring Rubric Create / Edit Form

**Route:** `/settings/rubrics/new` | `/settings/rubrics/:id/edit`

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back   New Scoring Rubric / Edit "Default Technical Rubric"   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SETUP                                                            │
│  Rubric name*   [__________________________________]             │
│  Interview type* [Technical                        ▼]            │
│                  Selects the default criteria pool               │
│                  ⚠ Changing type resets criteria to type defaults│
│                                                                   │
│  SCORING THRESHOLDS                                               │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Passing score   [70] /100     Minimum to pass           │    │
│  │  Strong hire     [85] /100     Bar for Strong Hire       │    │
│  │  Human review    [55] to [69]  Zone for manual review    │    │
│  │                                                           │    │
│  │  ⚠ Passing score must be less than Strong hire score     │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  EVALUATION CRITERIA                  Total weight: [100 / 100 ✓]│
│                                       ▲ Must equal exactly 100%  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ Correctness                          [30] % [−]          │     │
│  │ Technical accuracy of answers.                           │     │
│  ├─────────────────────────────────────────────────────────┤     │
│  │ Depth                                [20] % [−]          │     │
│  │ Ability to explain tradeoffs.                            │     │
│  ├─────────────────────────────────────────────────────────┤     │
│  │ Practical Experience                 [20] % [−]          │     │
│  ├─────────────────────────────────────────────────────────┤     │
│  │ Problem Solving                      [15] % [−]          │     │
│  ├─────────────────────────────────────────────────────────┤     │
│  │ Communication                        [15] % [−]          │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  [+ Add criterion ▼]          [⟳ Auto-balance weights]          │
│  (opens picker of unused criteria for this type)                  │
│                                                                   │
│  ☐ Set as default rubric for Technical interviews                │
│                                                                   │
│  [Cancel]                              [Save Rubric]             │
│                ↑ disabled when total weight ≠ 100%               │
└─────────────────────────────────────────────────────────────────┘
```

### Interview type → criteria flow

```
User selects interview type
         │
         ▼
Load from options.interview_type_criteria[selected_type]
         │
         ├── If type is one of 7 enums → pre-fill with that type's recommended criteria
         │   (weights already sum to 100)
         │
         └── If type is "custom" / null → show all 15 criteria from options.scoring_rubric.criteria
             User must manually assign weights (total must equal 100 before saving)
```

### Weight total indicator states

| Total | Indicator | Save button |
|-------|-----------|-------------|
| = 100% | `100 / 100 ✓` (green) | Enabled |
| < 100% | `85 / 100 ⚠ Add 15% more` (orange) | Disabled |
| > 100% | `110 / 100 ✗ Remove 10%` (red) | Disabled |

### Add Criterion picker

When user clicks `[+ Add criterion]`:

```
┌─────────────────────────────────────────┐
│ Add Criterion                       [×] │
│                                         │
│ ○ System Design                         │
│   Architecture, scaling, reliability... │
│                                         │
│ ○ Debugging Ability                     │
│   Diagnose failures and reason through  │
│                                         │
│ ○ Tradeoff Reasoning                    │
│   Compare alternatives and risks        │
│ ...                                     │
│                 [Add selected]  [Cancel] │
└─────────────────────────────────────────┘
```

- Shows only criteria NOT already in the rubric
- For typed rubrics: shows remaining criteria from the type's pool first, then "Other available criteria"
- For custom rubrics: shows all 15 criteria from `options.scoring_rubric.criteria`
- New criteria are added with `weight_percent: 0` — user must assign weight

### Auto-balance

When user clicks `[⟳ Auto-balance weights]`:
- Divides 100 evenly across all criteria
- If 100 is not divisible evenly, distribute remainder to the first criteria (e.g., 5 criteria → 20/20/20/20/20; 4 criteria → 25/25/25/25; 3 criteria → 34/33/33)

### Endpoints used

| Action | Endpoint | Body |
|--------|----------|------|
| Load options | `GET /api/interview-configs/options` | — |
| Load existing | `GET /api/interview-configs/scoring-rubrics/{id}?tenant_id=xxx` | — |
| Create | `POST /api/interview-configs/scoring-rubrics` | See below |
| Update | `PUT /api/interview-configs/scoring-rubrics/{id}?tenant_id=xxx` | See below |

### Create request body

```json
{
  "tenant_id": "tenant_xyz",
  "name": "Senior Technical Rubric",
  "is_default": false,
  "status": "active",
  "config": {
    "interview_type": "technical",
    "name": "Senior Technical Rubric",
    "passing_score": 75,
    "strong_hire_score": 90,
    "human_review_min": 60,
    "human_review_max": 74,
    "criteria": [
      { "criterion_key": "correctness",         "label": "Correctness",         "description": "Technical accuracy of answers.",                       "weight_percent": 25 },
      { "criterion_key": "system_design",       "label": "System Design",        "description": "Architecture, scaling, reliability, and component design.", "weight_percent": 25 },
      { "criterion_key": "depth",               "label": "Depth",               "description": "Ability to explain tradeoffs and underlying concepts.", "weight_percent": 20 },
      { "criterion_key": "problem_solving",     "label": "Problem Solving",      "description": "Debugging, reasoning, and approach quality.",          "weight_percent": 20 },
      { "criterion_key": "communication",       "label": "Communication",        "description": "Clarity and structure of explanation.",                "weight_percent": 10 }
    ]
  }
}
```

### Update request body (partial update)

```json
{
  "name": "Senior Technical Rubric (Updated)",
  "is_default": true,
  "config": {
    "interview_type": "technical",
    "name": "Senior Technical Rubric (Updated)",
    "passing_score": 75,
    "strong_hire_score": 90,
    "human_review_min": 60,
    "human_review_max": 74,
    "criteria": [
      { "criterion_key": "correctness",     "label": "Correctness",     "description": "Technical accuracy of answers.",                       "weight_percent": 30 },
      { "criterion_key": "system_design",   "label": "System Design",    "description": "Architecture, scaling, reliability, and component design.", "weight_percent": 25 },
      { "criterion_key": "depth",           "label": "Depth",           "description": "Ability to explain tradeoffs and underlying concepts.", "weight_percent": 20 },
      { "criterion_key": "problem_solving", "label": "Problem Solving",  "description": "Debugging, reasoning, and approach quality.",          "weight_percent": 15 },
      { "criterion_key": "communication",   "label": "Communication",    "description": "Clarity and structure of explanation.",                "weight_percent": 10 }
    ]
  }
}
```

### API error responses

#### Weight ≠ 100 → 422

```json
{
  "detail": "scoring rubric criteria weight_percent total must equal 100"
}
```

#### passing_score > strong_hire_score → 422

```json
{
  "detail": "passing_score must be less than or equal to strong_hire_score"
}
```

#### human_review range inverted → 422

```json
{
  "detail": "human_review_min must be less than or equal to human_review_max"
}
```

### Field validations

| Field | Rule |
|-------|------|
| `name` | Required, 3–100 chars |
| `interview_type` | One of the 7 enum values or null (custom) |
| `passing_score` | Integer 0–100 |
| `strong_hire_score` | Integer 0–100, must be ≥ `passing_score` |
| `human_review_min` | Integer 0–100 |
| `human_review_max` | Integer 0–100, must be ≥ `human_review_min` |
| `criteria` | At least 1 criterion required |
| `criteria[].weight_percent` | Integer 0–100, per row |
| Sum of all `weight_percent` | Must equal exactly 100 — block save and show error if not |

---

## Inline Scoring Rubric Selector Component

Appears inside interview launch / prepare request forms.

```
Scoring Rubric
[Technical Interview Rubric (Default)          ▼]

  Pass ≥ 70 · Strong hire ≥ 85 · 5 criteria    [Preview] [Change]
```

### "Change" opens a modal

```
┌──────────────────────────────────────────────────────┐
│ Select Scoring Rubric for Technical Interview   [×]   │
│                                                       │
│ Filter: [Technical ▼] [Search...        ]             │
│                                                       │
│ ● Default Technical Rubric       [Default]            │
│   Pass ≥ 70  ·  5 criteria                          │
│                                                       │
│ ○ Senior Technical Rubric                            │
│   Pass ≥ 75  ·  5 criteria                          │
│                                                       │
│                     [Cancel]  [Use selected rubric]  │
└──────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
App mount
  │
  ├── GET /api/interview-configs/options
  │     → store in React context / Zustand as `configOptions`
  │     → never re-fetch unless user explicitly refreshes
  │
  ├── Persona Library mount
  │     → GET /api/interview-configs/personas?tenant_id=xxx
  │     → render system presets (tenant_id==='system') + tenant personas
  │
  ├── Rubric Library mount
  │     → active tab = 'technical'
  │     → GET /api/interview-configs/scoring-rubrics?tenant_id=xxx&interview_type=technical
  │     → on tab switch → fetch that type lazily (cache per type)
  │
  └── Rubric Form mount (new)
        → read interview_type from URL query param (pre-select tab origin)
        → load configOptions.interview_type_criteria[type] → pre-fill criteria
        → weight total = sum(criteria.weight_percent) → validate live
```

---

## Complete Endpoint Summary

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/interview-configs/options` | All dropdowns + defaults + type criteria |
| 2 | GET | `/api/interview-configs/personas?tenant_id=xxx` | List personas (includes system) |
| 3 | GET | `/api/interview-configs/personas/{id}?tenant_id=xxx` | Get single persona |
| 4 | POST | `/api/interview-configs/personas` | Create persona |
| 5 | PUT | `/api/interview-configs/personas/{id}?tenant_id=xxx` | Update persona |
| 6 | POST | `/api/interview-configs/personas/{id}/set-default?tenant_id=xxx` | Set default |
| 7 | POST | `/api/interview-configs/personas/{id}/clone?tenant_id=xxx&new_name=...` | Clone |
| 8 | POST | `/api/interview-configs/personas/{id}/archive?tenant_id=xxx` | Archive |
| 9 | GET | `/api/interview-configs/scoring-rubrics?tenant_id=xxx&interview_type=technical` | List rubrics filtered by type |
| 10 | GET | `/api/interview-configs/scoring-rubrics/{id}?tenant_id=xxx` | Get single rubric |
| 11 | POST | `/api/interview-configs/scoring-rubrics` | Create rubric (server validates weights=100) |
| 12 | PUT | `/api/interview-configs/scoring-rubrics/{id}?tenant_id=xxx` | Update rubric |
| 13 | POST | `/api/interview-configs/scoring-rubrics/{id}/set-default?tenant_id=xxx` | Set type default |
| 14 | POST | `/api/interview-configs/scoring-rubrics/{id}/clone?tenant_id=xxx&new_name=...` | Clone |
| 15 | POST | `/api/interview-configs/scoring-rubrics/{id}/archive?tenant_id=xxx` | Archive |
