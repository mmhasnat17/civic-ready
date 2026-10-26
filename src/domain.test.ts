import { describe, expect, it } from 'vitest';
import { dateOffset, daysUntil, initialCases, priorityFor } from './domain';

describe('transparent calendar-based priority rules', () => {
  const today = '2026-03-08'; // US daylight saving transition day
  it('calculates calendar days correctly across DST', () => {
    expect(daysUntil('2026-03-09', today)).toBe(1);
  });
  it('prioritizes missed dates before upcoming dates', () => {
    const item = initialCases(today)[0];
    expect(priorityFor({ ...item, hearingDate: dateOffset(-1,today) },today)).toBe('Overdue');
    expect(priorityFor({ ...item, hearingDate: dateOffset(3,today) },today)).toBe('Urgent');
    expect(priorityFor({ ...item, hearingDate: dateOffset(7,today) },today)).toBe('Upcoming');
    expect(priorityFor({ ...item, hearingDate: dateOffset(8,today) },today)).toBe('Scheduled');
  });
  it('does not change priority based on contact preferences or accommodations', () => {
    const item = initialCases(today)[0];
    expect(priorityFor({ ...item, channel:'Call', accessibilityNeed:true },today)).toBe(priorityFor(item,today));
  });
  it('treats confirmed cases as complete', () => {
    expect(priorityFor({ ...initialCases(today)[0], status:'Confirmed' },today)).toBe('Complete');
  });
});
