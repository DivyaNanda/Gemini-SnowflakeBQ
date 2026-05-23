import React, { useState } from 'react';
import { ShieldAlert, DollarSign, Lock, Key, AlertTriangle, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';

const CostSecurityGuide: React.FC = () => {
  const [monthlyRequests, setMonthlyRequests] = useState<number>(5000);
  const [avgTokensPerRequest, setAvgTokensPerRequest] = useState<number>(2000);

  // Cloud Run Free Tier: 2 Million requests per month
  const cloudRunCost = monthlyRequests <= 2000000 ? 0 : (monthlyRequests - 2000000) * 0.0000004;

  // Gemini 2.5 Flash Pricing: $0.075 per 1M input tokens, $0.30 per 1M output tokens
  // Let's assume average cost of $0.15 per 1M tokens combined
  const geminiCost = (monthlyRequests * avgTokensPerRequest * 0.00000015);

  const totalEstimatedCost = cloudRunCost + geminiCost;

  return (
    <div className="p-8 overflow-y-auto h-full space-y-8 bg-slate-950">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-brand-bigquery" />
          GCP Deployment Cost &amp; Security Guide
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Answers to your questions about Cloud Run hosting costs, Vertex AI API usage, and securing your public URL.
        </p>
      </div>

      {/* Quick Answer Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          Will this deployment cost money on my Google Cloud account?
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>Short Answer:</strong> If you have low to moderate traffic, it will likely cost you <strong>$0.00 or pennies per month</strong>. 
          Google Cloud Run has an extremely generous free tier, and Gemini 2.5 Flash is highly cost-optimized. However, because your URL is public, you must take steps to secure your API key and prevent abuse.
        </p>
      </div>

      {/* Cost Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cloud Run Cost Card */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-brand-bigquery">
            <DollarSign className="w-5 h-5" />
            <h4 className="font-bold text-base text-white">Cloud Run Hosting Costs</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cloud Run charges only when your container is actively processing requests. When no one is using the app, it scales down to <strong>zero instances</strong> and costs absolutely nothing.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg border border-brand-border space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase block">Cloud Run Monthly Free Tier:</span>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>First 2,000,000 requests are 100% free</li>
              <li>360,000 GB-seconds of memory free</li>
              <li>180,000 vCPU-seconds free</li>
            </ul>
          </div>
        </div>

        {/* Vertex AI / Gemini Cost Card */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-brand-snowflake">
            <Sparkles className="w-5 h-5" />
            <h4 className="font-bold text-base text-white">Vertex AI (Gemini API) Costs</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gemini 2.5 Flash is Google's most cost-efficient high-performance model. You are billed strictly per token (words/characters) processed.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg border border-brand-border space-y-2">
            <span className="text-xs font-bold text-brand-snowflake uppercase block">Gemini 2.5 Flash Pricing:</span>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Input: $0.075 per 1,000,000 tokens</li>
              <li>Output: $0.30 per 1,000,000 tokens</li>
              <li>Average translation cost: Less than $0.001</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Cost Estimator */}
      <div className="bg-brand-card border border-brand-border p-6 rounded-xl space-y-6">
        <div>
          <h4 className="font-bold text-base text-white">Interactive Monthly Cost Estimator</h4>
          <p className="text-xs text-slate-400 mt-1">Adjust the sliders to estimate your exact monthly GCP bill.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Expected Monthly Translations/Requests: <span className="text-white font-bold">{monthlyRequests.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={monthlyRequests}
                onChange={(e) => setMonthlyRequests(parseInt(e.target.value))}
                className="w-full accent-brand-bigquery"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Average Tokens per Translation: <span className="text-white font-bold">{avgTokensPerRequest.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={avgTokensPerRequest}
                onChange={(e) => setAvgTokensPerRequest(parseInt(e.target.value))}
                className="w-full accent-brand-snowflake"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-brand-border flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Cloud Run Compute Cost:</span>
                <span className="font-semibold text-white">${cloudRunCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Vertex AI API Cost:</span>
                <span className="font-semibold text-white">${geminiCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-brand-border pt-3 flex justify-between text-sm font-bold text-white">
                <span>Total Estimated Monthly Bill:</span>
                <span className="text-emerald-400">${totalEstimatedCost.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-4">
              *Estimates are based on standard GCP pay-as-you-go pricing and assume no other active workloads in your project.
            </p>
          </div>
        </div>
      </div>

      {/* Security Checklist */}
      <div className="bg-brand-card border border-brand-border p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Lock className="w-5 h-5" />
          <h4 className="font-bold text-base text-white">Critical Security Checklist for Public URLs</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Because your Cloud Run URL is accessible by anyone, you must protect your API key from being stolen or abused. Follow these best practices immediately:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-brand-border space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold text-white">1. Restrict Your API Key</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Go to the <strong>GCP Console &gt; APIs &amp; Services &gt; Credentials</strong>. Edit your API Key and restrict it to only allow calls to the <strong>Generative Language API</strong>. This prevents the key from being used for other expensive GCP services.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-brand-border space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold text-white">2. Set Up Budget Alerts</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Go to <strong>Billing &gt; Budgets &amp; Alerts</strong>. Create a budget of $10.00/month and configure email notifications when spending reaches 50%, 90%, and 100% of the budget.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-brand-border space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold text-white">3. Set API Quotas</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In the GCP Console, search for <strong>Generative Language API</strong>, click on <strong>Quotas &amp; System Limits</strong>, and set a daily limit on requests to prevent automated bots from spamming your endpoint.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-brand-border space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold text-white">4. Cloud Run Ingress Controls</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If this is for internal team use, you can restrict Cloud Run ingress to only allow traffic from your corporate VPC or set up Google Cloud Identity-Aware Proxy (IAP) for user authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSecurityGuide;
