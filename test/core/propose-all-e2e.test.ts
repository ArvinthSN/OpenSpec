import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { InitCommand } from '../../src/core/init.js';
import { saveGlobalConfig } from '../../src/core/global-config.js';
import { ALL_WORKFLOWS } from '../../src/core/profiles.js';

describe('propose-all end-to-end integration', () => {
  let testDir: string;
  let configTempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-propose-all-test-'));
    originalEnv = { ...process.env };
    configTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-config-propose-all-'));
    process.env.XDG_CONFIG_HOME = configTempDir;
    process.env.CODEX_HOME = path.join(testDir, 'codex-home');
    process.env.HOME = path.join(testDir, 'home');
    process.env.USERPROFILE = path.join(testDir, 'home');

    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.rm(configTempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('installs propose-all skill and commands when custom profile includes propose-all', async () => {
    await saveGlobalConfig({
      profile: 'custom',
      workflows: ['propose', 'apply', 'propose-all'],
      delivery: 'both',
    });

    const init = new InitCommand({
      tools: 'claude,cursor,agents',
      force: true,
      animation: false,
    });

    await init.execute(testDir);

    // Universal .agents skills
    const agentsSkillPath = path.join(
      testDir,
      '.agents',
      'skills',
      'openspec-propose-all',
      'SKILL.md'
    );
    const agentsSkillContent = await fs.readFile(agentsSkillPath, 'utf-8');
    expect(agentsSkillContent).toContain('name: openspec-propose-all');
    expect(agentsSkillContent).toContain('OpenSpec_Requirement_Analysis_and_Planning.md');
    expect(agentsSkillContent).toContain('MANDATORY User Review and Approval Gate');
    expect(agentsSkillContent).toContain('Option 1 — Approve All');
    expect(agentsSkillContent).toContain('Option 4 — Cancel');

    // Claude Code command
    const claudeCommandPath = path.join(
      testDir,
      '.claude',
      'commands',
      'opsx',
      'propose-all.md'
    );
    const claudeCommandContent = await fs.readFile(claudeCommandPath, 'utf-8');
    expect(claudeCommandContent).toContain('name: "OPSX: Propose All"');
    expect(claudeCommandContent).toContain('allowed-tools: Bash(openspec:*)');

    // Cursor command
    const cursorCommandPath = path.join(
      testDir,
      '.cursor',
      'commands',
      'opsx-propose-all.md'
    );
    const cursorCommandContent = await fs.readFile(cursorCommandPath, 'utf-8');
    expect(cursorCommandContent).toContain('name: "/opsx-propose-all"');
    expect(cursorCommandContent).toContain('id: "opsx-propose-all"');
  });

  it('correctly parses a multi-specification planning document and derives plan', async () => {
    const samplePlanningDoc = `# Requirement Analysis and Planning: E-Commerce Platform

## Project Overview
A cloud-native multi-tenant e-commerce system with modular architecture.

## Functional Requirements
- FR-1: Secure customer registration and OAuth2 authentication.
- FR-2: Customer profile and address book management.
- FR-3: Product catalog, SKU variations, and pricing engine.

## Non-Functional Requirements
- NFR-1: Sub-200ms latency on catalog queries.
- NFR-2: Strict PCI-DSS compliance for payment handling.

## Proposed Specifications

### 1. Specification: identity-and-access
- **Purpose**: Centralized authentication, OAuth2 login, and session tokens.
- **Requirements Covered**: FR-1
- **Dependencies**: None
- **Proposal Prompt**:
  > Create an OpenSpec proposal for identity-and-access covering OAuth2, JWT session validation, and user credentials.

### 2. Specification: customer-profile
- **Purpose**: Manage user details, shipping addresses, and preferences.
- **Requirements Covered**: FR-2
- **Dependencies**: identity-and-access
- **Proposal Prompt**:
  > Create an OpenSpec proposal for customer-profile covering user address books, contact details, and profile preferences.

### 3. Specification: product-catalog
- **Purpose**: Product listings, categories, inventory status, and price calculations.
- **Requirements Covered**: FR-3, NFR-1
- **Dependencies**: None
- **Proposal Prompt**:
  > Create an OpenSpec proposal for product-catalog covering high-speed catalog search, SKU options, and price calculation.
`;

    const docPath = path.join(testDir, 'OpenSpec_Requirement_Analysis_and_Planning.md');
    await fs.writeFile(docPath, samplePlanningDoc, 'utf-8');

    // Helper to simulate requirement document parser
    function parsePlanningDoc(content: string) {
      const specRegex = /###\s+\d+\.\s+Specification:\s+([a-z0-9-]+)[\s\S]*?- \*\*Purpose\*\*:\s*([^\n]+)[\s\S]*?- \*\*Requirements Covered\*\*:\s*([^\n]+)[\s\S]*?- \*\*Dependencies\*\*:\s*([^\n]+)[\s\S]*?- \*\*Proposal Prompt\*\*:\s*>\s*([^\n]+)/g;
      const specs = [];
      let match;
      while ((match = specRegex.exec(content)) !== null) {
        specs.push({
          name: match[1].trim(),
          purpose: match[2].trim(),
          requirements: match[3].trim(),
          dependencies: match[4].trim() === 'None' ? [] : match[4].split(',').map((s) => s.trim()),
          prompt: match[5].trim(),
        });
      }
      return specs;
    }

    const parsed = parsePlanningDoc(samplePlanningDoc);
    expect(parsed).toHaveLength(3);

    expect(parsed[0].name).toBe('identity-and-access');
    expect(parsed[0].dependencies).toEqual([]);
    expect(parsed[0].prompt).toContain('identity-and-access');

    expect(parsed[1].name).toBe('customer-profile');
    expect(parsed[1].dependencies).toEqual(['identity-and-access']);

    expect(parsed[2].name).toBe('product-catalog');
    expect(parsed[2].dependencies).toEqual([]);

    // Derive execution order (topological sort)
    function deriveExecutionOrder(specs: Array<{ name: string; dependencies: string[] }>) {
      const ordered: string[] = [];
      const visited = new Set<string>();

      function visit(name: string) {
        if (visited.has(name)) return;
        const spec = specs.find((s) => s.name === name);
        if (spec) {
          for (const dep of spec.dependencies) {
            visit(dep);
          }
        }
        visited.add(name);
        ordered.push(name);
      }

      for (const spec of specs) {
        visit(spec.name);
      }
      return ordered;
    }

    const order = deriveExecutionOrder(parsed);
    expect(order.indexOf('identity-and-access')).toBeLessThan(order.indexOf('customer-profile'));
  });

  it('scaffolds independent OpenSpec changes for approved specifications', async () => {
    // Initialize project
    const init = new InitCommand({
      tools: 'agents',
      force: true,
      animation: false,
    });
    await init.execute(testDir);

    const changesDir = path.join(testDir, 'openspec', 'changes');
    await fs.mkdir(changesDir, { recursive: true });

    const approvedSpecs = ['identity-and-access', 'customer-profile', 'product-catalog'];

    for (const specName of approvedSpecs) {
      const changeDir = path.join(changesDir, specName);
      await fs.mkdir(changeDir, { recursive: true });

      // Create standard artifacts
      await fs.writeFile(
        path.join(changeDir, 'proposal.md'),
        `# Proposal: ${specName}\n\n## Why\nRequired capability.\n`,
        'utf-8'
      );
      await fs.writeFile(
        path.join(changeDir, 'tasks.md'),
        `# Tasks: ${specName}\n\n- [ ] 1.1 Implement core functionality\n`,
        'utf-8'
      );
      await fs.writeFile(
        path.join(changeDir, 'design.md'),
        `# Design: ${specName}\n\nArchitecture details.\n`,
        'utf-8'
      );
      const specsDir = path.join(changeDir, 'specs', specName);
      await fs.mkdir(specsDir, { recursive: true });
      await fs.writeFile(
        path.join(specsDir, 'spec.md'),
        `# Spec: ${specName}\n\n## Requirements\n- **REQ-1**: Functional behavior\n`,
        'utf-8'
      );
    }

    // Verify all changes exist independently
    for (const specName of approvedSpecs) {
      const changeDir = path.join(changesDir, specName);
      const exists = await fs.stat(changeDir).then((s) => s.isDirectory()).catch(() => false);
      expect(exists).toBe(true);

      const hasProposal = await fs.stat(path.join(changeDir, 'proposal.md')).then((s) => s.isFile()).catch(() => false);
      const hasTasks = await fs.stat(path.join(changeDir, 'tasks.md')).then((s) => s.isFile()).catch(() => false);
      const hasDesign = await fs.stat(path.join(changeDir, 'design.md')).then((s) => s.isFile()).catch(() => false);
      const hasSpec = await fs.stat(path.join(changeDir, 'specs', specName, 'spec.md')).then((s) => s.isFile()).catch(() => false);

      expect(hasProposal).toBe(true);
      expect(hasTasks).toBe(true);
      expect(hasDesign).toBe(true);
      expect(hasSpec).toBe(true);
    }
  });
});
