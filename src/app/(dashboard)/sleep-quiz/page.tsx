'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { Plus, Edit2, Trash2, Sliders, HelpCircle } from 'lucide-react';

export default function SleepQuizPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'questions'>('questions');
  
  // Data State
  const [questions, setQuestions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form States
  const [qForm, setQForm] = useState({ id: '', label: '', type: 'single-select', options: '', order: 0 });
  const [rForm, setRForm] = useState({ condition: '', recommendedSku: '', weight: 10, isActive: true });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [qRes, rRes] = await Promise.all([
        adminApi.sleepQuiz.getQuestions(),
        adminApi.sleepQuiz.getRules()
      ]);
      setQuestions(qRes.data.questions || []);
      setRules(rRes.data || []);
    } catch (error) {
      console.error('Failed to fetch sleep quiz data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers for Questions ---
  const handleOpenQuestionModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setQForm({
        id: item.id,
        label: item.label,
        type: item.type,
        options: item.options ? item.options.join(', ') : '',
        order: item.order || 0
      });
    } else {
      setEditingItem(null);
      setQForm({ id: '', label: '', type: 'single-select', options: '', order: 0 });
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...qForm,
      options: qForm.options ? qForm.options.split(',').map(s => s.trim()) : [],
      order: Number(qForm.order)
    };
    try {
      if (editingItem) {
        await adminApi.sleepQuiz.updateQuestion(editingItem._id, payload);
      } else {
        await adminApi.sleepQuiz.createQuestion(payload);
      }
      setIsQuestionModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      await adminApi.sleepQuiz.deleteQuestion(id);
      fetchData();
    }
  };

  // --- Handlers for Rules ---
  const handleOpenRuleModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setRForm({
        condition: item.condition,
        recommendedSku: item.recommendedSku,
        weight: item.weight,
        isActive: item.isActive
      });
    } else {
      setEditingItem(null);
      setRForm({ condition: '', recommendedSku: '', weight: 10, isActive: true });
    }
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...rForm, weight: Number(rForm.weight) };
    try {
      if (editingItem) {
        await adminApi.sleepQuiz.updateRule(editingItem._id, payload);
      } else {
        await adminApi.sleepQuiz.createRule(payload);
      }
      setIsRuleModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      await adminApi.sleepQuiz.deleteRule(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Sleep Quiz Configuration</h1>
        <p className="text-xs text-slate-400 mt-1">Configure questionnaire rules and manage questions.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-800 mb-6">
        <button 
          onClick={() => setActiveTab('questions')}
          className={`pb-2 px-1 font-semibold text-sm transition-colors ${activeTab === 'questions' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          <HelpCircle className="inline-block w-4 h-4 mr-2" />
          Quiz Questions
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          className={`pb-2 px-1 font-semibold text-sm transition-colors ${activeTab === 'rules' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          <Sliders className="inline-block w-4 h-4 mr-2" />
          AI Recommendation Rules
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading...</div>
      ) : (
        <>
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200">Question Builder</h3>
                <button onClick={() => handleOpenQuestionModal()} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 text-xs font-semibold flex items-center transition-colors">
                  <Plus className="w-3 h-3 mr-1" /> Add Question
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {questions.map((q) => (
                  <Card key={q._id || q.id} className="p-4 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Order: {q.order}</span>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Type: {q.type}</span>
                        <span className="text-xs text-slate-400 font-mono">{q.id}</span>
                      </div>
                      <h4 className="text-slate-200 mt-2 font-medium">{q.label}</h4>
                      {q.options && q.options.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">Options: {q.options.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleOpenQuestionModal(q)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteQuestion(q._id)} className="p-2 text-red-400 hover:text-white bg-red-400/10 hover:bg-red-500 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </Card>
                ))}
                {questions.length === 0 && <div className="text-slate-500 text-sm">No questions found.</div>}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200">AI Rules Engine</h3>
                <button onClick={() => handleOpenRuleModal()} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 text-xs font-semibold flex items-center transition-colors">
                  <Plus className="w-3 h-3 mr-1" /> Add Rule
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {rules.map((r) => (
                  <Card key={r._id} className={`p-4 border ${r.isActive ? 'border-emerald-500/30' : 'border-slate-800'} flex justify-between items-center`}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          {r.isActive ? 'Active' : 'Disabled'}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Weight: {r.weight}</span>
                        <span className="text-xs text-slate-400 font-mono text-emerald-300">Force SKU: {r.recommendedSku}</span>
                      </div>
                      <p className="text-sm text-slate-300">"{r.condition}"</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleOpenRuleModal(r)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteRule(r._id)} className="p-2 text-red-400 hover:text-white bg-red-400/10 hover:bg-red-500 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </Card>
                ))}
                {rules.length === 0 && <div className="text-slate-500 text-sm">No rules configured.</div>}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} title={editingItem ? "Edit Question" : "Add Question"}>
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div><label className="block text-xs text-slate-400 mb-1">ID (Variable Name)</label><input required value={qForm.id} onChange={e => setQForm({...qForm, id: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200" placeholder="e.g. preferredFirmness" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Label (Question Text)</label><input required value={qForm.label} onChange={e => setQForm({...qForm, label: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Type</label>
            <select value={qForm.type} onChange={e => setQForm({...qForm, type: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200">
              <option value="single-select">Single Select (Radio)</option>
              <option value="multi-select">Multi Select (Checkbox)</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean (Yes/No)</option>
            </select>
          </div>
          {(qForm.type === 'single-select' || qForm.type === 'multi-select') && (
            <div><label className="block text-xs text-slate-400 mb-1">Options (Comma separated)</label><input value={qForm.options} onChange={e => setQForm({...qForm, options: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200" placeholder="soft, medium, firm" /></div>
          )}
          <div><label className="block text-xs text-slate-400 mb-1">Sort Order</label><input type="number" required value={qForm.order} onChange={e => setQForm({...qForm, order: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200" /></div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-md">Save Question</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} title={editingItem ? "Edit Rule" : "Add Rule"}>
        <form onSubmit={handleSaveRule} className="space-y-4">
          <div><label className="block text-xs text-slate-400 mb-1">Condition (Plain English)</label><textarea required value={rForm.condition} onChange={e => setRForm({...rForm, condition: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 min-h-[80px]" placeholder="e.g. User has severe back pain and sleeps on their back" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Force Recommend SKU</label><input required value={rForm.recommendedSku} onChange={e => setRForm({...rForm, recommendedSku: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200" placeholder="e.g. VITA-ORTHO-001" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Rule Weight / Priority (Higher number overrides lower)</label><input type="number" required value={rForm.weight} onChange={e => setRForm({...rForm, weight: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200" /></div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" checked={rForm.isActive} onChange={e => setRForm({...rForm, isActive: e.target.checked})} className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500" />
            <label htmlFor="isActive" className="text-sm text-slate-300">Rule is Active</label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-md">Save Rule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
