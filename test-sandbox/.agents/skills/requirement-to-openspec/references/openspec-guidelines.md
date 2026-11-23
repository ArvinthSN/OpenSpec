# OpenSpec Guidelines Reference

This document is the authoritative reference for OpenSpec conventions, specification structure, and proposal workflow. AI agents and human authors MUST follow these guidelines when creating, reviewing, or modifying OpenSpec artifacts.

---

## 1. OpenSpec Framework Overview

**OpenSpec** is a lightweight, configuration-driven framework for **Spec-Driven Development (SDD)**. It provides a structured, repeatable process for defining *what* a system should do before deciding *how* to build it.

### Core Principles

| Principle | Description |
|---|---|
| **Specifications as Source of Truth** | Specifications are the single, authoritative source of truth for system behavior. Code implements specs; specs do not document code. |
| **Markdown-Native** | All specifications are written in Markdown (`.md`) with a strict header and block structure, ensuring readability by both humans and machines. |
| **Machine-Parseable** | The rigid structure makes specs deterministic for AI agents and parseable by tooling — linters, generators, and validators can operate on them programmatically. |
| **Behavior-First** | Specifications describe *observable, external behavior* — what a user or external system experiences. They never prescribe internal architecture, data structures, or technology choices. |
| **Change-Tracked** | All modifications flow through a formal proposal and delta-spec process, ensuring traceability from requirement to implementation. |

### When to Use OpenSpec

- Starting a new project or capability from requirements
- Adding features to an existing system
- Modifying or deprecating existing behavior
- Documenting system behavior for handoff or audit
- Generating implementation tasks from requirements

---

## 2. Specification File Structure

Every OpenSpec project follows this canonical directory layout:

```
openspec/
├── config.yaml              # Project-level configuration
├── specs/                   # Main specifications (source of truth)
│   ├── user-auth/
│   │   └── spec.md          # Specification for user authentication
│   ├── billing/
│   │   └── spec.md          # Specification for billing
│   └── notifications/
│       └── spec.md          # Specification for notifications
└── changes/                 # Active change workspace
    └── add-password-reset/
        ├── .openspec.yaml   # Change-level metadata
        ├── proposal.md      # Why this change exists
        ├── specs/           # Delta specs (what changes)
        │   └── user-auth/
        │       └── spec.md  # Delta spec for user-auth
        ├── design.md        # How to implement (optional)
        └── tasks.md         # Step-by-step execution plan
```

### Directory Roles

| Directory / File | Purpose |
|---|---|
| `config.yaml` | Defines project name, version, capabilities, conventions, and AI agent instructions. |
| `specs/` | Contains the **current, approved** specifications. Each capability or bounded context gets its own subfolder with a `spec.md`. These files represent the merged, up-to-date truth. |
| `changes/` | The **active workspace** for in-progress changes. Each change gets a descriptively named subfolder (e.g., `add-password-reset`, `fix-billing-rounding`). |
| `changes/<name>/.openspec.yaml` | Metadata for this specific change (change ID, status, linked proposal). |
| `changes/<name>/proposal.md` | The business case — *why* this change is being made and *what* it affects. |
| `changes/<name>/specs/` | Delta specifications — *what requirements* are being added, modified, or removed. Mirrors the `specs/` structure. |
| `changes/<name>/design.md` | Technical design — *how* the change will be implemented. Optional for trivial changes. |
| `changes/<name>/tasks.md` | Implementation checklist — the ordered, atomic steps to execute the change. |

### Key Rules

- **One spec per capability/module.** Never combine unrelated capabilities into a single `spec.md`.
- **Mirror structure in changes.** Delta specs under `changes/<name>/specs/` must mirror the path structure of `specs/`. If you are modifying `specs/user-auth/spec.md`, the delta goes in `changes/<name>/specs/user-auth/spec.md`.
- **Never edit `specs/` directly.** All changes flow through the `changes/` workspace and are merged into `specs/` only after approval.

---

## 3. Specification Markdown Format

Every `spec.md` file follows a rigid Markdown structure. Deviation from this structure makes the spec unparseable by tooling and ambiguous for AI agents.

