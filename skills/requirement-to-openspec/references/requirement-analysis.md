# Requirement Document Analysis Reference

This reference provides detailed, actionable guidance for **Step 1 (Document Analysis)** and **Step 2 (Missing Information Identification)** of the requirement-to-openspec skill. Follow every section methodically to ensure no requirement is missed, misunderstood, or left ambiguous.

---

## 1. Document Intake and File Type Handling

Before extracting requirements, correctly ingest the source document and log its metadata.

### 1.1 File Metadata Logging

For every document received, record the following before analysis begins:

- **File name** (original name as provided by the user)
- **File format** (PDF, DOCX, XLSX, MD, TXT, or other)
- **File size** (bytes / KB / MB)
- **Page count** (for PDF/DOCX) or **sheet count** (for XLSX)
- **Date received / analyzed**
- **Any password protection or access restrictions detected**

This metadata becomes part of the final planning document's "Document Overview" section.

### 1.2 Format-Specific Handling

#### PDF Documents
- Extract all text content page by page, preserving section ordering.
- Detect and extract **tables** — do not flatten tabular data into paragraphs. Preserve row/column structure and headers.
- Extract **headers and footers** on each page — these often contain version numbers, confidentiality notices, or section labels.
- Identify **images, diagrams, and figures** — note their location and any captions or alt text. If text within images is unreadable, flag it explicitly: `[UNREADABLE: Image on page X — manual review required]`.
- Handle **multi-column layouts** carefully — ensure text extraction follows logical reading order, not physical column order.
- Note **bookmarks / table of contents** if present — use them to validate that every section has been analyzed.
- Flag any **scanned/image-based pages** that lack embedded text as requiring OCR or manual review.

#### DOCX Documents
- Parse the **full document body** including all paragraphs, headings, and nested content.
- Extract **headers and footers** (they frequently contain document version, status, author, date).
- Extract **all tables** — preserve structure, merge cells, and header rows. Analyze each table row by row.
- Process **appendices** — these are often the most requirement-dense sections and must not be skipped.
- Read **embedded images** — extract alt text and captions. Flag images without alt text: `[IMAGE WITHOUT ALT TEXT: Location — manual review required]`.
- Process **comments and tracked changes** — these may contain clarifications, open questions, or pending decisions from stakeholders. Log them as potential requirements or open items.
- Parse **footnotes and endnotes** — they often contain constraints, exceptions, or regulatory references.
- Respect **heading hierarchy** (Heading 1, 2, 3…) to understand document structure and section nesting.

#### XLSX / Spreadsheet Documents
- Analyze **ALL worksheets** — not just the first or most obvious one. Hidden worksheets must also be checked.
- For each worksheet:
  - Identify whether it contains **tabular data**, **configuration matrices**, **lookup tables**, **field definitions**, **role-permission matrices**, or **mapping tables**.
  - Read **header rows** to understand column semantics before processing data rows.
  - Process **every data row** — do not summarize or sample. Each row may represent a distinct requirement, rule, or entity.
- Check for **named ranges** — they often define business rules, validation lists, or configuration parameters.
- Check for **merged cells** — unmerge logically to understand groupings and hierarchies.
- Check for **formulas** — they may encode business rules or calculations that must become explicit requirements.
- Check for **data validation dropdowns** — these define allowed values and may represent business constraints.
- Check for **conditional formatting** — it may encode business rules (e.g., "highlight overdue items in red" implies a status-tracking requirement).
- Note **cross-sheet references** — they indicate relationships between entities or modules.

#### Markdown Documents
- Parse the full document respecting Markdown heading hierarchy (`#`, `##`, `###`…).
- Extract content from **code blocks** — they may contain API schemas, configuration examples, data structures, or pseudocode that encode requirements.
- Process **tables** (pipe-delimited Markdown tables) row by row.
- Follow **internal links** (anchors to other sections) to resolve cross-references.
- Process **task lists** (`- [ ]` / `- [x]`) — these may represent requirement status or acceptance criteria.
- Note **HTML blocks** embedded in Markdown — they may contain structured data or layout not visible in plain Markdown rendering.

