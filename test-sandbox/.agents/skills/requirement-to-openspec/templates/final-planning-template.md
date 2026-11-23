# OpenSpec Requirement Analysis and Planning: {{PROJECT_NAME}}

> This document is the comprehensive output of the requirement-to-openspec skill (openspec/planning.md).
> Replace all `{{PLACEHOLDER}}` markers with actual content during generation.

---

## 1. Executive Summary

<!-- Provide a high-level summary of the project, the requirement document analyzed, key findings, total number of specs proposed, and recommended implementation approach. -->

{{EXECUTIVE_SUMMARY}}

---

## 2. Original Document Details

<!-- Record metadata about the source requirement document. -->

| Field | Value |
|-------|-------|
| Document Name | {{DOC_NAME}} |
| Format | {{FORMAT}} |
| Pages/Sheets | {{PAGES}} |
| Upload Date | {{UPLOAD_DATE}} |
| Analysis Date | {{ANALYSIS_DATE}} |
| Document Hash | {{DOC_HASH}} |

---

## 3. Project Overview

<!-- Describe the project purpose, context, and high-level goals as understood from the requirement document and user clarifications. -->

{{PROJECT_OVERVIEW}}

---

## 4. Business Objectives

<!-- List the key business objectives the project aims to achieve. Each objective should be measurable where possible. -->

| ID | Objective | Success Metric | Priority |
|----|-----------|---------------|----------|
| BO-001 | {{OBJECTIVE}} | {{METRIC}} | {{PRIORITY}} |

---

## 5. Stakeholders and User Roles

<!-- Identify all stakeholders and the user roles that will interact with the system. -->

### Stakeholders
| Stakeholder | Role | Responsibility | Contact |
|-------------|------|----------------|---------|
| {{STAKEHOLDER}} | {{ROLE}} | {{RESPONSIBILITY}} | {{CONTACT}} |

### User Roles
| Role | Permissions | Description | Primary Workflows |
|------|------------|-------------|-------------------|
| {{USER_ROLE}} | {{PERMISSIONS}} | {{DESCRIPTION}} | {{WORKFLOWS}} |

---

## 6. Consolidated Requirement Understanding

<!-- Present the full consolidated understanding of requirements after analysis and clarification. This is the validated baseline that specs are derived from. -->

{{CONSOLIDATED_UNDERSTANDING}}

---

## 7. Functional Requirements

<!-- List all functional requirements extracted from the document, user clarifications, and assumptions. -->

| ID | Requirement | Source | Status | Mapped Spec |
|----|-------------|--------|--------|-------------|
| FR-001 | {{REQUIREMENT}} | {{SOURCE_SECTION}} | Original/Clarified/Assumed | {{SPEC_ID}} |

---

## 8. Non-Functional Requirements

<!-- List all non-functional requirements including performance, security, scalability, usability, etc. -->

| ID | Category | Requirement | Source | Mapped Spec |
|----|----------|-------------|--------|-------------|
| NFR-001 | {{CATEGORY}} | {{REQUIREMENT}} | {{SOURCE}} | {{SPEC_ID}} |

---

## 9. Business Rules

<!-- Document all business rules that govern system behavior. -->

| ID | Rule | Trigger | Action | Source | Mapped Spec |
|----|------|---------|--------|--------|-------------|
| BR-001 | {{RULE}} | {{TRIGGER}} | {{ACTION}} | {{SOURCE}} | {{SPEC_ID}} |

---

## 10. User Workflows

<!-- Define the key user workflows/journeys through the system. -->

### WF-001: {{WORKFLOW_NAME}}
- **Actor:** {{ACTOR}}
- **Trigger:** {{TRIGGER}}
- **Preconditions:** {{PRECONDITIONS}}
- **Steps:**
  1. {{STEP}}
- **End State:** {{END_STATE}}
- **Exception Paths:** {{EXCEPTION}}
- **Related Specs:** {{SPEC_IDS}}

---

## 11. Data Requirements

<!-- Describe the data entities, their attributes, relationships, and constraints. -->

| ID | Entity | Attributes | Relationships | Constraints | Mapped Spec |
|----|--------|-----------|---------------|-------------|-------------|
| DR-001 | {{ENTITY}} | {{ATTRIBUTES}} | {{RELATIONSHIPS}} | {{CONSTRAINTS}} | {{SPEC_ID}} |

---

## 12. Integration Requirements

<!-- Document all external system integrations required. -->

| ID | System | Direction | Protocol | Data | Auth | Mapped Spec |
|----|--------|-----------|----------|------|------|-------------|
| INT-001 | {{SYSTEM}} | {{DIRECTION}} | {{PROTOCOL}} | {{DATA}} | {{AUTH}} | {{SPEC_ID}} |

