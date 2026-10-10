import { describe, expect, it } from 'vitest';
import { generateCode } from '../src/utils/codeGenerator';

describe('generateCode', () => {
  it('generates codes of the requested length', () => {
    expect(generateCode(10)).toHaveLength(10);
  });

  it('never uses ambiguous characters', () => {
    const sample = Array.from({ length: 500 }, () => generateCode(8)).join('');
    expect(sample).not.toMatch(/[01OlI]/);
  });
});