### Full Template

```markdown
# <Capability Name>

## Purpose

<One to three paragraphs explaining what this capability does and why it exists.
Focus on the business value and user-facing behavior. Do not mention technologies
or implementation details.>

## Requirements

### Requirement: <Requirement Name>

<A concise statement of the requirement using RFC 2119 keywords.
Example: "The system SHALL allow users to reset their password via email.">

#### Scenario: <Scenario Name>

- **Given** <precondition — the initial state of the system or user>
- **When** <action — what the user or system does>
- **Then** <expected outcome — what MUST happen>
- **And** <additional outcome — optional, for compound assertions>

#### Scenario: <Another Scenario Name>

- **Given** <precondition>
- **When** <action>
- **Then** <expected outcome>

### Requirement: <Another Requirement Name>

<Requirement statement.>

#### Scenario: <Scenario Name>

- **Given** <precondition>
- **When** <action>
- **Then** <expected outcome>
```

### Header Hierarchy

| Level | Usage | Example |
|---|---|---|
| `#` (H1) | Document title — the capability or subsystem name | `# User Authentication` |
| `## Purpose` | Purpose section — exactly one per spec | `## Purpose` |
| `## Requirements` | Requirements section — exactly one per spec | `## Requirements` |
| `### Requirement: <name>` | Individual requirement block | `### Requirement: Password Reset via Email` |
| `#### Scenario: <name>` | Behavioral scenario within a requirement | `#### Scenario: Valid Email Submitted` |

### RFC 2119 Keywords

Specifications use [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) keywords to indicate obligation levels. These keywords MUST be written in **UPPERCASE** when used normatively:

| Keyword | Meaning |
|---|---|
| **SHALL** / **MUST** | Absolute requirement. The system is non-compliant if this is violated. |
| **SHALL NOT** / **MUST NOT** | Absolute prohibition. The system is non-compliant if this occurs. |
| **SHOULD** | Recommended. May be omitted with documented justification. |
| **SHOULD NOT** | Discouraged. May be done with documented justification. |
| **MAY** | Optional. Implementer's discretion. |

### Scenario Format Rules

1. Every scenario MUST have at least **Given**, **When**, and **Then** clauses.
2. **And** clauses are optional and extend the preceding clause type (typically **Then**).
3. Each clause MUST be a single bullet point starting with the bolded keyword.
4. Preconditions (**Given**) describe the system state *before* the action.
5. Actions (**When**) describe what the user or external system does.
6. Outcomes (**Then** / **And**) describe the *observable, verifiable* result.
7. Scenarios MUST NOT reference implementation details (database tables, API endpoints, class names).

### Requirement Writing Rules

- **Be specific.** "The system SHALL send a password reset email within 30 seconds" — not "The system should handle password resets."
- **Be testable.** Every requirement must be verifiable by an automated test or a manual test procedure.
- **Be behavioral.** Describe what the user or external system observes, not what happens inside the code.
- **One behavior per requirement.** If a requirement describes two independent behaviors, split it into two requirements.
- **No implementation leakage.** Never mention database schemas, API routes, framework names, or architectural patterns in a requirement unless the requirement is explicitly about an external API contract.

### Example Specification

```markdown
# User Authentication

## Purpose

The User Authentication capability allows users to create accounts, sign in,
and manage their credentials. It ensures that only authenticated users can
access protected resources and that credentials are handled securely.

## Requirements

### Requirement: User Registration

The system SHALL allow new users to register with an email address and password.
The system MUST reject registration if the email is already associated with an
existing account.

#### Scenario: Successful Registration

- **Given** no account exists with the email "user@example.com"
- **When** a user submits registration with email "user@example.com" and a valid password
- **Then** the system creates a new account for "user@example.com"
- **And** the system sends a verification email to "user@example.com"
- **And** the system returns a success confirmation

#### Scenario: Duplicate Email Rejected

- **Given** an account already exists with the email "user@example.com"
- **When** a user submits registration with email "user@example.com"
- **Then** the system rejects the registration
- **And** the system returns an error indicating the email is already in use

### Requirement: Password Complexity

The system SHALL enforce a minimum password length of 8 characters. The system
SHOULD require at least one uppercase letter, one lowercase letter, and one digit.

#### Scenario: Password Too Short

- **Given** a user is registering or changing their password
- **When** the user submits a password shorter than 8 characters
- **Then** the system rejects the password
- **And** the system returns an error indicating the minimum length requirement

#### Scenario: Valid Complex Password

- **Given** a user is registering or changing their password
- **When** the user submits a password of 8 or more characters with mixed case and digits
- **Then** the system accepts the password
```

