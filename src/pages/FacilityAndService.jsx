import { useState, useEffect, useRef } from 'react';
import { Star, MessageSquare, Heart, Award, Sparkles, Activity, FileText, ArrowRight, Clock } from 'lucide-react';
import { fetchFeedback, fetchFormStructure, distributionForQuestions, fetchAllRegistrations } from '../lib/data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import dostLogo from '../assets/dost_logo.png';
import gadLogo from '../assets/logo.png';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


const PART2_LABELS = {
  cleanliness_safety: 'Cleanliness & safety',
  child_comfort: "Child's comfort",
  toys_materials: 'Toys & materials',
  staff_attentiveness: 'Staff attentiveness',
  accessibility_convenience: 'Accessibility',
  maintenance_upkeep: 'Maintenance',
  staff_responsiveness: 'Staff responsiveness',
};

const PART3_LABELS = {
  staff_eval_attentiveness: 'Attentiveness',
  staff_eval_friendliness: 'Friendliness',
  staff_eval_responsiveness: 'Responsiveness',
};

const SEGMENT_COLORS = {
  1: '#ef4444', // Red
  2: '#f97316', // Orange
  3: '#eab308', // Yellow
  4: '#a855f7', // Purple
  5: '#7030a0', // GAD purple
};

function TextDetailsModal({ questionLabel, responses, onClose }) {
  if (!questionLabel || !responses) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[80vh] flex flex-col border border-slate-100 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-100 bg-gradient-to-r from-violet-50/50 to-violet-100/20 shrink-0">
          <div>
            <h3 className="font-black text-slate-800 text-sm tracking-tight">{questionLabel}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Verbatim feedback comments</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {responses.length === 0 ? (
            <p className="text-slate-400 text-xs font-semibold italic text-center py-12">No text responses recorded.</p>
          ) : (
            responses.map((r, i) => (
              <div key={i} className="text-xs text-slate-700 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
                <p className="whitespace-pre-wrap break-words leading-relaxed font-semibold">{typeof r === 'string' ? r : (r.text ?? r.value ?? '')}</p>
                {r.date && (
                  <p className="mt-2.5 text-[9px] text-slate-400 font-black uppercase tracking-wider">
                    Submitted on {new Date(r.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SegmentedBar({ distribution }) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const counts = distribution && typeof distribution === 'object'
    ? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, ...distribution }
    : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  let sum = 0;
  let totalVotes = 0;
  for (let i = 1; i <= 5; i++) {
    const val = counts[i] || 0;
    sum += val * i;
    totalVotes += val;
  }
  const avgVal = totalVotes > 0 ? sum / totalVotes : 0;

  const handleMouseMove = (event) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setTooltipPos({ x, y });
    }
  };

  return (
    <div 
      className="relative inline-block w-44" 
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-stretch gap-1 h-6 w-full bg-slate-50/50 p-1 border border-slate-100 rounded-xl">
        {[1, 2, 3, 4, 5].map((v) => {
          let pct = 0;
          if (avgVal >= v) {
            pct = 1;
          } else if (avgVal < v - 1) {
            pct = 0;
          } else {
            pct = avgVal - (v - 1);
          }

          return (
            <div
              key={v}
              className="flex-1 bg-slate-100 rounded-[5px] h-full relative overflow-hidden cursor-pointer"
            >
              {/* Filled portion */}
              <div
                className="absolute left-0 top-0 bottom-0 rounded-[5px] transition-all duration-500"
                style={{
                  width: `${pct * 100}%`,
                  background: SEGMENT_COLORS[v],
                }}
              />
              {/* Subtle number indicator */}
              <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-extrabold select-none pointer-events-none transition-colors ${pct > 0.4 ? 'text-white' : 'text-slate-500'}`}>
                {v}
              </span>
            </div>
          );
        })}
      </div>
      {hovered && (
        <div
          className="absolute bg-slate-900 text-white text-[11px] font-bold rounded-xl px-3 py-2 shadow-xl pointer-events-none z-10 whitespace-nowrap border border-slate-800 animate-scale-up"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 48}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="text-white">Average Score: {avgVal.toFixed(2)} / 5.0</div>
          <div className="text-violet-200 mt-0.5">
            Based on {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacilityAndService({ period, dateRange, onViewChange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [formParts, setFormParts] = useState([]);
  const [textDetailsOpen, setTextDetailsOpen] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [expectedCount, setExpectedCount] = useState(0);

  const filterByPeriod = (records, p, range) => {
    if (range && range.from && range.to) {
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(range.to);
      to.setHours(23, 59, 59, 999);
      return records.filter((r) => {
        const d = new Date(r.created_at);
        return d >= from && d <= to;
      });
    }
    if (p === 'All') return records;
    
    const now = new Date();
    let from = new Date(now);
    if (p === 'This week') {
      from.setDate(now.getDate() - 7);
    } else if (p === 'This month') {
      from.setMonth(now.getMonth() - 1);
    } else if (p === 'Last 3 months') {
      from.setMonth(now.getMonth() - 3);
    } else if (p === 'This year') {
      from.setFullYear(now.getFullYear() - 1);
    } else {
      from.setMonth(now.getMonth() - 1);
    }
    return records.filter((r) => new Date(r.created_at) >= from);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchFeedback(period ?? 'This month', dateRange),
      fetchFormStructure(),
      fetchAllRegistrations(),
    ])
      .then(([data, parts, regs]) => {
        if (!cancelled) {
          setList(data);
          setFormParts(parts || []);
          const filteredRegs = filterByPeriod(regs || [], period ?? 'This month', dateRange);
          const evaluatedIds = new Set(data.map(e => e.registration_id));
          const pending = filteredRegs.filter(r => !evaluatedIds.has(r.id)).length;
          setPendingCount(pending);
          setExpectedCount(filteredRegs.length);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [period, dateRange]);

  useEffect(() => {
    const id = setInterval(() => {
      Promise.all([
        fetchFeedback(period ?? 'This month', dateRange),
        fetchFormStructure(),
        fetchAllRegistrations(),
      ])
        .then(([data, parts, regs]) => {
          setList(data);
          setFormParts(parts || []);
          const filteredRegs = filterByPeriod(regs || [], period ?? 'This month', dateRange);
          const evaluatedIds = new Set(data.map(e => e.registration_id));
          const pending = filteredRegs.filter(r => !evaluatedIds.has(r.id)).length;
          setPendingCount(pending);
          setExpectedCount(filteredRegs.length);
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, [period, dateRange]);

  const fallbackPart2Questions = (PART2_LABELS && Object.keys(PART2_LABELS).length)
    ? Object.entries(PART2_LABELS).map(([key, label]) => ({ key, label, answer_type: 'emoji' }))
    : [];
  const fallbackPart3Questions = (PART3_LABELS && Object.keys(PART3_LABELS).length)
    ? Object.entries(PART3_LABELS).map(([key, label]) => ({ key, label, answer_type: 'emoji' }))
    : [];

  const partsWithTableRows =
    formParts.length > 0
      ? formParts
          .map((part) => {
            const dist = distributionForQuestions(list, part.questions);
            const rows = part.questions.map((q) => {
              if (q.answer_type === 'text') {
                const withValue = list.filter((r) => (r[q.key] ?? '').toString().trim() !== '');
                const responses = withValue.map((r) => ({
                  text: (r[q.key] ?? '').toString().trim(),
                  date: r.created_at,
                }));
                return {
                  type: 'text',
                  label: q.label,
                  key: q.key,
                  respondentCount: responses.length,
                  responses,
                };
              }
              return {
                type: 'rating',
                label: q.label,
                key: q.key,
                distribution: dist[q.key] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
              };
            });
            return { part, rows };
          })
          .filter((x) => x.rows.length > 0)
      : [
          ...(fallbackPart2Questions.length
            ? (() => {
                const dist = distributionForQuestions(list, fallbackPart2Questions);
                return [{
                  part: { key: 'part2', label: 'Facility and Service Evaluation' },
                  rows: fallbackPart2Questions.map((q) => ({
                    type: 'rating',
                    label: q.label,
                    key: q.key,
                    distribution: dist[q.key] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                  })),
                }];
              })()
            : []),
          ...(fallbackPart3Questions.length
            ? (() => {
                const dist = distributionForQuestions(list, fallbackPart3Questions);
                return [{
                  part: { key: 'part3', label: 'Staff Evaluation' },
                  rows: fallbackPart3Questions.map((q) => ({
                    type: 'rating',
                    label: q.label,
                    key: q.key,
                    distribution: dist[q.key] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                  })),
                }];
              })()
            : []),
        ].filter((x) => x.rows.length > 0);

  const getAverageRating = (dist) => {
    let sum = 0;
    let count = 0;
    for (let i = 1; i <= 5; i++) {
      const val = dist[i] || 0;
      sum += val * i;
      count += val;
    }
    return count > 0 ? (sum / count).toFixed(1) : '0.0';
  };

  const getExcellentPercentage = (dist) => {
    const total = [1, 2, 3, 4, 5].reduce((sum, v) => sum + (dist[v] || 0), 0);
    if (total === 0) return 0;
    const excellent = dist[5] || 0;
    return Math.round((excellent / total) * 100);
  };

  const getRatingStatusDetails = (avg) => {
    const val = Number(avg);
    if (val >= 4.5) return { label: 'Outstanding', color: 'text-violet-600 bg-violet-50 border-violet-100' };
    if (val >= 3.5) return { label: 'Very Satisfactory', color: 'text-purple-600 bg-purple-50 border-purple-100' };
    if (val >= 2.5) return { label: 'Satisfactory', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    if (val >= 1.5) return { label: 'Fair', color: 'text-orange-600 bg-orange-50 border-orange-100' };
    if (val > 0) return { label: 'Needs Improvement', color: 'text-red-600 bg-red-50 border-red-100' };
    return { label: 'No Ratings', color: 'text-slate-400 bg-slate-50 border-slate-100' };
  };

  // Overall statistics derivation
  const overallStats = (() => {
    let totalRatingsSum = 0;
    let totalRatingsCount = 0;
    let textFeedbackCount = 0;
    
    partsWithTableRows.forEach(({ rows }) => {
      rows.forEach((row) => {
        if (row.type === 'rating') {
          for (let i = 1; i <= 5; i++) {
            const val = row.distribution[i] || 0;
            totalRatingsSum += val * i;
            totalRatingsCount += val;
          }
        } else if (row.type === 'text') {
          textFeedbackCount += row.respondentCount;
        }
      });
    });

    const avg = totalRatingsCount > 0 ? (totalRatingsSum / totalRatingsCount).toFixed(2) : '0.00';
    return {
      totalSubmissions: list.length,
      averageScore: avg,
      textFeedbackCount
    };
  })();

  const facilityChartData = [];
  const staffChartData = [];

  partsWithTableRows.forEach(({ part, rows }) => {
    rows.forEach((row) => {
      if (row.type === 'rating') {
        const avg = Number(getAverageRating(row.distribution));
        const label = row.label || '';
        const short = label.length > 12 ? label.slice(0, 12) + '...' : label;
        const datapoint = {
          shortName: short,
          fullName: label,
          avg: avg,
        };
        if (part.key === 'part2' || part.label.toLowerCase().includes('facility')) {
          facilityChartData.push(datapoint);
        } else {
          staffChartData.push(datapoint);
        }
      }
    });
  });

  const getHighestAndLowest = (data) => {
    if (!data || data.length === 0) return { highest: null, lowest: null };
    const sorted = [...data].sort((a, b) => b.avg - a.avg);
    return {
      highest: sorted[0] || null,
      lowest: sorted.length > 1 ? sorted[sorted.length - 1] : null,
    };
  };

  const facilityMinMax = getHighestAndLowest(facilityChartData);
  const staffMinMax = getHighestAndLowest(staffChartData);

  const handlePrintReport = () => {
    const filterLabel = dateRange?.from && dateRange?.to
      ? `${new Date(dateRange.from).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })} – ${new Date(dateRange.to).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}`
      : period || 'This month';

    const generatedAt = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const overallDetails = getRatingStatusDetails(overallStats.averageScore);

    const tablesHtml = partsWithTableRows.map(({ part, rows }) => {
      const tableRows = rows.map((row, idx) => {
        if (row.type === 'rating') {
          const avg = getAverageRating(row.distribution);
          const ratingDetails = getRatingStatusDetails(avg);
          const totalRatingCount = [1, 2, 3, 4, 5].reduce((s, v) => s + (row.distribution[v] || 0), 0);
          
          const breakdown = [5, 4, 3, 2, 1].map(num => {
            const count = row.distribution[num] || 0;
            const pct = totalRatingCount > 0 ? Math.round((count / totalRatingCount) * 100) : 0;
            return `${num}★: ${count} (${pct}%)`;
          }).join(' | ');

          return `
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-weight: 500;">${escapeHtml(row.label)}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #1e293b;">${avg} / 5.0</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 600;">${ratingDetails.label}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-size: 11px; color: #475569;">${breakdown}</td>
            </tr>
          `;
        } else {
          const listItems = row.responses.map(resp => `
            <div style="padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 11px;">
              <strong>[${new Date(resp.date).toLocaleDateString()}]</strong> ${escapeHtml(resp.text)}
            </div>
          `).join('');

          return `
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-weight: 500;">${escapeHtml(row.label)}</td>
              <td colspan="3" style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; background: #f8fafc;">
                ${listItems || '<em style="color:#94a3b8;">No responses received</em>'}
              </td>
            </tr>
          `;
        }
      }).join('');

      return `
        <div style="margin-top: 24px; page-break-inside: avoid;">
          <h3 style="font-size: 13px; font-weight: 700; color: #000; margin-bottom: 8px; border-bottom: 2px solid #7030a0; padding-bottom: 4px; text-transform: uppercase;">
            ${escapeHtml(part.label)}
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-family: sans-serif;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; border: 1px solid #cbd5e1; width: 40px; text-align: center;">#</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Evaluation Question / Metric</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; width: 90px; text-align: center;">Average</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; width: 140px; text-align: center;">Rating</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Distribution / Response</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Customer Satisfaction Evaluation Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #000;
            margin: 0;
            padding: 20px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .header-table td {
            border: none;
            padding: 0;
            vertical-align: middle;
          }
          .header-text {
            text-align: center;
            font-family: 'Times New Roman', Times, serif;
            font-size: 12px;
            line-height: 1.4;
          }
          .header-line {
            border: none;
            border-top: 2px solid #000;
            border-bottom: 0.5px solid #000;
            height: 3px;
            margin-top: 8px;
            margin-bottom: 20px;
          }
          .title-section {
            text-align: center;
            margin-bottom: 20px;
          }
          .title-section h1 {
            font-size: 15px;
            font-weight: bold;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .title-section p {
            margin: 3px 0;
            font-size: 10px;
            color: #475569;
          }
          .kpi-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
          }
          .kpi-table th {
            background-color: #f8fafc;
            font-weight: bold;
            border: 1px solid #cbd5e1;
            padding: 8px;
            text-align: center;
          }
          .kpi-table td {
            border: 1px solid #cbd5e1;
            padding: 8px;
            text-align: center;
            font-weight: 700;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 0;
              margin-bottom: 40px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 15%; text-align: left;">
              <img src="${dostLogo}" style="height: 60px; width: auto;" alt="DOST Logo" />
            </td>
            <td style="width: 70%;">
              <div class="header-text">
                Republic of the Philippines<br/>
                <strong>DEPARTMENT OF SCIENCE AND TECHNOLOGY</strong><br/>
                Ilocos Region<br/>
                City of San Fernando, La Union
              </div>
            </td>
            <td style="width: 15%; text-align: right;">
              <img src="${gadLogo}" style="height: 60px; width: auto;" alt="GAD Logo" />
            </td>
          </tr>
        </table>
        <div class="header-line"></div>

        <div class="title-section">
          <h1>Customer Satisfaction Evaluation Report</h1>
          <p style="font-weight: bold; font-size: 11px; color: #000; margin-top: 4px;">
            ${escapeHtml(filterLabel)}
          </p>
        </div>

        <table class="kpi-table">
          <thead>
            <tr>
              <th>Expected Evaluations</th>
              <th>Evaluations Received</th>
              <th>Pending Evaluations</th>
              <th>Overall Satisfaction Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${expectedCount}</td>
              <td>${overallStats.totalSubmissions}</td>
              <td>${pendingCount}</td>
              <td style="color: #7030a0;">
                ${overallStats.averageScore} / 5.0 (${overallDetails.label})
              </td>
            </tr>
          </tbody>
        </table>

        ${tablesHtml}

        <div style="position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 9px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 5px; font-family: Arial, sans-serif; background-color: #fff;">
          <span>Generated: ${escapeHtml(generatedAt)}</span>
          <span>Generated by: <a href="https://ihubgad.dost1.ph/" style="color: #475569; text-decoration: none;">https://ihubgad.dost1.ph/</a></span>
          <span>Page 1 of 1</span>
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'position:absolute;left:-9999px;width:800px;height:800px;border:none');
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    };

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        console.error(e);
      }
      cleanup();
    }, 500);
  };

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-red-700">
        <p className="font-semibold">Could not load evaluation data</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Action Row */}
      {!loading && (
        <div className="flex items-center justify-between gap-4 flex-wrap bg-[#7030a0]/5 border border-[#7030a0]/10 p-4 rounded-3xl">
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 tracking-tight">Need a printable report?</h4>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Export and print compiled satisfaction metrics as an official report sheet.</p>
          </div>
          <button
            type="button"
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white transition-all duration-200 hover:shadow-md hover:shadow-violet-200 bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2783] active:scale-95 rounded-xl shrink-0"
          >
            <FileText size={14} />
            Print report
          </button>
        </div>
      )}

      {/* Overall KPI Dashboard Ribbon */}
      {!loading && list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-violet-50/50 to-violet-100/30 border border-violet-100/70 p-4.5 rounded-3xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 rounded-2xl bg-[#7030a0]/10 text-[#7030a0] shrink-0">
              <Heart size={18} className="fill-[#7030a0]/20" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block truncate">Overall Satisfaction</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-black text-slate-800 leading-tight truncate">{overallStats.averageScore} <span className="text-[10px] text-slate-400 font-bold">/ 5.0</span></span>
                {(() => {
                  const details = getRatingStatusDetails(overallStats.averageScore);
                  return (
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${details.color}`}>
                      {details.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-50/50 to-violet-100/30 border border-violet-100/70 p-4.5 rounded-3xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 rounded-2xl bg-[#7030a0]/10 text-[#7030a0] shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block truncate">Expected Evaluations</span>
              <span className="text-xl font-black text-slate-800 leading-tight block truncate">{expectedCount} <span className="text-[10px] text-slate-400 font-bold">visits</span></span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-50/50 to-violet-100/30 border border-violet-100/70 p-4.5 rounded-3xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 rounded-2xl bg-[#7030a0]/10 text-[#7030a0] shrink-0">
              <Activity size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block truncate">Evaluations Received</span>
              <span className="text-xl font-black text-slate-800 leading-tight block truncate">{overallStats.totalSubmissions} <span className="text-[10px] text-slate-400 font-bold">submissions</span></span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-50/50 to-violet-100/30 border border-violet-100/70 p-4.5 rounded-3xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 rounded-2xl bg-[#7030a0]/10 text-[#7030a0] shrink-0">
              <Clock size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block truncate">Pending Evaluations</span>
              <span className="text-xl font-black text-slate-800 leading-tight block truncate">{pendingCount} <span className="text-[10px] text-slate-400 font-bold">unanswered</span></span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-50/50 to-violet-100/30 border border-violet-100/70 p-4.5 rounded-3xl flex items-center gap-3.5 shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="p-3 rounded-2xl bg-[#7030a0]/10 text-[#7030a0] shrink-0">
              <MessageSquare size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block truncate">Comments &amp; Suggestions</span>
              <span className="text-xl font-black text-slate-800 leading-tight block truncate">{overallStats.textFeedbackCount} <span className="text-[10px] text-slate-400 font-bold">remarks</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {!loading && (facilityChartData.length > 0 || staffChartData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Facility Evaluation Chart */}
          {facilityChartData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-black text-slate-800 text-sm tracking-tight">Facility &amp; Service Performance</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mt-0.5">Average scores comparison</p>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={facilityChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="shortName" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" allowDecimals tickFormatter={(v) => v.toFixed(1)} />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl border border-slate-800 max-w-xs animate-scale-up text-[11px]">
                            <p className="text-slate-200 font-bold mb-1">{item.fullName}</p>
                            <p className="font-black">Avg Score: <span className="text-[#a855f7]">{item.avg.toFixed(2)}</span></p>
                          </div>
                        );
                      }}
                    />
                    <Line type="monotone" dataKey="avg" stroke="#7030a0" strokeWidth={3} dot={{ fill: '#7030a0', stroke: '#fff', strokeWidth: 1.5, r: 4 }} activeDot={{ fill: '#a855f7', stroke: '#fff', strokeWidth: 2, r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {facilityMinMax.highest && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 font-bold truncate max-w-[70%]" title={facilityMinMax.highest.fullName}>Top: {facilityMinMax.highest.fullName}</span>
                    <span className="font-black text-emerald-600">{facilityMinMax.highest.avg.toFixed(1)}</span>
                  </div>
                )}
                {facilityMinMax.lowest && (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-rose-600 font-bold truncate max-w-[70%]" title={facilityMinMax.lowest.fullName}>Low: {facilityMinMax.lowest.fullName}</span>
                    <span className="font-black text-rose-600">{facilityMinMax.lowest.avg.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Staff Evaluation Chart */}
          {staffChartData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-black text-slate-800 text-sm tracking-tight">Staff Performance</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mt-0.5">Average scores comparison</p>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={staffChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="shortName" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" allowDecimals tickFormatter={(v) => v.toFixed(1)} />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl border border-slate-800 max-w-xs animate-scale-up text-[11px]">
                            <p className="text-slate-200 font-bold mb-1">{item.fullName}</p>
                            <p className="font-black">Avg Score: <span className="text-[#a855f7]">{item.avg.toFixed(2)}</span></p>
                          </div>
                        );
                      }}
                    />
                    <Line type="monotone" dataKey="avg" stroke="#7030a0" strokeWidth={3} dot={{ fill: '#7030a0', stroke: '#fff', strokeWidth: 1.5, r: 4 }} activeDot={{ fill: '#a855f7', stroke: '#fff', strokeWidth: 2, r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {staffMinMax.highest && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 font-bold truncate max-w-[70%]" title={staffMinMax.highest.fullName}>Top: {staffMinMax.highest.fullName}</span>
                    <span className="font-black text-emerald-600">{staffMinMax.highest.avg.toFixed(1)}</span>
                  </div>
                )}
                {staffMinMax.lowest && (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-rose-600 font-bold truncate max-w-[70%]" title={staffMinMax.lowest.fullName}>Low: {staffMinMax.lowest.fullName}</span>
                    <span className="font-black text-rose-600">{staffMinMax.lowest.avg.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-6 w-6 text-[#7030a0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading evaluations…</span>
        </div>
      ) : partsWithTableRows.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <FileText size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold text-sm">No Evaluation Data Found</p>
          <p className="text-slate-400 text-xs mt-1">Configure evaluation questions inside Form Management to observe analysis breakdown.</p>
        </div>
      ) : (
        partsWithTableRows.map(({ part, rows }) => (
          <div key={part.key} className="space-y-4">
            <div className="px-1">
              <h3 className="font-black text-slate-800 text-base tracking-tight">{part.label}</h3>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Rating scores and text feedback breakdown</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rows.map((row) => {
                if (row.type === 'rating') {
                  const avg = getAverageRating(row.distribution);
                  const statusDetails = getRatingStatusDetails(avg);
                  
                  return (
                    <div key={row.key} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between gap-5 relative overflow-hidden group">
                      {/* Metric Tag */}
                      <div className="absolute top-0 right-0 h-1.5 w-full bg-[#7030a0]/10 group-hover:bg-[#7030a0]/30 transition-colors" />
                      
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs font-bold text-slate-700 leading-relaxed max-w-[75%]">{row.label}</span>
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-violet-50 text-[#7030a0] text-sm font-black tracking-tight border border-violet-100 shadow-sm">
                            <Star size={13} className="fill-[#7030a0]/10" />
                            {avg}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Rating Distribution</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusDetails.color}`}>
                            {statusDetails.label}
                          </span>
                        </div>
                        <SegmentedBar distribution={row.distribution} />
                      </div>
                    </div>
                  );
                } else {
                  // Text response cards
                  const previewResponses = (row.responses || []).slice(0, 2);
                  return (
                    <div key={row.key} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between gap-4 relative overflow-hidden group md:col-span-2">
                      <div className="absolute top-0 right-0 h-1.5 w-full bg-[#a855f7]/10 group-hover:bg-[#a855f7]/30 transition-colors" />
                      
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-slate-700 leading-relaxed block">{row.label}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                            {row.respondentCount} {row.respondentCount === 1 ? 'comment' : 'comments'} registered
                          </span>
                        </div>
                        {row.respondentCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setTextDetailsOpen({ label: row.label, responses: row.responses || [] })}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-[#7030a0] bg-violet-50 hover:bg-violet-100/80 active:scale-95 transition-all duration-200 rounded-xl border border-violet-100"
                          >
                            <span>View all</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>

                      {/* Scrolling / Preview list */}
                      <div className="space-y-2">
                        {previewResponses.length === 0 ? (
                          <p className="text-slate-400 text-xs italic py-2">No comments left yet.</p>
                        ) : (
                          previewResponses.map((res, ri) => (
                            <div key={ri} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 text-[11px] text-slate-600 font-semibold leading-relaxed">
                              <p className="line-clamp-2">{res.text}</p>
                              {res.date && (
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1.5">
                                  {new Date(res.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ))
      )}

      {textDetailsOpen && (
        <TextDetailsModal
          questionLabel={textDetailsOpen.label}
          responses={textDetailsOpen.responses}
          onClose={() => setTextDetailsOpen(null)}
        />
      )}
    </div>
  );
}
