export type ContactChannel = 'Text' | 'Call' | 'Email';
export type CaseStatus = 'Pending' | 'Contacted' | 'Confirmed';

export interface CourtCase {
  id: string;
  client: string; // Fictional display names only. Never store real client records in this demo.
  caseRef: string;
  hearingDate: string; // YYYY-MM-DD local calendar date; no timezone conversion.
  channel: ContactChannel;
  status: CaseStatus;
  accessibilityNeed: boolean;
  lastContact?: string;
}

export interface AuditEntry { id: string; at: string; caseRef: string; action: string }
export type Priority = 'Overdue' | 'Urgent' | 'Upcoming' | 'Scheduled' | 'Complete';

// Compare calendar dates as UTC midnight to avoid daylight-saving shifts.
export function daysUntil(date: string, today: string): number {
  const parse = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((parse(date) - parse(today)) / 86_400_000);
}

export function priorityFor(item: CourtCase, today: string): Priority {
  if (item.status === 'Confirmed') return 'Complete';
  const days = daysUntil(item.hearingDate, today);
  if (days < 0) return 'Overdue';
  if (days <= 3) return 'Urgent';
  if (days <= 7) return 'Upcoming';
  return 'Scheduled';
}

export const priorityOrder: Record<Priority, number> = { Overdue: 0, Urgent: 1, Upcoming: 2, Scheduled: 3, Complete: 4 };
export function todayLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function dateOffset(days: number, today = todayLocal()): string {
  const [y, m, d] = today.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function initialCases(today = todayLocal()): CourtCase[] {
  return [
    { id:'1', client:'Jordan Ellis', caseRef:'CR-1042', hearingDate:dateOffset(1,today), channel:'Text', status:'Pending', accessibilityNeed:false },
    { id:'2', client:'Taylor Morgan', caseRef:'CR-1043', hearingDate:dateOffset(3,today), channel:'Call', status:'Contacted', accessibilityNeed:true, lastContact:dateOffset(-1,today) },
    { id:'3', client:'Casey Rivera', caseRef:'CR-1044', hearingDate:dateOffset(6,today), channel:'Email', status:'Pending', accessibilityNeed:false },
    { id:'4', client:'Avery Brooks', caseRef:'CR-1045', hearingDate:dateOffset(12,today), channel:'Text', status:'Confirmed', accessibilityNeed:false },
    { id:'5', client:'Morgan Lee', caseRef:'CR-1046', hearingDate:dateOffset(-1,today), channel:'Call', status:'Pending', accessibilityNeed:true },
    { id:'6', client:'Riley Parker', caseRef:'CR-1047', hearingDate:dateOffset(15,today), channel:'Email', status:'Pending', accessibilityNeed:false },
  ];
}