---

## 4. Proposal Document Structure (`proposal.md`)

The proposal is the **business case** for a change. It answers *why* and *what*, not *how*. Every change in `openspec/changes/` MUST have a `proposal.md`.

### Required Fields

```markdown
# Proposal: <Change Title>

## Metadata

| Field | Value |
|---|---|
| **Change ID** | `<kebab-case-identifier>` |
| **Author** | `<Name or team>` |
| **Status** | `Draft` / `Under Review` / `Approved` |
| **Created** | `<YYYY-MM-DD>` |
| **Last Updated** | `<YYYY-MM-DD>` |

## Goal

<What capability or behavior is being introduced, changed, or removed.
One to three sentences. Focus on the user-visible outcome.>

## Motivation

<Why this change is needed. Business context, user feedback, compliance
requirement, or technical debt that motivates the work.>

## User / System Impact

<How this change affects end users, administrators, or external systems.
Include changes to workflows, UI, API contracts, or data formats.>

## Affected Capabilities

<List the existing specifications that this change touches.>

- `specs/user-auth/spec.md` — Adding password reset flow
- `specs/notifications/spec.md` — Adding email notification for reset

## Breaking Changes

<Describe any breaking changes to existing behavior, APIs, or data formats.
Write "None" if there are no breaking changes.>

## Out of Scope

<Explicitly list what this change does NOT cover. This prevents scope creep
and sets clear boundaries for reviewers and implementers.>

- Two-factor authentication (separate proposal)
- OAuth/SSO integration (future work)
```

### Field Rules

| Field | Rules |
|---|---|
| **Change ID** | Kebab-case, descriptive, unique within the project. Examples: `add-password-reset`, `fix-billing-rounding`, `remove-legacy-login`. |
| **Author** | The person or team responsible for the proposal. |
| **Status** | One of exactly three values: `Draft`, `Under Review`, `Approved`. No other statuses. |
| **Goal** | Must describe the *what*, not the *how*. No technology or architecture references. |
| **User / System Impact** | Must describe impact from the *user's or external system's perspective*. |
| **Affected Capabilities** | Must list file paths relative to the `openspec/` root. |
| **Breaking Changes** | Must be explicit. "None" is acceptable. Never leave blank. |
| **Out of Scope** | Must be explicit. Helps prevent scope creep during review and implementation. |

---

## 5. Delta Specification Format

Delta specs define **what changes** in existing specifications. They live in `changes/<name>/specs/` and mirror the directory structure of `specs/`.

A delta spec is a specialized `spec.md` that explicitly categorizes every requirement as **ADDED**, **MODIFIED**, or **REMOVED**.

### Structure

```markdown
# <Capability Name> — Delta

## Change Reference

- **Change ID:** `<kebab-case-identifier>`
- **Base Spec:** `specs/<capability>/spec.md`

## ADDED Requirements

### Requirement: <New Requirement Name>

<Full requirement statement using RFC 2119 keywords.>

#### Scenario: <Scenario Name>

- **Given** <precondition>
- **When** <action>
- **Then** <expected outcome>

## MODIFIED Requirements

### Requirement: <Existing Requirement Name>

**Before:**
> <The original requirement statement, quoted verbatim.>

**After:**
<The updated requirement statement using RFC 2119 keywords.>

**Rationale:** <Why the requirement changed.>

#### Scenario: <Updated or New Scenario Name>

- **Given** <precondition>
- **When** <action>
- **Then** <expected outcome>

## REMOVED Requirements

### Requirement: <Deprecated Requirement Name>

**Original:**
> <The original requirement statement, quoted verbatim.>

**Rationale:** <Why this requirement is being removed.>

**Migration:** <What replaces it, or "No replacement — behavior is being discontinued.">
```

