# requirement-to-openspec

> **A Production-Ready AI Skill for Spec-Driven Development (SDD)**  
> Transforms software project requirement documents (PDF, DOCX, XLSX, Markdown, TXT) into structured, comprehensive **OpenSpec** specification planning documents.

---

## Overview

Modern software development with AI agents requires strict alignment between business intent and technical execution. The `requirement-to-openspec` skill automates the critical bridge between unstructured stakeholder requirements and deterministic, machine-parseable OpenSpec proposals.

It executes a rigorous 8-step workflow:
1. **Document Analysis:** Deep extraction across functional requirements, non-functional requirements, business rules, workflows, data models, and integrations.
2. **Missing Information Identification:** Automated gap detection (ambiguities, missing validations, unhandled errors, security gaps).
3. **Interactive Clarification:** Structured, low-friction Q&A with stakeholders with running clarification logs.
4. **Consolidated Understanding:** Sign-off gate establishing the baseline.
5. **Specification Identification:** Bounded capability decomposition avoiding both fragmentation and monoliths.
6. **Dependency & Resource Planning:** Topological dependency sequencing and parallel development streams.
7. **Proposal Prompt Generation:** Bespoke, ready-to-run prompts for AI coding agents to create OpenSpec proposals.
8. **Final Planning Document Generation:** Structured OpenSpec planning document saved to `openspec/planning.md` (or `planning.md`) featuring 25 standardized sections.

---

## Directory Structure

```
requirement-to-openspec/
├── SKILL.md                                 # Skill entry point (workflow, rules, progressive disclosure)
├── README.md                                # Skill documentation and quick start
├── TEST_VALIDATION_REPORT.md                # 7-scenario validation results & capability limits
├── references/
│   ├── requirement-analysis.md              # In-depth requirement extraction & gap detection
│   ├── openspec-guidelines.md               # OpenSpec architecture, delta specs & BDD formats
│   ├── specification-breakdown.md           # Decomposition heuristics & dependency analysis
│   └── prompt-generation-guidelines.md      # Rules for authoring actionable AI proposal prompts
├── templates/
│   ├── requirement-analysis-template.md     # Template for consolidated requirement baseline
│   ├── specification-template.md            # Template for individual specification definitions
│   └── final-planning-template.md           # Master 25-section final planning document template
└── examples/
    └── sample-output.md                     # Complete end-to-end LMS platform reference output
```

---

## Installation & Portability

This skill is designed following open AI skill conventions and is **automatically installed** into your project when initializing OpenSpec via `openspec init`.

It is also **100% portable** across major AI coding assistants and environments:

### 1. OpenSpec Initialization (Automatic)
- Simply run `openspec init` in your project and select your preferred AI assistants. OpenSpec installs `requirement-to-openspec` along with the core workflow skills into your assistant's project skills directory (such as `.agents/skills/`, `.claude/skills/`, `.cursor/skills/`, etc.).

### 2. Manual / Global Installation
- **Antigravity / Universal:** Copy the `requirement-to-openspec/` directory to `.agents/skills/requirement-to-openspec/` or `~/.gemini/config/skills/requirement-to-openspec/`.
- **Claude Code:** Copy to `.claude/skills/requirement-to-openspec/`.
- **Cursor / GitHub Copilot:** Place under `.cursor/skills/requirement-to-openspec/` or `.github/skills/requirement-to-openspec/`.

---

## Usage

1. Initialize OpenSpec in your project:
   ```bash
   openspec init
   ```
2. Open your AI agent session.
3. Provide your requirement document:
   > *"Here is our project requirement document: `docs/project-requirements.docx`. Use the `requirement-to-openspec` skill to analyze it, clarify any open questions, and generate our OpenSpec planning document."*
4. The AI agent will ingest the file, extract requirements, and initiate the interactive clarification dialogue.
5. Review and approve the consolidated understanding.
6. The agent generates `openspec/planning.md` containing all specifications, matrices, and proposal prompts.
7. Proceed to propose changes using the prompts generated in `planning.md` via `openspec propose <spec-name>` or `/opsx:propose <spec-name>`.