#### TXT / Plain Text Documents
- Scan the entire file sequentially — there is no structural markup to rely on.
- Identify **implicit sections** by looking for patterns: blank-line separators, numbered lists, indentation changes, ALL-CAPS headers, or dashed/underlined headings.
- Identify **tabular data** presented with spacing or tab alignment — reconstruct into structured tables.
- Be extra vigilant for **embedded lists** that may look like prose but actually enumerate distinct requirements.
- Flag the absence of structure: `[NOTE: Source document is unstructured plain text — requirement boundaries inferred by analysis agent]`.

---

## 2. Comprehensive Requirement Extraction Framework

Systematically extract every requirement from the document. For each category below, actively look for the listed sub-types. Do not wait for the document to explicitly label something as a "requirement" — many requirements are embedded in prose, diagrams, tables, or footnotes.

### 2.1 Functional Requirements (FR)

Functional requirements describe **what the system must do** — its behaviors, features, and capabilities.

**Extract the following sub-types:**

- **User Actions / Interactions:** Every action a user can perform — create, read, update, delete, search, filter, sort, export, import, upload, download, print, share, approve, reject, submit, cancel, undo.
- **System Behaviors / Responses:** What the system does in response to user actions or events — calculations, state changes, data transformations, triggering of downstream processes.
- **Business Processes / Transactions:** End-to-end processes the system supports — application submission, claim processing, enrollment, ordering, invoicing, onboarding.
- **Calculations and Formulas:** Any mathematical or logical computation — tax calculations, premium calculations, scoring algorithms, proration, rounding rules, aggregations.
- **Reports and Dashboards:** Every report, chart, dashboard, export, or analytics view mentioned — include its data source, filters, groupings, time ranges, and output format.
- **Notifications and Alerts:** Email, SMS, in-app, push notifications — capture the trigger event, recipient(s), message content or template, delivery channel, and timing (immediate vs. scheduled vs. batched).
- **Search and Filtering:** Search capabilities — what fields are searchable, what filters are available, full-text vs. field-specific, auto-complete, saved searches.
- **Data Import / Export:** Bulk data operations — file formats, field mappings, validation on import, scheduling, error handling.
- **Audit and Logging:** What user or system actions must be logged — who did what, when, what changed (before/after values).

### 2.2 Non-Functional Requirements (NFR)

Non-functional requirements describe **how the system must perform** — its quality attributes.

**Extract the following sub-types:**

- **Performance:** Response times (page load < 2s, API response < 500ms), throughput (transactions per second), batch processing time limits, concurrent user targets.
- **Scalability:** Expected growth in users, data volume, transaction volume. Horizontal vs. vertical scaling expectations. Peak load scenarios.
- **Availability:** Uptime targets (99.9%, 99.99%), maintenance windows, disaster recovery RTO/RPO, failover expectations, geographic redundancy.
- **Security:** Authentication methods (SSO, MFA, OAuth, SAML), authorization models (RBAC, ABAC), encryption (at rest, in transit), session management, password policies, vulnerability scanning, penetration testing requirements.
- **Compliance and Regulatory:** Industry standards (HIPAA, PCI-DSS, SOC 2, GDPR, WCAG, Section 508), data residency, retention policies, right to deletion, consent management.
- **Usability:** User experience expectations — mobile responsiveness, accessibility standards (WCAG 2.1 AA), internationalization (i18n), localization (l10n), right-to-left support.
- **Accessibility:** Screen reader compatibility, keyboard navigation, color contrast ratios, ARIA labels, focus management, alt text requirements.
- **Maintainability:** Code standards, documentation requirements, modular architecture expectations, API versioning strategy, backward compatibility.
- **Reliability:** Error rates, data integrity guarantees, transaction consistency (ACID), idempotency, retry strategies, graceful degradation.
- **Observability:** Logging, monitoring, alerting, health checks, distributed tracing, SLA dashboards.

### 2.3 Business Rules (BR)

Business rules define **the constraints, policies, and logic** that govern how the business operates.

**Extract the following sub-types:**

