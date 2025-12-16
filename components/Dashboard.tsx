import React, { useMemo, useState } from 'react';
import { AnalysisResult, CaseCategory, LegalCase } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const COLORS = {
  [CaseCategory.CRIMINAL]: '#ef4444', // Red-500
  [CaseCategory.SERVICE]: '#3b82f6', // Blue-500
  [CaseCategory.CIVIL]: '#10b981',   // Emerald-500
  [CaseCategory.FAMILY]: '#f59e0b',  // Amber-500
  [CaseCategory.ELECTION]: '#8b5cf6', // Violet-500
  [CaseCategory.TAX]: '#06b6d4',     // Cyan-500
  [CaseCategory.OTHER]: '#64748b',   // Slate-500
};

export const Dashboard: React.FC<DashboardProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<CaseCategory | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(CaseCategory).forEach(c => counts[c] = 0);
    
    result.cases.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
    })).filter(item => item.value > 0);
  }, [result.cases]);

  const filteredCases = useMemo(() => {
    let cases = result.cases;
    
    // Filter by Category
    if (activeTab !== 'All') {
      cases = cases.filter(c => c.category === activeTab);
    }
    
    // Filter by Date
    if (dateFilter) {
      cases = cases.filter(c => c.date === dateFilter);
    }

    return cases;
  }, [activeTab, dateFilter, result.cases]);

  const uniqueDates = useMemo(() => {
    const dates = new Set(result.cases.map(c => c.date).filter(Boolean));
    return Array.from(dates).sort();
  }, [result.cases]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Case Analysis Report</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-slate-500">
            <span>File: <span className="font-medium text-slate-700">{result.fileName}</span></span>
            <span className="hidden sm:inline">•</span>
            <span>Uploaded: <span className="font-medium text-slate-700">{result.uploadDate.toLocaleString()}</span></span>
            <span className="hidden sm:inline">•</span>
            <span>Total Cases: <span className="font-medium text-slate-700">{result.cases.length}</span></span>
          </div>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
        >
          Analyze Another File
        </button>
      </div>

      {/* Stats and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 self-start">Distribution</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as CaseCategory] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-semibold text-slate-700 mb-4">Summary</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.name} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-sm text-slate-500 font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold" style={{ color: COLORS[stat.name as CaseCategory] }}>
                    {stat.value}
                  </p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 p-4 gap-4 bg-slate-50/50">
          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 custom-scrollbar pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'All' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Cases
            </button>
            {Object.values(CaseCategory).map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === category ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
             <label htmlFor="dateFilter" className="text-sm font-medium text-slate-700 whitespace-nowrap">
               Filter by Date:
             </label>
             <input
               type="date"
               id="dateFilter"
               value={dateFilter}
               onChange={(e) => setDateFilter(e.target.value)}
               className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
             />
             {dateFilter && (
                <button 
                  onClick={() => setDateFilter('')}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Clear
                </button>
             )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-200 w-24">Category</th>
                <th className="p-4 font-semibold border-b border-slate-200 w-28">Date</th>
                <th className="p-4 font-semibold border-b border-slate-200 w-32">Case #</th>
                <th className="p-4 font-semibold border-b border-slate-200">Title & Summary</th>
                <th className="p-4 font-semibold border-b border-slate-200">Lawyers</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <p className="text-lg font-medium mb-1">No cases found</p>
                    <p className="text-sm">Try adjusting your category or date filters.</p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 align-top">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: `${COLORS[c.category]}20`, // 20% opacity
                          color: COLORS[c.category],
                        }}
                      >
                        {c.category}
                      </span>
                    </td>
                    <td className="p-4 align-top whitespace-nowrap font-medium text-slate-600">
                       {c.date || <span className="text-slate-400 italic">N/A</span>}
                    </td>
                    <td className="p-4 align-top font-medium text-slate-900">
                      {c.caseNumber}
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-semibold text-slate-800 mb-1">{c.title}</div>
                      <div className="text-slate-500 text-xs leading-relaxed">{c.summary}</div>
                    </td>
                    <td className="p-4 align-top text-xs text-slate-500">
                      {c.lawyers.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {c.lawyers.map((l, idx) => (
                            <li key={idx} className="truncate max-w-[200px]" title={l}>{l}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="italic opacity-50">Not listed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-right">
           Showing {filteredCases.length} of {result.cases.length} records
        </div>
      </div>
    </div>
  );
};