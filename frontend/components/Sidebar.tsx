import React from 'react';
import { LayoutDashboard, Code2, Files, MessageSquare, BookOpen, Sparkles, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'translator', name: 'SQL Translator', icon: Code2 },
    { id: 'batch', name: 'Batch Migration', icon: Files },
    { id: 'chat', name: 'Architect Chat', icon: MessageSquare },
    { id: 'guide', name: 'Migration Guide', icon: BookOpen },
    { id: 'cost-security', name: 'GCP Cost & Security', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-brand-dark border-r border-brand-border flex flex-col justify-between h-full">
      <div>
        {/* Logo / Header */}
        <div className="p-6 border-b border-brand-border flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-brand-snowflake to-brand-bigquery rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-brand-snowflake to-brand-bigquery bg-clip-text text-transparent">
              Snow2BQ
            </h1>
            <span className="text-xs text-slate-400">Migration Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-snowflake/10 to-brand-bigquery/10 text-white border-l-4 border-brand-bigquery'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-bigquery' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Persona Info */}
      <div className="p-4 border-t border-brand-border bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
            AI
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Gemini 2.5 Architect</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active & Ready
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
