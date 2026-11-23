# Specification Breakdown Guide

Detailed guidance on decomposing a software project into well-shaped, independently implementable OpenSpec specifications.

---

## 1. Specification Decomposition Principles

Effective decomposition is the foundation of a successful specification strategy. Follow these core principles:

### Single Purpose
Each specification MUST have a single, clearly articulated purpose. If you cannot describe what a spec does in one sentence without using "and" to join unrelated concerns, it needs to be split.

**Good:** "Handles user authentication and session management."
**Bad:** "Handles user authentication, report generation, and email notifications."

### Business Capability Alignment
Specifications SHOULD align with business capabilities rather than technical layers. A spec called `user-registration` (business capability) is almost always better than one called `api-endpoints` (technical layer).

**When technical-layer specs ARE warranted:**
- A shared database schema that multiple business specs depend on
- A cross-cutting infrastructure concern (e.g., logging framework, API gateway configuration)
- A reusable component library consumed by multiple features

### Fragmentation Balance
Avoid both extremes:
- **Over-fragmentation:** Too many tiny specs create excessive overhead, increase cross-spec dependencies, and make it hard to see the big picture. If a spec has only 1-2 trivial requirements, it probably belongs inside a related spec.
- **Under-fragmentation:** Monolithic specs are hard to estimate, hard to assign, hard to review, and hard to test independently. If a spec has 30+ requirements spanning multiple business concerns, it needs to be split.

### Independent Implementability
Each spec SHOULD be implementable on its own, producing a testable, demonstrable result. A developer should be able to pick up a spec, build it, and verify it works — even if downstream specs are not yet started.

### Minimal Cross-Spec Dependencies
While some dependencies are unavoidable, actively work to minimize them. Every dependency is a coordination cost, a scheduling constraint, and a potential blocker. Prefer specs that share interfaces (contracts) rather than internal implementation details.

### Reasonable Scope
A specification should be completable by one developer or a small team within a reasonable timeframe. If a spec would take one developer more than 2-3 sprints, consider splitting it. If it would take less than a day, consider merging it.

---

## 2. Decomposition Dimensions

Analyze the project along these axes to identify natural specification boundaries. Not every axis will produce a separate spec — use them as lenses to find the right cuts.

### Functional Modules
Identify distinct business functions the system performs. These are often the most natural spec boundaries.

**Examples:**
- User Management (registration, profiles, roles)
- Billing & Payments (invoicing, payment processing, refunds)
- Notifications (email, SMS, push, in-app)
- Reporting & Analytics (dashboards, exports, scheduled reports)
- Inventory Management (stock tracking, reorder rules, warehousing)

**How to identify:** Look for nouns in the requirements that represent distinct domains. Each domain with its own rules, data, and workflows is a candidate for a separate spec.

### Business Capabilities
Focus on value-delivering capabilities from the end-user's perspective. These cut across technical concerns.

**Examples:**
- "Customer can place an order" (touches UI, API, inventory, payment, notification)
- "Manager can approve expense reports" (touches UI, workflow engine, notifications, audit)
- "System generates monthly compliance reports" (touches data aggregation, formatting, delivery)

**How to identify:** Look for verbs and user stories in the requirements. Each capability that delivers standalone business value is a candidate.

### Independent Workflows
End-to-end business processes that can stand alone and be tested independently.

**Examples:**
- Order-to-fulfillment workflow
- Employee onboarding process
- Claim submission and adjudication pipeline
- Content publishing workflow (draft → review → approve → publish)

**How to identify:** Trace a process from initiation to completion. If it has a clear start, clear end, and can run without other workflows active, it is a candidate.

### Frontend Responsibilities
UI-specific concerns that may warrant their own spec, especially in larger applications.

**What to consider:**
- Page layouts and navigation structure
- Reusable UI component library
- Client-side state management
- Form handling and client-side validation
- Responsive design and accessibility
- Offline capability / Progressive Web App features

**When to separate:** When the frontend is complex enough that its design, implementation, and testing are substantial independent efforts. For simpler projects, frontend concerns can be embedded within business capability specs.

### Backend Responsibilities
Server-side logic that may warrant its own spec.

**What to consider:**
- API design and endpoint definitions
- Business rule engines and processing logic
- Background job processing and queuing
- Caching strategies
- Data transformation and ETL pipelines
- File processing (upload, conversion, storage)

