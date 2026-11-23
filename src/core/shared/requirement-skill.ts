/**
 * Requirement-to-OpenSpec Project-Level Skill Support
 *
 * Automatically installs and manages the `requirement-to-openspec` skill
 * in target projects during `openspec init` (and `openspec update`).
 */

import path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { fileURLToPath } from 'url';
import { FileSystemUtils } from '../../utils/file-system.js';

export const REQUIREMENT_SKILL_NAME = 'requirement-to-openspec';

let sourceDirOverride: (() => string) | undefined;

/**
 * Override the source directory for requirement-to-openspec (useful for testing).
 */
export function setRequirementSkillSourceDir(resolveDir: () => string): void {
  sourceDirOverride = resolveDir;
}

/**
 * Reset source directory override.
 */
export function resetRequirementSkillSourceDir(): void {
  sourceDirOverride = undefined;
}

/**
 * Resolves the source directory containing the requirement-to-openspec skill files.
 */
export function getRequirementSkillSourceDir(): string {
  if (sourceDirOverride) {
    return sourceDirOverride();
  }

  const currentFile = fileURLToPath(import.meta.url);
  // From src/core/shared/ or dist/core/shared/ to package root
  const skillsCandidate = path.resolve(path.dirname(currentFile), '..', '..', '..', 'skills', REQUIREMENT_SKILL_NAME);
  if (fsSync.existsSync(skillsCandidate)) {
    return skillsCandidate;
  }

  const rootCandidate = path.resolve(path.dirname(currentFile), '..', '..', '..', REQUIREMENT_SKILL_NAME);
  if (fsSync.existsSync(rootCandidate)) {
    return rootCandidate;
  }

  const cwdSkillsCandidate = path.resolve(process.cwd(), 'skills', REQUIREMENT_SKILL_NAME);
  if (fsSync.existsSync(cwdSkillsCandidate)) {
    return cwdSkillsCandidate;
  }

  const cwdCandidate = path.resolve(process.cwd(), REQUIREMENT_SKILL_NAME);
  if (fsSync.existsSync(cwdCandidate)) {
    return cwdCandidate;
  }

  return skillsCandidate;
}

/**
 * Recursively collects all files in a directory, returning paths relative to baseDir.
 * Excludes OS-generated hidden files like .DS_Store.
 */
export async function collectSkillFiles(dir: string, baseDir = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.openspec') {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await collectSkillFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'));
    }
  }

  return files.sort();
}

function normalizeContent(text: string): string {
  return text.replace(/\r\n/g, '\n').trimEnd();
}

function stripGeneratedBy(content: string): string {
  return content.replace(/^(\s*generatedBy:\s*["'][^"']*["']|\s*generatedBy:\s*[^\n]+)\n?/m, '');
}

/**
 * Compares existing file content against source content to detect user modifications.
 * For SKILL.md, version differences in `generatedBy` metadata are ignored.
 */
export function isRequirementSkillFileModified(
  existingContent: string,
  sourceContent: string,
  isSkillMd = false
): boolean {
  const normExisting = normalizeContent(existingContent);
  const normSource = normalizeContent(sourceContent);

  if (normExisting === normSource) {
    return false;
  }

  if (isSkillMd) {
    const strippedExisting = normalizeContent(stripGeneratedBy(normExisting));
    const strippedSource = normalizeContent(stripGeneratedBy(normSource));
    return strippedExisting !== strippedSource;
  }

  return true;
}

/**
 * Ensures `generatedBy: "<version>"` is embedded in the YAML frontmatter.
 */
export function injectGeneratedBy(skillContent: string, version: string): string {
  const normalized = skillContent.replace(/\r\n/g, '\n');

  if (normalized.includes('generatedBy:')) {
    return normalized.replace(
      /^(\s*generatedBy:\s*["'][^"']*["']|\s*generatedBy:\s*[^\n]+)$/m,
      `  generatedBy: "${version}"`
    );
  }

  if (normalized.includes('metadata:')) {
    return normalized.replace(
      /^(metadata:\s*\n)/m,
      `$1  generatedBy: "${version}"\n`
    );
  }

  if (normalized.startsWith('---')) {
    return normalized.replace(
      /^(---\n)/,
      `$1metadata:\n  generatedBy: "${version}"\n`
    );
  }

  return skillContent;
}

export interface InstallRequirementSkillOptions {
  skillsPath: string;
  skillsRoot: string;
  force?: boolean;
  version?: string;
  sourceDir?: string;
}

export interface InstallRequirementSkillResult {
  success: boolean;
  skillDir: string;
  installedFiles: string[];
  preservedFiles: string[];
  error?: string;
}

/**
 * Installs the complete requirement-to-openspec skill into target skills directory.
 * Preserves user modifications unless force is true.
 */
export async function installRequirementSkill(
  options: InstallRequirementSkillOptions
): Promise<InstallRequirementSkillResult> {
  const sourceDir = options.sourceDir ?? getRequirementSkillSourceDir();
  const skillDir = path.join(options.skillsPath, REQUIREMENT_SKILL_NAME);
  const installedFiles: string[] = [];
  const preservedFiles: string[] = [];

  if (!fsSync.existsSync(sourceDir)) {
    return {
      success: false,
      skillDir,
      installedFiles,
      preservedFiles,
      error: `Requirement skill source directory not found: ${sourceDir}`,
    };
  }

  try {
    const relativeFiles = await collectSkillFiles(sourceDir);

    for (const relFile of relativeFiles) {
      const srcPath = path.join(sourceDir, relFile);
      const destPath = path.join(skillDir, relFile);

      FileSystemUtils.assertPathWithin(options.skillsRoot, destPath);

      let fileContent = await fs.readFile(srcPath, 'utf8');
      const isSkillMd = relFile.toLowerCase() === 'skill.md';

      if (isSkillMd && options.version) {
        fileContent = injectGeneratedBy(fileContent, options.version);
      }

      const exists = await FileSystemUtils.fileExists(destPath);
      if (!exists) {
        await FileSystemUtils.writeFile(destPath, fileContent);
        installedFiles.push(relFile);
      } else if (options.force) {
        await FileSystemUtils.writeFile(destPath, fileContent);
        installedFiles.push(relFile);
      } else {
        const existingContent = await fs.readFile(destPath, 'utf8');
        const modified = isRequirementSkillFileModified(existingContent, fileContent, isSkillMd);

        if (modified) {
          preservedFiles.push(relFile);
        } else {
          if (isSkillMd) {
            await FileSystemUtils.writeFile(destPath, fileContent);
          }
          installedFiles.push(relFile);
        }
      }
    }

    return {
      success: true,
      skillDir,
      installedFiles,
      preservedFiles,
    };
  } catch (error) {
    return {
      success: false,
      skillDir,
      installedFiles,
      preservedFiles,
      error: (error as Error).message,
    };
  }
}

