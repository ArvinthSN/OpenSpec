import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { InitCommand } from '../../src/core/init.js';
import {
  REQUIREMENT_SKILL_NAME,
  installRequirementSkill,
  collectSkillFiles,
  getRequirementSkillSourceDir,
  isRequirementSkillFileModified,
  injectGeneratedBy,
} from '../../src/core/shared/requirement-skill.js';
import { FileSystemUtils } from '../../src/utils/file-system.js';

const { confirmMock, showWelcomeScreenMock, searchableMultiSelectMock } = vi.hoisted(() => ({
  confirmMock: vi.fn(),
  showWelcomeScreenMock: vi.fn().mockResolvedValue(undefined),
  searchableMultiSelectMock: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => ({
  confirm: confirmMock,
}));

vi.mock('../../src/ui/welcome-screen.js', () => ({
  showWelcomeScreen: showWelcomeScreenMock,
}));

vi.mock('../../src/prompts/searchable-multi-select.js', () => ({
  searchableMultiSelect: searchableMultiSelectMock,
}));

describe('Requirement-to-OpenSpec Skill Integration', () => {
  let testDir: string;
  let configTempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-req-skill-test-'));
    originalEnv = { ...process.env };
    configTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-config-req-'));
    process.env.XDG_CONFIG_HOME = configTempDir;
    process.env.HOME = path.join(testDir, 'home');
    process.env.USERPROFILE = path.join(testDir, 'home');

    vi.spyOn(console, 'log').mockImplementation(() => {});
    confirmMock.mockReset();
    confirmMock.mockResolvedValue(true);
    showWelcomeScreenMock.mockClear();
    searchableMultiSelectMock.mockReset();
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.rm(configTempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('unit helpers', () => {
    it('resolves the source directory of requirement-to-openspec', () => {
      const sourceDir = getRequirementSkillSourceDir();
      expect(sourceDir).toBeDefined();
      expect(sourceDir.endsWith('requirement-to-openspec')).toBe(true);
      expect(sourceDir).toContain(path.join('skills', REQUIREMENT_SKILL_NAME));
    });

    it('collects all files preserving structure', async () => {
      const sourceDir = getRequirementSkillSourceDir();
      const files = await collectSkillFiles(sourceDir);

      expect(files).toContain('SKILL.md');
      expect(files).toContain('README.md');
      expect(files.some((f) => f.startsWith('templates/'))).toBe(true);
      expect(files.some((f) => f.startsWith('references/'))).toBe(true);
      expect(files.some((f) => f.startsWith('examples/'))).toBe(true);
      expect(files).toContain('templates/final-planning-template.md');
      expect(files).toContain('references/openspec-guidelines.md');
    });

    it('detects user modifications accurately', () => {
      const original = '# Title\nSome content';
      const modified = '# Title\nSome customized content';

      expect(isRequirementSkillFileModified(original, original)).toBe(false);
      expect(isRequirementSkillFileModified(original, modified)).toBe(true);

      // Windows CRLF vs Unix LF normalization
      expect(isRequirementSkillFileModified('# Title\r\nSome content', original)).toBe(false);

      // SKILL.md generatedBy version difference is not counted as user modification
      const skillOriginal = '---\nmetadata:\n  generatedBy: "1.16.0"\n---\n# Instructions';
      const skillNewVersion = '---\nmetadata:\n  generatedBy: "1.17.0"\n---\n# Instructions';
      const skillUserEdited = '---\nmetadata:\n  generatedBy: "1.16.0"\n---\n# My Custom Rules';

      expect(isRequirementSkillFileModified(skillOriginal, skillNewVersion, true)).toBe(false);
      expect(isRequirementSkillFileModified(skillOriginal, skillUserEdited, true)).toBe(true);
    });

    it('injects generatedBy version into frontmatter', () => {
      const content = '---\nname: test\nmetadata:\n  author: openspec\n---\nBody';
      const updated = injectGeneratedBy(content, '1.16.0');
      expect(updated).toContain('generatedBy: "1.16.0"');
    });
  });

  describe('openspec init integration', () => {
    it('installs requirement-to-openspec skill when initializing with Claude Code', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillDir = path.join(testDir, '.claude', 'skills', REQUIREMENT_SKILL_NAME);
      expect(await FileSystemUtils.directoryExists(skillDir)).toBe(true);

      // Verify SKILL.md and supporting structure exist
      const skillFile = path.join(skillDir, 'SKILL.md');
      expect(await FileSystemUtils.fileExists(skillFile)).toBe(true);

      const skillContent = await fs.readFile(skillFile, 'utf8');
      expect(skillContent).toContain('name: requirement-to-openspec');
      expect(skillContent).toContain('openspec/planning.md');

      // Verify templates, references, examples
      expect(await FileSystemUtils.fileExists(path.join(skillDir, 'templates', 'final-planning-template.md'))).toBe(true);
      expect(await FileSystemUtils.fileExists(path.join(skillDir, 'references', 'openspec-guidelines.md'))).toBe(true);
      expect(await FileSystemUtils.fileExists(path.join(skillDir, 'references', 'prompt-generation-guidelines.md'))).toBe(true);
      expect(await FileSystemUtils.fileExists(path.join(skillDir, 'examples', 'sample-output.md'))).toBe(true);
      expect(await FileSystemUtils.fileExists(path.join(skillDir, 'README.md'))).toBe(true);
    });

    it('installs requirement-to-openspec skill when initializing with universal .agents target', async () => {
      const initCommand = new InitCommand({ tools: 'agents', force: true });
      await initCommand.execute(testDir);

      const skillDir = path.join(testDir, '.agents', 'skills', REQUIREMENT_SKILL_NAME);
      expect(await FileSystemUtils.directoryExists(skillDir)).toBe(true);
      expect(await FileSystemUtils.fileExists(path.join(skillDir, 'SKILL.md'))).toBe(true);
      expect(await FileSystemUtils.fileExists(path.join(skillDir, 'templates', 'final-planning-template.md'))).toBe(true);
    });

    it('installs requirement-to-openspec skill when initializing with Cursor', async () => {
      const initCommand = new InitCommand({ tools: 'cursor', force: true });
      await initCommand.execute(testDir);

      const skillDir = path.join(testDir, '.cursor', 'skills', REQUIREMENT_SKILL_NAME);
      expect(await FileSystemUtils.directoryExists(skillDir)).toBe(true);
      expect(await FileSystemUtils.fileExists(path.join(skillDir, 'SKILL.md'))).toBe(true);
    });

    it('does not install skills when tools is none', async () => {
      const initCommand = new InitCommand({ tools: 'none', force: true });
      await initCommand.execute(testDir);

      expect(await FileSystemUtils.directoryExists(path.join(testDir, '.claude', 'skills'))).toBe(false);
      expect(await FileSystemUtils.directoryExists(path.join(testDir, '.agents', 'skills'))).toBe(false);
    });

    it('preserves user modifications during reinitialization without force', async () => {
      // Step 1: Initial init
      const init1 = new InitCommand({ tools: 'claude', force: true });
      await init1.execute(testDir);

      const skillDir = path.join(testDir, '.claude', 'skills', REQUIREMENT_SKILL_NAME);
      const templatePath = path.join(skillDir, 'templates', 'final-planning-template.md');
      const skillPath = path.join(skillDir, 'SKILL.md');

      // Step 2: User customizes the template and SKILL.md
      const userCustomTemplate = '# Custom Organization Planning Template\n{{CUSTOM_SECTION}}';
      const userCustomSkill = '---\nname: requirement-to-openspec\nmetadata:\n  author: custom-team\n---\n# My Custom Team Rules';

      await fs.writeFile(templatePath, userCustomTemplate, 'utf8');
      await fs.writeFile(skillPath, userCustomSkill, 'utf8');

      // Step 3: User also adds an extra file of their own
      const userExtraFile = path.join(skillDir, 'references', 'my-team-standards.md');
      await fs.writeFile(userExtraFile, '# Team Standards', 'utf8');

      // Step 4: Re-initialize (e.g. openspec init in extend mode or without force)
      const init2 = new InitCommand({ tools: 'claude', force: false });
      await init2.execute(testDir);

      // Verify user modifications are preserved!
      expect(await fs.readFile(templatePath, 'utf8')).toBe(userCustomTemplate);
      expect(await fs.readFile(skillPath, 'utf8')).toBe(userCustomSkill);
      expect(await fs.readFile(userExtraFile, 'utf8')).toBe('# Team Standards');
    });

    it('overwrites user modifications during reinitialization when force is true', async () => {
      // Step 1: Initial init
      const init1 = new InitCommand({ tools: 'claude', force: true });
      await init1.execute(testDir);

      const skillDir = path.join(testDir, '.claude', 'skills', REQUIREMENT_SKILL_NAME);
      const templatePath = path.join(skillDir, 'templates', 'final-planning-template.md');

      // User customizes template
      await fs.writeFile(templatePath, '# Modified Content', 'utf8');

      // Step 2: Re-init with force: true
      const init2 = new InitCommand({ tools: 'claude', force: true });
      await init2.execute(testDir);

      // Verify file was restored from source
      const content = await fs.readFile(templatePath, 'utf8');
      expect(content).not.toBe('# Modified Content');
      expect(content).toContain('Executive Summary');
    });

    it('handles missing source directory gracefully without crashing init', async () => {
      const result = await installRequirementSkill({
        skillsPath: path.join(testDir, '.claude', 'skills'),
        skillsRoot: testDir,
        sourceDir: path.join(testDir, 'non-existent-dir'),
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

