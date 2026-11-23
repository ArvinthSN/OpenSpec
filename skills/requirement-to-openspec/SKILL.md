---
name: requirement-to-openspec
description: >
  Converts software project requirement documents (PDF, DOCX, XLSX, Markdown, TXT) into
  comprehensive OpenSpec specification planning documents. Use this skill when the user
  provides a requirements document and wants to generate structured OpenSpec proposals,
  specification breakdowns, and implementation plans.
---

# Requirement to OpenSpec

Transform a software project requirements document into a complete, structured **OpenSpec specification planning document** — ready for implementation by development teams or AI agents.

## Input

The user must provide a **requirement document** in one of the supported formats: **PDF, DOCX, XLSX, Markdown, or TXT**.

## Output

The skill MUST write the output directly to local storage as `openspec/planning.md` (or `planning.md` in the project root if `openspec/` is not yet present). The file must persist on disk and contain the complete requirement analysis, with primary emphasis on:
1. **Justified Specification Count & Sizing:** How many specifications to create, why that exact number was chosen, and their bounded scopes.
2. **Actionable Proposal Prompts for `propose` Command:** Individual prompts for every specification tailored for immediate execution with `openspec propose <spec-name>` or `/opsx:propose <spec-name>`.

## Workflow

Follow these steps **in order**. Each step must complete before the next begins.

### 1. Document Analysis

Read the uploaded document end-to-end. Extract and categorise every requirement:

- Functional requirements, non-functional requirements, business rules
- User roles and permissions
- Workflows and process flows
- Domain entities and data models
- Integration points and external systems
- Constraints, assumptions, and dependencies

Assign a **unique ID** to every requirement using the prefixes `FR-`, `NFR-`, `BR-`, `INT-` (e.g., `FR-001`, `NFR-003`).

See [requirement-analysis.md](./references/requirement-analysis.md) for detailed analysis guidance.

### 2. Missing Information Identification

Scan the extracted requirements for:

- Ambiguities and vague language
- Incomplete or conflicting requirements
- Missing business rules and validation logic
- Unclear workflows or decision points
- Unspecified error handling and edge cases
- Unclear integration contracts
- Missing security and compliance requirements

### 3. Interactive Clarification

Present questions to the user in **manageable groups**. Each question must include:

| Field | Description |
|---|---|
| **Question ID** | Unique identifier (e.g., `Q-001`) |
| **Section** | The requirement area it relates to |
| **What's unclear** | The specific gap or ambiguity |
| **Why it matters** | Impact on the specification if left unresolved |
| **Suggested options** | Reasonable defaults or choices to speed resolution |

Maintain a **clarification log** of all questions asked and answers received. Repeat until all **critical ambiguities** are resolved.

### 4. Consolidated Requirement Understanding

Present a full summary of the project understanding back to the user. Clearly distinguish:

- **Original** requirements (verbatim from the document)
- **Clarified** requirements (resolved through Q&A)
- **Assumed** requirements (inferred; flagged for user review)

> **Do not proceed until the user explicitly confirms this understanding.**

### 5. Specification Identification & Sizing

Determine the appropriate number of OpenSpec specifications. Do not use a fixed or arbitrary number. Justify why this exact number of specs is optimal (preventing both monoliths and over-fragmentation).

Break the project into discrete OpenSpec specifications based on functional modules, business capabilities, workflows, and technical layers (frontend, backend, database, integrations, security, testing). Each specification must have a clear purpose and implementation boundary.

Each specification must include:

| Attribute | Description |
|---|---|
| Spec ID | Unique identifier (e.g., `SPEC-001`) |
| Name | Short, descriptive name (kebab-case) |
| Description | What this spec covers |
| Business Value | Why it matters to stakeholders |
| Requirements Covered | List of requirement IDs (FR-xxx, NFR-xxx, etc.) |
| Scope / Out-of-Scope | Clear, unambiguous boundaries |
| Dependencies | Other specs this depends on |
| Priority | High / Medium / Low |
| Complexity | Sizing and effort estimate (High / Medium / Low with rationale) |
| Deliverables | Tangible outputs |
| Acceptance Criteria | How completion is verified |
| Implementation Order | Suggested sequence position |

See [specification-breakdown.md](./references/specification-breakdown.md) for decomposition strategies and sizing heuristics.

### 6. Dependency & Development Planning

Produce:

- A **dependency matrix** mapping inter-spec dependencies
- **Parallel development** opportunities (specs with no blocking dependencies)
- **Sequential requirements** (specs that must be built in order)
- **Critical foundational specs** that unblock the most downstream work

