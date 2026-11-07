import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { sanitiseText } from '../../sanitise/sanitiser';
import type {
  MatchEventInput,
  MatchEventRecord,
  FeedbackInput,
  FeedbackRecord,
  MissLogInput,
  MissLogRecord,
} from './schema';
import type { LibraryEntry } from '../../library/types';

const DB_FILE = path.resolve('data/local_db.json');
const MOCK_FILE = path.resolve('data/mock-events.json');
const LIBRARY_FILE = path.resolve('data/library.json');

interface LocalDatabaseState {
  match_events: MatchEventRecord[];
  feedback: FeedbackRecord[];
  miss_log: MissLogRecord[];
}

function loadLibraryIds(): Set<string> {
  try {
    if (!fs.existsSync(LIBRARY_FILE)) return new Set(['nsp_no_match']);
    const entries: LibraryEntry[] = JSON.parse(fs.readFileSync(LIBRARY_FILE, 'utf8'));
    const ids = new Set(entries.map(e => e.id));
    ids.add('nsp_no_match');
    return ids;
  } catch {
    return new Set(['nsp_no_match']);
  }
}

export function getMondayOfWeek(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  // In JavaScript, Sunday is 0, Monday is 1... Saturday is 6
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function readDb(): LocalDatabaseState {
  if (!fs.existsSync(DB_FILE)) {
    const initial: LocalDatabaseState = { match_events: [], feedback: [], miss_log: [] };
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { match_events: [], feedback: [], miss_log: [] };
  }
}

function writeDb(data: LocalDatabaseState): void {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Local Repository Implementation for Rapid Prototype
 * Follows documented schemas, zero user accounts, zero raw text, and retention rules.
 */
export const db = {
  getStatus() {
    const hasPostgres = Boolean(process.env.DATABASE_URL);
    return {
      storage: hasPostgres ? 'postgresql' : 'local_dev',
      connected: hasPostgres,
      isMock: false,
      note: hasPostgres
        ? 'Connected to PostgreSQL database'
        : 'Using local JSON database storage (DATABASE_URL not configured)',
    };
  },

  insertMatchEvent(input: MatchEventInput): MatchEventRecord | null {
    // 1. Consent Gate: Opt-in only
    if (input.consent !== true) {
      return null;
    }

    // 2. Validate entry_id against library
    const validIds = loadLibraryIds();
    const entryId = validIds.has(input.entry_id) ? input.entry_id : 'nsp_no_match';

    // 3. Compute week_start (Monday of current week; no exact timestamp)
    const weekStart = getMondayOfWeek();

    const record: MatchEventRecord = {
      event_id: crypto.randomUUID(),
      week_start: weekStart,
      entry_id: entryId,
      fault_label: input.fault_label,
      state_code: input.state_code ? input.state_code.slice(0, 3).toUpperCase() : null,
      match_path: input.match_path,
      outcome: input.outcome,
    };

    const state = readDb();
    state.match_events.push(record);
    writeDb(state);

    return record;
  },

  insertFeedback(input: FeedbackInput): FeedbackRecord {
    // 1. Validate entry_id against library
    const validIds = loadLibraryIds();
    if (!validIds.has(input.entry_id)) {
      throw new Error(`Unknown library entry_id: ${input.entry_id}`);
    }

    // 2. Mask sensitive info in optional note (P4, P10)
    let maskedNote: string | null = null;
    if (input.note && typeof input.note === 'string') {
      const sanitised = sanitiseText(input.note);
      maskedNote = sanitised.maskedText.slice(0, 300);
    }

    const record: FeedbackRecord = {
      id: crypto.randomUUID(),
      created_on: getTodayDate(),
      entry_id: input.entry_id,
      category: input.category,
      note: maskedNote,
    };

    const state = readDb();
    state.feedback.push(record);
    writeDb(state);

    return record;
  },

  insertMissLog(input: MissLogInput): MissLogRecord {
    // Explicit consent required
    if (input.consent !== true) {
      throw new Error('Explicit consent is required to log unmatched remark.');
    }

    // Server-side re-sanitisation (client masking alone is never trusted)
    const sanitised = sanitiseText(input.text_masked);
    const maskedText = sanitised.maskedText.slice(0, 200);

    const today = getTodayDate();
    const record: MissLogRecord = {
      id: crypto.randomUUID(),
      created_on: today,
      expires_at: addDays(today, 30), // 30-day retention
      text_masked: maskedText,
    };

    const state = readDb();
    state.miss_log.push(record);
    writeDb(state);

    return record;
  },

  /**
   * Enforces documented data retention:
   * - miss_log expires after 30 days
   * - match_events expires after 12 months (365 days)
   * - feedback expires after 12 months (365 days)
   */
  purgeExpired(referenceDate: string = getTodayDate()) {
    const state = readDb();
    const initialMisses = state.miss_log.length;
    const initialEvents = state.match_events.length;
    const initialFeedback = state.feedback.length;

    // Purge miss_log older than expires_at
    state.miss_log = state.miss_log.filter(m => m.expires_at >= referenceDate);

    // 12 months cutoff date
    const twelveMonthsAgo = addDays(referenceDate, -365);
    state.match_events = state.match_events.filter(e => e.week_start >= twelveMonthsAgo);
    state.feedback = state.feedback.filter(f => f.created_on >= twelveMonthsAgo);

    writeDb(state);

    return {
      purgedMisses: initialMisses - state.miss_log.length,
      purgedEvents: initialEvents - state.match_events.length,
      purgedFeedback: initialFeedback - state.feedback.length,
    };
  },

  /**
   * Reads aggregated dashboard statistics.
   * If forceMock === true (used in explicit test fixtures), returns mock fixture with MOCK DATA banner.
   * In production and live environments, aggregates actual events with k-anonymity suppression (k >= 10).
   */
  getDashboardData(forceMock?: boolean) {
    if (forceMock === true) {
      if (fs.existsSync(MOCK_FILE)) {
        const mockData = JSON.parse(fs.readFileSync(MOCK_FILE, 'utf8'));
        return {
          ...mockData,
          data_source: 'mock_fixture',
          status: 'mock',
        };
      }
    }

    const state = readDb();

    // Real aggregation with k-anonymity suppression (k >= 10)
    const K_THRESHOLD = 10;
    const entryCounts: Record<string, number> = {};
    const faultSplit: Record<string, number> = {
      student: 0,
      institute_officer: 0,
      bank: 0,
      unsure: 0,
    };
    const weeklyTrends: Record<string, number> = {};

    for (const event of state.match_events) {
      // Aggregate by entry_id
      entryCounts[event.entry_id] = (entryCounts[event.entry_id] || 0) + 1;

      // Aggregate fault split
      if (faultSplit[event.fault_label] !== undefined) {
        faultSplit[event.fault_label]++;
      }

      // Aggregate weekly trend
      weeklyTrends[event.week_start] = (weeklyTrends[event.week_start] || 0) + 1;
    }

    // Top 5 confusing messages with suppression
    const topEntries = Object.entries(entryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => {
        const isSuppressed = count < K_THRESHOLD;
        return {
          entry_id: id,
          count: isSuppressed ? null : count,
          count_display: isSuppressed ? '< 10' : String(count),
          suppressed: isSuppressed,
        };
      });

    const weeklyTrendArray = Object.entries(weeklyTrends)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week_start, count]) => ({
        week_start,
        count: count < K_THRESHOLD ? null : count,
        count_display: count < K_THRESHOLD ? '< 10' : String(count),
        suppressed: count < K_THRESHOLD,
      }));

    return {
      mock: false,
      notice:
        state.match_events.length === 0
          ? 'No opt-in community events recorded yet.'
          : 'LIVE AGGREGATE DATA (Server-side suppressed for groups < 10)',
      data_source: 'local_dev',
      min_group_size: K_THRESHOLD,
      total_events: state.match_events.length,
      top_confusing_messages: topEntries,
      fault_split: faultSplit,
      weekly_trends: weeklyTrendArray,
    };
  },

  // Helper for internal testing only
  _getState(): LocalDatabaseState {
    return readDb();
  },

  _saveState(state: LocalDatabaseState): void {
    writeDb(state);
  },

  _clear(): void {
    writeDb({ match_events: [], feedback: [], miss_log: [] });
  },
};
