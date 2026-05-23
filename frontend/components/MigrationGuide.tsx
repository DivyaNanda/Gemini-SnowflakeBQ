import React, { useState } from 'react';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { MIGRATION_RULES } from '../constants';

const MigrationGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Data Types', 'Functions', 'DDL/DML', 'Advanced'];

  const filteredRules = MIGRATION_RULES.filter((rule) => {
    const matchesSearch =
      rule.snowflake.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.bigquery.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || rule.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 overflow-y-auto h-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-snowflake" />
          Migration Cheat Sheet &amp; Best Practices
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Quick reference guide for mapping Snowflake SQL dialects to Google BigQuery standard SQL.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-brand-card border border-brand-border p-4 rounded-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search syntax, functions, or types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-brand-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-snowflake"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-brand-snowflake text-white'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-brand-snowflake px-2.5 py-1 rounded-full border border-brand-border">
                  {rule.category}
                </span>
                <h3 className="text-base font-semibold text-white mt-2 flex items-center gap-3">
                  <span className="text-brand-snowflake">{rule.snowflake}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="text-brand-bigquery">{rule.bigquery}</span>
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">{rule.description}</p>

            {/* Code Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-lg border border-brand-border">
                <span className="text-[10px] font-bold text-brand-snowflake uppercase tracking-wider block mb-2">
                  Snowflake
                </span>
                <pre className="font-mono text-xs text-slate-300 overflow-x-auto">{rule.exampleSnowflake}</pre>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-brand-border">
                <span className="text-[10px] font-bold text-brand-bigquery uppercase tracking-wider block mb-2">
                  BigQuery
                </span>
                <pre className="font-mono text-xs text-slate-300 overflow-x-auto">{rule.exampleBigQuery}</pre>
              </div>
            </div>
          </div>
        ))}

        {filteredRules.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No matching migration rules found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationGuide;