**When to separate:** When backend services are shared across multiple business capabilities, or when the processing logic is complex enough to justify independent specification.

### Database Requirements
Data layer concerns that often benefit from a foundational spec.

**What to consider:**
- Entity-relationship model and schema design
- Migration strategy and versioning
- Data integrity constraints and referential integrity
- Index strategy and query optimization
- Data archival and retention policies
- Seed data and reference data management

**When to separate:** Almost always create a foundational database/data-model spec for any project with non-trivial data requirements. Other specs then depend on it for their data structures.

### Integrations
Each external system interaction is a candidate for its own spec.

**What to consider:**
- Third-party API integrations (payment gateways, email services, SMS providers)
- Legacy system interfaces
- File import/export with external systems
- Webhook handling (inbound and outbound)
- SSO and identity provider integration
- External data synchronization

**When to separate:** Each integration with a distinct external system SHOULD be its own spec, because:
- External systems have their own release cycles and breaking changes
- Each integration requires its own error handling, retry logic, and fallback strategy
- Testing requires mocking/stubbing the external system independently

### Security
Security concerns that span multiple specs often need a dedicated foundational spec.

**What to consider:**
- Authentication mechanisms (login, MFA, SSO, API keys)
- Authorization model (RBAC, ABAC, resource-level permissions)
- Data encryption (at rest, in transit)
- Audit logging and compliance tracking
- Input sanitization and injection prevention
- Rate limiting and abuse prevention
- CORS, CSP, and other security headers
- Secret management

**When to separate:** Create a dedicated security spec when authentication/authorization is non-trivial. For simple apps with basic login, security can be part of a user-management spec.

### Testing and Validation
Testing strategy and validation rules that apply across the system.

**What to consider:**
- Test strategy document (unit, integration, E2E, performance)
- Test data management and seeding
- Validation rule catalog (field-level, business-rule-level)
- Acceptance test definitions per spec
- Performance benchmarks and load test scenarios
- Accessibility testing requirements

**When to separate:** A cross-cutting testing spec is useful for large projects. For smaller projects, testing requirements can be embedded in each business spec's acceptance criteria.

---

## 3. Determining the Right Number of Specifications

There is no magic formula, but these guidelines help you arrive at the right number.

### Step-by-Step Process

1. **List all distinct business capabilities** extracted from the requirements. This gives you an upper bound on the number of specs.

2. **Group related requirements that change together.** Requirements that are always modified as a unit belong in the same spec. For example, "user registration form" and "registration email confirmation" change together — same spec.

3. **Separate concerns that can evolve independently.** If billing rules change without affecting user management, they belong in different specs.

