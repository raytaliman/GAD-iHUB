import { supabase } from './supabase';

const SATISFACTION_SCORE = {
  'Very Satisfied': 5,
  Satisfied: 4,
  Neutral: 3,
  Dissatisfied: 2,
  'Very Dissatisfied': 1,
};

const RATING_SCORE = {
  excellent: 5,
  veryGood: 4,
  good: 3,
  fair: 2,
  poor: 1,
  na: null,
};

const PART2_KEYS = [
  'cleanliness_safety',
  'child_comfort',
  'toys_materials',
  'staff_attentiveness',
  'accessibility_convenience',
  'maintenance_upkeep',
  'staff_responsiveness',
];
const PART3_KEYS = ['staff_eval_attentiveness', 'staff_eval_friendliness', 'staff_eval_responsiveness'];

/**
 * Fetches form parts and questions from the database for the dynamic Evaluations page.
 * 
 * @async
 * @returns {Promise<Array<{key: string, label: string, questions: Array<{key: string, label: string, answer_type: string}>}>>} 
 *          An array of form parts, each containing its questions. Returns an empty array if Supabase is not configured or an error occurs.
 */
export async function fetchFormStructure() {
  if (!supabase) return [];
  try {
    const [partsRes, questionsRes] = await Promise.all([
      supabase.from('form_parts').select('key, sort_order, label').order('sort_order'),
      supabase.from('questions').select('part, sort_order, key, label, answer_type').order('part').order('sort_order'),
    ]);
    const partRows = partsRes.data ?? [];
    const questionRows = questionsRes.data ?? [];
    return partRows
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((p) => {
        const qs = (questionRows || [])
          .filter((q) => q.part === p.key)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((q) => ({ key: q.key, label: q.label || q.key, answer_type: q.answer_type ?? 'emoji' }));
        return { key: p.key, label: p.label, questions: qs };
      })
      .filter((p) => p.questions.length > 0);
  } catch {
    return [];
  }
}

/**
 * Calculates the average score for each question key based on feedback submissions.
 * Text-based questions are skipped.
 * 
 * @param {Array<Object>} list - The list of feedback submission objects.
 * @param {Array<Object>} questions - The list of question configuration objects.
 * @returns {Object} A mapping of question keys to their average numeric scores.
 */
export function averagesForQuestions(list, questions) {
  const scoreMap = (type) => (type === 'satisfaction' ? SATISFACTION_SCORE : RATING_SCORE);
  const out = {};
  (questions || []).forEach((q) => {
    const map = scoreMap(q.answer_type);
    if (q.answer_type === 'text') {
      out[q.key] = null;
      return;
    }
    let sum = 0;
    let n = 0;
    list.forEach((r) => {
      const v = map[r[q.key]];
      if (v != null) {
        sum += v;
        n++;
      }
    });
    out[q.key] = n ? sum / n : 0;
  });
  return out;
}

/**
 * Counts the frequency of each score (1-5) for rating-based questions.
 * Used for displaying segmented distribution bars.
 * 
 * @param {Array<Object>} list - The list of feedback submission objects.
 * @param {Array<Object>} questions - The list of question configuration objects.
 * @returns {Object} A mapping of question keys to an object containing counts for each score level.
 */
export function distributionForQuestions(list, questions) {
  const scoreMap = (type) => (type === 'satisfaction' ? SATISFACTION_SCORE : RATING_SCORE);
  const out = {};
  (questions || []).forEach((q) => {
    if (q.answer_type === 'text') {
      out[q.key] = null;
      return;
    }
    const map = scoreMap(q.answer_type);
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    list.forEach((r) => {
      const v = map[r[q.key]];
      if (v >= 1 && v <= 5) counts[v] = (counts[v] || 0) + 1;
    });
    out[q.key] = counts;
  });
  return out;
}

/**
 * Parses a relative period string into an absolute date range.
 * 
 * @private
 * @param {string} period - The period string (e.g., 'This week', 'This month', 'This year').
 * @returns {Object} An object with `from` and `to` Date objects.
 */