- **Validation Rules:** Field-level validations (required, min/max length, regex patterns, allowed values, date ranges), cross-field validations (field A required if field B = X), entity-level validations.
- **Calculation Rules:** Formulas, algorithms, rounding rules, proration logic, tax computation, discount application, penalty calculation.
- **Eligibility Criteria:** Who or what qualifies for a process, benefit, or action — age limits, geographic restrictions, membership tiers, licensing requirements.
- **Approval Workflows:** Who approves what, approval hierarchies, auto-approval thresholds, escalation on timeout, delegation rules, approval conditions.
- **Status Transitions:** Valid state transitions (e.g., Draft → Submitted → Under Review → Approved / Rejected), who can trigger each transition, what happens on each transition, guard conditions.
- **Conditional / Branching Logic:** If/then/else rules, lookup-table-driven behavior, configurable rules, rule precedence and overrides.
- **Time-Based Rules:** Deadlines, SLA timers, aging rules, auto-expiration, grace periods, recurring schedules.
- **Deduplication Rules:** How duplicates are detected and resolved — matching criteria, merge logic, master record selection.

### 2.4 User Roles and Permissions

Capture the **complete access control model**.

- **Role Definitions:** Every named role mentioned (Admin, Manager, Clerk, Auditor, External User, API Consumer, System Account). Note the business purpose of each.
- **Role Hierarchy:** Parent-child or inheritance relationships between roles (e.g., Manager inherits all Clerk permissions).
- **Permission Matrix:** For each role, capture: which features / screens / actions / data are accessible (read, write, delete, approve, export) and which are denied.
- **Access Levels:** Row-level security (users see only their own data vs. team data vs. all data), field-level security (sensitive fields hidden or masked for certain roles).
- **Role-Based Views:** Different UI layouts, dashboards, or navigation menus per role.
- **Role Assignment Rules:** Who can assign / revoke roles, self-registration roles, default role on account creation.
- **Multi-Tenancy Considerations:** If applicable — tenant isolation, cross-tenant visibility, tenant admin vs. super admin.

### 2.5 Workflows and Business Processes

Capture the **end-to-end flows** the system must support.

- **Process Steps:** Every step in the workflow — who performs it, what they do, what inputs are needed, what outputs are produced.
- **Decision Points:** Where the flow branches based on conditions — capture the condition, each branch, and the outcome.
- **Parallel Paths:** Steps that can or must occur simultaneously — parallel approvals, parallel processing, fork-and-join patterns.
- **Exception Paths:** What happens when the normal flow fails — error handling, fallback procedures, manual overrides, retry logic.
- **Escalation Procedures:** When and how work is escalated — timeout-based escalation, threshold-based escalation, escalation chains.
- **Triggers:** What initiates the workflow — user action, scheduled event, external event, data threshold, API call.
- **Completion Criteria:** What defines the workflow as "done" — final state, required outputs, notifications sent.
- **SLA and Timing:** Maximum allowed duration for each step or the overall workflow, warning thresholds.

### 2.6 Entities and Data Requirements

Capture the **data model** implied or stated in the document.

- **Entities / Objects:** Every business entity mentioned — Customer, Policy, Claim, Order, Product, User, Document, Transaction, etc.
- **Attributes / Fields:** For each entity — field name, data type (string, integer, decimal, date, boolean, enum, blob), length/precision, required/optional, default value, display label.
- **Relationships:** Between entities — one-to-one, one-to-many, many-to-many. Note the cardinality and whether the relationship is required or optional.
- **Constraints:** Unique keys, composite keys, foreign keys, check constraints, not-null constraints.
- **Data Lifecycle:** Creation, modification, archival, deletion, soft-delete vs. hard-delete, data retention periods.
- **Historical / Temporal Data:** Whether historical states must be preserved (audit trail, versioning, effective dating, bitemporal modeling).
- **Master Data / Reference Data:** Lookup tables, code tables, configuration tables — their source of truth, how they are maintained, and whether they are shared across modules.
- **Data Volume Estimates:** Expected record counts, growth rates, peak data creation periods.

### 2.7 External Integrations (INT)

Capture every interaction with an **external system, service, or data source**.

- **Integration Partner / System:** Name and purpose of the external system.
- **Direction:** Inbound (receiving data), outbound (sending data), or bidirectional.
- **Protocol / Method:** REST API, SOAP, GraphQL, file transfer (SFTP, S3), message queue (Kafka, RabbitMQ, SQS), webhooks, database link, EDI.
- **Data Format:** JSON, XML, CSV, fixed-width, HL7, FHIR, custom binary.
- **Authentication:** API key, OAuth 2.0, mutual TLS, basic auth, SAML, custom token.
- **Frequency / Trigger:** Real-time, near-real-time, batch (hourly, daily, weekly), event-driven.
- **Error Handling:** Retry strategy, dead-letter queue, manual intervention, alerting on failure.
- **Data Mapping:** Field-by-field mapping between internal and external data models, transformation rules, default values for missing fields.
- **SLA / Rate Limits:** Expected response times, rate limits, throttling behavior, circuit breaker patterns.
- **Environments:** Sandbox, staging, production endpoints, and how they differ.

