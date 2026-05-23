import React, { useState } from 'react';
import { Files, Play, Trash2, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { translateSnowflakeToBigQuery } from '../services/geminiService';
import { BatchItem } from '../types';

const BatchMigrator: React.FC = () => {
  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleAddSampleFiles = () => {
    const samples: BatchItem[] = [
      {
        id: '1',
        name: 'customer_dim_ddl.sql',
        snowflakeSql: 'CREATE TABLE customer_dim (id VARCHAR(50), details VARIANT, balance NUMBER(10,2));',
        status: 'pending'
      },
      {
        id: '2',
        name: 'sales_fact_flatten.sql',
        snowflakeSql: 'SELECT s.id, f.value:item::string FROM sales s, LATERAL FLATTEN(input => s.items) f;',
        status: 'pending'
      },
      {
        id: '3',
        name: 'monthly_reporting_qualify.sql',
        snowflakeSql: 'SELECT emp_id, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) as rn FROM emps QUALIFY rn = 1;',
        status: 'pending'
      }
    ];
    setQueue([...queue, ...samples]);
  };

  const handleClearQueue = () => {
    setQueue([]);
  };

  const handleRemoveItem = (id: string) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  const handleProcessBatch = async () => {
    if (queue.length === 0) return;
    setProcessing(true);

    // Process sequentially to respect API limits and show progress
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'completed') continue;

      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'processing' } : q));

      try {
        const result = await translateSnowflakeToBigQuery(item.snowflakeSql);
        setQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          status: 'completed',
          translatedSql: result.translatedSql,
          complexity: result.complexityScore
        } : q));
      } catch (err: any) {
        setQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          status: 'failed',
          error: err.message || 'Translation failed'
        } : q));
      }
    }
    setProcessing(false);
  };

  const handleDownloadAll = () => {
    queue.forEach(item => {
      if (item.translatedSql) {
        const element = document.createElement('a');
        const file = new Blob([item.translatedSql], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `bq_${item.name}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    });
  };

  return (
    <div className="p-8 overflow-y-auto h-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Batch SQL Migrator</h2>
          <p className="text-slate-400 text-sm">Queue multiple Snowflake SQL scripts or DDL files for bulk translation.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddSampleFiles}
            className="bg-slate-900 border border-brand-border hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Load Sample Queue
          </button>
          <button
            onClick={handleClearQueue}
            className="bg-slate-900 border border-brand-border hover:bg-slate-800 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Clear Queue
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Queue List */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl flex flex-col h-[500px] overflow-hidden">
          <div className="bg-slate-900/50 px-6 py-4 border-b border-brand-border flex justify-between items-center">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Files className="w-4 h-4 text-brand-snowflake" />
              Migration Queue ({queue.length} files)
            </span>
            {queue.some(q => q.status === 'completed') && (
              <button
                onClick={handleDownloadAll}
                className="text-xs font-semibold text-brand-bigquery hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download All Completed
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-brand-border">
            {queue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Files className="w-12 h-12 text-slate-700" />
                <p className="text-sm">Queue is empty.</p>
                <p className="text-xs text-slate-600">Load sample files or paste scripts to begin.</p>
              </div>
            ) : (
              queue.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-900/30 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-md">{item.snowflakeSql}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    {item.status === 'pending' && (
                      <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-medium">
                        Pending
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="text-xs bg-brand-bigquery/10 text-brand-bigquery px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" />
                        Completed ({item.complexity})
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-xs bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-xl flex flex-col justify-between h-[500px]">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Batch Execution</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Process all queued Snowflake SQL scripts. The AI will translate each script sequentially, applying BigQuery best practices, and flag any high-complexity patterns.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Queue:</span>
                <span className="font-semibold text-white">{queue.length}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Completed:</span>
                <span className="font-semibold text-emerald-400">
                  {queue.filter(q => q.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Failed:</span>
                <span className="font-semibold text-red-400">
                  {queue.filter(q => q.status === 'failed').length}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleProcessBatch}
            disabled={processing || queue.length === 0}
            className="w-full bg-gradient-to-r from-brand-snowflake to-brand-bigquery hover:from-brand-snowflake/90 hover:to-brand-bigquery/90 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-bigquery/20 transition-all duration-200 disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Batch...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Batch Migration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchMigrator;
