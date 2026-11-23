import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

import {
  getOpsxProposeAllSkillTemplate,
  getOpsxProposeAllCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent, getCommandContents } from '../../../src/core/shared/skill-generation.js';
import { loadSchema } from '../../../src/core/artifact-graph/schema.js';
import { CommandAdapterRegistry } from '../../../src/core/command-generation/registry.js';
import { generateCommand } from '../../../src/core/command-generation/generator.js';
import {
  formatCommandInvocation,
  getInvocationForAdapter,
} from '../../../src/core/command-generation/invocation.js';
import { resolveOptionalWorkflows } from '../../../src/core/templates/optional-workflow.js';
import { ALL_WORKFLOWS } from '../../../src/core/profiles.js';

const withAll = (body: string) =>
  resolveOptionalWorkflows(body, new Set<string>(ALL_WORKFLOWS));

const withoutApply = (body: string) =>
  resolveOptionalWorkflows(
    body,
    new Set<string>(ALL_WORKFLOWS.filter((id) => id !== 'apply'))
  );

const proposeAllSkillBody = withAll(getOpsxProposeAllSkillTemplate().instructions);
const proposeAllCommandBody = withAll(getOpsxProposeAllCommandTemplate().content);

const asDeployed = <T extends { instructions: string }>(template: T): T => ({
  ...template,
  instructions: withAll(template.instructions),
});

const proposeAllBodies: Array<[string, string]> = [
  ['propose-all skill', generateSkillContent(asDeployed(getOpsxProposeAllSkillTemplate()), 'TEST')],
  ['propose-all command', proposeAllCommandBody],
];

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..');
const defaultSchema = loadSchema(path.join(repoRoot, 'schemas', 'spec-driven', 'schema.yaml'));