### 2.8 Technical Constraints

Capture any **technology-specific mandates or limitations**.

- **Technology Stack Mandates:** Required languages, frameworks, databases, cloud providers, or specific product versions.
- **Browser / Device Support:** Minimum browser versions, mobile device support, responsive breakpoints, offline capability.
- **Deployment Constraints:** On-premises vs. cloud, specific cloud regions, container orchestration requirements, CI/CD pipeline requirements.
- **Infrastructure Requirements:** Server sizing, storage requirements, network topology, load balancer requirements, CDN usage.
- **Third-Party Licensing:** Software licenses that constrain technology choices or deployment models.
- **Legacy System Constraints:** Systems that cannot be modified and must be integrated as-is, deprecated APIs that must still be supported.
- **Data Sovereignty:** Data must reside in specific jurisdictions, cross-border transfer restrictions.

### 2.9 Dependencies and Assumptions

Capture what the project **relies upon but does not control**.

- **External Dependencies:** Systems, services, or teams that must deliver something before or during the project — upstream data feeds, identity providers, payment gateways, regulatory approvals.
- **Prerequisite Systems:** Systems that must be in place before this system can function — infrastructure, middleware, shared services.
- **Assumed Environments:** Assumptions about deployment environments, network connectivity, user devices, browser capabilities.
- **Organizational Assumptions:** Assumptions about team structure, available expertise, support model, training plans.
- **Data Availability Assumptions:** Assumptions about data quality, data migration readiness, master data availability.
- **Timeline Assumptions:** Assumed availability of dependent systems or stakeholder decisions by certain dates.

---

## 3. Requirement ID Assignment Convention

Every extracted requirement **must** be assigned a unique identifier following this convention:

| Prefix | Category | Example |
|--------|----------|---------|
| `FR-` | Functional Requirement | FR-001, FR-002, …, FR-nnn |
| `NFR-` | Non-Functional Requirement | NFR-001, NFR-002, … |
| `BR-` | Business Rule | BR-001, BR-002, … |
| `INT-` | Integration Requirement | INT-001, INT-002, … |
| `WF-` | Workflow Requirement | WF-001, WF-002, … |
| `DR-` | Data Requirement | DR-001, DR-002, … |
| `SEC-` | Security Requirement | SEC-001, SEC-002, … |

### Assignment Rules

- **Sequential numbering** within each category — start at 001 and increment.
- **Never reuse** an ID, even if a requirement is removed or merged. Mark it as `[REMOVED — merged into FR-XXX]` or `[REMOVED — duplicate of BR-YYY]`.
- **One requirement per ID** — do not combine multiple distinct requirements under a single ID. If a sentence contains two requirements, split it into two IDs.
- **Cross-category references** — when a functional requirement implies a business rule, create both (e.g., FR-012 references BR-005). Note the relationship explicitly.
- **Source traceability** — for each ID, record where in the source document it was found (section number, page number, table row, or paragraph reference).
- When a requirement does not cleanly fit one category, assign it to the **most specific** category. For example, "passwords must be at least 12 characters" is SEC, not NFR, even though security is a non-functional concern.

---

## 4. Analysis Quality Checklist

After completing the extraction, verify every item on this checklist. Do not proceed to Step 2 (Missing Information Identification) until all items are confirmed.

### Document Coverage
- [ ] **Every section** of the document has been read and analyzed — not just the sections labeled "Requirements."
- [ ] **Table of contents** (if present) has been compared against analyzed sections to ensure nothing was skipped.
- [ ] **All tables** have been analyzed **row by row** — not summarized or sampled.
- [ ] **All appendices** have been analyzed with the same rigor as the main body.
- [ ] **Headers and footers** have been checked for version info, status, dates, and confidentiality notices.
- [ ] **Footnotes and endnotes** have been read and incorporated.
- [ ] **Comments and tracked changes** (DOCX) have been reviewed.
- [ ] **All worksheets** (XLSX) have been analyzed, including hidden sheets.

