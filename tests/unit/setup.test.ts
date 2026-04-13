import { describe, it, expect } from 'vitest';

describe('Project setup', () => {
  it('should run tests with vitest', () => {
    expect(1 + 1).toBe(2);
  });

  it('should support TypeScript', () => {
    const greeting: string = 'hello';
    expect(greeting).toBe('hello');
  });
});