---

## 13. Technical Constraints

<!-- List any technical constraints, platform requirements, technology mandates, or architectural decisions that affect implementation. -->

| ID | Constraint | Category | Impact | Source |
|----|-----------|----------|--------|--------|
| TC-001 | {{CONSTRAINT}} | Platform/Security/Performance/Compatibility | {{IMPACT}} | {{SOURCE}} |

---

## 14. Clarification Log

<!-- Record all questions asked during the interactive clarification phase and the user's responses. -->

| # | Question | User Response | Impact on Requirements | Date |
|---|----------|--------------|----------------------|------|
| 1 | {{QUESTION}} | {{RESPONSE}} | {{IMPACT}} | {{DATE}} |

---

## 15. Assumptions and Risks

<!-- Document all assumptions made during analysis and their associated risks. -->

### Assumptions
| ID | Assumption | Impact if Wrong | Confidence | Mitigation |
|----|-----------|-----------------|------------|------------|
| ASM-001 | {{ASSUMPTION}} | {{IMPACT}} | High/Medium/Low | {{MITIGATION}} |

### Risks
| ID | Risk | Likelihood | Impact | Mitigation Strategy |
|----|------|-----------|--------|---------------------|
| RSK-001 | {{RISK}} | High/Medium/Low | High/Medium/Low | {{MITIGATION}} |

---

## 16. Project Scope

<!-- Define clear boundaries of what is in scope and out of scope for this project. -->

### In Scope
{{IN_SCOPE}}

### Out of Scope
{{OUT_OF_SCOPE}}

### Future Considerations
{{FUTURE_CONSIDERATIONS}}

---

## 17. Proposed Specification Count & Sizing Justification

<!-- Summarize the total number of specs proposed, their breakdown by priority and complexity, and the rationale justifying why this exact number of specs was chosen (avoiding both monoliths and excessive fragmentation). -->

### 17.1 Specification Count Summary
| Metric | Count |
|--------|-------|
| Total Proposed Specifications | {{TOTAL_SPECS}} |
| High / Critical Priority | {{HIGH_PRIORITY_COUNT}} |
| Medium Priority | {{MEDIUM_PRIORITY_COUNT}} |
| Low Priority | {{LOW_PRIORITY_COUNT}} |
| High Complexity | {{HIGH_COMPLEXITY_COUNT}} |
| Medium Complexity | {{MEDIUM_COMPLEXITY_COUNT}} |
| Low Complexity | {{LOW_COMPLEXITY_COUNT}} |

### 17.2 Decomposition & Sizing Rationale
<!-- Detail why the project is broken down into exactly this number of specifications:
- Capability Boundaries: How business capabilities map 1:1 or 1:N to specifications.
- Anti-Fragmentation Heuristic: Why smaller modules were combined or kept separate.
- Implementation & Review Boundaries: Ensuring each specification can be independently reviewed, implemented, and verified in an agile sprint. -->
{{DECOMPOSITION_RATIONALE}}

---

## 18. Complete Specification Breakdown

<!-- Provide the full list of proposed specifications with their details, clear boundaries, and deliverables. -->

### SPEC-001: {{SPEC_NAME}}
| Field | Value |
|-------|-------|
| Spec ID | SPEC-001 |
| Spec Name (Kebab-Case) | {{SPEC_NAME_KEBAB}} |
| Priority | {{PRIORITY}} |
| Complexity | {{COMPLEXITY}} |
| Suggested Implementation Order | {{ORDER}} |
| OpenSpec Propose Target | `openspec/changes/{{CHANGE_DIR_NAME}}/` |

**Description:**
{{DESCRIPTION}}

**Business Value:**
{{BUSINESS_VALUE}}

**Requirements Covered:**
{{REQ_IDS_AND_TITLES}}

**Functional Scope:**
- **In Scope:** {{IN_SCOPE}}
- **Out of Scope:** {{OUT_OF_SCOPE}}

**Dependencies:**
- **Prerequisite Specs:** {{PREREQUISITE_SPECS}}
- **Downstream Blocked Specs:** {{DOWNSTREAM_SPECS}}

**Expected Deliverables:**
{{DELIVERABLES}}

**Acceptance Criteria:**
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}

<!-- Repeat this block for each specification: SPEC-002, SPEC-003, etc. -->

---

## 19. Requirement Traceability Matrix

<!-- Map every requirement to the spec(s) that implement it. Every requirement must be covered by at least one spec. Flag any orphaned requirements. -->

