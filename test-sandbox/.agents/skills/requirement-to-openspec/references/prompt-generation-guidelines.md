# Prompt Generation Guidelines

> Detailed guidance for generating individual, spec-specific AI agent prompts that create OpenSpec proposals (Step 7 of the requirement-to-openspec workflow).

---

## 1. Prompt Generation Principles

### Core Rules

1. **One Prompt Per Specification.** Every prompt targets exactly ONE specification. There are no generic, reusable, or multi-spec prompts. A prompt for `SPEC-003 user-authentication` is materially different from a prompt for `SPEC-004 role-based-access`.

2. **Tailored for the `propose` Command.** Each prompt is crafted to directly feed into the OpenSpec proposal command (`openspec propose <spec-name>` in the terminal or `/opsx:propose <spec-name>` in AI chat). The developer or agent copies the prompt as the execution brief for creating the proposal.

3. **Proposals Only — Never Implementation.** Prompts instruct the AI agent to create OpenSpec *proposals* — structured requirement documents, scenarios, and task breakdowns. They MUST NOT instruct the agent to write application code, generate database migrations, scaffold project files, or produce any implementation artifact.

4. **Self-Contained.** An AI agent reading only the prompt — with no prior conversation, no access to the original requirements document, and no memory of earlier steps — must know exactly what to do, what requirements to cover, what scope boundaries to respect, and what artifacts to produce.

5. **Respect the Existing Project.** Prompts must instruct the agent to discover and respect the project's current structure, naming conventions, technology stack, and any previously written specifications. New proposals must integrate with — not contradict or duplicate — existing work.

6. **Follow OpenSpec Conventions.** All artifacts produced by the prompt must adhere to OpenSpec standards: RFC 2119 requirement keywords, GIVEN/WHEN/THEN scenarios, delta specification format (ADDED/MODIFIED/REMOVED), and the standard proposal directory structure.

### Why These Principles Matter

| Principle | Without It | With It |
|-----------|-----------|---------|
| One-per-spec | Agent conflates boundaries, misses edge cases | Focused, auditable, reviewable proposals |
| Proposals only | Premature code that bypasses design review | Requirements that can be validated before a line of code is written |
| Self-contained | Agent asks clarifying questions, stalls, or hallucinates context | Agent executes end-to-end without ambiguity |
| Respect existing | Duplicate specs, naming conflicts, broken dependency chains | Clean integration with the project's existing specification surface |
| OpenSpec conventions | Inconsistent format, unverifiable scenarios | Machine-readable, testable, reviewable specs |

---

## 2. Required Prompt Structure

Every generated prompt MUST instruct the AI agent to execute the following five phases in order. Skipping or reordering phases leads to incomplete or incorrect proposals.

### Phase 1: Context Discovery

Before writing anything, the agent must understand the world it is operating in.

| Step | Instruction | Why |
|------|-------------|-----|
| 1 | Inspect the existing project structure (file tree) — at minimum the root, `openspec/`, `openspec/specs/`, and `openspec/changes/` directories. | Understand the project layout, identify existing conventions, and avoid creating conflicting file paths. |
| 2 | Read `openspec/config.yaml` if it exists. | This file defines the project's OpenSpec version, default author, capability registry, and any project-level settings the proposal must respect. |
| 3 | Review any existing specifications in `openspec/specs/`. | Prevent duplicate requirements, understand how existing specs are structured, and identify capabilities that are already defined. |
| 4 | Identify the project's technology stack, frameworks, and patterns from project configuration files (e.g., `package.json`, `pom.xml`, `requirements.txt`, `go.mod`). | Ensure the proposal's design considerations are compatible with the actual technology in use — without prescribing implementation. |
| 5 | Note the project's coding and naming conventions (file naming, folder structure, ID formats, kebab-case vs. camelCase, etc.). | Ensure generated artifacts follow the same style as the rest of the project. |

### Phase 2: Requirements Understanding

The agent must deeply understand the requirements it is specifying — not just their IDs, but their intent, context, and business value.