function parsePeriod(period) {
  const now = new Date();
  let from = new Date(now);
  if (period === 'This week') {
    from.setDate(now.getDate() - 7);
  } else if (period === 'This month') {
    from.setMonth(now.getMonth() - 1);
  } else if (period === 'Last 3 months') {
    from.setMonth(now.getMonth() - 3);
  } else if (period === 'This year') {
    from.setFullYear(now.getFullYear() - 1);
  } else {
    from.setMonth(now.getMonth() - 1);
  }
  return { from, to: now };
}

/**
 * Fetches all feedback evaluations from Supabase, flattens the record structure, 
 * and filters by the specified time period or date range.
 * 
 * @async
 * @param {string} [period='This month'] - The descriptive period to filter by.
 * @param {Object|null} [dateRange=null] - An optional specific date range object {from, to}.
 * @throws {Error} If Supabase is not configured or a database error occurs.
 * @returns {Promise<Array<Object>>} A flattened list of evaluation records.
 */
export async function fetchFeedback(period = 'This month', dateRange = null) {
  if (!supabase) {
    throw new Error(
      'API connection is not configured. Create .env with VITE_API_URL or VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  // Query from evaluations and join with registrations
  const { data, error } = await supabase
    .from('evaluations')
    .select('*, registrations(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Flatten registration into the row so KPI logic remains same
  const raw = data || [];
  const list = raw.map((r) => {
    const reg = r.registrations || {};
    const ans = r.answers && typeof r.answers === 'object' ? r.answers : (typeof r.answers === 'string' ? (() => { try { return JSON.parse(r.answers); } catch { return {}; } })() : {});
    return { ...reg, ...r, ...ans };
  });

  if (dateRange && dateRange.from && dateRange.to) {
    const from = new Date(dateRange.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(dateRange.to);
    to.setHours(23, 59, 59, 999);
    return list.filter((r) => {
      const d = new Date(r.created_at);
      return d >= from && d <= to;
    });
  }
  // 'All' period: return everything with no date filter
  if (period === 'All') return list;
  const { from } = parsePeriod(period);
  return list.filter((r) => new Date(r.created_at) >= from);
}

/**
 * Fetches ALL registrations directly from the registrations table with no date filter.
 * Each registration row has its children parsed from JSON.
 *
 * @async
 * @throws {Error} If Supabase is not configured or a database error occurs.
 * @returns {Promise<Array<Object>>} A list of all registration records.
 */
export async function fetchAllRegistrations() {
  if (!supabase) {
    throw new Error(
      'API connection is not configured. Create .env with VITE_API_URL or VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  const { data, error } = await supabase
    .from('registrations')
    .select('*, evaluations(id, created_at)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((r) => {
    // Parse children if stored as JSON string
    let children = r.children;
    if (typeof children === 'string') {
      try { children = JSON.parse(children); } catch { children = []; }
    }
    if (!Array.isArray(children)) children = [];
    const evals = r.evaluations || [];
    const evalItem = evals[0] || null;
    return { 
      ...r, 
      children,
      time_out: evalItem ? evalItem.created_at : null,
      eval_id: evalItem ? evalItem.id : null
    };
  });
}

/**
 * Updates a registration record in Supabase.
 *
 * @async
 * @param {string|number} id - The registration row ID.
 * @param {Object} fields - Fields to update (e.g. parent_name, email, children, …).
 * @throws {Error} If Supabase is not configured or a database error occurs.
 * @returns {Promise<Object>} The updated registration row.
 */
export async function updateRegistration(id, fields) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
  // Ensure children is stored as a plain array (Supabase handles JSON columns)
  const payload = { ...fields };
  if (payload.children && typeof payload.children !== 'string') {
    payload.children = payload.children; // keep as array; Supabase serialises automatically
  }
  const { data, error } = await supabase
    .from('registrations')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Calculates the percentage change between a current and previous value.
 * 
 * @private
 * @param {number} current - The current measurement.
 * @param {number} previous - The previous measurement to compare against.
 * @returns {number|null} The percentage change, or null if previous is zero/null.
 */
function pctChange(current, previous) {
  if (previous == null || previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

/**
 * Computes high-level Key Performance Indicators (KPIs) from a list of feedback records.
 * Includes total submissions, average satisfaction, positive rating percentage, 
 * suggestion count, and their recent trends.
 * 
 * @param {Array<Object>} list - The list of evaluation records to analyze.
 * @returns {Object} An object containing all computed KPIs and trend percentages.
 */
export function computeKPIs(list) {
  const n = list.length;
  const empty = {
    total: 0,
    avgSatisfaction: null,
    positiveRate: null,
    withSuggestions: 0,
    totalTrend: null,
    satisfactionTrend: null,
    positiveTrend: null,
    suggestionsTrend: null,
  };
  if (n === 0) return empty;

  const now = new Date();
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);
  const fourDaysAgo = new Date(now);
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
  fourDaysAgo.setHours(0, 0, 0, 0);

  const listLast2Days = list.filter((r) => new Date(r.created_at) >= twoDaysAgo);
  const listPrev2Days = list.filter((r) => {
    const d = new Date(r.created_at);
    return d >= fourDaysAgo && d < twoDaysAgo;
  });

  const scores = list
    .map((r) => SATISFACTION_SCORE[r.overall_satisfaction])
    .filter((s) => s != null);
  const avgSatisfaction = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const positive = list.filter(
    (r) => r.overall_satisfaction === 'Very Satisfied' || r.overall_satisfaction === 'Satisfied'
  ).length;
  const withSuggestions = list.filter((r) => r.comments && String(r.comments).trim().length > 0).length;

  const nLast = listLast2Days.length;
  const nPrev = listPrev2Days.length;
  const scoresLast = listLast2Days.map((r) => SATISFACTION_SCORE[r.overall_satisfaction]).filter((s) => s != null);
  const scoresPrev = listPrev2Days.map((r) => SATISFACTION_SCORE[r.overall_satisfaction]).filter((s) => s != null);
  const avgLast = scoresLast.length ? scoresLast.reduce((a, b) => a + b, 0) / scoresLast.length : null;
  const avgPrev = scoresPrev.length ? scoresPrev.reduce((a, b) => a + b, 0) / scoresPrev.length : null;
  const posLast = listLast2Days.filter(
    (r) => r.overall_satisfaction === 'Very Satisfied' || r.overall_satisfaction === 'Satisfied'
  ).length;
  const posPrev = listPrev2Days.filter(
    (r) => r.overall_satisfaction === 'Very Satisfied' || r.overall_satisfaction === 'Satisfied'
  ).length;
  const rateLast = nLast ? posLast / nLast : null;
  const ratePrev = nPrev ? posPrev / nPrev : null;
  const sugLast = listLast2Days.filter((r) => r.comments && String(r.comments).trim().length > 0).length;
  const sugPrev = listPrev2Days.filter((r) => r.comments && String(r.comments).trim().length > 0).length;

  const totalTrend = pctChange(nLast, nPrev);
  const satisfactionTrend =
    avgLast != null && avgPrev != null ? pctChange((avgLast / 5) * 100, (avgPrev / 5) * 100) : null;
  const positiveTrend = rateLast != null && ratePrev != null ? pctChange(rateLast * 100, ratePrev * 100) : null;
  const suggestionsTrend = pctChange(sugLast, sugPrev);

  return {
    total: n,
    avgSatisfaction,
    positiveRate: n ? positive / n : null,
    withSuggestions,
    totalTrend,
    satisfactionTrend,
    positiveTrend,
    suggestionsTrend,
  };
}

/**
 * Groups submissions by date or month for time-series charts.
 * 
 * @param {Array<Object>} list - The records to group.
 * @param {string} period - The time period context (e.g., 'This year' for monthly grouping).
 * @returns {Array<{label: string, count: number}>} An array of data points for charting.
 */
export function groupByTime(list, period) {
  const groups = {};
  list.forEach((r) => {
    const d = new Date(r.created_at);
    let key;
    if (period === 'This year') {
      key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    groups[key] = (groups[key] || 0) + 1;
  });
  return Object.entries(groups)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      const d = (x) => new Date(x.label);
      return d(a) - d(b);
    })
    .slice(-12);
}

/** 
 * Calculates average satisfaction (1–5) per time interval for trend analysis.
 * 
 * @param {Array<Object>} list - The records to analyze.
 * @param {string} period - The time period context.
 * @returns {Array<{label: string, value: number}>} Trend data points for charting.
 */
export function satisfactionOverTime(list, period) {
  const groups = {};
  list.forEach((r) => {
    const score = SATISFACTION_SCORE[r.overall_satisfaction];
    if (score == null) return;
    const d = new Date(r.created_at);
    let key;
    if (period === 'This year') {
      key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (!groups[key]) groups[key] = { sum: 0, n: 0 };
    groups[key].sum += score;
    groups[key].n += 1;
  });
  return Object.entries(groups)
    .map(([label, { sum, n }]) => ({ label, value: sum / n }))
    .sort((a, b) => {
      const d = (x) => new Date(x.label);
      return d(a) - d(b);
    })
    .slice(-12);
}

/**
 * Counts the occurrences of each overall satisfaction category.
 * 
 * @param {Array<Object>} list - The records to analyze.
 * @returns {Object} A mapping of satisfaction labels to their counts.
 */
export function satisfactionDistribution(list) {
  const dist = {};
  [
    'Very Satisfied',
    'Satisfied',
    'Neutral',
    'Dissatisfied',
    'Very Dissatisfied',
  ].forEach((k) => (dist[k] = 0));
  list.forEach((r) => {
    if (r.overall_satisfaction && dist[r.overall_satisfaction] !== undefined) {
      dist[r.overall_satisfaction]++;
    }
  });
  return dist;
}

/**
 * Averages scores for a specific set of numeric rating keys.
 * 
 * @param {Array<Object>} list - The records to analyze.
 * @param {Array<string>} keys - The object keys to average.
 * @returns {Object} A mapping of keys to their respective average scores.
 */
export function criteriaAverages(list, keys) {
  const sums = {};
  const counts = {};
  keys.forEach((k) => {
    sums[k] = 0;
    counts[k] = 0;
  });
  list.forEach((r) => {
    keys.forEach((k) => {
      const v = RATING_SCORE[r[k]];
      if (v != null) {
        sums[k] += v;
        counts[k]++;
      }
    });
  });
  const out = {};
  keys.forEach((k) => {
    out[k] = counts[k] ? sums[k] / counts[k] : 0;
  });
  return out;
}

/** Calculates averages specifically for Part II (Facility & Service) questions. */
export function part2Averages(list) {
  return criteriaAverages(list, PART2_KEYS);
}

/** Calculates averages specifically for Part III (Staff Evaluation) questions. */
export function part3Averages(list) {
  return criteriaAverages(list, PART3_KEYS);
}

/**
 * Formats a list of records by adding a human-readable date string.
 * 
 * @param {Array<Object>} list - The records to format.
 * @returns {Array<Object>} The formatted list.
 */
export function formatLatest(list) {
  return (list || []).map((r) => ({
    ...r,
    date: new Date(r.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }));
}

/**
 * Breaks down respondents by biological sex.
 * 
 * @param {Array<Object>} list - The records to analyze.
 * @returns {Array<{name: string, value: number}>} Data for sex distribution charts.
 */
export function basicInfoBySex(list) {
  const out = { Male: 0, Female: 0, Other: 0 };
  (list || []).forEach((r) => {
    if (r.sex === 'Male' || r.sex === 'Female') {
      out[r.sex]++;
    } else {
      out.Other++;
    }
  });
  return Object.entries(out).map(([name, value]) => ({ name, value }));
}

/**
 * Breaks down respondents by their associated office or unit.
 * 
 * @param {Array<Object>} list - The records to analyze.
 * @returns {Array<{name: string, value: number}>} Data for office distribution charts.
 */
export function basicInfoByOffice(list) {
  const counts = {};
  (list || []).forEach((r) => {
    const o = r.office_unit_other && String(r.office_unit_other).trim()
      ? `${r.office_unit_address || 'Others'} (${r.office_unit_other})`
      : (r.office_unit_address || '—');
    counts[o] = (counts[o] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Aggregates the sex distribution of children mentioned in the feedback.
 * 
 * @param {Array<Object>} list - The records to analyze.
 * @returns {Array<{name: string, value: number}>} Data for child sex distribution.
 */
export function basicInfoByChildSex(list) {
  const out = { Male: 0, Female: 0 };
  (list || []).forEach((r) => {
    const children = Array.isArray(r.children) ? r.children : [];
    children.forEach((c) => {
      if (c.sex && out[c.sex] !== undefined) out[c.sex]++;
    });
  });
  return Object.entries(out).map(([name, value]) => ({ name, value }));
}

/**
 * Aggregates child age distribution from feedback records.
 * 
 * @param {Array<Object>} list - The records to analyze.
 * @returns {Array<{name: string, value: number}>} Data for child age charts.
 */
export function basicInfoByChildAge(list) {
  const counts = {};
  (list || []).forEach((r) => {
    const children = Array.isArray(r.children) ? r.children : [];
    children.forEach((c) => {
      const a = c.age != null && String(c.age).trim() !== '' ? String(c.age) : '—';
      counts[a] = (counts[a] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const na = parseInt(a.name, 10);
      const nb = parseInt(b.name, 10);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      if (Number.isNaN(na)) return 1;
      return -1;
    });
}

/**
 * Formats respondent data for display in tables, including formatted dates.
 * 
 * @param {Array<Object>} list - The records to format.
 * @returns {Array<Object>} The formatted list.
 */
export function formatRespondents(list) {
  return (list || []).map((r) => ({
    ...r,
    dateOfUseFormatted: r.created_at
      ? new Date(r.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—',
    submittedFormatted: r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—',
  }));
}

/** 
 * Computes average satisfaction score (1–5) aggregated across high-level system parts.
 * Used for the "Summary by Part" dashboard widget.
 * 
 * @param {Array<Object>} list - The records to analyze.
 * @returns {Array<{name: string, avg: number}>} Aggregated averages per system section.
 */
export function avgSatisfactionByPart(list) {
  const part2Avgs = part2Averages(list);
  const part3Avgs = part3Averages(list);
  const part2Vals = Object.values(part2Avgs).filter((v) => v > 0);
  const part3Vals = Object.values(part3Avgs).filter((v) => v > 0);
  const part4Scores = list
    .map((r) => SATISFACTION_SCORE[r.overall_satisfaction])
    .filter((s) => s != null);
  return [
    {
      name: 'Part II – Facility & Service',
      avg: part2Vals.length ? part2Vals.reduce((a, b) => a + b, 0) / part2Vals.length : 0,
    },
    {
      name: 'Part III – Staff Evaluation',
      avg: part3Vals.length ? part3Vals.reduce((a, b) => a + b, 0) / part3Vals.length : 0,
    },
    {
      name: 'Part IV – Overall Satisfaction',
      avg: part4Scores.length ? part4Scores.reduce((a, b) => a + b, 0) / part4Scores.length : 0,
    },
  ];
}

/**
 * Deletes all registration and visit records for a visitor based on email or name + contact number.
 *
 * @async
 * @param {string|number} id - The registration row ID.
 * @throws {Error} If Supabase is not configured or a database error occurs.
 */
export async function deleteRegistration(id) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  // 1. Fetch target registration to resolve visitor identity
  const { data: target, error: fetchErr } = await supabase
    .from('registrations')
    .select('email, parent_name, contact_number')
    .eq('id', id)
    .single();

  if (fetchErr || !target) {
    // Fallback: Delete single row if not found
    const { error: delErr } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id);
    if (delErr) throw delErr;
    return;
  }

  // 2. Delete all registration records matching this visitor
  let query = supabase.from('registrations').delete();
  if (target.email && target.email.trim()) {
    const { error: delErr } = await query.eq('email', target.email.trim());
    if (delErr) throw delErr;
  } else {
    const { error: delErr } = await query
      .eq('parent_name', target.parent_name)
      .eq('contact_number', target.contact_number);
    if (delErr) throw delErr;
  }
}

