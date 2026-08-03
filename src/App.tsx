import { useHashRoute, navigate } from '@/lib/router';
import { ToastProvider } from '@/components/Toast';
import { OptionsProvider } from '@/lib/optionsContext';
import { ListPage } from '@/pages/ListPage';
import { FormPage } from '@/pages/FormPage';
import { LaunchWizardPage } from '@/pages/LaunchWizardPage';
import { InterviewStatusPage } from '@/pages/InterviewStatusPage';
import { InterviewReportPage } from '@/pages/InterviewReportPage';
import { PersonaLibraryPage } from '@/pages/PersonaLibraryPage';
import { PersonaFormPage } from '@/pages/PersonaFormPage';
import { RubricLibraryPage } from '@/pages/RubricLibraryPage';
import { RubricFormPage } from '@/pages/RubricFormPage';
import { API_MODE, isMockMode } from '@/lib/config';
import type { InterviewType } from '@/types/interviewConfig';
import { Bot, List, Rocket, Users, ClipboardList, Beaker } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  matchPrefix?: boolean;
}

const NAV: NavItem[] = [
  { path: '/configs', label: 'Behavior Configs', icon: <List className="h-4 w-4" />, matchPrefix: true },
  { path: '/settings/personas', label: 'Personas', icon: <Users className="h-4 w-4" />, matchPrefix: true },
  { path: '/settings/rubrics', label: 'Scoring Rubrics', icon: <ClipboardList className="h-4 w-4" />, matchPrefix: true },
  { path: '/launch', label: 'Launch Interview', icon: <Rocket className="h-4 w-4" />, matchPrefix: true },
];

const isActive = (current: string, item: NavItem): boolean =>
  item.matchPrefix
    ? current === item.path || current.startsWith(item.path + '/')
    : current === item.path;

function App() {
  const route = useHashRoute();
  const { path, params } = route;

  let page: React.ReactNode;
  if (path === '/configs/new') {
    page = <FormPage mode="new" />;
  } else if (path === '/configs/edit') {
    page = <FormPage mode="edit" configId={params.id} />;
  } else if (path === '/settings/personas/new') {
    page = <PersonaFormPage mode="new" />;
  } else if (path === '/settings/personas/edit') {
    page = <PersonaFormPage mode="edit" personaId={params.id} />;
  } else if (path === '/settings/rubrics/new') {
    page = <RubricFormPage mode="new" initialType={(params.type as InterviewType) || 'technical'} />;
  } else if (path === '/settings/rubrics/edit') {
    page = <RubricFormPage mode="edit" rubricId={params.id} />;
  } else if (path === '/launch') {
    page = <LaunchWizardPage />;
  } else if (path === '/launch/status') {
    page = <InterviewStatusPage token={params.token} />;
  } else if (path === '/interview/report') {
    page = <InterviewReportPage platformInterviewId={params.id ?? 'INTV-2026-00142'} />;
  } else if (path === '/settings/personas') {
    page = <PersonaLibraryPage />;
  } else if (path === '/settings/rubrics') {
    page = <RubricLibraryPage />;
  } else {
    page = <ListPage />;
  }

  return (
    <ToastProvider>
      <OptionsProvider>
        <div className="min-h-screen flex bg-slate-50">
          {/* Sidebar */}
          <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
            <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-900">Interview Bot</span>
                <span className="text-[11px] text-slate-400">Config Console</span>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {NAV.map((item) => {
                const active = isActive(path, item);
                return (
                  <button key={item.path} onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}>
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="px-4 py-4 border-t border-slate-100">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-md ${isMockMode() ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <Beaker className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold text-slate-700">{isMockMode() ? 'Mock API' : 'Real API'}</span>
                  <span className="text-[11px] text-slate-400">VITE_API_MODE={API_MODE}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile top bar */}
            <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-slate-900">Interview Bot</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${isMockMode() ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isMockMode() ? 'Mock' : 'Real'}
              </span>
            </header>

            {/* Mobile nav */}
            <nav className="md:hidden flex gap-1 px-3 py-2 border-b border-slate-200 bg-white overflow-x-auto">
              {NAV.map((item) => {
                const active = isActive(path, item);
                return (
                  <button key={item.path} onClick={() => navigate(item.path)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                      active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}>
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {page}
              </div>
            </main>
          </div>
        </div>
      </OptionsProvider>
    </ToastProvider>
  );
}

export default App;
