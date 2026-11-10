/**
 * Non-diagnostic personal tracker primitives.
 * These utilities never interpret health information or grant authorization.
 */
export type TrackerKind = 'journal' | 'progress' | 'reminder';
export type TrackerFilter = TrackerKind | 'all';
export type TrackerOrder = 'newest' | 'oldest';
export type TrackerEntry = {
  id: string;
  owner_id: string;
  kind: TrackerKind;
  title: string;
  note: string;
  event_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};
export type TrackerDraft = {
  kind: TrackerKind;
  title: string;
  note: string;
  event_date: string | null;
};

export const TRACKER_PAGE_SIZE = 20;
export const TRACKER_KINDS: readonly TrackerKind[] = ['journal', 'progress', 'reminder'];

export function trackerEnabled(flag: unknown): boolean {
  return flag === 'true';
}

export function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 1900 && year <= 2100 &&
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function validateTrackerDraft(draft: TrackerDraft): string | null {
  if (!TRACKER_KINDS.includes(draft.kind)) return 'Choose a valid entry type.';
  if (!draft.title.trim() || draft.title.trim().length > 160) return 'Enter a title of 1 to 160 characters.';
  if (draft.note.length > 4000) return 'Notes cannot exceed 4,000 characters.';
  if (draft.event_date !== null && !isValidCalendarDate(draft.event_date)) return 'Choose a valid date.';
  if (draft.kind === 'reminder' && !draft.event_date) return 'Choose a date for a reminder.';
  return null;
}

/** Only personal reminder metadata; never put patient names, titles, or notes into calendar exports. */
export function genericReminderCalendar(entry: Pick<TrackerEntry, 'id' | 'event_date' | 'kind'>, stamp = new Date()): string | null {
  if (entry.kind !== 'reminder' || !entry.event_date || !isValidCalendarDate(entry.event_date)) return null;
  const start = new Date(entry.event_date + 'T00:00:00Z');
  const end = new Date(start.getTime() + 86400000);
  const compact = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '');
  const identifier = entry.id.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 70) || 'reminder';
  const created = stamp.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'CALSCALE:GREGORIAN',
    'PRODID:-//MamaMwana//Private Tracker//EN', 'BEGIN:VEVENT',
    'UID:mm-' + identifier + '@mamamwana.invalid', 'DTSTAMP:' + created,
    'DTSTART;VALUE=DATE:' + compact(start), 'DTEND;VALUE=DATE:' + compact(end),
    'SUMMARY:MamaMwana personal reminder',
    'DESCRIPTION:Open your private MamaMwana tracker for details. This is not a clinic appointment.',
    'END:VEVENT', 'END:VCALENDAR', ''
  ].join('\r\n');
}

export function fileSafeLocalDate(date = new Date()): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function trackerExport(entries: readonly TrackerEntry[]): string {
  return JSON.stringify({
    product: 'MamaMwana personal tracker',
    version: 1,
    warning: 'Sensitive private export. Store securely. This is not a certified medical record.',
    entries: entries.map(({id, kind, title, note, event_date, completed, created_at, updated_at}) =>
      ({id, kind, title, note, event_date, completed, created_at, updated_at}))
  }, null, 2);
}