| Step | Instruction | Why |
|------|-------------|-----|
| 6 | Read and understand the confirmed project requirements relevant to this specification. The full requirement text is provided in the prompt. | The agent must work from the actual requirement text, not just IDs or summaries. |
| 7 | Identify the specific requirement IDs this specification covers and list them explicitly. | Ensures traceability — every requirement maps to at least one GIVEN/WHEN/THEN scenario. |
| 8 | Understand the business context and objectives — why these requirements exist and what user or business problem they solve. | Requirements without business context produce technically correct but practically useless specifications. |
| 9 | Identify affected capabilities — both new capabilities this spec introduces and existing capabilities it modifies. | Prevents scope bleed and ensures the delta spec correctly marks ADDED vs. MODIFIED requirements. |

### Phase 3: Proposal Creation

This is the core production phase. The agent creates the OpenSpec proposal artifacts.

| Step | Instruction | Artifact Produced |
|------|-------------|-------------------|
| 10 | Create the change folder at `openspec/changes/<change-id>/`. The `<change-id>` should follow the pattern `CHG-<NNN>-<spec-name>` (e.g., `CHG-003-user-authentication`). | Directory structure |
| 11 | Write `proposal.md` containing: **Change ID**, **Author** (use `ai-agent` or the value from `config.yaml`), **Status** (`draft`), **Goal** (tied to this specific spec's business purpose), **User/System Impact**, **Affected Capabilities** (list), and **Out of Scope** (explicit exclusions). | `openspec/changes/<change-id>/proposal.md` |
| 12 | Write delta specifications in `specs/<capability>/spec.md`. Each requirement block must be marked **ADDED**, **MODIFIED**, or **REMOVED**. Use RFC 2119 keywords (**SHALL**, **MUST**, **SHOULD**, **SHOULD NOT**, **MAY**) for requirement strength. Every requirement must have at least one **GIVEN/WHEN/THEN** scenario. Include **edge cases** and **error scenarios** as additional scenarios. | `openspec/changes/<change-id>/specs/<capability>/spec.md` |
| 13 | Write `design.md` if the specification involves non-trivial architecture, integration points, or data modeling. Include: **Technical Approach** (high-level, not implementation), **API Contracts** (request/response shapes, not code), **Data Models** (entities and relationships), and **Component Interactions** (sequence or flow descriptions). Omit this file for simple, self-contained specs. | `openspec/changes/<change-id>/design.md` (optional) |
| 14 | Write `tasks.md` with sequential, numbered checkbox items. Each task must be **atomic** (one clear action), **verifiable** (has a done-condition), and **ordered** (dependencies flow top-to-bottom). | `openspec/changes/<change-id>/tasks.md` |

### Phase 4: Validation

Before reporting completion, the agent must verify its own work.

| Step | Instruction | Catches |
|------|-------------|---------|
| 15 | Verify that every requirement ID listed in the prompt has at least one corresponding GIVEN/WHEN/THEN scenario. List any gaps. | Missing coverage — the most common defect in specification proposals. |
| 16 | Check for duplicate requirements against existing specifications discovered in Phase 1. If a requirement is already covered by an existing spec, note it and do not re-specify it. | Specification sprawl, conflicting requirement definitions. |
| 17 | Ensure no implementation details have leaked into requirements. Requirements say *what* the system must do, never *how* it does it. Phrases like "use JWT", "store in PostgreSQL", "call the REST endpoint" are implementation and must not appear in requirement blocks. | Premature design decisions that constrain implementation choices. |
| 18 | Validate that naming conventions in the proposal (file names, capability names, requirement IDs) match the project's existing style discovered in Phase 1. | Inconsistent naming that breaks tooling and human readability. |
| 19 | Confirm that all stated dependencies (on other specs, capabilities, or external systems) are accurate and that the depended-upon spec actually exists or is planned. | Phantom dependencies or missing dependency declarations that break implementation ordering. |

### Phase 5: Reporting

The agent must clearly report what it produced.

| Step | Instruction | Purpose |
|------|-------------|---------|
| 20 | List all created artifacts with their full file paths. | Enables review and auditing without searching the file system. |
| 21 | List any requirements from the prompt that could not be fully specified, along with the reason why (e.g., ambiguous requirement text, missing business context, circular dependency). | Surfaces gaps for human follow-up rather than silently dropping requirements. |
| 22 | Note any assumptions made during proposal creation that were not explicitly stated in the prompt. | Makes hidden assumptions visible so reviewers can validate or correct them. |

---

## 3. Prompt Template

The skill generates one prompt per specification by filling in the template below. Placeholders are enclosed in double curly braces `{{...}}`. The skill MUST replace every placeholder with spec-specific content — no placeholder should remain in the final prompt.

```markdown
# OpenSpec Proposal Prompt: {{SPEC_ID}} — {{SPEC_NAME}}

## Your Role
You are an AI specification agent. Your task is to create an OpenSpec proposal
for the specification described below. You produce REQUIREMENTS and SCENARIOS,
NOT code. Follow every instruction in this prompt precisely.

---

## Specification Overview

- **Spec ID:** {{SPEC_ID}}
- **Spec Name:** {{SPEC_NAME}}
- **Description:** {{SPEC_DESCRIPTION}}
- **Business Value:** {{BUSINESS_VALUE}}

---

## Requirements to Cover

The following requirements MUST be addressed in this proposal. Use the exact
requirement IDs provided.

{{REQUIREMENT_IDS}}

### Requirement Details

{{REQUIREMENT_DETAILS}}

---

## Scope

### In Scope
{{SCOPE}}

### Out of Scope
{{OUT_OF_SCOPE}}

---

## Dependencies

This specification depends on the following:
{{DEPENDENCIES}}

If a dependency spec does not yet exist, note it as a gap but proceed with
the proposal.

---

## Existing Project Context

### Existing Specifications
The following specifications already exist in this project. Do NOT duplicate
requirements that are already covered by them:
{{EXISTING_SPECS}}

### Project Conventions
{{PROJECT_CONVENTIONS}}

---

## Instructions

### Phase 1: Context Discovery
1. Inspect the existing project structure — at minimum the root, `openspec/`,
   `openspec/specs/`, and `openspec/changes/` directories.
2. Read `openspec/config.yaml` if it exists and respect its settings.
3. Review existing specifications in `openspec/specs/` to understand what is
   already defined and avoid duplication.
4. Identify the project's technology stack from configuration files
   (e.g., `package.json`, `pom.xml`, `requirements.txt`).
5. Note the project's file naming and coding conventions.

### Phase 2: Requirements Understanding
6. Read and understand ALL requirements listed above. Each one must map to at
   least one GIVEN/WHEN/THEN scenario.
7. List the exact requirement IDs this proposal covers.
8. Keep the business context in mind: {{BUSINESS_VALUE}}
9. Identify which capabilities are NEW (ADDED) vs. changes to EXISTING
   capabilities (MODIFIED).

### Phase 3: Proposal Creation
10. Create the change folder: `openspec/changes/CHG-{{SPEC_ID_NUM}}-{{SPEC_NAME}}/`
11. Write `proposal.md`:
    - Change ID: `CHG-{{SPEC_ID_NUM}}-{{SPEC_NAME}}`
    - Author: (use project config or `ai-agent`)
    - Status: `draft`
    - Goal: (specific to this spec, tied to business value)
    - User/System Impact
    - Affected Capabilities
    - Out of Scope
12. Write delta specifications in `specs/<capability>/spec.md`:
    - Mark each requirement block as ADDED, MODIFIED, or REMOVED
    - Use RFC 2119 keywords: SHALL, MUST, SHOULD, SHOULD NOT, MAY
    - Write GIVEN/WHEN/THEN scenarios for EVERY requirement
    - Include edge cases and error scenarios
    - Include boundary conditions
13. Write `design.md` ONLY if this spec involves non-trivial architecture,
    API contracts, data models, or component interactions. Omit for simple specs.
14. Write `tasks.md`:
    - Sequential checkbox items
    - Each task is atomic and verifiable
    - Tasks are ordered by dependency

### Phase 4: Validation
15. Verify every requirement ID has at least one GIVEN/WHEN/THEN scenario.
    List any gaps.
16. Check for duplicates against existing specifications listed above.
17. Ensure NO implementation details appear in requirements (no specific
    technologies, libraries, or code patterns in requirement text).
18. Validate naming conventions match the project's existing style.
19. Confirm all dependencies are accurately stated.

### Phase 5: Reporting
20. List all created artifacts with full file paths.
21. List any requirements that could not be fully specified and explain why.
22. Note any assumptions made.

---

## Output Format
All files must be Markdown. Follow OpenSpec directory conventions. Use the
exact artifact structure described in Phase 3.
```

### Placeholder Reference

| Placeholder | Source | Example Value |
|-------------|--------|---------------|
| `{{SPEC_ID}}` | Specification Identification step (Step 5) | `SPEC-003` |
| `{{SPEC_ID_NUM}}` | Numeric portion of the Spec ID | `003` |
| `{{SPEC_NAME}}` | Kebab-case spec name from Step 5 | `user-authentication` |
| `{{SPEC_DESCRIPTION}}` | Description field from spec breakdown | `Covers user registration, login, logout, password reset, and session management` |
| `{{BUSINESS_VALUE}}` | Business Value field from spec breakdown | `Enables secure user access, protects user data, and meets compliance requirements for authentication` |
| `{{REQUIREMENT_IDS}}` | Mapped requirement IDs from traceability matrix | `FR-001, FR-002, FR-003, FR-010, BR-005, NFR-012` |
| `{{REQUIREMENT_DETAILS}}` | Full text of each requirement (ID + description + acceptance criteria) | See example in Section 6 |
| `{{DEPENDENCIES}}` | Dependencies field from spec breakdown | `SPEC-001 (database-schema), SPEC-002 (user-profile)` |
| `{{SCOPE}}` | Scope field from spec breakdown | `User registration flow, login/logout, password reset, session token management` |
| `{{OUT_OF_SCOPE}}` | Out-of-Scope field from spec breakdown | `OAuth/SSO integration (covered by SPEC-007), two-factor authentication (covered by SPEC-008)` |
| `{{EXISTING_SPECS}}` | Discovered from project's `openspec/specs/` directory + earlier specs in this run | `SPEC-001 database-schema, SPEC-002 user-profile` |
| `{{PROJECT_CONVENTIONS}}` | Discovered from project analysis | `Kebab-case file names, PascalCase component names, 'FR-' prefix for functional requirements` |

---

## 4. Prompt Quality Checklist

Before including a generated prompt in the final planning document, verify every item below. A prompt that fails any check must be revised.

### Specificity
- [ ] Prompt is specific to exactly one specification (not generic or multi-spec)
- [ ] Spec ID and Spec Name are filled in (not placeholder text)
- [ ] All requirement IDs for this spec are explicitly listed
- [ ] Full requirement text is included for every ID (not just the ID number)

### Context
- [ ] Business context and value proposition are stated
- [ ] Dependencies on other specs are listed with their Spec IDs
- [ ] Scope boundaries (in-scope and out-of-scope) are clearly defined
- [ ] Existing specifications in the project are listed to prevent duplication
- [ ] Project conventions are documented

### Instructions
- [ ] Prompt instructs the agent to inspect the existing project structure
- [ ] Prompt instructs the agent to read `openspec/config.yaml`
- [ ] Prompt instructs the agent to review existing specs before writing
- [ ] Prompt instructs the agent to follow OpenSpec conventions (delta specs, RFC 2119 keywords)
- [ ] Prompt instructs the agent to create GIVEN/WHEN/THEN scenarios for every requirement
- [ ] Prompt instructs the agent to identify edge cases and error scenarios
- [ ] Prompt instructs the agent to check for duplicate requirements
- [ ] Prompt instructs the agent to validate its own work
- [ ] Prompt instructs the agent to report all created artifacts with file paths

### Prohibitions
- [ ] Prompt does NOT instruct the agent to write application code
- [ ] Prompt does NOT instruct the agent to generate database migrations
- [ ] Prompt does NOT instruct the agent to scaffold project files
- [ ] Prompt does NOT assume a technology stack unless discovered from the project
- [ ] Prompt does NOT contain leftover placeholder text (e.g., `{{SPEC_ID}}` still present)

---

## 5. Anti-Patterns to Avoid

### ❌ Generic Prompts
**Bad:** `"Create a spec for user management."`
**Why it fails:** No requirement IDs, no scope boundaries, no business context. The agent will hallucinate requirements.
**Fix:** Fill in every placeholder from the template. Include the full requirement text for every requirement ID.

### ❌ ID-Only References
**Bad:** `"Cover requirements FR-001, FR-002, FR-003."`
**Why it fails:** The agent has no access to the requirements document. It doesn't know what FR-001 says.
**Fix:** Include the complete requirement text:
```
- **FR-001:** The system shall allow users to register with an email address and password.
- **FR-002:** The system shall validate email format during registration.
- **FR-003:** The system shall enforce a minimum password length of 8 characters.
```

### ❌ Technology Assumptions
**Bad:** `"Use JWT tokens for session management and store user data in PostgreSQL."`
**Why it fails:** This is implementation. The spec should say *what* the system must do (manage sessions securely), not *how* (JWT + PostgreSQL).
**Fix:** `"The system SHALL maintain user sessions with configurable expiration. The system SHALL store user credentials securely using industry-standard hashing."`

### ❌ Code Generation Instructions
**Bad:** `"Generate the Express.js routes for user authentication and the Sequelize models for the users table."`
**Why it fails:** This produces implementation, not a proposal. It skips the entire specification and review process.
**Fix:** Instruct the agent to produce `proposal.md`, delta `spec.md` files, and `tasks.md` — never code.

### ❌ Duplicate Requirements
**Bad:** Prompt for SPEC-003 includes requirement FR-005, but FR-005 is already fully covered in SPEC-001.
**Why it fails:** Two specs now own the same requirement. Changes to FR-005 must be updated in two places, and they will inevitably diverge.
**Fix:** Check the traceability matrix. If FR-005 belongs to SPEC-001, do not include it in SPEC-003's prompt. If SPEC-003 *depends on* FR-005, list it as a dependency, not a covered requirement.

### ❌ Missing Edge Case Instructions
**Bad:** Prompt covers only the happy path: "User registers successfully."
**Why it fails:** The agent produces scenarios for success but ignores failures, boundary conditions, and error paths — which is where most bugs live.
**Fix:** Explicitly instruct: "For every requirement, identify and write scenarios for: success path, failure/error paths, boundary conditions, invalid input, concurrent access, and authorization failures."

### ❌ Missing Validation Steps
**Bad:** Prompt ends at "Create the proposal" with no Phase 4 (Validation) or Phase 5 (Reporting).
**Why it fails:** The agent may produce incomplete proposals — missing scenarios for some requirements, duplicate requirements, or implementation details in requirement text — with no self-check to catch them.
**Fix:** Always include Phase 4 (Validation) and Phase 5 (Reporting) in the prompt. These phases are not optional.

### ❌ Scope Ambiguity
**Bad:** Prompt says "Handle all user-related functionality."
**Why it fails:** "All user-related functionality" could include registration, authentication, profiles, preferences, roles, permissions, notifications, activity logs — far too broad for one spec.
**Fix:** Define explicit in-scope and out-of-scope boundaries. Be specific about what this spec does and does not cover, referencing other spec IDs for excluded areas.

---

## 6. Example Prompt (Fully Filled)

Below is a complete, production-quality prompt for a hypothetical "User Authentication" specification. This is what the skill's output should look like after all placeholders are replaced with real content.

---

````markdown
# OpenSpec Proposal Prompt: SPEC-003 — user-authentication

## Your Role
You are an AI specification agent. Your task is to create an OpenSpec proposal
for the specification described below. You produce REQUIREMENTS and SCENARIOS,
NOT code. Follow every instruction in this prompt precisely.

---

## Specification Overview

- **Spec ID:** SPEC-003
- **Spec Name:** user-authentication
- **Description:** Covers user registration, login, logout, password reset,
  and session management for the TaskFlow project management application.
- **Business Value:** Enables secure user access to the application, protects
  user data and project information from unauthorized access, and satisfies
  SOC 2 compliance requirements for authentication controls.

---

## Requirements to Cover

The following requirements MUST be addressed in this proposal. Use the exact
requirement IDs provided.

FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, BR-004, NFR-008

### Requirement Details

- **FR-012:** The system SHALL allow new users to register by providing a
  display name, email address, and password. Registration SHALL create a
  new user account in `inactive` status pending email verification.

- **FR-013:** The system SHALL send a verification email containing a unique,
  time-limited token (valid for 24 hours) to the user's registered email
  address upon successful registration. The system SHALL activate the account
  only after the user clicks the verification link.

- **FR-014:** The system SHALL allow registered, verified users to log in by
  providing their email address and password. Upon successful authentication,
  the system SHALL create a user session and return a session identifier.
  Failed login attempts SHALL be recorded.

- **FR-015:** The system SHALL lock a user account after 5 consecutive failed
  login attempts within a 15-minute window. Locked accounts SHALL automatically
  unlock after 30 minutes. The user SHOULD be notified via email when their
  account is locked.

- **FR-016:** The system SHALL allow authenticated users to log out, which
  SHALL invalidate their current session immediately. The system SHALL support
  a "log out of all devices" option that invalidates all active sessions for
  the user.

- **FR-017:** The system SHALL allow users to initiate a password reset by
  providing their registered email address. The system SHALL send a reset
  email containing a unique, time-limited token (valid for 1 hour). The
  system SHALL allow the user to set a new password using a valid reset token.
  Used or expired tokens SHALL be rejected.

- **BR-004:** User passwords MUST meet the following complexity requirements:
  minimum 8 characters, at least one uppercase letter, at least one lowercase
  letter, at least one digit, and at least one special character from the set
  `!@#$%^&*()_+-=`. The system MUST NOT store passwords in plain text.

- **NFR-008:** Authentication endpoints (login, registration, password reset)
  SHALL respond within 500ms under normal load (up to 100 concurrent requests).
  The system SHOULD implement rate limiting on authentication endpoints to
  prevent brute-force attacks (maximum 20 requests per IP per minute).

---

## Scope

### In Scope
- User registration with email verification
- User login with session creation
- Account lockout after repeated failed attempts
- User logout (single session and all sessions)
- Password reset via email token
- Password complexity validation
- Authentication rate limiting
- Session lifecycle management

### Out of Scope
- OAuth / SSO / social login integration (covered by SPEC-007)
- Two-factor authentication / MFA (covered by SPEC-008)
- User profile management — display name, avatar, preferences (covered by SPEC-004)
- Role-based access control and permissions (covered by SPEC-005)
- User search and admin user management (covered by SPEC-009)

---

## Dependencies

This specification depends on the following:
- **SPEC-001** (`database-schema`): Defines the base data model, including the
  `users` table schema that this spec's requirements write to.
- **SPEC-002** (`email-service`): Provides the email delivery capability used
  for verification emails and password reset emails.

If a dependency spec does not yet exist, note it as a gap but proceed with
the proposal.

---

## Existing Project Context

### Existing Specifications
The following specifications already exist in this project. Do NOT duplicate
requirements that are already covered by them:
- SPEC-001 (`database-schema`) — base data models and entity relationships
- SPEC-002 (`email-service`) — transactional email templates and delivery

### Project Conventions
- File names: kebab-case (e.g., `user-authentication`, `password-reset`)
- Requirement IDs: `FR-` prefix for functional, `NFR-` for non-functional,
  `BR-` for business rules, `INT-` for integrations
- Component names: PascalCase (e.g., `AuthService`, `SessionManager`)
- OpenSpec config specifies author as `taskflow-team`
- Existing specs use `###` for individual requirements within a capability

---

## Instructions

### Phase 1: Context Discovery
1. Inspect the existing project structure — at minimum the root, `openspec/`,
   `openspec/specs/`, and `openspec/changes/` directories.
2. Read `openspec/config.yaml` if it exists and respect its settings.
3. Review existing specifications in `openspec/specs/` to understand what is
   already defined and avoid duplication.
4. Identify the project's technology stack from configuration files
   (e.g., `package.json`, `pom.xml`, `requirements.txt`).
5. Note the project's file naming and coding conventions.

### Phase 2: Requirements Understanding
6. Read and understand ALL 8 requirements listed above (FR-012 through FR-017,
   BR-004, NFR-008). Each one must map to at least one GIVEN/WHEN/THEN scenario.
7. This proposal covers: FR-012, FR-013, FR-014, FR-015, FR-016, FR-017,
   BR-004, NFR-008.
8. Business context: Secure authentication is foundational to TaskFlow —
   without it, project data is exposed and SOC 2 compliance fails.
9. Capabilities:
   - NEW: `user-registration`, `user-login`, `password-reset`, `session-management`
   - MODIFIED: none (no existing capabilities are changed by this spec)

### Phase 3: Proposal Creation
10. Create the change folder: `openspec/changes/CHG-003-user-authentication/`
11. Write `proposal.md`:
    - Change ID: `CHG-003-user-authentication`
    - Author: `taskflow-team`
    - Status: `draft`
    - Goal: Establish secure user authentication flows including registration
      with email verification, login with account lockout protection, logout
      with session invalidation, and password reset via time-limited tokens.
    - User/System Impact: Users gain secure access to the application. System
      gains authentication infrastructure and session management.
    - Affected Capabilities: `user-registration`, `user-login`,
      `password-reset`, `session-management`
    - Out of Scope: OAuth/SSO (SPEC-007), MFA (SPEC-008), profiles (SPEC-004),
      RBAC (SPEC-005)
12. Write delta specifications in the following capability spec files:
    - `specs/user-registration/spec.md` — ADDED: FR-012, FR-013, BR-004
    - `specs/user-login/spec.md` — ADDED: FR-014, FR-015, NFR-008
    - `specs/session-management/spec.md` — ADDED: FR-016
    - `specs/password-reset/spec.md` — ADDED: FR-017, BR-004
    For each requirement:
    - Mark as ADDED
    - Use RFC 2119 keywords: SHALL, MUST, SHOULD, SHOULD NOT, MAY
    - Write GIVEN/WHEN/THEN scenarios covering: success path, failure/error
      paths, boundary conditions, invalid input, and edge cases
    - Example scenario for FR-015:
      ```
      GIVEN a user has entered an incorrect password 4 times in the last 10 minutes
      WHEN the user submits a 5th incorrect password
      THEN the system SHALL lock the account
      AND the system SHOULD send a lockout notification email
      AND the system SHALL return an error indicating the account is locked
      AND the system SHALL record the lockout event in the audit log
      ```
      ```
      GIVEN a user account was locked 30 minutes ago due to failed login attempts
      WHEN the lockout duration has elapsed
      THEN the system SHALL automatically unlock the account
      AND the user SHALL be able to attempt login again
      ```
13. Write `design.md`:
    - Technical Approach: Describe authentication flow (registration →
      verification → login → session → logout) at an architectural level
    - API Contracts: Define request/response shapes for registration, login,
      logout, and password reset endpoints (data structures, not code)
    - Data Models: User entity (fields relevant to auth), Session entity,
      VerificationToken entity, PasswordResetToken entity
    - Component Interactions: How AuthService interacts with EmailService
      (from SPEC-002) and the data layer (from SPEC-001)
14. Write `tasks.md`:
    - [ ] Define user-registration capability spec with all scenarios
    - [ ] Define user-login capability spec with all scenarios
    - [ ] Define session-management capability spec with all scenarios
    - [ ] Define password-reset capability spec with all scenarios
    - [ ] Define API contracts in design.md
    - [ ] Define data models in design.md
    - [ ] Cross-reference all 8 requirement IDs to verify complete coverage
    - [ ] Review for implementation leakage (no technology-specific terms in requirements)
    - [ ] Verify no duplication with SPEC-001 or SPEC-002
    - [ ] Final self-review against OpenSpec conventions

### Phase 4: Validation
15. Verify every requirement ID (FR-012, FR-013, FR-014, FR-015, FR-016,
    FR-017, BR-004, NFR-008) has at least one GIVEN/WHEN/THEN scenario.
    List any gaps.
16. Check for duplicates against SPEC-001 (`database-schema`) and
    SPEC-002 (`email-service`).
17. Ensure NO implementation details appear in requirements — no specific
    databases, frameworks, libraries, token formats, or hashing algorithms
    in requirement text.
18. Validate naming conventions: kebab-case files, `FR-`/`NFR-`/`BR-` IDs,
    PascalCase components.
19. Confirm dependencies on SPEC-001 and SPEC-002 are accurately stated.

### Phase 5: Reporting
20. List all created artifacts with full file paths.
21. List any requirements that could not be fully specified and explain why.
22. Note any assumptions made.

---

## Output Format
All files must be Markdown. Follow OpenSpec directory conventions. Use the
exact artifact structure described in Phase 3.
````

---

> **Note:** This example prompt is 8 requirements across 4 capabilities. Real prompts may be smaller (2–3 requirements for a focused spec) or larger (10–15 requirements for a complex workflow spec). The structure and phases remain the same regardless of size. The key is that every requirement ID appears in the prompt with its full text, and every phase is present.
