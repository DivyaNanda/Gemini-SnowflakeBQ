import React, { useState } from 'react';
import { Play, Copy, Check, Download, AlertTriangle, Sparkles, Info, Cloud, CheckCircle2, ListChecks, Code2 } from 'lucide-react';
import { SQL_TEMPLATES } from '../constants';
import { translateSnowflakeToBigQuery } from '../services/geminiService';
import { TranslationResult } from '../types';

const Translator: React.FC = () => {
  const [snowflakeSql, setSnowflakeSql] = useState<string>(SQL_TEMPLATES[0].snowflake);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'explanation' | 'optimization'>('steps');

  const handleTemplateChange = (id: string) => {
    const template = SQL_TEMPLATES.find(t => t.id === id);
    if (template) {
      setSnowflakeSql(template.snowflake);
      setResult(null);
      setError(null);
    }
  };

  const handleTranslate = async () => {
    if (!snowflakeSql.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const translation = await translateSnowflakeToBigQuery(snowflakeSql);
      setResult(translation);
      setActiveTab('steps');
    } catch (err: any) {
      setError(err.message || 'Failed to translate SQL. Please check your API key or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.translatedSql) {
      navigator.clipboard.writeText(result.translatedSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result?.translatedSql) {
      const element = document.createElement('a');
      const file = new Blob([result.translatedSql], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'bigquery_translated.sql';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const hasArchitecturalNote = result && (
    result.translatedSql.includes('[GCP ARCHITECTURAL NOTE]') ||
    result.explanation.includes('[GCP ARCHITECTURAL NOTE]') ||
    snowflakeSql.toUpperCase().includes('TASK') ||
    snowflakeSql.toUpperCase().includes('STREAM') ||
    snowflakeSql.toUpperCase().includes('STORAGE INTEGRATION')
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Bar / Controls */}
      <div className="bg-brand-dark border-b border-brand-border p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-300">Select Template:</span>
          <select
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="bg-slate-900 border border-brand-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-snowflake"
          >
            {SQL_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading}
          className="bg-gradient-to-r from-brand-snowflake to-brand-bigquery hover:from-brand-snowflake/90 hover:to-brand-bigquery/90 text-white font-semibold px-6 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-brand-bigquery/20 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Translating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Translate & Optimize
            </>
          )}
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left: Snowflake Editor */}
        <div className="flex flex-col border-r border-brand-border h-full overflow-hidden">
          <div className="bg-slate-900/50 px-4 py-2 border-b border-brand-border flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-snowflake uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-snowflake"></span>
              Snowflake SQL Source
            </span>
          </div>
          <textarea
            value={snowflakeSql}
            onChange={(e) => setSnowflakeSql(e.target.value)}
            className="flex-1 bg-slate-950 p-6 font-mono text-sm text-slate-300 focus:outline-none resize-none leading-relaxed"
            placeholder="Paste your Snowflake SQL here..."
          />
        </div>

        {/* Right: BigQuery Output & Recommendations */}
        <div className="flex flex-col h-full overflow-hidden bg-slate-950">
          {/* Tabs */}
          <div className="bg-slate-900/50 border-b border-brand-border flex items-center justify-between px-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('steps')}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
                  activeTab === 'steps'
                    ? 'border-brand-bigquery text-brand-bigquery'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                3-Step Output
              </button>
              <button
                onClick={() => setActiveTab('explanation')}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
                  activeTab === 'explanation'
                    ? 'border-brand-bigquery text-brand-bigquery'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Architect Explanation
              </button>
              <button
                onClick={() => setActiveTab('optimization')}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
                  activeTab === 'optimization'
                    ? 'border-brand-bigquery text-brand-bigquery'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Optimization Advice
              </button>
            </div>

            {result && activeTab === 'steps' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  title="Download SQL File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-400 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold">Translation Error</h5>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                <Sparkles className="w-12 h-12 text-slate-700 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Ready for Translation</p>
                  <p className="text-xs text-slate-500 mt-1">Click "Translate & Optimize" to generate BigQuery SQL.</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-10 h-10 border-4 border-brand-bigquery border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400">Analyzing Snowflake dialect and optimizing for BigQuery...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                {/* GCP Architectural Note Alert */}
                {hasArchitecturalNote && (
                  <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border-l-4 border-brand-bigquery p-5 rounded-r-xl space-y-3 shadow-lg shadow-indigo-950/30">
                    <div className="flex items-center gap-2.5 text-brand-bigquery">
                      <Cloud className="w-5 h-5 animate-pulse" />
                      <h5 className="font-bold text-sm uppercase tracking-wider">GCP Architectural Integration Alert</h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This Snowflake script contains infrastructure, orchestration, or ingestion components (<span className="text-brand-snowflake font-semibold">TASKS, STREAMS, or STORAGE INTEGRATIONS</span>). Direct SQL translation is not recommended for these objects.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-brand-border">
                        <span className="text-[10px] font-bold text-brand-bigquery uppercase block mb-1">Orchestration</span>
                        <p className="text-[11px] text-slate-400">Use <strong className="text-slate-200">Cloud Composer</strong> (Managed Apache Airflow) or Cloud Workflows to replace Snowflake Tasks.</p>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-brand-border">
                        <span className="text-[10px] font-bold text-brand-bigquery uppercase block mb-1">Change Data Capture</span>
                        <p className="text-[11px] text-slate-400">Use <strong className="text-slate-200">Pub/Sub</strong> or Datastream to replace Snowflake Streams for real-time CDC.</p>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-brand-border">
                        <span className="text-[10px] font-bold text-brand-bigquery uppercase block mb-1">Data Ingestion</span>
                        <p className="text-[11px] text-slate-400">Use <strong className="text-slate-200">BigQuery Data Transfer Service</strong> (DTS) to replace Storage Integrations.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3-Step Output Tab */}
                {activeTab === 'steps' && (
                  <div className="space-y-6">
                    {/* Step 1: Complexity Assessment */}
                    <div className="bg-slate-900/40 border border-brand-border rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-snowflake/10 text-brand-snowflake text-xs font-bold">1</span>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Complexity Assessment</h4>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          result.complexityScore === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          result.complexityScore === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {result.complexityScore} Complexity
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {result.complexityAssessment}
                      </p>
                    </div>

                    {/* Step 2: Production-Ready BigQuery SQL */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-bigquery/10 text-brand-bigquery text-xs font-bold">2</span>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Production-Ready BigQuery SQL</h4>
                      </div>
                      <pre className="font-mono text-xs text-slate-300 bg-slate-900/30 p-4 rounded-lg border border-brand-border overflow-x-auto leading-relaxed">
                        {result.translatedSql}
                      </pre>
                    </div>

                    {/* Step 3: Structural and Dialect Changes Made */}
                    <div className="bg-slate-900/40 border border-brand-border rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">3</span>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Structural &amp; Dialect Changes Made</h4>
                      </div>
                      <ul className="space-y-2">
                        {result.structuralChanges && result.structuralChanges.map((change, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Warnings */}
                    {result.warnings && result.warnings.length > 0 && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg space-y-2">
                        <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          Migration Warnings ({result.warnings.length})
                        </h5>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                          {result.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Tab */}
                {activeTab === 'explanation' && (
                  <div className="space-y-4">
                    <div className="bg-slate-900/30 p-6 rounded-lg border border-brand-border space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-4 h-4 text-brand-bigquery" />
                        Architectural Mapping Decisions
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Optimization Tab */}
                {activeTab === 'optimization' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/30 p-6 rounded-lg border border-brand-border space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Partitioning Strategy
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {result.partitioningRecommendation}
                      </p>
                    </div>

                    <div className="bg-slate-900/30 p-6 rounded-lg border border-brand-border space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Clustering Strategy
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {result.clusteringRecommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Translator;