### Extraction Completeness
- [ ] Every requirement has a **unique ID** following the convention in Section 3.
- [ ] Every requirement has a **source reference** (document section, page, table, row).
- [ ] Every requirement has been assigned to **at least one category** (FR, NFR, BR, INT, WF, DR, SEC).
- [ ] **Implicit requirements** have been flagged with `[IMPLICIT]` tag — they are identified but not invented.
- [ ] **Ambiguous requirements** have been flagged with `[AMBIGUOUS]` tag for clarification in Step 2.

### Cross-Reference Resolution
- [ ] Internal document cross-references ("see Section 3.2", "as described above") have been **resolved** — the referenced content has been located and linked.
- [ ] **Conflicting statements** between sections have been identified and flagged.
- [ ] **Duplicate requirements** stated in different sections have been detected and consolidated under a single ID, with the duplicates noted.

### Terminology
- [ ] A **glossary of domain-specific terms** has been compiled — every term that could be unfamiliar or has a specific meaning in this domain.
- [ ] **Acronyms** have been expanded and defined.
- [ ] Terms used **inconsistently** across the document (same concept, different names) have been flagged.

---

## 5. Missing Information Detection Framework

After extracting all requirements, systematically scan for gaps, ambiguities, and incompleteness. Every detected issue must be logged with:
- **Issue ID** (e.g., GAP-001)
- **Related requirement(s)** (by ID)
- **Category** (from the list below)
- **Description** of what is missing or unclear
- **Impact** (what cannot be specified or built without this information)
- **Suggested clarification question** for the user

### 5.1 Ambiguous Language Patterns

Scan the entire document for vague, subjective, or open-ended language. These words and phrases almost always indicate under-specified requirements:

- **Vague qualifiers:** "appropriate", "reasonable", "adequate", "sufficient", "acceptable", "suitable", "proper", "timely", "relevant"
- **Open-ended lists:** "etc.", "and so on", "such as", "including but not limited to", "among others", "and more"
- **Subjective terms:** "user-friendly", "intuitive", "easy to use", "fast", "responsive", "modern", "clean", "simple"
- **Weasel words:** "should" (vs. "must" / "shall"), "may", "might", "could", "can", "possibly", "ideally", "preferably"
- **Unquantified measures:** "large number", "many users", "high performance", "minimal downtime", "quickly", "frequently", "rarely"
- **Undefined references:** "the system", "the user", "the data" (which system? which user type? which data?)
- **Passive voice hiding actors:** "the report is generated" (by whom? triggered by what?), "data is validated" (against what rules?)

For each instance found, flag it and formulate a specific clarification question that would eliminate the ambiguity.

### 5.2 Incomplete Specifications

For every functional requirement, verify the presence of:

- **Inputs:** What data, events, or user actions trigger this function? Are all input fields/parameters defined?
- **Processing / Logic:** What does the system do with the inputs? Are the steps or rules fully described?
- **Outputs:** What is produced — screen update, data change, notification, report, file? Is the output format defined?
- **Preconditions:** What must be true before this function can execute? (user must be logged in, record must exist, prior step must be complete)
- **Postconditions:** What must be true after successful execution?
- **Error / Exception States:** What happens when inputs are invalid, a dependency is unavailable, a timeout occurs, or the user cancels mid-process?
- **User Feedback:** What does the user see during and after the operation — progress indicators, success messages, error messages?

Flag any requirement missing one or more of these elements.

### 5.3 Conflicting Requirements

Look for contradictions between:

- **Different sections** of the same document (Section 2 says X, Section 5 says not-X).
- **Different requirement types** (a business rule contradicts a workflow step).
- **Text vs. diagrams** (a process diagram shows a path not described in text, or omits one that is).
- **Text vs. tables** (a table shows field X as optional, but the text says it is required).
- **Stakeholder perspectives** (if the document reflects multiple authors, look for conflicting priorities or assumptions).

For each conflict, document both statements, their locations, and ask the user which takes precedence.

### 5.4 Missing Business Rules for Edge Cases

For every business rule identified, probe for edge cases:

