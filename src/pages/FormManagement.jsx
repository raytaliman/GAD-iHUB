import { useState, useEffect, useCallback } from 'react';
import { Pencil, Plus, Trash2, Save, X, LayoutList } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { addLog } from '../lib/systemLogs';

// Fallback parts and questions when form_parts / questions tables are not in the DB
const DEFAULT_PART2 = [
  { key: 'cleanliness_safety', label: 'Cleanliness and safety of the station', sort_order: 0 },
  { key: 'child_comfort', label: "Child's comfort and enjoyment in the facility", sort_order: 1 },
  { key: 'toys_materials', label: 'Availability and quality of toys/materials', sort_order: 2 },
  { key: 'staff_attentiveness', label: 'Attentiveness and support of staff', sort_order: 3 },
  { key: 'accessibility_convenience', label: 'Accessibility and convenience of location', sort_order: 4 },
  { key: 'maintenance_upkeep', label: 'Maintenance and upkeep of the facility', sort_order: 5 },
  { key: 'staff_responsiveness', label: "Responsiveness of staff to parents' concerns", sort_order: 6 },
];
const DEFAULT_PART3 = [
  { key: 'staff_eval_attentiveness', label: 'Attentiveness and support of staff', sort_order: 0 },
  { key: 'staff_eval_friendliness', label: 'Friendliness and courtesy', sort_order: 1 },
  { key: 'staff_eval_responsiveness', label: "Responsiveness to parents' concerns", sort_order: 2 },
];
const DEFAULT_PART4 = [
  { key: 'overall_satisfaction', label: 'How satisfied are you with your overall experience using the Child-Minding Station?', sort_order: 0, answer_type: 'satisfaction' },
];
const DEFAULT_PARTS = [
  { id: 'part2', key: 'part2', label: 'Part II – Facility and Service Evaluation', sort_order: 0, questions: DEFAULT_PART2 },
  { id: 'part3', key: 'part3', label: 'Part III – Staff Evaluation', sort_order: 1, questions: DEFAULT_PART3 },
  { id: 'part4', key: 'part4', label: 'Part IV – Overall Satisfaction', sort_order: 2, questions: DEFAULT_PART4 },
];

const RUN_RADIO_SQL_MESSAGE =
  'The radio button feature requires a database update.\n\n' +
  'Please run the SQL migration in "add_radio_options.sql" in your Supabase SQL Editor to enable this feature.';

const RUN_SQL_MESSAGE =
  'This action requires database setup. Please run the SQL migration setup in your Supabase SQL Editor.';

const ANSWER_TYPE_OPTIONS = [
  { value: 'emoji', label: 'Emoji scale', desc: 'Standard 1-to-5 smiley emoji rating selector.' },
  { value: 'satisfaction', label: 'Satisfaction scale', desc: '5-level text satisfaction scale (Very Satisfied to Very Dissatisfied).' },
  { value: 'text', label: 'Written feedback', desc: 'Free-form comment or suggestion input textbox.' },
  { value: 'radio', label: 'Multiple choice', desc: 'Single-choice custom options list (comma separated).' }
];

/**
 * Normalizes a raw question object into a consistent internal format.
 * 
 * @private
 * @param {Object} q - Raw question data.
 * @param {string} partKey - The key of the part this question belongs to.
 * @returns {Object} Normalized question object.
 */
function norm(q, partKey) {
  return {
    id: q.id ?? q.key,
    key: q.key,
    label: q.label,
    sort_order: q.sort_order ?? 0,
    part: partKey,
    answer_type: q.answer_type ?? 'emoji',
    options: q.options ?? [],
  };
}

/**
 * Custom hook that manages the fetching and local state of the form structure.
 * Handles fallbacks to default parts if the database schema is not fully initialized.
 * 
 * @private
 * @returns {Object} { parts, loading, error, reload, hasBackend }
 */
