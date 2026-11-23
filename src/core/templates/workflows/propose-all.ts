/**
 * Skill Template Workflow Modules
 *
 * Workflow template module for batch proposal generation from a planning
 * or requirement analysis document.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { optionalWorkflow } from '../optional-workflow.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';
import { PROJECT_ROOT_GUARD } from './project-root.js';

const SKILL_APPLY_HANDOFF = optionalWorkflow(
  'apply',
  'run `/opsx:apply` or ask me to apply this change',
  'ask me to apply this change'
);

const COMMAND_APPLY_HANDOFF = optionalWorkflow(
  'apply',
  'run `/opsx:apply`',
  'run `openspec instructions apply --change "<name>" --json` to get the tasks'
);

const PROPOSE_SINGLE_HANDOFF = optionalWorkflow(
  'propose',
  'run `/opsx:propose <name>`',
  'propose that change individually'
);

export function getOpsxProposeAllSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-propose-all',
    description: 'Generate multiple OpenSpec proposals from a requirement analysis and planning document in one batch with review and approval. Use when the user has a planning or requirement document and wants to create multiple proposals at once, or says "opsx propose-all", "openspec propose-all", or "propose all".',
    instructions: `Propose multiple changes in batch from a requirement analysis and planning document.

**Planning boundary**: This workflow creates planning artifacts only. The user request that selected or triggered this workflow authorizes planning only, even if it asks to build or fix something. Do not edit project code. After all proposal artifacts are complete, stop. Do not start implementation in the same response, even if the initial request asks for it. Wait for a new user request after the artifacts are presented; then start the apply workflow.

I'll analyze your requirement-analysis document, extract all proposed specifications, present a consolidated proposal plan with dependencies, enforce a mandatory review and approval gate, and create each approved proposal as an independent OpenSpec change with the artifacts your schema defines.

With the default spec-driven schema, each generated change includes:
- \`proposal.md\` (what & why)
- \`specs/<capability-path>/spec.md\` (what the system must do - delta spec)
- \`design.md\` (how)
- \`tasks.md\` (implementation steps)

---

${STORE_SELECTION_GUIDANCE}

${PROJECT_ROOT_GUARD}

**Input**: An optional file path to a requirement-analysis or planning document (e.g., \`path/to/requirements.md\`). If omitted, the default file \`OpenSpec_Requirement_Analysis_and_Planning.md\` in the project root is used.

**Steps**

1. **Locate and load the requirement document**

   a. Check if the user explicitly provided a document path in their command or prompt (e.g., \`/opsx-propose-all path/to/doc.md\`). If provided, verify that the file exists and is readable.
   b. If no path was provided, look for the default file in the current working directory / project root:
      \`OpenSpec_Requirement_Analysis_and_Planning.md\`
   c. If the default file is not found, check for fallback planning files:
      - \`openspec/planning.md\`
      - \`planning.md\`
   d. If none of these files can be found, ask the user:
      > "Could not find \`OpenSpec_Requirement_Analysis_and_Planning.md\`. Please provide the path to your requirement-analysis or planning document:"
      Wait for their response and do not proceed without a valid document.
   e. Verify that the document is non-empty. Read and understand the **complete document**. Do not merely extract top-level headings or read only the first section. Read all requirement sections, architecture details, constraints, proposed specifications, and embedded proposal prompts.

2. **Load project context and existing changes**

   a. Run \`openspec context --json\` from the current working directory (or \`openspec context --json --store "<store-id>"\` when a registered store was explicitly selected). Use the returned \`root.path\` as the authoritative OpenSpec root. If context reports \`no_openspec_root\`, stop without creating or changing any files and follow the **Project check** above.
   b. Read \`<root.path>/openspec/config.yaml\` (or \`config.yml\` if \`config.yaml\` does not exist). If the file parses and contains a \`context\` string (up to 51,200 bytes in UTF-8), apply it as constraints across all proposals.
   c. Run \`openspec list --json\` to inspect existing active and archived changes in the project. Note existing change names to prevent accidental naming collisions.
   d. Determine the workflow schema: Use the configured default schema unless the user explicitly requested a specific schema via \`--schema <schema-name>\`.

3. **Full requirement analysis**

   Thoroughly analyze the complete document to understand:
   - **Project Goals & Scope**: The core problem, business objectives, and functional/non-functional scope.
   - **Architecture & Technical Constraints**: System design, technologies, frameworks, external integrations, and constraints.
   - **Specification Extraction**: Dynamically identify every proposed specification or change described in the document (whether 2, 5, 10, 20, or more). Do NOT hardcode or omit any specifications simply because the document is long.
   - For each identified specification, extract:
     - **Identifier / #**: Sequential number and reference ID.
     - **Change Name**: Valid kebab-case name (e.g., \`identity-and-access\`, \`quote-pricing\`).
     - **Purpose & Scope**: What the capability does and its boundaries.
     - **Requirements Covered**: List of specific functional and non-functional requirements mapped from the document.
     - **Expected Deliverables**: Specs, delta capabilities, designs, and tasks.
     - **Proposal Prompt**: The exact proposal prompt text provided in the document for generating this change. Preserve the original prompt text accurately.
     - **Dependencies**: Which other specifications this specification depends on (e.g., Auth must precede User Profile).
     - **Implementation Order**: Derive a topological order respecting all dependencies.
     - **Potential Overlaps**: Note any shared data models, interfaces, or scope boundaries.

4. **Build a consolidated proposal plan**

   Before creating any proposals or modifying any files, prepare a comprehensive proposal plan containing:

   **A. Project Summary**
   A concise summary of the overall project, architecture, and technology stack as understood from the document and project context.

   **B. Specification Inventory**
   Present all identified specifications in a structured Markdown table:
   | # | Specification | Purpose | Requirements Covered | Dependencies |
   |---|---|---|---|---|

   **C. Proposal Prompt Inventory**
   List each specification with the exact proposal prompt that will be used to generate it:
   - **# - <Specification Name>**: \`<extracted proposal prompt>\`

   **D. Dependency Analysis & Execution Sequence**
   - **Independent specifications**: Can be created first with no prerequisites.
   - **Dependent specifications**: Listed in their strict topological sequence.
   - **Dependency check**: Confirm there are no circular dependencies or unclear orderings.

   **E. Validation & Coverage Check**
   - Confirm that every major requirement from the input document is covered by at least one specification.
   - Confirm that every specification has a concrete proposal prompt.
   - Confirm specification boundaries are well-sized (not overly broad or duplicated).

5. **MANDATORY User Review and Approval Gate**

   **CRITICAL RULE**: You must NEVER create proposals or modify files immediately after analyzing the document. You must present the complete proposal plan to the user and request explicit confirmation.

   Present the proposal plan and provide these four options:

   - **Option 1 — Approve All**: The user approves the entire proposal plan. Proceed to create all approved proposals in the established dependency order.
   - **Option 2 — Modify**: The user requests adjustments to specification names, scope, prompts, dependencies, or ordering. Apply the modifications, display the updated plan, and require re-approval before proceeding.
   - **Option 3 — Exclude Specifications**: The user selects one or more specifications to exclude from this run. Remove them, re-evaluate dependency impacts on remaining specifications, explain any consequences, and obtain confirmation.
   - **Option 4 — Cancel**: Abort the batch workflow. Do not create any changes or modify any files.

   **Approval Rules**:
   - Explicit confirmation is mandatory. Do not infer approval from silence or ambiguity.
   - Do not create any changes prior to approval.
   - If the user cancels, stop safely.

6. **Batch Proposal Generation (Dependency Order)**

   Once explicit approval is received, generate all approved proposals sequentially in their established dependency order.

   For each approved specification:

   a. **Pre-flight & conflict check**:
      - Confirm the kebab-case change name.
      - Check if a change directory already exists at \`openspec/changes/<change-name>/\`.
      - If a change with that name already exists:
        - If it is already complete and validated, ask the user whether to reuse/skip it or regenerate it.
        - If partially complete, ask whether to continue it or start fresh.
        - Do not silently overwrite existing files.

   b. **Scaffold the change directory**:
      Run:
      \`\`\`bash
      openspec new change "<change-name>"
      \`\`\`
      (Or with \`--schema "<schema-name>"\` if a non-default schema was explicitly selected).

   c. **Query artifact graph and build order**:
      Run:
      \`\`\`bash
      openspec status --change "<change-name>" --json
      \`\`\`
      Parse \`applyRequires\` and \`artifacts\` with their \`requires\` dependency edges to establish the transitive required set (closing over \`proposal\`, \`specs\`, \`design\`, \`tasks\`).

   d. **Create all artifacts in the required set**:
      Loop through required artifacts in dependency order:
      - Get instructions:
        \`\`\`bash
        openspec instructions <artifact-id> --change "<change-name>" --json
        \`\`\`
      - Read completed dependency artifacts from disk for context.
      - Apply \`context\` and \`rules\` from the instructions as constraints (do not copy them into the file).
      - Choose the output path before creating anything. If \`resolvedOutputPath\` is a glob, follow \`instruction\` to choose a concrete path inside \`changeRoot\`, and verify it remains inside \`changeRoot\` after resolving symlinks, both in its parent directories and in the file itself if it already exists; if it does not, stop and tell the user. Otherwise the output path is \`resolvedOutputPath\`
      - If the \`instruction\` field delegates creation to a specific skill or command, invoke it only if it can write the artifact to that output path; otherwise stop and tell the user. Then verify the artifact file exists at that output path
      - Otherwise create the artifact file using \`template\` as the structure and write it to that output path
      - Re-run \`openspec status --change "<change-name>" --json\` after writing each artifact.
      - Continue until all required artifacts are done.

   e. **Validate the change**:
      Run:
      \`\`\`bash
      openspec validate "<change-name>"
      \`\`\`
      If validation passes, mark the specification as \`Validated\`.

   f. **Failure and recovery handling**:
      - If an individual specification fails to scaffold or validate:
        - Record the failure reason and mark status as \`Failed\`.
        - Do NOT mark it as completed.
        - Check downstream dependencies: Any remaining specifications that depend on this failed specification must be marked \`Skipped (blocked by dependency: <failed-spec>)\`.
        - Continue processing remaining independent specifications where safe.

7. **Final Consolidated Execution Report**

   After all approved specifications have been processed, present a consolidated execution report:

   **OpenSpec Batch Proposal Results**
   - **Total identified**: <count>
   - **Approved**: <count>
   - **Successfully created & validated**: <count>
   - **Failed**: <count>
   - **Skipped**: <count>

   | # | Specification | Status | Change Name | Location / Details |
   |---|---|---|---|---|
   | 1 | <Name> | Validated | \`<change-name>\` | \`openspec/changes/<change-name>/\` |
   | 2 | <Name> | Failed | \`<change-name>\` | <Error details> |
   | 3 | <Name> | Skipped | \`<change-name>\` | Blocked by dependency / Excluded |

   **Next Steps**:
   - Provide summary of validated changes.
   - Handoff note: "All approved proposal artifacts have been created. When you are ready to review or implement a change, ${SKILL_APPLY_HANDOFF}."

**Artifact Creation Guidelines**
- Follow the \`instruction\` field from \`openspec instructions\` for each artifact type.
- Each specification MUST become its own independent change directory under \`openspec/changes/<change-name>/\`. Do NOT merge multiple specifications into one change.
- Never edit project code during this workflow. Respect the planning boundary.
- Re-read dependency artifacts from disk before creating dependent artifacts.`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxProposeAllCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Propose All',
    description: 'Generate multiple OpenSpec proposals from a requirement analysis and planning document with approval',
    category: 'Workflow',
    tags: ['proposal', 'batch', 'requirements', 'workflow'],
    content: `Propose multiple changes in batch from a requirement analysis and planning document.

**Planning boundary**: This workflow creates planning artifacts only. The user request that selected or triggered this workflow authorizes planning only, even if it asks to build or fix something. Do not edit project code. After all proposal artifacts are complete, stop. Do not start implementation in the same response, even if the initial request asks for it. Wait for a new user request after the artifacts are presented; then start the apply workflow.

I'll analyze your requirement-analysis document, extract all proposed specifications, present a consolidated proposal plan with dependencies, enforce a mandatory review and approval gate, and create each approved proposal as an independent OpenSpec change with the artifacts your schema defines.

With the default spec-driven schema, each generated change includes:
- \`proposal.md\` (what & why)
- \`specs/<capability-path>/spec.md\` (what the system must do - delta spec)
- \`design.md\` (how)
- \`tasks.md\` (implementation steps)

---

${STORE_SELECTION_GUIDANCE}

${PROJECT_ROOT_GUARD}

**Input**: An optional file path to a requirement-analysis or planning document (e.g., \`path/to/requirements.md\`). If omitted, the default file \`OpenSpec_Requirement_Analysis_and_Planning.md\` in the project root is used.

**Steps**

1. **Locate and load the requirement document**

   a. Check if the user explicitly provided a document path in their command or prompt (e.g., \`/opsx-propose-all path/to/doc.md\`). If provided, verify that the file exists and is readable.
   b. If no path was provided, look for the default file in the current working directory / project root:
      \`OpenSpec_Requirement_Analysis_and_Planning.md\`
   c. If the default file is not found, check for fallback planning files:
      - \`openspec/planning.md\`
      - \`planning.md\`
   d. If none of these files can be found, ask the user:
      > "Could not find \`OpenSpec_Requirement_Analysis_and_Planning.md\`. Please provide the path to your requirement-analysis or planning document:"
      Wait for their response and do not proceed without a valid document.
   e. Verify that the document is non-empty. Read and understand the **complete document**. Do not merely extract top-level headings or read only the first section. Read all requirement sections, architecture details, constraints, proposed specifications, and embedded proposal prompts.

2. **Load project context and existing changes**

   a. Run \`openspec context --json\` from the current working directory (or \`openspec context --json --store "<store-id>"\` when a registered store was explicitly selected). Use the returned \`root.path\` as the authoritative OpenSpec root. If context reports \`no_openspec_root\`, stop without creating or changing any files and follow the **Project check** above.
   b. Read \`<root.path>/openspec/config.yaml\` (or \`config.yml\` if \`config.yaml\` does not exist). If the file parses and contains a \`context\` string (up to 51,200 bytes in UTF-8), apply it as constraints across all proposals.
   c. Run \`openspec list --json\` to inspect existing active and archived changes in the project. Note existing change names to prevent accidental naming collisions.
   d. Determine the workflow schema: Use the configured default schema unless the user explicitly requested a specific schema via \`--schema <schema-name>\`.

3. **Full requirement analysis**

   Thoroughly analyze the complete document to understand:
   - **Project Goals & Scope**: The core problem, business objectives, and functional/non-functional scope.
   - **Architecture & Technical Constraints**: System design, technologies, frameworks, external integrations, and constraints.
   - **Specification Extraction**: Dynamically identify every proposed specification or change described in the document (whether 2, 5, 10, 20, or more). Do NOT hardcode or omit any specifications simply because the document is long.
   - For each identified specification, extract:
     - **Identifier / #**: Sequential number and reference ID.
     - **Change Name**: Valid kebab-case name (e.g., \`identity-and-access\`, \`quote-pricing\`).
     - **Purpose & Scope**: What the capability does and its boundaries.
     - **Requirements Covered**: List of specific functional and non-functional requirements mapped from the document.
     - **Expected Deliverables**: Specs, delta capabilities, designs, and tasks.
     - **Proposal Prompt**: The exact proposal prompt text provided in the document for generating this change. Preserve the original prompt text accurately.
     - **Dependencies**: Which other specifications this specification depends on (e.g., Auth must precede User Profile).
     - **Implementation Order**: Derive a topological order respecting all dependencies.
     - **Potential Overlaps**: Note any shared data models, interfaces, or scope boundaries.

4. **Build a consolidated proposal plan**

   Before creating any proposals or modifying any files, prepare a comprehensive proposal plan containing:

   **A. Project Summary**
   A concise summary of the overall project, architecture, and technology stack as understood from the document and project context.

   **B. Specification Inventory**
   Present all identified specifications in a structured Markdown table:
   | # | Specification | Purpose | Requirements Covered | Dependencies |
   |---|---|---|---|---|

   **C. Proposal Prompt Inventory**
   List each specification with the exact proposal prompt that will be used to generate it:
   - **# - <Specification Name>**: \`<extracted proposal prompt>\`

   **D. Dependency Analysis & Execution Sequence**
   - **Independent specifications**: Can be created first with no prerequisites.
   - **Dependent specifications**: Listed in their strict topological sequence.
   - **Dependency check**: Confirm there are no circular dependencies or unclear orderings.

   **E. Validation & Coverage Check**
   - Confirm that every major requirement from the input document is covered by at least one specification.
   - Confirm that every specification has a concrete proposal prompt.
   - Confirm specification boundaries are well-sized (not overly broad or duplicated).

5. **MANDATORY User Review and Approval Gate**

   **CRITICAL RULE**: You must NEVER create proposals or modify files immediately after analyzing the document. You must present the complete proposal plan to the user and request explicit confirmation.

   Present the proposal plan and provide these four options:

   - **Option 1 — Approve All**: The user approves the entire proposal plan. Proceed to create all approved proposals in the established dependency order.
   - **Option 2 — Modify**: The user requests adjustments to specification names, scope, prompts, dependencies, or ordering. Apply the modifications, display the updated plan, and require re-approval before proceeding.
   - **Option 3 — Exclude Specifications**: The user selects one or more specifications to exclude from this run. Remove them, re-evaluate dependency impacts on remaining specifications, explain any consequences, and obtain confirmation.
   - **Option 4 — Cancel**: Abort the batch workflow. Do not create any changes or modify any files.

   **Approval Rules**:
   - Explicit confirmation is mandatory. Do not infer approval from silence or ambiguity.
   - Do not create any changes prior to approval.
   - If the user cancels, stop safely.

6. **Batch Proposal Generation (Dependency Order)**

   Once explicit approval is received, generate all approved proposals sequentially in their established dependency order.

   For each approved specification:

   a. **Pre-flight & conflict check**:
      - Confirm the kebab-case change name.
      - Check if a change directory already exists at \`openspec/changes/<change-name>/\`.
      - If a change with that name already exists:
        - If it is already complete and validated, ask the user whether to reuse/skip it or regenerate it.
        - If partially complete, ask whether to continue it or start fresh.
        - Do not silently overwrite existing files.

   b. **Scaffold the change directory**:
      Run:
      \`\`\`bash
      openspec new change "<change-name>"
      \`\`\`
      (Or with \`--schema "<schema-name>"\` if a non-default schema was explicitly selected).

   c. **Query artifact graph and build order**:
      Run:
      \`\`\`bash
      openspec status --change "<change-name>" --json
      \`\`\`
      Parse \`applyRequires\` and \`artifacts\` with their \`requires\` dependency edges to establish the transitive required set (closing over \`proposal\`, \`specs\`, \`design\`, \`tasks\`).

   d. **Create all artifacts in the required set**:
      Loop through required artifacts in dependency order:
      - Get instructions:
        \`\`\`bash
        openspec instructions <artifact-id> --change "<change-name>" --json
        \`\`\`
      - Read completed dependency artifacts from disk for context.
      - Apply \`context\` and \`rules\` from the instructions as constraints (do not copy them into the file).
      - Choose the output path before creating anything. If \`resolvedOutputPath\` is a glob, follow \`instruction\` to choose a concrete path inside \`changeRoot\`, and verify it remains inside \`changeRoot\` after resolving symlinks, both in its parent directories and in the file itself if it already exists; if it does not, stop and tell the user. Otherwise the output path is \`resolvedOutputPath\`
      - If the \`instruction\` field delegates creation to a specific skill or command, invoke it only if it can write the artifact to that output path; otherwise stop and tell the user. Then verify the artifact file exists at that output path
      - Otherwise create the artifact file using \`template\` as the structure and write it to that output path
      - Re-run \`openspec status --change "<change-name>" --json\` after writing each artifact.
      - Continue until all required artifacts are done.

   e. **Validate the change**:
      Run:
      \`\`\`bash
      openspec validate "<change-name>"
      \`\`\`
      If validation passes, mark the specification as \`Validated\`.

   f. **Failure and recovery handling**:
      - If an individual specification fails to scaffold or validate:
        - Record the failure reason and mark status as \`Failed\`.
        - Do NOT mark it as completed.
        - Check downstream dependencies: Any remaining specifications that depend on this failed specification must be marked \`Skipped (blocked by dependency: <failed-spec>)\`.
        - Continue processing remaining independent specifications where safe.

7. **Final Consolidated Execution Report**

   After all approved specifications have been processed, present a consolidated execution report:

   **OpenSpec Batch Proposal Results**
   - **Total identified**: <count>
   - **Approved**: <count>
   - **Successfully created & validated**: <count>
   - **Failed**: <count>
   - **Skipped**: <count>

   | # | Specification | Status | Change Name | Location / Details |
   |---|---|---|---|---|
   | 1 | <Name> | Validated | \`<change-name>\` | \`openspec/changes/<change-name>/\` |
   | 2 | <Name> | Failed | \`<change-name>\` | <Error details> |
   | 3 | <Name> | Skipped | \`<change-name>\` | Blocked by dependency / Excluded |

   **Next Steps**:
   - Provide summary of validated changes.
   - Handoff note: "All approved proposal artifacts have been created. When you are ready to review or implement a change, ${COMMAND_APPLY_HANDOFF}."

**Artifact Creation Guidelines**
- Follow the \`instruction\` field from \`openspec instructions\` for each artifact type.
- Each specification MUST become its own independent change directory under \`openspec/changes/<change-name>/\`. Do NOT merge multiple specifications into one change.
- Never edit project code during this workflow. Respect the planning boundary.
- Re-read dependency artifacts from disk before creating dependent artifacts.`,
  };
}