- **Boundary values:** What happens at the exact boundary? (exactly 18 years old, exactly $0.00, exactly the deadline)
- **Zero / null / empty values:** What happens when a required input is blank, zero, or null?
- **Maximum limits:** What is the upper bound? What happens when it is exceeded?
- **Concurrent actions:** What happens when two users perform the same action simultaneously?
- **Retroactive changes:** What happens when data that was used in a past decision is corrected?
- **Timezone / locale:** Are dates and times timezone-aware? What is the system's reference timezone?
- **Rounding:** When calculations produce fractions, what rounding rule applies? (floor, ceiling, round-half-up, banker's rounding)

### 5.5 Unclear Workflow Transitions

For every workflow, verify:

- Every **state** has at least one **entry path** and at least one **exit path** (no orphan states).
- Every **decision point** has conditions for **all branches**, including the "else" / default branch.
- **Parallel paths** have a defined **join / synchronization** point — what happens if one branch completes before another? What if one branch fails?
- **Manual steps** have a defined **responsible role**.
- **Automated steps** have a defined **trigger** and **completion criteria**.
- **Timeout behavior** is specified for steps that involve waiting (approval, external response, user action).
- **Cancellation** is addressed — can the workflow be cancelled mid-flight? What happens to in-progress steps?

### 5.6 Missing Validation Rules

For every data input (form field, API parameter, file upload, imported data), verify:

- **Required vs. optional** is specified.
- **Data type** is specified (string, number, date, boolean, enum, file).
- **Length / range constraints** are specified (min/max length, min/max value, date range).
- **Format constraints** are specified (email format, phone format, postal code, regex pattern).
- **Allowed values** are specified for enumerations (dropdown lists, status codes, type codes).
- **Cross-field validations** are specified (end date must be after start date, secondary contact required if primary is external).
- **Error messages** are specified for each validation failure (or at minimum, the user-facing behavior is described).

### 5.7 Unspecified Error-Handling Scenarios

For every system interaction (API call, database operation, file operation, external service call), verify:

- **Failure mode** is identified — what can go wrong? (network timeout, invalid response, service unavailable, data corruption, quota exceeded)
- **System behavior on failure** is specified — retry? fallback? queue for later? alert an operator? show user an error?
- **Retry strategy** is specified — how many retries? what interval? exponential backoff?
- **Data consistency** on failure is addressed — is the operation atomic? What happens to partial writes? Is rollback required?
- **User communication** on failure is specified — what does the user see? Can they retry? Is there a support path?
- **Logging / alerting** on failure is specified — what is logged? Who is notified?

### 5.8 Unclear Integration Specifications

For every external integration, verify:

- **Authentication method** is specified — not just "secure connection" but the exact mechanism.
- **Data format** is specified — not just "JSON" but the schema or at least the key fields.
- **Error codes / responses** from the external system are documented.
- **Rate limits** of the external system are known and handled.
- **Data mapping** is complete — every field in the internal system maps to a field in the external system (or has a default / is excluded).
- **Retry and failover** logic is specified.
- **Testing / sandbox** environment is available and documented.
- **SLA** of the external system is known (availability, response time).
- **Data ownership** is clear — who is the source of truth for shared data?

### 5.9 Missing Security Requirements

Verify that the document addresses:

- **Authentication:** How do users log in? SSO, local credentials, MFA, biometric? Session timeout? "Remember me" behavior?
- **Authorization:** How are permissions enforced? At what level — feature, screen, field, record?
- **Data Encryption:** At rest? In transit? Which algorithms / standards? Key management?
- **Audit Trail:** What actions are logged? Who can view audit logs? Retention period? Tamper-proof?
- **Data Masking / Redaction:** Which fields are sensitive (PII, PHI, PCI)? How are they displayed to different roles?
- **Input Sanitization:** Protection against injection attacks (SQL, XSS, CSRF)?
- **API Security:** Rate limiting, IP whitelisting, API key rotation, token expiry?
- **Incident Response:** What is the procedure for a security breach? Who is notified?

### 5.10 Missing Non-Functional Requirements

Even if a document focuses on functional requirements, check whether the following are addressed at all:

- **Performance targets** — if not stated, flag as missing. "The system should be fast" is not a target.
- **Scalability expectations** — expected user count, data volume, growth trajectory.
- **Availability / uptime** — target SLA percentage, planned maintenance windows.
- **Backup and recovery** — backup frequency, recovery time objective, recovery point objective.
- **Monitoring and alerting** — how is system health tracked? Who is alerted on issues?
- **Internationalization / Localization** — is multi-language support needed? Multiple currencies? Multiple date formats?
- **Accessibility compliance** — which standard and level? (WCAG 2.1 AA, Section 508)
- **Browser / device support** — minimum versions, mobile-first vs. desktop-first?
- **Documentation** — user manuals, API documentation, admin guides, training materials?

---

## 6. Requirement Quality Assessment

After extraction and gap detection, assess the **quality** of each individual requirement. A requirement that fails any of these criteria must be flagged for clarification or refinement before it can be translated into an OpenSpec specification.

### 6.1 Testability

> Can the requirement be objectively verified through testing?

- A testable requirement has **measurable acceptance criteria** — specific values, counts, time limits, or observable behaviors.
- **Fail indicators:**
  - Contains subjective terms ("user-friendly", "intuitive", "fast") without quantified thresholds.
  - Describes a goal ("improve efficiency") rather than a behavior ("reduce processing time from 5 minutes to 30 seconds").
  - Cannot be demonstrated in a test scenario with a definitive pass/fail outcome.
- **Action:** Flag as `[NOT TESTABLE]` and formulate a clarification question asking for measurable criteria.

### 6.2 Completeness

> Are all inputs, outputs, preconditions, postconditions, and error states specified?

- A complete requirement leaves no question about **what triggers it, what it does, and what results it produces**.
- **Fail indicators:**
  - Missing input specification — "the system processes the request" (what request? what fields?).
  - Missing output specification — "the system generates a report" (what content? what format? delivered how?).
  - Missing preconditions — "the user submits the form" (must the user be logged in? must all fields be filled?).
  - Missing error handling — "the system saves the data" (what if the save fails? what if validation fails?).
- **Action:** Flag as `[INCOMPLETE]` with a description of what is missing.

### 6.3 Consistency

> Does this requirement contradict any other requirement in the document?

- A consistent requirement does not conflict with any other requirement, business rule, workflow, or constraint.
- **Fail indicators:**
  - Two requirements specify different behaviors for the same trigger or state.
  - A business rule contradicts a workflow step.
  - A security requirement conflicts with a usability requirement.
  - A data requirement specifies a field as required in one place and optional in another.
- **Action:** Flag as `[CONFLICT]` with references to both conflicting requirements by their IDs.

### 6.4 Unambiguity

> Can this requirement be interpreted in only one way?

- An unambiguous requirement has **one and only one** valid interpretation.
- **Fail indicators:**
  - Uses pronouns with unclear antecedents ("it should be updated" — what is "it"?).
  - Uses terms that could mean different things in different contexts ("the record" — which record type?).
  - Uses language that leaves room for design interpretation when the business intent should dictate the behavior.
  - Multiple team members could reasonably disagree on what the requirement means.
- **Action:** Flag as `[AMBIGUOUS]` with the multiple possible interpretations and a clarification question.

### 6.5 Traceability

> Can this requirement be traced back to a specific business objective, stakeholder need, or regulatory mandate?

- A traceable requirement has a clear **"why"** — it exists because of a business goal, user need, compliance obligation, or explicit stakeholder request.
- **Fail indicators:**
  - The requirement appears without context or justification.
  - It cannot be linked to any stated project objective or business driver.
  - It seems to be a solution masquerading as a requirement (specifying "how" without a clear "why").
- **Action:** Flag as `[UNTRACEABLE]` and ask the user to provide the business justification or originating stakeholder.

---

## Summary of Tags for Flagging

Use these standardized tags throughout the analysis to ensure consistent flagging:

| Tag | Meaning | Used When |
|-----|---------|-----------|
| `[IMPLICIT]` | Requirement inferred, not explicitly stated | A behavior is implied but never written as a requirement |
| `[AMBIGUOUS]` | Multiple interpretations possible | Vague language, undefined terms, unclear scope |
| `[INCOMPLETE]` | Missing inputs, outputs, or conditions | Requirement lacks full specification |
| `[CONFLICT]` | Contradicts another requirement | Two requirements disagree |
| `[NOT TESTABLE]` | Cannot be objectively verified | Subjective or unmeasurable language |
| `[UNTRACEABLE]` | No clear business justification | Requirement without a stated "why" |
| `[UNREADABLE]` | Source content could not be extracted | Image-based PDF, missing alt text, corrupted content |
| `[ASSUMED]` | Agent made an assumption | Reasonable assumption made due to missing information |