function useFormStructure() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parts, setParts] = useState([]);
  const [hasBackend, setHasBackend] = useState(false);

  /**
   * Loads form parts and questions from Supabase.
   */
  const load = useCallback(async (showSpinner = true) => {
    if (!supabase) {
      setParts(DEFAULT_PARTS.map((p) => ({ ...p, questions: p.questions.map((q) => norm({ ...q, part: p.key }, p.key)) })));
      setLoading(false);
      return;
    }
    if (showSpinner) setLoading(true);
    setError(null);

    const seedDefaultStructure = async () => {
      try {
        const partsToInsert = DEFAULT_PARTS.map(p => ({
          key: p.key,
          sort_order: p.sort_order,
          label: p.label
        }));
        const { error: partErr } = await supabase.from('form_parts').insert(partsToInsert);
        if (partErr) throw partErr;

        const questionsToInsert = DEFAULT_PARTS.flatMap(p => p.questions.map(q => ({
          part: p.key,
          sort_order: q.sort_order,
          key: q.key,
          label: q.label,
          answer_type: q.answer_type ?? q.answerType ?? 'emoji',
          options: q.options || null
        })));
        const { error: questErr } = await supabase.from('questions').insert(questionsToInsert);
        if (questErr) throw questErr;

        return true;
      } catch (err) {
        console.error('Failed to seed default form structure:', err);
        return false;
      }
    };

    let partsRes = await supabase.from('form_parts').select('id, key, sort_order, label').order('sort_order');
    let questionsRes = await supabase.from('questions').select('id, part, sort_order, key, label, answer_type, options').order('part').order('sort_order');
    if (questionsRes.error && questionsRes.error.code === '42703') {
      console.warn('options column missing, falling back to basic questions fetch');
      questionsRes = await supabase.from('questions').select('id, part, sort_order, key, label, answer_type').order('part').order('sort_order');
    }

    if (partsRes.error || questionsRes.error) {
      setError(partsRes.error?.message || questionsRes.error?.message);
      setParts(DEFAULT_PARTS.map((p) => ({ ...p, questions: p.questions.map((q) => norm({ ...q, part: p.key }, p.key)) })));
      setHasBackend(false);
    } else {
      let backendExists = (partsRes.data?.length ?? 0) > 0 || (questionsRes.data?.length ?? 0) > 0;
      if (!backendExists) {
        const seeded = await seedDefaultStructure();
        if (seeded) {
          partsRes = await supabase.from('form_parts').select('id, key, sort_order, label').order('sort_order');
          questionsRes = await supabase.from('questions').select('id, part, sort_order, key, label, answer_type, options').order('part').order('sort_order');
          if (questionsRes.error && questionsRes.error.code === '42703') {
            questionsRes = await supabase.from('questions').select('id, part, sort_order, key, label, answer_type').order('part').order('sort_order');
          }
          backendExists = !partsRes.error && !questionsRes.error && ((partsRes.data?.length ?? 0) > 0 || (questionsRes.data?.length ?? 0) > 0);
        }
      }

      setHasBackend(backendExists);
      if (!backendExists) {
        setParts(DEFAULT_PARTS.map((p) => ({ ...p, questions: p.questions.map((q) => norm({ ...q, part: p.key }, p.key)) })));
      } else {
        const partRows = partsRes.data ?? [];
        const questionRows = questionsRes.data ?? [];
        const combined = partRows.length
          ? partRows
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((p) => {
              const qs = (questionRows || [])
                .filter((q) => q.part === p.key)
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((q) => norm(q, p.key));
              return { id: p.id, key: p.key, label: p.label, sort_order: p.sort_order ?? 0, questions: qs };
            })
          : DEFAULT_PARTS.map((p) => ({
            ...p,
            questions: (questionRows || [])
              .filter((q) => q.part === p.key)
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((q) => norm(q, p.key)),
          }));
        setParts(combined);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { parts, loading, error, reload: load, hasBackend };
}

/**
 * Component representing a single question item in a list with edit and delete controls.
 * 
 * @param {Object} props
 * @param {Object} props.item - Question object.
 * @param {Function} props.onEdit - Callback when edit is clicked.
 * @param {Function} props.onDelete - Callback when delete is clicked.
 * @param {boolean} props.canEdit - Permission flag for editing.
 * @param {boolean} props.canDelete - Permission flag for deletion.
 */
function QuestionRow({ item, onEdit, onDelete, canEdit, canDelete, animationDelay = 0 }) {
  return (
    <div
      className="flex items-center gap-3 py-3 px-4 hover:bg-slate-50/40 transition-colors animate-fade-in-up"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both',
      }}
    >
      <span className="text-slate-400 text-xs font-bold w-6 flex-shrink-0">{item.sort_order + 1}.</span>
      <span className="flex-1 text-slate-800 text-xs font-semibold leading-relaxed">{item.label}</span>
      <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100/80">{item.answer_type ?? 'emoji'}</span>
      {canEdit && (
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-violet-50 hover:text-[#7030a0] transition-all border border-slate-200 hover:border-violet-200 text-xs font-bold shrink-0"
          aria-label="Edit"
        >
          <Pencil size={14} />
          Edit
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-200 hover:border-rose-200 text-xs font-bold shrink-0"
          aria-label="Delete"
        >
          <Trash2 size={14} />
          Delete
        </button>
      )}
    </div>
  );
}

/**
 * Checks if a question ID corresponds to a database-managed UUID.
 * 
 * @private
 * @param {Object} item - Question object.
 * @returns {boolean} True if it looks like a DB record.
 */
function isQuestionFromDb(item) {
  const id = item?.id ?? '';
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));
}

