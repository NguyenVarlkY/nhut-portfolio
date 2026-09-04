'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Trash2, Check, Edit, Plus, ListTodo, Target, CalendarDays, BarChart3, ClipboardList,
  Flag, X, ChevronRight, Search, CalendarClock, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

/* ================= Types ================= */
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
}

interface Goal {
  id: string;
  title: string;
  desc: string;
  target: number;
  progress: number;
  createdAt: number;
}

interface Plan {
  id: string;
  title: string;
  steps: { id: string; text: string; done: boolean }[];
  createdAt: number;
}

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  done: boolean;
}

/* ================= Storage ================= */
const TASKS_KEY = 'nhut-todo-tasks';
const GOALS_KEY = 'nhut-todo-goals';
const PLANS_KEY = 'nhut-todo-plans';
const SCHEDULE_KEY = 'nhut-todo-schedule';

type Tab = 'tasks' | 'goals' | 'plans' | 'schedule' | 'analytics';

const uid = () => Math.random().toString(36).substr(2, 9);
const CATEGORIES = ['Work', 'Study', 'Personal', 'Health'];

/* ================= Charts (pure SVG) ================= */
function Donut({ pct, color = '#8b5cf6' }: { pct: number; color?: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(pct, 100) / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

function BarRow({ label, value, max, color = '#8b5cf6' }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-muted">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-8 shrink-0 text-right font-mono text-xs text-body">{value}</span>
    </div>
  );
}

/* ================= Main Component ================= */
export default function TestTodo() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('tasks');

  // Tasks
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState<TodoItem['priority']>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'today' | 'overdue'>('all');
  const [search, setSearch] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Goals
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  // Plans
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planTitle, setPlanTitle] = useState('');
  const [planStep, setPlanStep] = useState('');

  // Schedule
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evTime, setEvTime] = useState('');

  /* Persistence */
  useEffect(() => {
    try {
      setTodos(JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'));
      setGoals(JSON.parse(localStorage.getItem(GOALS_KEY) || '[]'));
      setPlans(JSON.parse(localStorage.getItem(PLANS_KEY) || '[]'));
      setEvents(JSON.parse(localStorage.getItem(SCHEDULE_KEY) || '[]'));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { localStorage.setItem(TASKS_KEY, JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem(PLANS_KEY, JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem(SCHEDULE_KEY, JSON.stringify(events)); }, [events]);

  /* ---- Tasks ---- */
  const addTodo = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setTodos([...todos, { id: uid(), text: trimmed, completed: false, createdAt: Date.now(), priority, dueDate: dueDate || undefined, category }]);
    setInputValue('');
    setDueDate('');
  }, [inputValue, todos, priority]);

  const toggleTodo = (id: string) =>
    setTodos(todos.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const deleteTodo = (id: string) => setTodos(todos.filter(t => t.id !== id));
  const startEdit = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) { setEditId(id); setEditText(todo.text); }
  };
  const saveEdit = () => {
    if (editId && editText.trim()) {
      setTodos(todos.map(t => (t.id === editId ? { ...t, text: editText.trim() } : t)));
      setEditId(null); setEditText('');
    }
  };
  const clearCompleted = () => setTodos(todos.filter(t => !t.completed));

  const todayKey = new Date().toISOString().slice(0, 10);
  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'today') return t.dueDate === todayKey;
    if (filter === 'overdue') return Boolean(t.dueDate && t.dueDate < todayKey && !t.completed);
    return true;
  }).filter(t => t.text.toLowerCase().includes(search.trim().toLowerCase()))
    .filter(t => categoryFilter === 'all' || (t.category ?? 'Work') === categoryFilter);
  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;
  const todayCount = todos.filter(t => t.dueDate === todayKey && !t.completed).length;
  const overdueCount = todos.filter(t => Boolean(t.dueDate && t.dueDate < todayKey && !t.completed)).length;

  const prioColor: Record<TodoItem['priority'], string> = {
    low: 'text-green-400', medium: 'text-amber-400', high: 'text-red-400',
  };

  /* ---- Goals ---- */
  const addGoal = () => {
    if (!goalTitle.trim()) return;
    setGoals([...goals, { id: uid(), title: goalTitle.trim(), desc: '', target: parseInt(goalTarget) || 100, progress: 0, createdAt: Date.now() }]);
    setGoalTitle(''); setGoalTarget('');
  };
  const updateGoalProgress = (id: string, delta: number) =>
    setGoals(goals.map(g => (g.id === id ? { ...g, progress: Math.max(0, Math.min(g.target, g.progress + delta)) } : g)));
  const deleteGoal = (id: string) => setGoals(goals.filter(g => g.id !== id));

  /* ---- Plans ---- */
  const addPlan = () => {
    if (!planTitle.trim()) return;
    setPlans([...plans, { id: uid(), title: planTitle.trim(), steps: [], createdAt: Date.now() }]);
    setPlanTitle('');
  };
  const addStep = (planId: string) => {
    if (!planStep.trim()) return;
    setPlans(plans.map(p => (p.id === planId ? { ...p, steps: [...p.steps, { id: uid(), text: planStep.trim(), done: false }] } : p)));
    setPlanStep('');
  };
  const toggleStep = (planId: string, stepId: string) =>
    setPlans(plans.map(p => (p.id === planId ? { ...p, steps: p.steps.map(s => (s.id === stepId ? { ...s, done: !s.done } : s)) } : p)));
  const deletePlan = (id: string) => setPlans(plans.filter(p => p.id !== id));

  /* ---- Schedule ---- */
  const addEvent = () => {
    if (!evTitle.trim()) return;
    setEvents([...events, { id: uid(), title: evTitle.trim(), date: evDate, time: evTime, done: false }]);
    setEvTitle(''); setEvDate(''); setEvTime('');
  };
  const toggleEvent = (id: string) => setEvents(events.map(e => (e.id === id ? { ...e, done: !e.done } : e)));
  const deleteEvent = (id: string) => setEvents(events.filter(e => e.id !== id));

  /* ---- Analytics ---- */
  const completionPct = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;
  const goalPct = goals.length ? Math.round((goals.reduce((a, g) => a + g.progress, 0) / goals.reduce((a, g) => a + g.target, 0)) * 100) : 0;
  const planPct = plans.length
    ? Math.round((plans.reduce((a, p) => a + p.steps.filter(s => s.done).length, 0) / Math.max(1, plans.reduce((a, p) => a + p.steps.length, 0))) * 100)
    : 0;
  const schedulePct = events.length ? Math.round((events.filter(e => e.done).length / events.length) * 100) : 0;
  const overallPct = Math.round((completionPct + goalPct + planPct + schedulePct) / 4);

  const highCount = todos.filter(t => t.priority === 'high' && !t.completed).length;
  const medCount = todos.filter(t => t.priority === 'medium' && !t.completed).length;
  const lowCount = todos.filter(t => t.priority === 'low' && !t.completed).length;

  // This week's tasks (created within last 7 days)
  const weekCount = todos.filter(t => Date.now() - t.createdAt < 7 * 86400000).length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tasks', label: t('tools.todo.tabTasks'), icon: <ListTodo size={15} /> },
    { id: 'goals', label: t('tools.todo.tabGoals'), icon: <Target size={15} /> },
    { id: 'plans', label: t('tools.todo.tabPlans'), icon: <ClipboardList size={15} /> },
    { id: 'schedule', label: t('tools.todo.tabSchedule'), icon: <CalendarDays size={15} /> },
    { id: 'analytics', label: t('tools.todo.tabAnalytics'), icon: <BarChart3 size={15} /> },
  ];

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-start px-6 pt-16 pb-12">
      <div className="container-port w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <span className="section-tag">{t('tools.todo.tag')}</span>
          <h1 className="section-title mb-4">
            {t('tools.todo.title')} <span className="grad-text">{t('tools.todo.titleHighlight')}</span>
          </h1>
          <p className="text-muted max-w-lg">{t('tools.todo.description')}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Active', value: activeCount, icon: <ListTodo size={16} />, color: 'text-primary-light' },
              { label: 'Completed', value: completedCount, icon: <CheckCircle2 size={16} />, color: 'text-green-400' },
              { label: 'Today', value: todayCount, icon: <CalendarClock size={16} />, color: 'text-accent' },
              { label: 'Overdue', value: overdueCount, icon: <AlertCircle size={16} />, color: 'text-red-400' },
            ].map(card => (
              <div key={card.label} className="glass flex items-center gap-3 p-3">
                <span className={card.color}>{card.icon}</span>
                <div><p className="font-mono text-lg font-bold text-body">{card.value}</p><p className="text-[11px] text-muted">{card.label}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(tb => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                tab === tb.id
                  ? 'border-primary-light/40 bg-surface-hover text-primary-light'
                  : 'border-subtle bg-surface text-muted hover:border-primary-light/40 hover:text-body'
              }`}
            >
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        <div className="glass w-full">
          {/* ============ TASKS ============ */}
          {tab === 'tasks' && (
            <>
              {/* Input */}
          <div className="p-5 border-b border-subtle">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={editId ? editText : inputValue}
                    onChange={e => editId ? setEditText(e.target.value) : setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') editId ? saveEdit() : addTodo(); }}
                    placeholder={editId ? t('tools.todo.editPlaceholder') : t('tools.todo.placeholder')}
                    className="flex-1 rounded-xl bg-surface px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                  />
                  {!editId && (
                    <label className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-xs text-muted sm:w-[145px]">
                      <CalendarDays size={15} aria-hidden="true" />
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} aria-label="Due date" className="min-w-0 bg-transparent text-xs text-body outline-none" />
                    </label>
                  )}
                  {!editId && (
                    <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Task category" className="rounded-xl bg-surface px-3 py-2.5 text-xs text-body outline-none focus:ring-2 focus:ring-primary-light/40 sm:w-[120px]">
                      {CATEGORIES.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                  )}
                  {/* Priority chips */}
                  {!editId && (
                    <div className="flex gap-1.5">
                      {(['low', 'medium', 'high'] as const).map(p => (
                        <button
                          key={p} onClick={() => setPriority(p)}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                            priority === p ? 'border-primary-light/50 bg-primary-light/10 text-primary-light' : 'border-subtle text-muted hover:border-primary-light/40'
                          }`}
                        >
                          {p === 'low' ? t('tools.todo.priorityLow') : p === 'medium' ? t('tools.todo.priorityMedium') : t('tools.todo.priorityHigh')}
                        </button>
                      ))}
                    </div>
                  )}
                  {!editId ? (
                    <button onClick={addTodo} disabled={!inputValue.trim()} className="btn btn-primary !px-4 !py-2.5">
                      <Plus size={18} /> {t('tools.todo.addButton')}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={!editText.trim()} className="btn btn-primary !px-4 !py-2.5">
                        <Check size={18} /> {t('tools.todo.saveButton')}
                      </button>
                      <button onClick={() => { setEditId(null); setEditText(''); }} className="btn btn-ghost !px-4 !py-2.5">
                        <X size={18} /> {t('tools.todo.cancelButton')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Filter bar */}
              <div className="flex flex-col gap-3 p-4 border-b border-subtle sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {(['all', 'active', 'completed', 'today', 'overdue'] as const).map(f => (
                    <button
                      key={f} onClick={() => setFilter(f)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                        filter === f ? 'bg-primary-light/10 text-primary-light' : 'text-muted hover:text-body'
                      }`}
                    >
                      {f === 'all' ? t('tools.todo.filterAll') : f === 'active' ? t('tools.todo.filterActive') : f === 'completed' ? t('tools.todo.filterCompleted') : f === 'today' ? 'Today' : 'Overdue'}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 rounded-lg border border-subtle bg-surface px-3 py-1.5 text-xs text-muted sm:w-48">
                  <Search size={14} aria-hidden="true" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks" aria-label="Search tasks" className="min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-muted" />
                </label>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} aria-label="Filter by category" className="rounded-lg border border-subtle bg-surface px-3 py-1.5 text-xs text-body outline-none focus:ring-2 focus:ring-primary-light/40">
                  <option value="all">All categories</option>
                  {CATEGORIES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              {/* List */}
              <div className="p-4 space-y-2">
                {filteredTodos.length === 0 ? (
                  <p className="py-10 text-center text-muted">
                    {todos.length === 0 ? t('tools.todo.emptyState') : t('tools.todo.noMatchingTodos')}
                  </p>
                ) : (
                  filteredTodos.map(todo => (
                    <div key={todo.id} className="flex items-start gap-3 rounded-xl border border-transparent p-3 hover:border-primary-light/20 hover:bg-surface-hover transition-all">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        aria-label={todo.completed ? `Mark ${todo.text} as active` : `Complete ${todo.text}`}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          todo.completed ? 'border-primary-light bg-primary-light/20' : 'border-subtle'
                        }`}
                      >
                        {todo.completed && <Check size={12} className="text-primary-light" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        {editId === todo.id ? (
                          <input
                            type="text" value={editText} autoFocus
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditId(null); setEditText(''); } }}
                            className="w-full rounded-lg bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`flex-1 text-sm break-words ${todo.completed ? 'line-through text-muted' : 'text-body'}`}>{todo.text}</span>
                            <Flag size={13} aria-label={`${todo.priority} priority`} className={`shrink-0 ${prioColor[todo.priority]}`} />
                          </div>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          {todo.category && <span className="rounded-md bg-primary-light/10 px-1.5 py-0.5 text-primary-light">{todo.category}</span>}
                          {todo.dueDate && <span className={`flex items-center gap-1 ${todo.dueDate < todayKey && !todo.completed ? 'text-red-400' : 'text-muted'}`}><CalendarDays size={12} aria-hidden="true" /> {todo.dueDate}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(todo.id)} aria-label={`Edit ${todo.text}`} className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-body">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.text}`} className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {todos.length > 0 && (
                <div className="flex items-center justify-between border-t border-subtle p-4">
                  <button onClick={clearCompleted} disabled={completedCount === 0} className="btn btn-ghost !px-3 !py-2 text-xs">
                    <Trash2 size={15} /> {t('tools.todo.clearCompleted')}
                  </button>
                  <span className="text-xs text-muted">{todos.length} {t('tools.todo.totalTodos')} · {completedCount} ✓</span>
                </div>
              )}
            </>
          )}

          {/* ============ GOALS ============ */}
          {tab === 'goals' && (
            <div className="p-5 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text" value={goalTitle} onChange={e => setGoalTitle(e.target.value)}
                  placeholder={t('tools.todo.goalTitle')} onKeyDown={e => e.key === 'Enter' && addGoal()}
                  className="flex-1 rounded-xl bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                />
                <input
                  type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)}
                  placeholder={t('tools.todo.goalTarget')} className="w-24 rounded-xl bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                />
                <button onClick={addGoal} disabled={!goalTitle.trim()} className="btn btn-primary !px-4 !py-2.5">
                  <Plus size={18} /> {t('tools.todo.addGoal')}
                </button>
              </div>

              {goals.length === 0 ? (
                <p className="py-8 text-center text-muted">{t('tools.todo.emptyState')}</p>
              ) : (
                goals.map(goal => {
                  const pct = goal.target > 0 ? Math.round((goal.progress / goal.target) * 100) : 0;
                  return (
                    <div key={goal.id} className="rounded-xl border border-subtle bg-surface p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-body">{goal.title}</h4>
                          <p className="text-xs text-muted">{goal.progress}/{goal.target} · {pct}%</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateGoalProgress(goal.id, -10)} className="rounded-lg border border-subtle px-2 py-1 text-xs text-muted hover:text-body">−</button>
                          <button onClick={() => updateGoalProgress(goal.id, 10)} className="rounded-lg border border-subtle px-2 py-1 text-xs text-muted hover:text-body">+</button>
                          <button onClick={() => deleteGoal(goal.id)} className="rounded-lg p-1.5 text-muted hover:text-red-400"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-hover">
                        <div className="h-full rounded-full bg-gradient-brand transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ============ PLANS ============ */}
          {tab === 'plans' && (
            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <input
                  type="text" value={planTitle} onChange={e => setPlanTitle(e.target.value)}
                  placeholder={t('tools.todo.planTitle')} onKeyDown={e => e.key === 'Enter' && addPlan()}
                  className="flex-1 rounded-xl bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                />
                <button onClick={addPlan} disabled={!planTitle.trim()} className="btn btn-primary !px-4 !py-2.5">
                  <Plus size={18} /> {t('tools.todo.addPlan')}
                </button>
              </div>

              {plans.length === 0 ? (
                <p className="py-8 text-center text-muted">{t('tools.todo.emptyPlans')}</p>
              ) : (
                plans.map(plan => {
                  const done = plan.steps.filter(s => s.done).length;
                  const pct = plan.steps.length ? Math.round((done / plan.steps.length) * 100) : 0;
                  return (
                    <div key={plan.id} className="rounded-xl border border-subtle bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-body">{plan.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{done}/{plan.steps.length} · {pct}%</span>
                          <button onClick={() => deletePlan(plan.id)} className="rounded-lg p-1.5 text-muted hover:text-red-400"><Trash2 size={15} /></button>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          type="text" value={planStep} onChange={e => setPlanStep(e.target.value)}
                          placeholder={t('tools.todo.planStepPlaceholder')} onKeyDown={e => e.key === 'Enter' && addStep(plan.id)}
                          className="flex-1 rounded-lg bg-surface-hover px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                        />
                        <button onClick={() => addStep(plan.id)} disabled={!planStep.trim()} className="rounded-lg border border-subtle px-2.5 py-1.5 text-xs hover:border-primary-light/40"><Plus size={14} /></button>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        {plan.steps.map(step => (
                          <button key={step.id} onClick={() => toggleStep(plan.id, step.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-hover">
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${step.done ? 'border-primary-light bg-primary-light/20' : 'border-subtle'}`}>
                              {step.done && <Check size={10} className="text-primary-light" />}
                            </span>
                            <span className={`flex-1 text-xs ${step.done ? 'line-through text-muted' : 'text-body'}`}>{step.text}</span>
                            <ChevronRight size={12} className="text-muted" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ============ SCHEDULE ============ */}
          {tab === 'schedule' && (
            <div className="p-5 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text" value={evTitle} onChange={e => setEvTitle(e.target.value)}
                  placeholder={t('tools.todo.scheduleTitle')} className="flex-1 rounded-xl bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                />
                <input type="date" value={evDate} onChange={e => setEvDate(e.target.value)} className="rounded-xl bg-surface px-3 py-2.5 text-sm focus:outline-none" />
                <input type="time" value={evTime} onChange={e => setEvTime(e.target.value)} className="rounded-xl bg-surface px-3 py-2.5 text-sm focus:outline-none" />
                <button onClick={addEvent} disabled={!evTitle.trim()} className="btn btn-primary !px-4 !py-2.5">
                  <Plus size={18} /> {t('tools.todo.addButton')}
                </button>
              </div>

              <div className="mb-2 flex gap-4 text-xs text-muted">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent/60" /> {t('tools.todo.upcoming')}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400/60" /> {t('tools.todo.completed')}</span>
              </div>

              {events.length === 0 ? (
                <p className="py-8 text-center text-muted">{t('tools.todo.emptySchedule')}</p>
              ) : (
                events.map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-subtle bg-surface p-3">
                    <button
                      onClick={() => toggleEvent(ev.id)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${ev.done ? 'border-green-400 bg-green-400/20' : 'border-subtle'}`}
                    >
                      {ev.done && <Check size={12} className="text-green-400" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-sm ${ev.done ? 'line-through text-muted' : 'text-body'}`}>{ev.title}</span>
                      {(ev.date || ev.time) && (
                        <span className="ml-2 font-mono text-xs text-muted">{ev.date}{ev.date && ev.time ? ' · ' : ''}{ev.time}</span>
                      )}
                    </div>
                    <button onClick={() => deleteEvent(ev.id)} className="rounded-lg p-1.5 text-muted hover:text-red-400"><Trash2 size={15} /></button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ============ ANALYTICS ============ */}
          {tab === 'analytics' && (
            <div className="p-6 space-y-6">
              {/* 4 donut cards */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: t('tools.todo.analyticsCompletion'), pct: completionPct, color: '#8b5cf6' },
                  { label: t('tools.todo.analyticsGoals'), pct: goalPct, color: '#22d3ee' },
                  { label: t('tools.todo.analyticsPlans'), pct: planPct, color: '#f59e0b' },
                  { label: t('tools.todo.analyticsSchedule'), pct: schedulePct, color: '#22c55e' },
                ].map((d, i) => (
                  <div key={i} className="flex flex-col items-center rounded-xl border border-subtle bg-surface p-3">
                    <div className="relative">
                      <Donut pct={d.pct} color={d.color} />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{d.pct}%</span>
                    </div>
                    <span className="mt-2 text-center text-xs text-muted">{d.label}</span>
                  </div>
                ))}
              </div>

              {/* Overall progress */}
              <div className="rounded-xl border border-subtle bg-surface p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-body">{t('tools.todo.analyticsOverall')}</h4>
<span className="font-mono text-lg font-bold grad-text">{overallPct}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-surface-hover">
                  <div className="h-full rounded-full bg-gradient-brand transition-all duration-600" style={{ width: `${overallPct}%` }} />
                </div>
              </div>

              {/* Weekly + priority */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-subtle bg-surface p-4">
                  <h4 className="mb-3 text-sm font-semibold text-body">{t('tools.todo.analyticsWeek')}</h4>
                  <div className="space-y-3">
                    <BarRow label={t('tools.todo.tabTasks')} value={todos.length} max={Math.max(todos.length, 1)} color="#8b5cf6" />
                    <BarRow label={t('tools.todo.analyticsCompletion')} value={completedCount} max={Math.max(todos.length, 1)} color="#22c55e" />
                    <BarRow label="7d" value={weekCount} max={Math.max(todos.length, 1)} color="#22d3ee" />
                  </div>
                </div>
                <div className="rounded-xl border border-subtle bg-surface p-4">
                  <h4 className="mb-3 text-sm font-semibold text-body">{t('tools.todo.analyticsPriority')}</h4>
                  <div className="space-y-3">
                    <BarRow label={t('tools.todo.priorityHigh')} value={highCount} max={Math.max(highCount, medCount, lowCount, 1)} color="#ef4444" />
                    <BarRow label={t('tools.todo.priorityMedium')} value={medCount} max={Math.max(highCount, medCount, lowCount, 1)} color="#f59e0b" />
                    <BarRow label={t('tools.todo.priorityLow')} value={lowCount} max={Math.max(highCount, medCount, lowCount, 1)} color="#22c55e" />
                  </div>
                </div>
              </div>

              {/* Goal progress bars */}
              {goals.length > 0 && (
                <div className="rounded-xl border border-subtle bg-surface p-4">
                  <h4 className="mb-3 text-sm font-semibold text-body">{t('tools.todo.analyticsGoalProgress')}</h4>
                  <div className="space-y-3">
                    {goals.map(g => (
                      <BarRow key={g.id} label={g.title} value={g.progress} max={Math.max(g.target, 1)} color="#8b5cf6" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
