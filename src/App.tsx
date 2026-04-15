/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Calculator, RotateCcw, Copy, Check, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  inputs: string[];
  result: number[];
  timestamp: number;
}

export default function App() {
  const [inputs, setInputs] = useState<string[]>(['', '', '', '']);
  const [result, setResult] = useState<number[] | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('combo_calc_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('combo_calc_history', JSON.stringify(history));
  }, [history]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      newInputs[index] = value;
      setInputs(newInputs);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < 3) {
        inputRefs[index + 1].current?.focus();
      } else {
        calculate();
      }
    }
  };

  const calculate = () => {
    const numericInputs = inputs.map(val => parseFloat(val));
    
    if (numericInputs.some(isNaN)) {
      return;
    }

    const indexedInputs = numericInputs.map((val, idx) => ({ val, idx }));
    const sorted = [...indexedInputs].sort((a, b) => b.val - a.val);

    const fibValues = [5, 13, 21, 34];
    const resultsMap = new Array(4);

    sorted.forEach((item, rank) => {
      resultsMap[item.idx] = fibValues[rank];
    });

    setResult(resultsMap);

    // Add to history
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      inputs: [...inputs],
      result: resultsMap,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const resetFields = () => {
    setInputs(['', '', '', '']);
    setResult(null);
    setCopied(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('combo_calc_history');
  };

  const deleteRow = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const copyToClipboard = (textToCopy?: string) => {
    const text = textToCopy || (result ? result.join(', ') : '');
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isFormValid = inputs.every(val => val !== '' && !isNaN(parseFloat(val)));

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] font-sans selection:bg-sky-500/30 flex flex-col items-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[700px]"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20 shadow-[0_0_20px_rgba(56,189,248,0.1)]">
            <TrendingUp className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#f8fafc]">
            Combo <span className="text-sky-400">Calculator</span>
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-[#1e293b] rounded-[24px] p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-[#334155] backdrop-blur-sm relative overflow-hidden mb-8">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/5 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/5 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="grid grid-cols-2 gap-[20px] mb-8">
              {inputs.map((val, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="text-[12px] uppercase tracking-widest font-semibold text-[#94a3b8] ml-1">
                    Input {idx + 1}
                  </label>
                  <input
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="decimal"
                    value={val}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    placeholder="0"
                    className="w-full bg-[#0f172a] border border-[#334155] text-white px-4 py-[14px] rounded-[12px] font-sans text-base focus:outline-none focus:border-sky-400 transition-colors placeholder:text-slate-600"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculate}
                disabled={!isFormValid}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[12px] font-bold text-base transition-all shadow-lg ${
                  isFormValid 
                    ? 'bg-sky-400 hover:bg-sky-300 text-[#0f172a] shadow-sky-500/20' 
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Calculator className="w-5 h-5" />
                Calculate Results
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFields}
                className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-[12px] border border-[#334155] transition-all"
                title="Clear Fields"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Current Result Area */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="mb-12"
            >
              <div className="bg-[#0f172a] border border-[#334155] border-dashed rounded-[12px] p-6 relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] uppercase tracking-[0.05em] font-semibold text-[#94a3b8] mx-auto">
                    RESULT
                  </span>
                  <button 
                    onClick={() => copyToClipboard()}
                    className="absolute right-4 top-4 text-sky-400 hover:text-sky-300 transition-colors p-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="text-2xl font-bold tracking-[0.05em] text-sky-400 text-center">
                  {result.join(', ')}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Table */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full overflow-hidden rounded-2xl border border-[#334155] bg-[#1e293b]/50 backdrop-blur-sm"
          >
            <div className="p-4 border-bottom border-[#334155] bg-[#1e293b] flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#94a3b8]">Calculation History</h2>
              <span className="text-[10px] text-slate-500">{history.length} Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0f172a]/50 text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold">
                    <th className="px-4 py-3 border-b border-[#334155]">Inputs (1-4)</th>
                    <th className="px-4 py-3 border-b border-[#334155]">Result Sequence</th>
                    <th className="px-4 py-3 border-b border-[#334155] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {history.map((item) => (
                    <tr key={item.id} className="group hover:bg-sky-500/5 transition-colors border-b border-[#334155]/50 last:border-0">
                      <td className="px-4 py-4 font-mono text-xs text-slate-400">
                        {item.inputs.join(' | ')}
                      </td>
                      <td className="px-4 py-4 font-bold text-sky-400 tracking-wide">
                        {item.result.join(', ')}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => copyToClipboard(item.result.join(', '))}
                            className="p-2 text-slate-500 hover:text-sky-400 transition-colors"
                            title="Copy Result"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteRow(item.id)}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#1e293b]/30 border-t border-[#334155] flex justify-center">
              <button 
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All History
              </button>
            </div>
          </motion.div>
        )}

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 text-[11px] uppercase tracking-widest font-bold">
            By "ESTR Capital"
          </p>
        </div>
      </motion.div>
    </div>
  );
}