/**
 * Component that displays a section (form part) containing its related questions.
 * 
 * @param {Object} props
 * @param {Object} props.part - Part data.
 * @param {Array<Object>} props.items - List of questions in this part.
 */
function PartSection({
  part,
  items,
  editingId,
  onEdit,
  onDelete,
  onAddQuestion,
  onEditPart,
  onDeletePart,
  partEditLabel,
  onPartEditLabelChange,
  onSavePartEdit,
  onCancelPartEdit,
  isCustomPart,
  hasBackend,
}) {
  const showingPartEdit = editingId === part.id;
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-scale-in">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50/20">
        {showingPartEdit ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="text"
              value={partEditLabel}
              onChange={(e) => onPartEditLabelChange(e.target.value)}
              className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-[#7030a0] transition-all bg-white"
              placeholder="Part title"
              autoFocus
            />
            <button type="button" onClick={() => onSavePartEdit(part, partEditLabel)} className="p-2.5 rounded-xl text-white bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#5b2783] active:scale-95 transition-all">
              <Save size={16} />
            </button>
            <button type="button" onClick={onCancelPartEdit} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 active:scale-95 transition-all">
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">{part.label}</h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onEditPart(part)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:bg-violet-50 hover:text-[#7030a0] active:scale-95 transition-all text-xs font-bold"
                  aria-label="Edit part title"
                >
                  <Pencil size={13} />
                  Rename
                </button>
                {isCustomPart && (
                  <button
                    type="button"
                    onClick={() => onDeletePart(part)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all text-xs font-bold"
                    aria-label="Delete part"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAddQuestion(part.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:shadow-md hover:shadow-violet-200 active:scale-95 shrink-0"
              style={{ backgroundColor: '#7030a0' }}
            >
              <Plus size={16} />
              Add question
            </button>
          </>
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500 text-sm">No questions yet. Add one above.</div>
        ) : (
          items.map((item, index) => (
            <QuestionRow
              key={item.id ?? item.key}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              canEdit={hasBackend && isQuestionFromDb(item)}
              canDelete={hasBackend && isQuestionFromDb(item)}
              animationDelay={index * 50}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Main Form Management page that allows administrators to dynamically edit the satisfaction form.
 * Supports adding/removing sections (parts), editing questions, and changing answer types (satisfaction, emoji, text, radio).
 */
export default function FormManagement() {
  const { parts, loading, error, reload, hasBackend } = useFormStructure();
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editAnswerType, setEditAnswerType] = useState('emoji');
  const [saving, setSaving] = useState(false);
  const [addQuestionModal, setAddQuestionModal] = useState(null);
  const [newQuestionLabel, setNewQuestionLabel] = useState('');
  const [newQuestionAnswerType, setNewQuestionAnswerType] = useState('emoji'); // 'emoji' | 'satisfaction' | 'text'
  const [addPartModal, setAddPartModal] = useState(false);
  const [newPartLabel, setNewPartLabel] = useState('');
  const [partEditLabel, setPartEditLabel] = useState('');
  const [editOptions, setEditOptions] = useState('');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'question', item } | { type: 'part', part }

  /**
   * Initializes editing for a specific question.
   * @param {Object} item - The question to edit.
   */
  const startEdit = (item) => {
    if (!item) {
      setEditingId(null);
      setEditLabel('');
      setEditAnswerType('emoji');
      setEditOptions('');
      return;
    }
    setEditingId(item.id ?? item.key);
    setEditLabel(item.label ?? '');
    setEditAnswerType(['emoji', 'satisfaction', 'text', 'radio'].includes(item.answer_type) ? item.answer_type : 'emoji');
    setEditOptions(Array.isArray(item.options) ? item.options.join(', ') : '');
  };

  /**
   * Persists question edits to Supabase.
   */
  const saveEdit = async (item, label, answerType) => {
    if (!hasBackend || !supabase) {
      window.alert(RUN_SQL_MESSAGE);
      startEdit(null);
      return;
    }
    if (!isQuestionFromDb(item)) return;
    const type = (answerType === 'satisfaction' || answerType === 'text' || answerType === 'radio') ? answerType : 'emoji';
    setSaving(true);
    // Note: options are immutable on creation, so we don't update them here
    const { error: err } = await supabase.from('questions').update({
      label: (label ?? '').trim(),
      answer_type: type
    }).eq('id', item.id);
    setSaving(false);
    if (err) return;
    addLog({ action: 'edit', target: 'Question', details: `Question "${(label ?? '').trim()}" in part ${item.part}` });
    startEdit(null);
    reload(false);
  };

  /**
   * Permanently deletes a question from the database.
   */
  const deleteQuestion = async (item) => {
    if (!supabase || !hasBackend || !isQuestionFromDb(item)) return;
    setSaving(true);
    const { error: err } = await supabase.from('questions').delete().eq('id', item.id);
    setSaving(false);
    if (err) return;
    addLog({ action: 'delete', target: 'Question', details: `Question "${item.label}" (${item.id})` });
    startEdit(null);
    reload(false);
  };

  const requestDeleteQuestion = (item) => {
    if (hasBackend && isQuestionFromDb(item)) setDeleteConfirm({ type: 'question', item });
  };

  const openAddQuestion = (partKey) => {
    setAddQuestionModal(partKey);
    setNewQuestionLabel('');
    setNewQuestionAnswerType('emoji');
    setNewQuestionOptions('');
  };

  const submitAddQuestion = async () => {
    const partKey = addQuestionModal;
    const label = (newQuestionLabel || '').trim();
    if (!partKey || !label) {
      setAddQuestionModal(null);
      return;
    }
    if (!hasBackend || !supabase) {
      window.alert(RUN_RADIO_SQL_MESSAGE);
      setAddQuestionModal(null);
      return;
    }
    setSaving(true);
    const key = `extra_${Math.random().toString(36).slice(2, 10)}`;
    const part = parts.find((p) => p.key === partKey);
    const maxOrder = part ? Math.max(-1, ...part.questions.map((q) => (q.sort_order ?? 0))) + 1 : 0;
    const options = newQuestionAnswerType === 'radio' ? newQuestionOptions.split(',').map(s => s.trim()).filter(Boolean) : null;
    const { error: err } = await supabase
      .from('questions')
      .insert({
        part: partKey,
        sort_order: maxOrder,
        key,
        label,
        answer_type: newQuestionAnswerType,
        options: options
      });
    setSaving(false);
    if (err) {
      console.error('Error adding question:', err);
      window.alert(`Failed to add question: ${err.message}`);
      setSaving(false);
      return;
    }
    addLog({ action: 'add', target: 'Question', details: `Question "${label}" in part ${partKey}` });
    setAddQuestionModal(null);
    setNewQuestionLabel('');
    setNewQuestionAnswerType('emoji');
    setNewQuestionOptions('');
    reload(false);
  };

  const nextPartKey = () => {
    const nums = parts.map((p) => {
      const m = (p.key || '').match(/^part(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    });
    return `part${Math.max(2, ...nums, 0) + 1}`;
  };

  const submitAddPart = async () => {
    const label = (newPartLabel || '').trim();
    if (!label) {
      setAddPartModal(false);
      setNewPartLabel('');
      return;
    }
    if (!hasBackend || !supabase) {
      window.alert(RUN_SQL_MESSAGE);
      setAddPartModal(false);
      setNewPartLabel('');
      return;
    }
    setSaving(true);
    const key = nextPartKey();
    const sortOrder = parts.length;
    const { error: err } = await supabase.from('form_parts').insert({ key, sort_order: sortOrder, label });
    setSaving(false);
    if (err) {
      setAddPartModal(false);
      setNewPartLabel('');
      return;
    }
    addLog({ action: 'add', target: 'Form part', details: `Part "${label}" (${key})` });
    setAddPartModal(false);
    setNewPartLabel('');
    reload(false);
  };

  const isCustomPart = (part) => {
    const n = (part.key || '').match(/^part(\d+)$/);
    return n ? parseInt(n[1], 10) > 3 : true;
  };

  const startEditPart = (part) => {
    setEditingId(part.id);
    setPartEditLabel(part.label ?? '');
  };

  const cancelPartEdit = () => {
    setEditingId(null);
    setPartEditLabel('');
  };

  const savePartEdit = async (part, label) => {
    if (!hasBackend || !supabase) {
      window.alert(RUN_SQL_MESSAGE);
      cancelPartEdit();
      return;
    }
    const partId = part.id;
    if (!partId || String(partId).length < 10) {
      window.alert('Part titles for Part II/III come from the form_parts table.\n\n' + RUN_SQL_MESSAGE);
      cancelPartEdit();
      return;
    }
    setSaving(true);
    const { error: err } = await supabase.from('form_parts').update({ label: (label || '').trim() }).eq('id', partId);
    setSaving(false);
    if (err) {
      cancelPartEdit();
      return;
    }
    addLog({ action: 'edit', target: 'Form part', details: `Part "${(label || '').trim()}" (${part.key})` });
    cancelPartEdit();
    reload(false);
  };

  const deletePart = async (part) => {
    if (!supabase || !hasBackend || !isCustomPart(part)) return;
    setSaving(true);
    await supabase.from('questions').delete().eq('part', part.key);
    const { error: err } = await supabase.from('form_parts').delete().eq('id', part.id);
    setSaving(false);
    if (err) return;
    addLog({ action: 'delete', target: 'Form part', details: `Part "${part.label}" (${part.key})` });
    cancelPartEdit();
    reload(false);
  };

  const requestDeletePart = (part) => {
    if (hasBackend && isCustomPart(part)) setDeleteConfirm({ type: 'part', part });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'question') {
      await deleteQuestion(deleteConfirm.item);
    } else {
      await deletePart(deleteConfirm.part);
    }
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-black/10 shadow-card text-center text-slate-500">Loading form structure…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-black text-slate-800 text-lg tracking-tight mb-1.5">Form Management</h2>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed">
          Manage parts (sections) and questions shown in the mobile app. You can add or remove parts, edit part titles, and add, edit, or remove questions in each part.
        </p>
        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-800 text-xs font-semibold leading-relaxed">
            {error}. Using built-in structure. Run <code className="bg-amber-100/50 px-1.5 py-0.5 rounded font-mono">supabase_setup.sql</code> in the Supabase SQL Editor to enable saving and adding parts.
          </div>
        )}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => { setAddPartModal(true); setNewPartLabel(''); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:shadow-md hover:shadow-violet-200 active:scale-95"
            style={{ backgroundColor: '#7030a0' }}
          >
            <LayoutList size={16} />
            Add part
          </button>
        </div>
      </div>

      {parts.map((part) => (
        <PartSection
          key={part.key}
          part={part}
          items={part.questions ?? []}
          editingId={editingId}
          onEdit={startEdit}
          onDelete={requestDeleteQuestion}
          onAddQuestion={openAddQuestion}
          onEditPart={startEditPart}
          onDeletePart={requestDeletePart}
          partEditLabel={partEditLabel}
          onPartEditLabelChange={setPartEditLabel}
          onSavePartEdit={savePartEdit}
          onCancelPartEdit={cancelPartEdit}
          isCustomPart={isCustomPart(part)}
          hasBackend={hasBackend}
        />
      ))}

      {(() => {
        const editingItem = parts.flatMap((p) => p.questions ?? []).find((q) => (q.id ?? q.key) === editingId);
        return editingItem ? (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => startEdit(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold text-slate-800 mb-4">Edit question</h3>
              <label className="block text-sm font-medium text-slate-700 mb-1">Question text</label>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                placeholder="Question text"
                autoFocus
              />
              <label className="block text-sm font-medium text-slate-700 mb-2">Answer type</label>
              <div className="space-y-2 mb-4">
                {ANSWER_TYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-slate-50/80"
                    style={{ borderColor: editAnswerType === opt.value ? '#7030a0' : '#e2e8f0', backgroundColor: editAnswerType === opt.value ? '#f5f0f9' : 'transparent' }}
                  >
                    <input
                      type="radio"
                      name="editAnswerTypeModal"
                      value={opt.value}
                      checked={editAnswerType === opt.value}
                      onChange={() => setEditAnswerType(opt.value)}
                      className="mt-1 accent-[#7030a0]"
                    />
                    <div>
                      <span className="font-medium text-slate-800">{opt.label}</span>
                      <p className="text-slate-500 text-sm">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {editAnswerType === 'radio' && (
                <div className="mb-4 animate-scale-in">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Options (immutable)</label>
                  <input
                    type="text"
                    value={editOptions}
                    readOnly
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed"
                    title="Options cannot be changed after creation"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Options are fixed upon creation. To change options, please create a new question.</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => startEdit(null)} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await saveEdit(editingItem, editLabel, editAnswerType);
                    startEdit(null);
                  }}
                  disabled={saving || !(editLabel ?? '').trim()}
                  className="px-4 py-2 rounded-xl text-white disabled:opacity-50"
                  style={{ backgroundColor: '#7030a0' }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {addQuestionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setAddQuestionModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-800 mb-4">Add question — {parts.find((p) => p.key === addQuestionModal)?.label ?? addQuestionModal}</h3>
            <label className="block text-sm font-medium text-slate-700 mb-1">Question text</label>
            <input
              type="text"
              value={newQuestionLabel}
              onChange={(e) => setNewQuestionLabel(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              placeholder="e.g. Quality of lighting"
              autoFocus
            />
            <label className="block text-sm font-medium text-slate-700 mb-2">Answer type</label>
            <div className="space-y-2 mb-4">
              {ANSWER_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-slate-50/80"
                  style={{
                    borderColor: newQuestionAnswerType === opt.value ? '#7030a0' : '#e2e8f0',
                    backgroundColor: newQuestionAnswerType === opt.value ? '#f5f0f9' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="answerType"
                    value={opt.value}
                    checked={newQuestionAnswerType === opt.value}
                    onChange={() => setNewQuestionAnswerType(opt.value)}
                    className="mt-1 accent-[#7030a0]"
                  />
                  <div>
                    <span className="font-medium text-slate-800">{opt.label}</span>
                    <p className="text-slate-500 text-sm">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {newQuestionAnswerType === 'radio' && (
              <div className="mb-4 animate-scale-in">
                <label className="block text-sm font-medium text-slate-700 mb-1">Options (comma separated)</label>
                <input
                  type="text"
                  value={newQuestionOptions}
                  onChange={(e) => setNewQuestionOptions(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Yes, No, Maybe"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAddQuestionModal(null)} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAddQuestion}
                disabled={saving || !newQuestionLabel.trim()}
                className="px-4 py-2 rounded-xl text-white disabled:opacity-50"
                style={{ backgroundColor: '#7030a0' }}
              >
                {saving ? 'Saving…' : 'Add question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addPartModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setAddPartModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-800 mb-4">Add part</h3>
            <p className="text-slate-500 text-sm mb-3">Create a new section in the form (e.g. &quot;Part IV – Food and Refreshments&quot;). You can add questions to it after.</p>
            <input
              type="text"
              value={newPartLabel}
              onChange={(e) => setNewPartLabel(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              placeholder="Part title (e.g. Part IV – Food and Refreshments)"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setAddPartModal(false); setNewPartLabel(''); }} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAddPart}
                disabled={saving || !newPartLabel.trim()}
                className="px-4 py-2 rounded-xl text-white disabled:opacity-50"
                style={{ backgroundColor: '#7030a0' }}
              >
                {saving ? 'Saving…' : 'Add part'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-800 mb-2">
              {deleteConfirm.type === 'question' ? 'Remove question?' : 'Delete part?'}
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              {deleteConfirm.type === 'question'
                ? 'Remove this question from the form? This cannot be undone.'
                : `Delete "${deleteConfirm.part.label}" and all its questions? This cannot be undone.`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete()}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