If the user mentions a team size, optionally propose a **task allocation plan**.

### 7. Generate Individual OpenSpec Proposal Prompts (for `propose` Command)

For **each** identified specification, generate a detailed, **ready-to-use AI agent prompt specifically designed for the OpenSpec `propose` command** (`openspec propose <change-name>` or `/opsx:propose <change-name>`).

Each prompt must provide complete, self-contained context so an AI coding agent can execute the proposal workflow without asking questions:
1. Exact command invocation syntax (`openspec propose <spec-name>` or `/opsx:propose <spec-name>`)
2. Context discovery instructions (inspect existing files, read `openspec/config.yaml`, review existing specs)
3. Full verbatim text of all mapped requirements (FR, NFR, BR, INT) — not just IDs
4. Scope boundaries (In-Scope vs Out-of-Scope)
5. Mandatory OpenSpec artifact generation instructions:
   - `proposal.md` with why/what, impact, affected capabilities
   - Delta specs under `specs/<capability>/spec.md` with RFC 2119 keywords (`SHALL`, `MUST`, `SHOULD`) and BDD `GIVEN/WHEN/THEN` scenarios (covering happy path, error paths, and edge cases)
   - `design.md` for architectural contracts, data models, and component flows
   - `tasks.md` with sequential, atomic checkbox checklist
6. Validation rules to prevent requirement duplication or implementation leakage

> **Prompts must be specific to each spec** — never generic templates.

See [prompt-generation-guidelines.md](./references/prompt-generation-guidelines.md) for prompt authoring rules.

### 8. Generate and Persist Final Planning Document in Local Storage

The AI agent MUST write the output directly into local storage as:
`openspec/planning.md` (or `planning.md` in the workspace root if `openspec/` is not yet created).

Use file creation tools (`write_file`) to persist this file on disk. The document must contain all **25 sections** — from Executive Summary through Final Recommendations — with primary focus on the **justified specification count and breakdown** and the **individual prompts for the `propose` command**.

The generated `planning.md` serves as the authoritative blueprint and input for subsequent OpenSpec workflows: each proposed specification prompt can be executed with `openspec propose <spec-name>` (or `/opsx:propose <spec-name>`), transitioning directly into OpenSpec proposal and implementation (`apply`).

See [final-planning-template.md](./templates/final-planning-template.md) for the full section list and structure.

## Requirement Traceability

Every extracted requirement **must** be:

1. Assigned a unique ID (`FR-001`, `NFR-001`, `BR-001`, `INT-001`)
2. Mapped to at least one specification
3. Traceable from source document → requirement → specification → prompt

Flag any **unmapped requirements** — they indicate gaps in specification coverage.

## Quality Rules

These rules are **non-negotiable** throughout the entire workflow:

1. **Local storage file generation** — Always write `openspec/planning.md` (or `planning.md` in the project root) to disk in local storage; never merely display output in chat.
2. **Understand before generating** — read the full document before producing any output.
3. **Ask before assuming** — when in doubt, clarify with the user.
4. **Never hallucinate requirements** — every requirement must trace to the source document or an explicit user clarification.
5. **Preserve original business intent** — do not reinterpret or dilute the user's goals.
6. **Maintain traceability** — every requirement maps to a spec; every spec maps back to requirements.
7. **Justified specification count** — explicitly justify why the chosen number of specs is optimal.
8. **Avoid spec fragmentation** — group related functionality into cohesive specs; do not over-split.
9. **Clear implementation boundaries** — each spec's scope and out-of-scope must be unambiguous.
10. **Actionable prompts for `propose`** — generated prompts must be immediately executable with `openspec propose` or `/opsx:propose`.
11. **Follow OpenSpec conventions** — use GIVEN/WHEN/THEN scenarios, RFC 2119 keywords (MUST, SHOULD, MAY), delta specs, and `proposal.md` structure. See [openspec-guidelines.md](./references/openspec-guidelines.md).
12. **Domain-independent** — do not assume any technology stack unless the user specifies one.
13. **No final document before user confirmation** — always get explicit sign-off at Step 4 before generating specs and the planning document.

## References

- [Requirement Analysis Guidance](./references/requirement-analysis.md)
- [OpenSpec Conventions & Proposal Workflow](./references/openspec-guidelines.md)
- [Specification Breakdown Strategies](./references/specification-breakdown.md)
- [Prompt Generation Guidelines](./references/prompt-generation-guidelines.md)

## Templates

- [Requirement Analysis Template](./templates/requirement-analysis-template.md)
- [Specification Template](./templates/specification-template.md)
- [Final Planning Document Template](./templates/final-planning-template.md)
