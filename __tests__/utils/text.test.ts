import { truncate } from '../../src/utils/text';

describe('text utilities', () => {
  it('should truncate text to specified length', () => {
    const longText = 'This is a very long text that should be truncated';
    const result = truncate(longText, 20);
    expect(result).toBe('This is a very long…');
  });

  it('should not truncate text shorter than limit', () => {
    const shortText = 'Short text';
    const result = truncate(shortText, 20);
    expect(result).toBe('Short text');
  });

  it('should handle empty string', () => {
    const result = truncate('', 10);
    expect(result).toBe('');
  });

  it('should handle null/undefined gracefully', () => {
    const result1 = truncate(null as any, 10);
    const result2 = truncate(undefined as any, 10);
    expect(result1).toBe('');
    expect(result2).toBe('');
  });
});
