# Requirement-to-OpenSpec Skill

The `requirement-to-openspec` skill transforms software project requirement documents (PDF, DOCX, XLSX, Markdown, TXT) into a structured OpenSpec planning document (`openspec/planning.md`). It bridges the gap between high-level stakeholder specifications and actionable OpenSpec changes.

---

## Overview

When building non-trivial features or entire systems, requirements often arrive as PRDs, SRS documents, spreadsheets, or briefs. The `requirement-to-openspec` skill enables your AI coding assistant to:

1. **Ingest and analyze** requirement documents end-to-end.
2. **Detect gaps**, ambiguities, missing validations, and unhandled edge cases.
3. **Clarify critical unknowns** through interactive dialogue.
4. **Decompose scope** into right-sized, bounded OpenSpec specifications.
5. **Establish dependencies** and sequential/parallel development paths.
6. **Generate executable proposal prompts** tailored for `openspec propose <spec-name>` (or `/opsx:propose <spec-name>`).
7. **Persist `openspec/planning.md`** as the single source of truth for planning and subsequent implementation.

---

## Installation

The skill is **automatically installed** into your project whenever you run:

```bash
openspec init
```

OpenSpec places the complete skill structure (instructions, templates, guidelines, and reference examples) into the appropriate project skills directory for your selected AI assistant (e.g., `.agents/skills/requirement-to-openspec/`, `.claude/skills/requirement-to-openspec/`, or `.cursor/skills/requirement-to-openspec/`).

### User Customizations Preserved

If you customize the skill instructions or templates (e.g. `final-planning-template.md`), subsequent runs of `openspec init` in extend mode will **preserve your modifications** rather than overwriting them. Use `openspec init --force` if you intentionally want to reset to the default templates.

---

## How It Works: The 8-Step Workflow

```text
Requirement Document (PDF / DOCX / XLSX / MD / TXT)
                      │
                      ▼
 1. Document Analysis (Extract FR, NFR, BR, INT)
                      │
                      ▼
 2. Gap Identification (Ambiguities, missing logic)
                      │
                      ▼
 3. Interactive Clarification (Structured Q&A)
                      │
                      ▼
 4. Baseline Confirmation (Sign-off gate)
                      │
                      ▼
 5. Specification Sizing (Bounded contexts & acceptance criteria)
                      │
                      ▼
 6. Dependency & Order Planning (Topological sequencing)
                      │
                      ▼
 7. Proposal Prompt Generation (Tailored for openspec propose)
                      │
                      ▼
 8. Persist openspec/planning.md
                      │
                      ▼
    Next: openspec propose <spec-name> ──► openspec apply
```

---

## Invoking the Skill

After initializing OpenSpec in your project, ask your AI coding assistant in chat:

> *"Here is our requirement document: `docs/requirements.pdf`. Use the `requirement-to-openspec` skill to analyze it, clarify any questions, and generate our `openspec/planning.md` document."*

The assistant will read the document, ask any clarification questions, and persist `openspec/planning.md`.

---

## Transitioning to Implementation

Once `openspec/planning.md` is generated, each identified specification includes a self-contained proposal prompt. You can execute each prompt directly:

```bash
# In chat:
/opsx:propose <spec-name>

# Or in terminal:
openspec propose <spec-name>
```

This creates the delta specification and task checklist (`proposal.md`, `specs/...`, `tasks.md`), which you can then implement with `/opsx:apply`.