### Delta Rules

1. **Every change to behavior MUST be captured in a delta spec.** If a proposal says "add password reset," there must be a delta spec with ADDED requirements for password reset.
2. **MODIFIED requirements MUST show before/after.** The "Before" block quotes the original requirement verbatim so reviewers can see exactly what changed.
3. **REMOVED requirements MUST include rationale and migration path.** Never silently remove behavior.
4. **Omit empty sections.** If there are no MODIFIED requirements, omit the `## MODIFIED Requirements` section entirely. Do not include empty sections.
5. **Delta specs are temporary.** After approval and implementation, the delta is merged into the main `specs/` file and the change folder is archived.

---

## 6. Design Document (`design.md`)

The design document describes **how** the approved requirements will be implemented. It bridges the gap between specification (what) and code (how).

### When to Include

| Scenario | Design Document Required? |
|---|---|
| New capability with multiple components | **Yes** |
| Change affecting API contracts | **Yes** |
| Change involving security or data model modifications | **Yes** |
| Simple bug fix with obvious implementation | **No** — may be omitted |
| Trivial configuration change | **No** — may be omitted |

### Structure

```markdown
# Design: <Change Title>

## Change Reference

- **Change ID:** `<kebab-case-identifier>`
- **Proposal:** `proposal.md`

## Technical Approach

<High-level description of the implementation strategy. What components are
involved, how they interact, and what the overall architecture looks like.>

## API Contracts

<Define any new or modified API endpoints, message formats, or integration
points. Use code blocks for request/response examples.>

### <Endpoint or Interface Name>

- **Method:** `POST`
- **Path:** `/api/v1/password-reset`
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Password reset email sent."
  }
  ```

## Data Model Changes

<Describe any new entities, modified fields, or schema changes. Use tables
or diagrams for clarity.>

| Entity | Field | Type | Description |
|---|---|---|---|
| `PasswordResetToken` | `token` | `string` | Unique reset token |
| `PasswordResetToken` | `expires_at` | `datetime` | Token expiration |
| `PasswordResetToken` | `user_id` | `reference` | Linked user |

## Security Considerations

<Describe authentication, authorization, data protection, and threat
mitigation strategies relevant to this change.>

## Component Interaction

<Describe how components communicate. Use sequence descriptions or
diagrams to illustrate the flow.>

1. User submits email to the password reset endpoint.
2. Server generates a cryptographically secure token with a 1-hour expiry.
3. Server sends a reset email containing a link with the token.
4. User clicks the link, submits a new password with the token.
5. Server validates the token, updates the password, and invalidates the token.

## Constraints and Trade-offs

<Document any constraints (performance, compatibility, regulatory) and
trade-offs made during design. Explain why alternatives were rejected.>

- **Constraint:** Reset tokens must expire within 1 hour (compliance requirement).
- **Trade-off:** Using email-based reset instead of SMS — simpler implementation, broader reach, but less secure for compromised email accounts.
```

### Design Rules

1. The design MUST NOT introduce requirements — it only describes *how* to implement the requirements already defined in the delta specs.
2. API contracts in the design MUST be consistent with the behavioral requirements in the specs.
3. If the design reveals that a requirement is unimplementable or ambiguous, the spec must be updated first — the design does not override the spec.
4. Technology choices in the design are recommendations, not mandates, unless the project's `config.yaml` specifies technology constraints.

---

## 7. Tasks Document (`tasks.md`)

The tasks document is the **execution plan** — an ordered checklist of atomic, verifiable implementation steps. Implementation MUST NOT begin until `tasks.md` exists and is approved.

### Structure

```markdown
# Tasks: <Change Title>

## Change Reference

- **Change ID:** `<kebab-case-identifier>`
- **Proposal:** `proposal.md`
- **Design:** `design.md`