| Requirement ID | Requirement Summary | Type | SPEC-001 | SPEC-002 | SPEC-003 | ... | Coverage Status |
|---------------|---------------------|------|----------|----------|----------|-----|-----------------|
| FR-001 | {{SUMMARY}} | FR | ✅ | | | | Covered |
| FR-002 | {{SUMMARY}} | FR | | ✅ | | | Covered |
| NFR-001 | {{SUMMARY}} | NFR | ✅ | ✅ | | | Covered |
| BR-001 | {{SUMMARY}} | BR | | | ✅ | | Covered |
| INT-001 | {{SUMMARY}} | INT | | ✅ | | | Covered |
| DR-001 | {{SUMMARY}} | DR | ✅ | | | | Covered |

<!-- Legend: ✅ = Primary coverage, 🔗 = Secondary/partial coverage, ❌ = Not covered (orphaned) -->

### Coverage Summary
| Type | Total | Covered | Orphaned |
|------|-------|---------|----------|
| Functional (FR) | {{COUNT}} | {{COVERED}} | {{ORPHANED}} |
| Non-Functional (NFR) | {{COUNT}} | {{COVERED}} | {{ORPHANED}} |
| Business Rules (BR) | {{COUNT}} | {{COVERED}} | {{ORPHANED}} |
| Integration (INT) | {{COUNT}} | {{COVERED}} | {{ORPHANED}} |
| Data (DR) | {{COUNT}} | {{COVERED}} | {{ORPHANED}} |

---

## 20. Specification Dependency Matrix

<!-- Show which specs depend on which other specs. Use this to identify critical path and parallel work streams. -->

| Spec ↓ Depends On → | SPEC-001 | SPEC-002 | SPEC-003 | SPEC-004 | ... |
|----------------------|----------|----------|----------|----------|-----|
| SPEC-001 | — | | | | |
| SPEC-002 | BLOCKS | — | | | |
| SPEC-003 | | INFORMS | — | | |
| SPEC-004 | | | BLOCKS | — | |

<!-- Legend: BLOCKS = must be completed before this spec can start, INFORMS = provides useful context but is not a hard blocker, — = self -->

### Dependency Summary
| Spec ID | Blocked By | Blocks | Informed By | Informs |
|---------|-----------|--------|-------------|---------|
| SPEC-001 | None | {{SPEC_IDS}} | None | {{SPEC_IDS}} |
| SPEC-002 | {{SPEC_IDS}} | {{SPEC_IDS}} | {{SPEC_IDS}} | {{SPEC_IDS}} |

---

## 21. Recommended Implementation Sequence

<!-- Provide the recommended order for implementing specs, respecting dependencies and maximizing value delivery. -->

| Phase | Spec ID | Spec Name | Rationale | Estimated Effort |
|-------|---------|-----------|-----------|-----------------|
| 1 | {{SPEC_ID}} | {{SPEC_NAME}} | {{RATIONALE}} | {{EFFORT}} |
| 2 | {{SPEC_ID}} | {{SPEC_NAME}} | {{RATIONALE}} | {{EFFORT}} |
| 3 | {{SPEC_ID}} | {{SPEC_NAME}} | {{RATIONALE}} | {{EFFORT}} |

---

## 22. Parallel Development Opportunities

<!-- Identify which specs can be developed in parallel to optimize delivery time. -->

### Parallel Streams
```
Stream A: SPEC-001 → SPEC-003 → SPEC-006
Stream B: SPEC-002 → SPEC-005
Stream C: SPEC-004 (independent)
```

<!-- Replace the above with actual parallel streams based on the dependency matrix. -->

| Stream | Specs | Dependencies Between Streams | Notes |
|--------|-------|------------------------------|-------|
| A | {{SPEC_IDS}} | {{CROSS_DEPS}} | {{NOTES}} |
| B | {{SPEC_IDS}} | {{CROSS_DEPS}} | {{NOTES}} |

---

## 23. Individual OpenSpec Proposal Prompts (for `propose` Command)

<!-- For each specification, provide a complete, copy-pasteable, ready-to-run prompt specifically formatted for the OpenSpec `propose` workflow.
Developers and AI agents can trigger proposal authoring by executing:
`openspec propose <change-name>` or in chat with `/opsx:propose <change-name>` followed by this prompt. -->

### SPEC-001: {{SPEC_NAME}}

**Command Invocation:**
```bash
# Terminal CLI
openspec propose add-{{SPEC_NAME_KEBAB}}

# Or inside AI coding assistant chat:
/opsx:propose add-{{SPEC_NAME_KEBAB}}
```

