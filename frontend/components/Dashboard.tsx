import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calculator, TrendingUp, ShieldCheck, Zap, HelpCircle, Cloud } from 'lucide-react';
import { WAREHOUSE_SIZES } from '../constants';
import { CostCalculatorInput } from '../types';

const complexityData = [
  { name: 'Low', count: 12, fill: '#10B981' },
  { name: 'Medium', count: 18, fill: '#F59E0B' },
  { name: 'High', count: 6, fill: '#EF4444' },
];

const historyData = [
  { date: 'Mon', queries: 4 },
  { date: 'Tue', queries: 8 },
  { date: 'Wed', queries: 15 },
  { date: 'Thu', queries: 22 },
  { date: 'Fri', queries: 30 },
  { date: 'Sat', queries: 32 },
  { date: 'Sun', queries: 36 },
];

const Dashboard: React.FC = () => {
  // Cost Calculator State
  const [calcInput, setCalcInput] = useState<CostCalculatorInput>({
    snowflakeWarehouseSize: 'Medium',
    snowflakeHoursPerDay: 8,
    snowflakeDaysPerMonth: 22,
    bigqueryStorageTb: 10,
    bigqueryQueryVolumeTb: 50,
  });

  // Calculate Snowflake Costs
  const selectedWh = WAREHOUSE_SIZES.find(w => w.size === calcInput.snowflakeWarehouseSize) || WAREHOUSE_SIZES[2];
  const snowflakeCreditsPerMonth = selectedWh.creditsPerHour * calcInput.snowflakeHoursPerDay * calcInput.snowflakeDaysPerMonth;
  const snowflakeCostPerCredit = 3.00; // Average Enterprise Credit Cost
  const estimatedSnowflakeCost = snowflakeCreditsPerMonth * snowflakeCostPerCredit;

  // Calculate BigQuery Costs (On-Demand pricing model: $5 per TB scanned, $20 per TB storage)
  const bigqueryStorageCost = calcInput.bigqueryStorageTb * 20; // $20/TB active storage
  const bigqueryQueryCost = calcInput.bigqueryQueryVolumeTb * 5; // $5/TB scanned
  const estimatedBigQueryCost = bigqueryStorageCost + bigqueryQueryCost;

  const monthlySavings = Math.max(0, estimatedSnowflakeCost - estimatedBigQueryCost);
  const savingsPercentage = estimatedSnowflakeCost > 0 ? (monthlySavings / estimatedSnowflakeCost) * 100 : 0;

  return (
    <div className="p-8 overflow-y-auto h-full space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Migration Command Center</h2>
          <p className="text-slate-400 text-sm">Real-time insights, translation metrics, and architectural cost modeling.</p>
        </div>
        <div className="bg-slate-900 border border-brand-border px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-medium text-slate-300">Connected to Google Cloud Vertex AI</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-brand-card border border-brand-border p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-snowflake/5 rounded-full blur-xl"></div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Translated</p>
          <h3 className="text-3xl font-bold text-white mt-2">36</h3>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12% this week
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-bigquery/5 rounded-full blur-xl"></div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg. Translation Accuracy</p>
          <h3 className="text-3xl font-bold text-white mt-2">98.4%</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified by Gemini 2.5
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Complexity Queries</p>
          <h3 className="text-3xl font-bold text-white mt-2">6</h3>
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Requires manual review
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Est. Monthly Savings</p>
          <h3 className="text-3xl font-bold text-emerald-400 mt-2">${monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          <p className="text-xs text-slate-400 mt-2">Based on active cost model</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Complexity Breakdown */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-white mb-4">Query Complexity Breakdown</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complexityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1E293B' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {complexityData.map((entry, index) => (
                    <rect key={`rect-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Translation History */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-white mb-4">Translation Velocity</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285F4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: '#1E293B' }} />
                <Area type="monotone" dataKey="queries" stroke="#4285F4" fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Architectural Migration Paths & Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-brand-border p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-brand-snowflake">
            <Zap className="w-5 h-5" />
            <h4 className="font-semibold text-sm text-white">Slot Optimization</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            BigQuery uses clustering and partitioning to prune data blocks. Always map Snowflake's <code className="text-brand-snowflake">CLUSTER BY</code> to BigQuery's native <code className="text-brand-bigquery">PARTITION BY</code> and <code className="text-brand-bigquery">CLUSTER BY</code> to minimize slot consumption.
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-brand-bigquery">
            <Cloud className="w-5 h-5" />
            <h4 className="font-semibold text-sm text-white">Orchestration Migration</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Snowflake <code className="text-brand-snowflake">TASKS</code> should be migrated to <strong className="text-slate-200">Google Cloud Composer</strong> (Managed Airflow) or Cloud Workflows for enterprise-grade scheduling and dependency management.
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-semibold text-sm text-white">Real-time CDC Ingestion</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Replace Snowflake <code className="text-brand-snowflake">STREAMS</code> with <strong className="text-slate-200">Google Cloud Pub/Sub</strong> and Datastream to achieve low-latency, serverless change data capture (CDC) pipelines.
          </p>
        </div>
      </div>

      {/* Interactive Cost Savings Calculator */}
      <div className="bg-brand-card border border-brand-border p-8 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-bigquery/10 rounded-lg text-brand-bigquery">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Snowflake vs. BigQuery Cost Modeler</h4>
            <p className="text-slate-400 text-xs">Estimate your potential savings by migrating workloads to BigQuery.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs */}
          <div className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Snowflake Warehouse Size</label>
                <select
                  value={calcInput.snowflakeWarehouseSize}
                  onChange={(e) => setCalcInput({ ...calcInput, snowflakeWarehouseSize: e.target.value })}
                  className="w-full bg-slate-950 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-snowflake"
                >
                  {WAREHOUSE_SIZES.map((w) => (
                    <option key={w.size} value={w.size}>
                      {w.size} ({w.creditsPerHour} Credit/hr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Hours Run per Day</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={calcInput.snowflakeHoursPerDay}
                  onChange={(e) => setCalcInput({ ...calcInput, snowflakeHoursPerDay: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-snowflake"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Active Storage (TB)</label>
                <input
                  type="number"
                  min="1"
                  value={calcInput.bigqueryStorageTb}
                  onChange={(e) => setCalcInput({ ...calcInput, bigqueryStorageTb: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-bigquery"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Query Volume Scanned (TB)</label>
                <input
                  type="number"
                  min="1"
                  value={calcInput.bigqueryQueryVolumeTb}
                  onChange={(e) => setCalcInput({ ...calcInput, bigqueryQueryVolumeTb: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-bigquery"
                />
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-slate-950 border border-brand-border p-6 rounded-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <span className="text-xs text-slate-400">Snowflake Monthly Cost</span>
                <span className="text-sm font-semibold text-white">${estimatedSnowflakeCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <span className="text-xs text-slate-400">BigQuery Monthly Cost</span>
                <span className="text-sm font-semibold text-white">${estimatedBigQueryCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium text-slate-200">Estimated Savings</span>
                <span className="text-lg font-bold text-emerald-400">
                  ${monthlySavings.toLocaleString()} ({savingsPercentage.toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                BigQuery pricing is modeled on standard active storage ($20/TB) and On-Demand query scanning ($5/TB). Actual savings may vary based on slot reservations.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