## Implementation Tasks

- [ ] <!-- id: 1 --> Create the `PasswordResetToken` data model with `token`, `expires_at`, and `user_id` fields
- [ ] <!-- id: 2 --> Implement token generation service using cryptographically secure random bytes
- [ ] <!-- id: 3 --> Create the `POST /api/v1/password-reset` endpoint to accept email and trigger token generation
- [ ] <!-- id: 4 --> Implement email sending for password reset with tokenized link
- [ ] <!-- id: 5 --> Create the `POST /api/v1/password-reset/confirm` endpoint to accept token and new password
- [ ] <!-- id: 6 --> Implement token validation logic (existence check, expiration check, single-use enforcement)
- [ ] <!-- id: 7 --> Write unit tests for token generation and validation
- [ ] <!-- id: 8 --> Write integration tests for the full password reset flow
- [ ] <!-- id: 9 --> Write scenario tests matching all GIVEN/WHEN/THEN scenarios from the delta spec
- [ ] <!-- id: 10 --> Update API documentation
```

### Task Rules

1. **Sequential by default.** Tasks are listed in dependency order. Each task may depend on those above it.
2. **Atomic.** Each task represents a single, completable unit of work. "Implement the whole feature" is not a valid task.
3. **Verifiable.** Each task has a clear definition of done. A reviewer (human or AI) can determine whether the task is complete by inspecting the result.
4. **ID-tagged.** Every task gets a unique HTML comment ID: `<!-- id: N -->`. This enables tooling to track task completion programmatically.
5. **Checkbox format.** Use `- [ ]` for incomplete and `- [x]` for completed tasks.
6. **Scenario coverage.** There MUST be at least one task that writes tests corresponding to each scenario in the delta spec.
7. **No orphan tasks.** Every task must trace back to a requirement in the delta spec or a technical necessity described in the design document.

---

## 8. OpenSpec Configuration (`config.yaml`)

The `config.yaml` file at the root of the `openspec/` directory provides project-level configuration.

### Structure

```yaml
project:
  name: "<Project Name>"
  version: "<Semantic Version>"
  description: "<Brief project description>"

capabilities:
  - name: "user-auth"
    description: "User authentication and credential management"
    spec: "specs/user-auth/spec.md"
  - name: "billing"
    description: "Subscription billing and payment processing"
    spec: "specs/billing/spec.md"
  - name: "notifications"
    description: "Email and push notification delivery"
    spec: "specs/notifications/spec.md"

conventions:
  keywords: "RFC 2119"
  scenario_format: "GIVEN/WHEN/THEN"
  id_format: "kebab-case"
  spec_format: "markdown"

constraints:
  - "All APIs must be RESTful"
  - "All dates must use ISO 8601 format"
  - "All text must support UTF-8 encoding"

agents:
  instructions: |
    When generating or modifying specs, follow the OpenSpec guidelines
    in references/openspec-guidelines.md. Use RFC 2119 keywords in
    UPPERCASE. Every requirement must have at least one GIVEN/WHEN/THEN
    scenario. Never include implementation details in specifications.