**Proposal Authoring Prompt:**
````markdown
You are an expert software specification engineer and OpenSpec specialist.

Execute the OpenSpec `propose` workflow for **SPEC-001: {{SPEC_NAME}}** in the **{{PROJECT_NAME}}** project.

### 1. Change Context
- **Target Change Directory:** `openspec/changes/add-{{SPEC_NAME_KEBAB}}/`
- **Spec ID:** SPEC-001
- **Capability Name:** `{{SPEC_NAME_KEBAB}}`
- **Priority:** {{PRIORITY}}
- **Complexity:** {{COMPLEXITY}}

### 2. Source Requirements Covered
Cover the following requirements verbatim from the confirmed requirements baseline:
{{VERBATIM_REQUIREMENTS_WITH_IDS}}

### 3. Business Scope Boundaries
- **In-Scope:** {{IN_SCOPE}}
- **Out-of-Scope:** {{OUT_OF_SCOPE}}
- **Relevant Business Rules:** {{RELEVANT_BUSINESS_RULES}}
- **Technical Constraints:** {{RELEVANT_CONSTRAINTS}}

### 4. Required Proposal Artifacts
Create the following files under `openspec/changes/add-{{SPEC_NAME_KEBAB}}/`:

1. **`proposal.md`**:
   - Change ID: `add-{{SPEC_NAME_KEBAB}}`
   - Status: Draft
   - Goal & Business Justification
   - User & System Impact
   - Affected Capabilities
   - Out-of-Scope boundaries

2. **`specs/{{SPEC_NAME_KEBAB}}/spec.md` (Delta Specification)**:
   - Header with `# {{SPEC_NAME}} Specification`
   - `## Purpose` section
   - `## Requirements` section:
     - Use `### ADDED Requirements` (or `MODIFIED` / `REMOVED` if existing)
     - Use RFC 2119 keywords (`SHALL`, `MUST`, `SHOULD`, `MAY`)
     - Provide at least one concrete BDD scenario (`#### Scenario: <name>`) per requirement using:
       - `**Given** <precondition>`
       - `**When** <action/event>`
       - `**Then** <expected outcome>`
       - `**And** <additional verification>`
     - Include scenarios for happy paths, edge cases, error handling, and authorization failures.

3. **`design.md`** (Architecture & Technical Contracts):
   - High-level architectural approach
   - API endpoints, request/response payload schemas, and HTTP status codes
   - Entity relationships and data constraints
   - Security, token authentication, and role authorization checks

4. **`tasks.md`** (Step-by-step checklist):
   - Numbered markdown checkbox list (`- [ ] <!-- id: 1 --> ...`)
   - Atomic, ordered implementation steps
   - Unit test and integration test verification steps

### 5. OpenSpec Quality & Guardrails
- Keep requirements behavior-first (external observable behavior, not internal framework plumbing).
- Do not write application source code; produce ONLY the OpenSpec proposal files.
- Report all created artifact file paths upon completion.
````

<!-- Repeat this block for each specification: SPEC-002, SPEC-003, etc. -->

---

## 24. Acceptance and Validation Strategy

<!-- Define how the overall project and individual specs will be validated and accepted. -->

### Overall Acceptance Criteria
- [ ] All functional requirements are covered by at least one spec
- [ ] All non-functional requirements are addressed
- [ ] All business rules are implemented
- [ ] All integration points are defined
- [ ] No orphaned requirements in the traceability matrix
- [ ] {{ADDITIONAL_CRITERION}}

### Validation Approach
| Phase | Validation Activity | Responsible | Criteria |
|-------|-------------------|-------------|----------|
| Per-Spec | {{ACTIVITY}} | {{RESPONSIBLE}} | {{CRITERIA}} |
| Integration | {{ACTIVITY}} | {{RESPONSIBLE}} | {{CRITERIA}} |
| UAT | {{ACTIVITY}} | {{RESPONSIBLE}} | {{CRITERIA}} |

### Sign-off Requirements
{{SIGNOFF_REQUIREMENTS}}

---

## 25. Final Recommendations

<!-- Provide strategic recommendations for the project based on the analysis. -->

### Key Recommendations
1. {{RECOMMENDATION}}

### Critical Success Factors
1. {{FACTOR}}

### Suggested Next Steps
1. Begin with Phase 1 specifications as outlined in the implementation sequence
2. Validate all assumptions (Section 15) with stakeholders before proceeding
3. Use the OpenSpec Proposal Prompts (Section 23) to generate detailed spec proposals
4. {{ADDITIONAL_STEP}}

---

*Generated by the requirement-to-openspec skill*
*Analysis Date: {{ANALYSIS_DATE}}*
