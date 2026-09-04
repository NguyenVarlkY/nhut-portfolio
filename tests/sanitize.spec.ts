import { test, expect } from '@playwright/test';
import { sanitizeInput } from '../lib/sanitize';

test('sanitizeInput trims whitespace', () => {
  const result = sanitizeInput('  hello  ');
  expect(result.sanitized).toBe('hello');
  expect(result.clean).toBe(true);
});

test('sanitizeInput blocks SQL injection', () => {
  const result = sanitizeInput('SELECT * FROM users');
  expect(result.clean).toBe(false);
});

test('sanitizeInput blocks profanity', () => {
  const result = sanitizeInput('This is a fuck test');
  expect(result.clean).toBe(false);
});

test('sanitizeInput blocks XSS', () => {
  const result = sanitizeInput('<script>alert("xss")</script>');
  expect(result.clean).toBe(false);
});