4. **Consider team structure (Conway's Law).** If different teams own different parts of the system, spec boundaries should respect team boundaries. A spec that requires two teams to coordinate is harder to deliver than one owned by a single team.

5. **Consider deployment boundaries.** If the system has separately deployable components (microservices, frontend apps, mobile apps), specs should align with those boundaries.

6. **Check the requirement count per spec.** As a rough guideline:
   - **Target range:** 5–20 requirements per spec
   - **Below 5:** Consider merging with a related spec (unless the requirements are individually complex)
   - **Above 20:** Consider splitting by sub-capability
   - **Above 30:** Almost certainly needs splitting

### Sizing Benchmarks

| Project Size (Requirements) | Typical Spec Count | Notes |
|---|---|---|
| 10–30 | 3–5 | Small project; avoid over-splitting |
| 30–50 | 5–8 | Medium project; natural modules emerge |
| 50–100 | 8–12 | Large project; clear domain boundaries |
| 100–200 | 12–20 | Enterprise project; team-aligned specs |
| 200+ | 15–25+ | Complex system; consider phased delivery |

These are guidelines, not rules. A project with 40 deeply complex requirements might need 10 specs, while one with 40 simple CRUD operations might need only 4.

### Validation Checklist

After determining your specs, verify:
- [ ] Every requirement is covered by at least one spec
- [ ] No requirement is covered by more than one spec (unless intentionally shared)
- [ ] Each spec has a clear, distinct purpose
- [ ] No spec is trivially small (< 3 requirements without justification)
- [ ] No spec is excessively large (> 25 requirements without justification)
- [ ] Cross-cutting concerns have a home (dedicated spec or explicit ownership)
- [ ] The total number feels manageable for the project size and team

---

## 4. Specification Definition Template

For each identified specification, capture the following attributes. This template ensures consistency and completeness across all specs in the project.

### Template Fields

#### 1. Spec ID
A sequential, prefixed identifier for unique reference throughout the planning document.

**Format:** `SPEC-NNN` (e.g., SPEC-001, SPEC-002)

**Rules:**
- Always zero-padded to 3 digits
- Sequential within the project
- Never reused, even if a spec is removed

#### 2. Spec Name
A descriptive, kebab-case name that communicates the spec's purpose at a glance.

**Format:** lowercase-kebab-case (e.g., `user-authentication`, `order-processing`, `payment-gateway-integration`)

**Rules:**
- 2-4 words preferred
- Use domain language, not technical jargon
- Must be unique within the project

#### 3. Description
A concise explanation of what the spec covers and why it exists.

**Format:** 2-3 sentences. First sentence states what the spec does. Second sentence explains why it is a separate spec. Optional third sentence notes key constraints or considerations.

**Example:**
> Handles user registration, login, password management, and session lifecycle. Separated as a foundational spec because all other specs depend on authenticated user context. Must support both email/password and OAuth 2.0 social login flows.

#### 4. Business Value
Why this spec matters to the business. Connects technical work to business outcomes.

**Example:**
> Enables secure user access, which is a prerequisite for all personalized features. Directly impacts user onboarding conversion rate and platform security posture.

#### 5. Requirements Covered
An explicit list of requirement IDs that this spec addresses. Every requirement in the project MUST appear in at least one spec's list.

**Format:** Comma-separated list of requirement IDs, grouped by type.

**Example:**
> FR-001, FR-002, FR-005, FR-006, NFR-003, NFR-007, BR-001, BR-002

#### 6. Functional Scope
What is IN this spec — the boundaries of what the implementation covers.

**Format:** Bulleted list of capabilities and behaviors.

**Example:**
> - User registration with email verification
> - Login with email/password
> - OAuth 2.0 social login (Google, GitHub)
> - Password reset flow
> - Session creation, validation, and expiration
> - JWT token issuance and refresh

#### 7. Out-of-Scope Items
What is explicitly NOT in this spec, to prevent scope creep and clarify boundaries.

**Format:** Bulleted list with brief justification.

**Example:**
> - User profile management (covered in SPEC-003)
> - Role-based access control (covered in SPEC-004)
> - Admin user management (covered in SPEC-005)
> - Two-factor authentication (deferred to Phase 2)

#### 8. Dependencies
Other specs that this spec depends on. Include the nature of the dependency.

**Format:** List of Spec IDs with dependency description.

**Example:**
> - SPEC-001 (database-schema): BLOCKS — requires user table and session table to exist
> - SPEC-007 (email-service): INFORMS — uses email service for verification, but can stub during development

#### 9. Priority
Business priority classification that influences implementation ordering.

**Values:**
- **Critical:** System cannot function without this spec. Must be in Phase 1.
- **High:** Core business value. Should be in Phase 1 or early Phase 2.
- **Medium:** Important but not blocking. Phase 2 or 3.
- **Low:** Nice-to-have or enhancement. Phase 3 or later.

#### 10. Complexity
Technical complexity assessment with justification.

**Values:**
- **High:** Involves complex algorithms, multiple integrations, significant state management, or novel technical challenges. Justification required.
- **Medium:** Standard complexity with some non-trivial logic or integration work.
- **Low:** Straightforward CRUD operations or simple logic with well-known patterns.

**Example:**
> Medium — Standard authentication flows, but OAuth 2.0 integration with multiple providers adds configuration complexity and requires handling provider-specific edge cases.

#### 11. Expected Deliverables
The concrete artifacts that completing this spec produces.

**Example:**
> - OpenSpec proposal document (`proposal.md`)
> - API endpoint definitions (REST or GraphQL schema)
> - Database migration scripts for auth-related tables
> - Authentication middleware / guards
> - Login and registration UI components
> - Unit and integration tests for auth flows

#### 12. Acceptance Criteria
Measurable conditions that determine when the spec is fully implemented. Written in a testable format.

**Example:**
> - A new user can register with email and password and receives a verification email
> - A registered user can log in and receive a valid JWT token
> - An expired session returns 401 and the user is prompted to re-authenticate
> - OAuth login works with Google and GitHub providers
> - Password reset email is sent within 30 seconds of request
> - All auth endpoints return appropriate error codes for invalid input

#### 13. Suggested Implementation Order
A numeric value indicating the recommended sequence for implementation across all project specs.

**Rules:**
- Lower number = implement first
- Specs with the same number can be implemented in parallel
- Must respect dependency ordering (a spec cannot have a lower order number than a spec it depends on)

**Example:**
> 1 (foundational — required by SPEC-003, SPEC-004, SPEC-005)

---

## 5. Avoiding Common Decomposition Mistakes

### Overlap
**Symptom:** Two or more specs describe the same behavior, feature, or requirement.

**Diagnosis:** Check if the same requirement ID appears in multiple specs' "Requirements Covered" lists. Review functional scope for duplicate descriptions.

**Resolution:**
- If the overlap is accidental, assign the requirement to the spec where it fits most naturally and remove it from the other.
- If the overlap is intentional (shared concern), clearly document which spec OWNS the implementation and which spec CONSUMES it.
- If neither spec is a natural fit, consider creating a dedicated shared spec.

### Gaps
**Symptom:** One or more requirements are not covered by any specification.

**Diagnosis:** Build a traceability matrix mapping every requirement ID to its covering spec. Any requirement without a spec assignment is a gap.

**Resolution:**
- Assign orphaned requirements to the most relevant existing spec.
- If no existing spec is a good fit, create a new spec or a "miscellaneous" spec (but avoid catch-all specs that lack cohesion).
- Re-examine whether the orphaned requirement is actually a valid requirement or an artifact of unclear documentation.

### Too Thin
**Symptom:** A spec contains only 1-2 trivial requirements and could be completed in a few hours.

**Diagnosis:** Check the requirement count and estimated effort. If the spec has fewer than 3 requirements and low complexity, it is too thin.

**Resolution:**
- Merge into the most closely related spec.
- If merging is not natural, combine multiple thin specs into a single "utilities" or "enhancements" spec — but only if they share a common theme.

### Too Fat
**Symptom:** A spec contains 30+ requirements, spans multiple business concerns, and would take weeks to implement.

**Diagnosis:** If a spec's functional scope requires multiple paragraphs to describe, or its acceptance criteria exceed 15-20 items, it is too fat.

**Resolution:**
- Identify sub-capabilities within the spec and split along those lines.
- Look for natural seams: different user roles, different data entities, different lifecycle phases.
- Extract integrations, reporting, and admin functions into separate specs first — they are often the easiest to separate.

### Wrong Boundaries
**Symptom:** Specs are organized by technical layer (e.g., "frontend-spec," "backend-spec," "database-spec") rather than by business capability.

**Diagnosis:** If implementing a single user story requires changes to 3+ specs, the boundaries are likely wrong.

**Resolution:**
- Re-organize specs around business capabilities so that a single user story (or small group of related stories) maps to one spec.
- Technical-layer specs are acceptable only for genuinely shared infrastructure (see Section 1, "Business Capability Alignment").

### Missing Cross-Cutting Concerns
**Symptom:** Security, logging, error handling, or monitoring requirements are scattered across every spec with no clear ownership.

**Diagnosis:** Search for requirements related to security, audit, logging, monitoring, and error handling. If they appear in many specs' scope but none owns the foundational implementation, there is a gap.

**Resolution:**
- Create a foundational spec that owns the cross-cutting concern's implementation (e.g., `security-foundation`, `observability-framework`).
- Other specs then declare a dependency on the foundational spec and consume its capabilities rather than reimplementing them.
- Document in each consuming spec how it integrates with the cross-cutting concern (e.g., "Uses auth middleware from SPEC-002").

---

## 6. Dependency Analysis

Understanding and managing dependencies between specifications is critical for planning, sequencing, and parallel development.

### Building the Dependency Matrix

Create a matrix where:
- **Rows** = specs that DEPEND ON something
- **Columns** = specs that ARE DEPENDED UPON
- **Cells** = dependency type

| | SPEC-001 | SPEC-002 | SPEC-003 | SPEC-004 | SPEC-005 |
|---|---|---|---|---|---|
| **SPEC-001** | — | NONE | NONE | NONE | NONE |
| **SPEC-002** | BLOCKS | — | NONE | NONE | NONE |
| **SPEC-003** | BLOCKS | INFORMS | — | NONE | NONE |
| **SPEC-004** | BLOCKS | BLOCKS | NONE | — | NONE |
| **SPEC-005** | NONE | NONE | INFORMS | INFORMS | — |

### Dependency Types

- **BLOCKS:** The depended-upon spec MUST be completed (or at least its interface defined) before this spec can begin implementation. This is a hard dependency.
  - *Example:* The database schema spec must be done before the user authentication spec can create tables.
- **INFORMS:** The depended-upon spec provides context, conventions, or patterns that influence this spec, but implementation can proceed in parallel using stubs or assumptions.
  - *Example:* The notification spec is informed by the order-processing spec (to know what events trigger notifications), but can be built with placeholder events.
- **NONE:** No meaningful dependency between the two specs.

### Identifying and Breaking Circular Dependencies

**Detection:** If Spec A depends on Spec B AND Spec B depends on Spec A, you have a circular dependency.

**Resolution strategies:**
1. **Extract the shared concern** into a new foundational spec that both depend on.
2. **Define an interface contract** — one spec owns the interface definition, the other consumes it, breaking the cycle.
3. **Merge the specs** — if two specs are tightly coupled in both directions, they may actually be one spec.
4. **Downgrade one dependency** from BLOCKS to INFORMS — identify which direction is the weaker dependency and treat it as informational rather than blocking.

### Identifying the Critical Path

The critical path is the longest chain of BLOCKS dependencies from start to finish.

**Process:**
1. Build a directed acyclic graph (DAG) where edges represent BLOCKS dependencies.
2. Find the longest path through the graph.
3. The specs on this path determine the minimum project duration.
4. Any delay to a spec on the critical path delays the entire project.

**Actions:**
- Prioritize critical-path specs for early implementation.
- Assign the strongest developers to critical-path specs.
- Identify which BLOCKS dependencies could be downgraded to INFORMS by defining interface contracts early.

### Identifying Parallel Development Opportunities

Specs with no BLOCKS dependency between them can be developed in parallel.

**Process:**
1. From the DAG, identify all specs at the same "depth" (same number of BLOCKS dependencies from the root).
2. These specs are candidates for parallel development.
3. Verify that parallel specs do not modify the same files or data structures — shared file edits create merge conflicts and coordination overhead.

---

## 7. Implementation Sequencing

Once dependencies are mapped, organize specs into implementation phases.

### Topological Sorting

Sort all specs using topological sort based on BLOCKS dependencies:
1. Start with specs that have no BLOCKS dependencies (they depend on nothing).
2. Next, add specs whose BLOCKS dependencies are all in the previous group.
3. Continue until all specs are placed.

If topological sort fails, there is a circular dependency that must be broken first (see Section 6).

### Implementation Phases

Organize sorted specs into logical phases that align with project milestones and deployment strategy.

#### Phase 1: Foundation
**Purpose:** Establish the technical and data foundation that all other specs build upon.

**Typical specs:**
- Database schema and data model
- Authentication and session management
- Core configuration and environment setup
- Shared component library or design system (if applicable)
- Security foundation (auth middleware, encryption utilities)

**Exit criteria:** A developer can set up the project, authenticate, and interact with the base data model.

#### Phase 2: Core Business Logic
**Purpose:** Implement the primary business capabilities that deliver the system's core value.

**Typical specs:**
- Primary domain entities and their CRUD operations
- Core business workflows (e.g., order processing, claim adjudication)
- Business rule engines and validation logic
- Essential API endpoints

**Exit criteria:** The system's core value proposition is functional and demonstrable.

#### Phase 3: Integrations
**Purpose:** Connect the system to external services and data sources.

**Typical specs:**
- Payment gateway integration
- Email/SMS service integration
- Third-party API integrations
- Legacy system connectors
- SSO / identity provider integration

**Exit criteria:** All external system interactions are functional with proper error handling and fallbacks.

#### Phase 4: Enhancements and Optimization
**Purpose:** Add non-critical features, improve performance, and enhance user experience.

**Typical specs:**
- Reporting and analytics dashboards
- Advanced search and filtering
- Notification preferences and delivery optimization
- Performance optimization (caching, query optimization)
- Admin tools and back-office features

**Exit criteria:** The system is feature-complete per the requirements.

#### Phase 5: Testing and Validation
**Purpose:** Comprehensive testing, quality assurance, and pre-launch validation.

**Typical specs:**
- End-to-end test suites
- Performance and load testing
- Security audit and penetration testing
- Accessibility compliance validation
- User acceptance testing (UAT) scenarios

**Exit criteria:** All acceptance criteria across all specs are verified and passing.

### Phase Assignment Rules

- A spec MUST NOT be in an earlier phase than any spec it BLOCKS-depends on.
- A spec SHOULD be in the earliest phase possible, given its dependencies.
- Specs in the same phase SHOULD be parallelizable (no BLOCKS dependencies between them).
- If a phase has too many specs for the team to handle in parallel, split it into sub-phases (Phase 2a, Phase 2b).

---

## 8. Multi-Developer Planning

When the team size is known, translate the specification breakdown into a concrete development plan.

### Assigning Specs to Developers

**Principles:**
1. **Respect dependencies:** A developer should not be blocked waiting for their own earlier work. Assign dependent specs to different developers where possible.
2. **Maximize parallelism:** Assign independent specs to different developers so they can work simultaneously.
3. **Minimize context switching:** Where possible, assign related specs to the same developer so domain knowledge is retained.
4. **Balance workload:** Distribute complexity and effort evenly across the team.
5. **Consider expertise:** Assign integration specs to developers with integration experience; assign UI-heavy specs to frontend-oriented developers.

### Parallel Work Identification

Create a Gantt-style plan showing which specs can proceed simultaneously:

```
Developer A: [SPEC-001: db-schema]──>[SPEC-004: authorization]──>[SPEC-008: reporting]
Developer B:       [SPEC-002: user-auth]──>[SPEC-005: order-processing]──>[SPEC-009: admin]
Developer C:       [SPEC-003: ui-foundation]──>[SPEC-006: payment-integration]──>[SPEC-010: notifications]
                                                     ↑ sync point (SPEC-005 informs SPEC-006)
```

### Sync Points

Identify moments where parallel work streams must converge:
- **Interface sync:** When one spec produces an API that another consumes — agree on the contract before both proceed.
- **Data model sync:** When multiple specs add to the same database schema — coordinate migrations.
- **Integration sync:** When an integration spec needs events or data from a business logic spec — define the event contract early.
- **UI sync:** When multiple specs contribute to the same page or workflow — agree on component boundaries and shared state.

**Document each sync point:**
- Which specs are involved
- What must be agreed upon
- When the sync must happen (before which phase or milestone)
- Who is responsible for facilitating the sync

### Effort Estimation

Use T-shirt sizing for initial estimates:

| Size | Effort Estimate | Typical Characteristics |
|---|---|---|
| **S (Small)** | 1-3 days | Simple CRUD, minimal logic, well-understood patterns |
| **M (Medium)** | 3-7 days | Moderate business logic, one integration, some edge cases |
| **L (Large)** | 1-2 weeks | Complex business rules, multiple integrations, significant testing |
| **XL (Extra Large)** | 2-4 weeks | Novel algorithms, complex state management, extensive integration, high security requirements |

**Estimation guidelines:**
- Include time for implementation, unit testing, code review, and bug fixes.
- Do NOT include time for requirements clarification or spec writing (that is the current phase).
- Add a buffer (15-25%) for unforeseen complexity.
- If a spec estimates at XL, reconsider whether it should be split.
- Compare estimates across specs for consistency — if two similar specs have wildly different estimates, re-examine.

### Sample Multi-Developer Plan

For a 3-developer team with 8 specs:

| Phase | Developer A | Developer B | Developer C | Sync Points |
|---|---|---|---|---|
| **Phase 1** | SPEC-001: db-schema (M) | SPEC-002: user-auth (L) | SPEC-003: ui-foundation (M) | DB schema review before Phase 2 |
| **Phase 2** | SPEC-004: order-mgmt (L) | SPEC-005: inventory (M) | SPEC-006: billing (L) | API contracts between 004, 005, 006 |
| **Phase 3** | SPEC-007: payment-gw (M) | SPEC-008: notifications (S) | — (support/review) | Payment events from SPEC-006 |
| **Phase 4** | Integration testing | Integration testing | UAT preparation | Full system sync |

### Key Deliverable

The output of this multi-developer planning process is a **Development Roadmap** that includes:
1. Phased spec assignments with developer names
2. Estimated timeline per phase
3. Identified sync points with responsible parties
4. Risk areas where delays in one spec cascade to others
5. Parallel work streams visualized
6. Total estimated project duration (critical path duration + buffer)