```

### Configuration Fields

| Field | Required | Description |
|---|---|---|
| `project.name` | Yes | Human-readable project name. |
| `project.version` | Yes | Semantic version of the project configuration. |
| `project.description` | No | Brief description of the project scope. |
| `capabilities` | Yes | List of all capabilities with their spec file paths. |
| `capabilities[].name` | Yes | Kebab-case capability identifier. |
| `capabilities[].description` | Yes | One-line description of the capability. |
| `capabilities[].spec` | Yes | Relative path to the capability's `spec.md`. |
| `conventions` | No | Project-wide conventions (keyword style, scenario format). |
| `constraints` | No | Global constraints that apply to all specifications. |
| `agents.instructions` | No | Special instructions for AI agents working on this project. |

---

## 9. Naming and Path Conventions

Consistent naming ensures that tooling, cross-references, and AI agents can reliably locate and link artifacts.

### Rules

| Element | Convention | Example |
|---|---|---|
| **Capability folders** | Kebab-case | `user-auth/`, `payment-processing/` |
| **Change folders** | Kebab-case, action-prefixed | `add-password-reset/`, `fix-billing-rounding/`, `remove-legacy-login/` |
| **Spec files** | Always `spec.md` | `specs/user-auth/spec.md` |
| **Change IDs** | Kebab-case, matching the folder name | `add-password-reset` |
| **Requirement names** | Title Case, descriptive | `Password Reset via Email` |
| **Scenario names** | Title Case, descriptive | `Valid Email Submitted` |
| **Config files** | Lowercase with extension | `config.yaml`, `.openspec.yaml` |

### Organizational Principles

1. **One spec per capability.** Each bounded context, feature module, or subsystem gets its own folder and `spec.md`.
2. **Bounded context grouping.** Related capabilities may share a parent directory (e.g., `specs/auth/login/spec.md`, `specs/auth/registration/spec.md`), but each spec file covers exactly one capability.
3. **Flat change workspace.** All active changes live directly under `changes/`. Do not nest change folders.
4. **Descriptive change names.** Use the pattern `<verb>-<noun>` for change folder names:
   - `add-` for new capabilities
   - `fix-` for bug fixes
   - `update-` or `modify-` for enhancements
   - `remove-` for deprecations
5. **Cross-references use relative paths.** When one spec references another, use relative file paths: `See [User Authentication](../user-auth/spec.md)`.

---

## 10. Quality Standards for Specifications

These standards ensure that specifications are useful, testable, and maintainable. All specs — new and modified — MUST pass these quality checks.

### Requirement Quality Checklist

| Check | Rule |
|---|---|
| **Testable** | Can this requirement be verified by an automated test or a defined manual procedure? If not, rewrite it. |
| **Behavioral** | Does this requirement describe externally observable behavior? If it mentions databases, classes, or internal state, rewrite it. |
| **Unambiguous** | Can two independent readers arrive at the same understanding? If not, add precision. |
| **Atomic** | Does this requirement describe exactly one behavior? If it uses "and" to join two independent behaviors, split it. |
| **Necessary** | Does this requirement trace to a business need, user story, or compliance rule? If not, question its inclusion. |
| **RFC 2119 Compliant** | Does the requirement use SHALL/MUST/SHOULD/MAY correctly and in UPPERCASE? |

### Scenario Quality Checklist

| Check | Rule |
|---|---|
| **Complete** | Every requirement MUST have at least one scenario. |
| **Happy path covered** | At least one scenario demonstrates the expected, successful behavior. |
| **Edge cases covered** | Scenarios MUST cover boundary conditions, error states, and exceptional inputs. |
| **Given is a state** | The **Given** clause describes a *state*, not an action. "Given the user is logged in" — not "Given the user logs in." |
| **When is an action** | The **When** clause describes a single, specific *action*. |
| **Then is verifiable** | The **Then** clause describes an outcome that can be programmatically or manually checked. |
| **No implementation leakage** | Scenarios MUST NOT reference internal mechanisms (SQL queries, function names, cache keys). |

### Specification-Level Checks

- **No orphan requirements.** Every requirement must trace to at least one scenario.
- **No technology-specific language** unless the requirement is explicitly about an external API contract or a mandated technology in `config.yaml`.
- **Cross-references use relative paths.** Never use absolute paths or URLs to reference other specs in the same project.
- **Consistent terminology.** Use the same term for the same concept throughout all specs. Define domain terms in the Purpose section if needed.
- **No duplication.** If two specs describe the same requirement, consolidate into one and cross-reference.

---

## 11. Proposal Workflow

The proposal workflow is the end-to-end process for making changes to an OpenSpec project. Every change — from feature addition to deprecation — follows these steps.

### Workflow Steps

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Identify   →  2. Create Folder  →  3. Write Proposal       │
│       ↓                                       ↓                 │
│  9. Archive    ←  8. Execute Tasks  ←  7. Review & Approve      │
│                                              ↑                  │
│                    6. Write Tasks   →  5. Write Design (opt.)   │
│                          ↑                                      │
│                    4. Write Delta Specs                          │
└─────────────────────────────────────────────────────────────────┘
```

