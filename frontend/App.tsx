import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Translator from './components/Translator';
import BatchMigrator from './components/BatchMigrator';
import ArchitectChat from './components/ArchitectChat';
import MigrationGuide from './components/MigrationGuide';
import CostSecurityGuide from './components/CostSecurityGuide';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden bg-slate-950">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'translator' && <Translator />}
        {activeTab === 'batch' && <BatchMigrator />}
        {activeTab === 'chat' && <ArchitectChat />}
        {activeTab === 'guide' && <MigrationGuide />}
        {activeTab === 'cost-security' && <CostSecurityGuide />}
      </main>
    </div>
  );
};

export default App;