describe('/opsx-propose-all command and skill templates', () => {
  describe('preamble and schema artifacts', () => {
    it('advertises every artifact the default schema defines', () => {
      const ids = defaultSchema.artifacts.map((a) => a.id);
      expect(ids).toContain('proposal');
      expect(ids).toContain('specs');
      expect(ids).toContain('design');
      expect(ids).toContain('tasks');

      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} missing proposal artifact`).toContain('proposal.md');
        expect(body, `${label} missing specs artifact`).toContain('specs/<capability-path>/spec.md');
        expect(body, `${label} missing design artifact`).toContain('design.md');
        expect(body, `${label} missing tasks artifact`).toContain('tasks.md');
      }
    });

    it('enforces planning boundary across all surfaces', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} missing planning boundary`).toContain('Planning boundary');
        expect(body, `${label} must forbid code editing`).toContain('Do not edit project code');
        expect(body, `${label} must require user request to apply`).toContain(
          'Wait for a new user request after the artifacts are presented; then start the apply workflow'
        );
      }
    });

    it('includes store selection guidance and project check guard', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} missing store guidance`).toContain('Store selection:');
        expect(body, `${label} missing project check`).toContain('Project check:');
        expect(body, `${label} missing context command`).toContain('openspec context --json');
      }
    });
  });

  describe('document analysis requirements', () => {
    it('specifies the default document filename and fallback search', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} missing default filename`).toContain(
          'OpenSpec_Requirement_Analysis_and_Planning.md'
        );
        expect(body, `${label} missing fallback planning file`).toContain('openspec/planning.md');
        expect(body, `${label} missing prompt when document not found`).toContain(
          'Could not find `OpenSpec_Requirement_Analysis_and_Planning.md`'
        );
      }
    });

    it('instructs complete reading rather than shallow header extraction', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} must read complete document`).toContain('complete document');
        expect(body, `${label} must not merely extract top-level headings`).toContain(
          'Do not merely extract top-level headings'
        );
      }
    });

    it('requires extracting all proposed specifications and preserving original proposal prompts', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} must identify every proposed specification`).toContain(
          'identify every proposed specification'
        );
        expect(body, `${label} must preserve proposal prompt text`).toContain(
          'Proposal Prompt'
        );
        expect(body, `${label} must check requirement coverage`).toContain(
          'Requirements Covered'
        );
        expect(body, `${label} must analyze dependencies`).toContain('Dependencies');
      }
    });
  });

  describe('consolidated plan and review preparation', () => {
    it('instructs building all required proposal plan sections', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} missing Project Summary`).toContain('Project Summary');
        expect(body, `${label} missing Specification Inventory`).toContain('Specification Inventory');
        expect(body, `${label} missing Proposal Prompt Inventory`).toContain('Proposal Prompt Inventory');
        expect(body, `${label} missing Dependency Analysis`).toContain('Dependency Analysis & Execution Sequence');
        expect(body, `${label} missing Validation & Coverage Check`).toContain('Validation & Coverage Check');
      }
    });
  });

  describe('mandatory approval gate', () => {
    it('strictly forbids creating proposals before explicit approval', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} missing approval gate rule`).toContain(
          'MANDATORY User Review and Approval Gate'
        );
        expect(body, `${label} must never create proposals without approval`).toContain(
          'NEVER create proposals or modify files immediately after analyzing the document'
        );
        expect(body, `${label} must state explicit confirmation is mandatory`).toContain(
          'Explicit confirmation is mandatory'
        );
      }
    });

    it('presents the four explicit options to the user', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} missing Option 1`).toContain('Option 1 — Approve All');
        expect(body, `${label} missing Option 2`).toContain('Option 2 — Modify');
        expect(body, `${label} missing Option 3`).toContain('Option 3 — Exclude Specifications');
        expect(body, `${label} missing Option 4`).toContain('Option 4 — Cancel');
      }
    });

    it('requires re-approval if modifications are requested', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} must require re-approval after modify`).toContain(
          'require re-approval before proceeding'
        );
      }
    });
  });

  describe('batch generation and orchestration', () => {
    it('creates each specification as an independent change directory', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} must create separate change per spec`).toContain(
          'openspec new change "<change-name>"'
        );
        expect(body, `${label} must mandate independent change directories`).toContain(
          'Each specification MUST become its own independent change directory'
        );
        expect(body, `${label} must forbid merging multiple specs`).toContain(
          'Do NOT merge multiple specifications into one change'
        );
      }
    });

    it('checks for change-name conflicts without silent overwrite', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} must check conflicts`).toContain('Pre-flight & conflict check');
        expect(body, `${label} must not silently overwrite`).toContain(
          'Do not silently overwrite existing files'
        );
      }
    });

    it('validates each generated change', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} must validate change`).toContain('openspec validate "<change-name>"');
      }
    });

    it('handles failures gracefully and isolates dependent proposals', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} missing failure handling`).toContain('Failure and recovery handling');
        expect(body, `${label} must mark downstream dependencies skipped`).toContain(
          'Skipped (blocked by dependency'
        );
        expect(body, `${label} must continue independent specs`).toContain(
          'Continue processing remaining independent specifications where safe'
        );
      }
    });
  });

  describe('final execution report', () => {
    it('includes metrics, summary table, and next steps', () => {
      for (const [label, body] of proposeAllBodies) {
        expect(body, `${label} missing execution report`).toContain('Final Consolidated Execution Report');
        expect(body, `${label} missing total count`).toContain('Total identified');
        expect(body, `${label} missing approved count`).toContain('Approved');
        expect(body, `${label} missing created count`).toContain('Successfully created & validated');
        expect(body, `${label} missing failed count`).toContain('Failed');
        expect(body, `${label} missing skipped count`).toContain('Skipped');
      }
    });
  });

  describe('optional workflow resolution across profiles', () => {
    it('resolves apply handoff when apply is installed', () => {
      const skill = withAll(getOpsxProposeAllSkillTemplate().instructions);
      const command = withAll(getOpsxProposeAllCommandTemplate().content);

      expect(skill).toContain('/opsx:apply');
      expect(command).toContain('/opsx:apply');
    });

    it('resolves fallback handoff when apply is not installed', () => {
      const skill = withoutApply(getOpsxProposeAllSkillTemplate().instructions);
      const command = withoutApply(getOpsxProposeAllCommandTemplate().content);

      expect(skill).not.toContain('/opsx:apply');
      expect(skill).toContain('ask me to apply this change');

      expect(command).not.toContain('/opsx:apply');
      expect(command).toContain('openspec instructions apply --change');
    });
  });

  describe('tool command generation adapters', () => {
    it('generates namespaced command file for Claude Code (/opsx:propose-all)', () => {
      const adapter = CommandAdapterRegistry.get('claude');
      expect(adapter).toBeDefined();

      const filePath = adapter!.getFilePath('propose-all');
      expect(filePath).toBe(path.join('.claude', 'commands', 'opsx', 'propose-all.md'));

      const invocation = getInvocationForAdapter(adapter!);
      expect(formatCommandInvocation(invocation, 'propose-all')).toBe('/opsx:propose-all');

      const commandContent = getCommandContents(ALL_WORKFLOWS).find((c) => c.id === 'propose-all');
      expect(commandContent).toBeDefined();

      const generated = generateCommand(commandContent!, adapter!);
      expect(generated.path).toBe(filePath);
      expect(generated.fileContent).toContain('name: "OPSX: Propose All"');
      expect(generated.fileContent).toContain('allowed-tools: Bash(openspec:*)');
      expect(generated.fileContent).toContain('category: "Workflow"');
    });

    it('generates flat command file for Cursor (/opsx-propose-all)', () => {
      const adapter = CommandAdapterRegistry.get('cursor');
      expect(adapter).toBeDefined();

      const filePath = adapter!.getFilePath('propose-all');
      expect(filePath).toBe(path.join('.cursor', 'commands', 'opsx-propose-all.md'));

      const invocation = getInvocationForAdapter(adapter!);
      expect(formatCommandInvocation(invocation, 'propose-all')).toBe('/opsx-propose-all');

      const commandContent = getCommandContents(ALL_WORKFLOWS).find((c) => c.id === 'propose-all');
      expect(commandContent).toBeDefined();

      const generated = generateCommand(commandContent!, adapter!);
      expect(generated.path).toBe(filePath);
      expect(generated.fileContent).toContain('name: "/opsx-propose-all"');
      expect(generated.fileContent).toContain('id: "opsx-propose-all"');
      expect(generated.fileContent).toContain('category: "Workflow"');
    });
  });
});