### Step Details

#### Step 1: Identify the Change

- Determine what behavior needs to change: new capability, modification, bug fix, or deprecation.
- Review existing specs to understand current behavior and identify affected capabilities.
- Confirm the change has a clear business justification.

#### Step 2: Create a Change Folder

- Create a new folder under `openspec/changes/` with a descriptive kebab-case name.
- Initialize `.openspec.yaml` with change metadata.
- Example: `openspec/changes/add-password-reset/`

#### Step 3: Write `proposal.md` — The WHY and WHAT

- Document the goal, motivation, impact, affected capabilities, breaking changes, and out-of-scope items.
- Follow the format defined in [Section 4](#4-proposal-document-structure-proposalmd).
- Set status to `Draft`.
- This is the first artifact a reviewer reads — it must clearly communicate the purpose of the change.

#### Step 4: Write Delta Specs — The REQUIREMENTS

- Create delta spec files under `changes/<name>/specs/`, mirroring the `specs/` directory structure.
- Categorize every requirement change as ADDED, MODIFIED, or REMOVED.
- Follow the delta format defined in [Section 5](#5-delta-specification-format).
- Ensure every requirement has at least one GIVEN/WHEN/THEN scenario.
- Apply all quality standards from [Section 10](#10-quality-standards-for-specifications).

#### Step 5: Write `design.md` — The HOW (Optional)

- Document the technical approach, API contracts, data model changes, security considerations, and trade-offs.
- Follow the format defined in [Section 6](#6-design-document-designmd).
- May be omitted for trivial changes (e.g., simple configuration updates, minor wording fixes).
- If included, it MUST be consistent with the delta specs — the design implements the specs, not the other way around.

#### Step 6: Write `tasks.md` — The EXECUTION PLAN

- Break the implementation into sequential, atomic, verifiable tasks.
- Follow the format defined in [Section 7](#7-tasks-document-tasksmd).
- Ensure every scenario in the delta spec has a corresponding test task.
- This file MUST exist before implementation begins.

#### Step 7: Human Review and Approval

- Update proposal status to `Under Review`.
- Reviewers check:
  - Does the proposal clearly state the goal and impact?
  - Are the delta specs complete, testable, and unambiguous?
  - Does the design (if present) faithfully implement the requirements?
  - Are the tasks atomic, ordered, and traceable?
- Upon approval, update proposal status to `Approved`.

#### Step 8: Execute Tasks

- Implement tasks in order, checking off each `- [ ]` as `- [x]` upon completion.
- Each task is verified against its definition of done before moving to the next.
- If implementation reveals a spec deficiency, **stop and update the spec first** — do not code behavior that is not specified.

#### Step 9: Archive — Merge Deltas into Main Specs

- After all tasks are complete and verified:
  1. Merge ADDED requirements into the main `specs/` files.
  2. Apply MODIFIED requirement changes to the main `specs/` files.
  3. Remove REMOVED requirements from the main `specs/` files.
  4. Archive the change folder (move to an `archived/` directory or delete per project policy).
- The main `specs/` directory now reflects the updated, approved truth.

### Status Lifecycle

```
Draft  →  Under Review  →  Approved  →  (Implementation)  →  Archived
                ↓
           Rejected (with rationale)
```

---

## Quick Reference: File Checklist

When creating a complete OpenSpec change, ensure all of these artifacts exist:

| # | File | Required | Purpose |
|---|---|---|---|
| 1 | `changes/<name>/.openspec.yaml` | Yes | Change metadata |
| 2 | `changes/<name>/proposal.md` | Yes | Business case (WHY / WHAT) |
| 3 | `changes/<name>/specs/<capability>/spec.md` | Yes | Delta specifications (REQUIREMENTS) |
| 4 | `changes/<name>/design.md` | Conditional | Technical design (HOW) |
| 5 | `changes/<name>/tasks.md` | Yes | Execution plan (STEPS) |
