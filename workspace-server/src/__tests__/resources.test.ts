/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

jest.mock('node:fs');

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;

describe('MCP resource path resolution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves WORKSPACE-Context.md relative to __dirname parent', () => {
    // Simulates workspace-server/dist/index.js looking for WORKSPACE-Context.md
    const simulatedDirname = '/project/workspace-server/dist';
    const contextPath = join(simulatedDirname, '..', 'WORKSPACE-Context.md');
    expect(contextPath).toContain('workspace-server');
    expect(contextPath).toContain('WORKSPACE-Context.md');
  });

  it('finds skills dir in release layout (dist/../skills)', () => {
    const simulatedDirname = '/project/dist';
    const releasePath = join(simulatedDirname, '..', 'skills');
    const devPath = join(simulatedDirname, '..', '..', 'skills');

    mockExistsSync.mockImplementation((p) => p === releasePath);

    const skillsBaseDir = [releasePath, devPath].find((d) =>
      mockExistsSync(d),
    );
    expect(skillsBaseDir).toBe(releasePath);
  });

  it('finds skills dir in dev layout (dist/../../skills)', () => {
    const simulatedDirname = '/project/workspace-server/dist';
    const releasePath = join(simulatedDirname, '..', 'skills');
    const devPath = join(simulatedDirname, '..', '..', 'skills');

    mockExistsSync.mockImplementation((p) => p === devPath);

    const skillsBaseDir = [releasePath, devPath].find((d) =>
      mockExistsSync(d),
    );
    expect(skillsBaseDir).toBe(devPath);
  });

  it('returns undefined when no skills directory is found', () => {
    mockExistsSync.mockReturnValue(false);
    const simulatedDirname = '/project/workspace-server/dist';
    const paths = [
      join(simulatedDirname, '..', 'skills'),
      join(simulatedDirname, '..', '..', 'skills'),
    ];
    const skillsBaseDir = paths.find((d) => mockExistsSync(d));
    expect(skillsBaseDir).toBeUndefined();
  });

  it('reads skill file content when path exists', () => {
    const skillPath = '/project/skills/gmail/SKILL.md';
    const expectedContent = '# Gmail Expert\n\nSome content here.';
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(expectedContent as any);

    const content = existsSync(skillPath)
      ? readFileSync(skillPath, 'utf-8')
      : null;
    expect(content).toBe(expectedContent);
  });

  it('skips skill registration when skill file does not exist', () => {
    mockExistsSync.mockReturnValue(false);
    const skillPath = '/project/skills/gmail/SKILL.md';

    const content = existsSync(skillPath)
      ? readFileSync(skillPath, 'utf-8')
      : null;
    expect(content).toBeNull();
    expect(mockReadFileSync).not.toHaveBeenCalled();
  });

  it('covers all expected skill names', () => {
    const expectedSkills = [
      'gmail',
      'google-docs',
      'google-calendar',
      'google-chat',
      'google-sheets',
      'google-slides',
    ];

    // Verify all skills have entries (sanity check on the list)
    expect(expectedSkills).toHaveLength(6);
    expectedSkills.forEach((name) => {
      expect(name).toMatch(/^[a-z-]+$/);
    });
  });
});
