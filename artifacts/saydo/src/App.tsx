import { useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Command,
  FileText,
  Fingerprint,
  Layers3,
  LockKeyhole,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Play,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { Route, Switch, Link, useLocation, Router as WouterRouter } from 'wouter';

type RequestItem = { id: string; text: string; createdAt: Date };
type ActionPreview = {
  id: string;
  serviceLabel: string;
  title: string;
  summary: string;
  details: string[];
  status: 'pending' | 'approved' | 'dismissed' | 'simulated';
};

const queryClient = new QueryClient();
const exampleRequests = [
  'Send Maya the meeting notes from today',
  'Add a reminder to review the budget on Friday',
  'Draft a reply thanking Jordan for the introduction',
];

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" data-testid="brand-saydo">
      <div className={`brand-symbol ${small ? 'brand-symbol-small' : ''}`} aria-hidden="true">
        <span />
        <span />
      </div>
      <span className="font-extrabold tracking-[-.07em] text-[21px] leading-none">saydo</span>
    </div>
  );
}

function Header() {
  const [location] = useLocation();
  return (
    <header className="topbar">
      <Link href="/" className="brand-link" data-testid="link-home"><BrandMark /></Link>
      <nav className="topnav" aria-label="Main navigation">
        <Link href="/" className={`nav-link ${location === '/' ? 'nav-active' : ''}`} data-testid="link-workspace">Workspace</Link>
        <Link href="/architecture" className={`nav-link ${location === '/architecture' ? 'nav-active' : ''}`} data-testid="link-how-it-works">How it works</Link>
      </nav>
      <div className="header-note"><span className="live-dot" /> Local demo <span className="header-divider">/</span> no accounts connected</div>
    </header>
  );
}

function makePreview(text: string): ActionPreview {
  const lower = text.toLowerCase();
  if (lower.includes('remind') || lower.includes('calendar') || lower.includes('friday')) {
    return {
      id: crypto.randomUUID(),
      serviceLabel: 'Reminder · proposed',
      title: 'Create a reminder',
      summary: 'A reminder based on your request, ready for your review.',
      details: ['Task: ' + text.replace(/^(please\s+)?(add|set|create)\s+(a\s+)?(reminder|remind me to)\s*/i, '').replace(/\.$/, ''), 'Timing: Friday', 'Destination: Reminders'],
      status: 'pending',
    };
  }
  if (lower.includes('reply') || lower.includes('email') || lower.includes('send') || lower.includes('message')) {
    return {
      id: crypto.randomUUID(),
      serviceLabel: 'Email · proposed',
      title: lower.includes('draft') ? 'Draft an email reply' : 'Prepare a message',
      summary: 'A message prepared from your request. You can review it before anything happens.',
      details: ['To: ' + (text.match(/\b(?:to|send)\s+([A-Z][a-z]+)/)?.[1] ?? 'Recipient to confirm'), 'Message: ' + text, 'Action: Create a draft only'],
      status: 'pending',
    };
  }
  return {
    id: crypto.randomUUID(),
    serviceLabel: 'Workspace · proposed',
    title: 'Prepare a task',
    summary: 'A suggested next step based on what you asked for.',
    details: ['Request: ' + text, 'Action: Prepare for your review', 'No external service will be contacted'],
    status: 'pending',
  };
}

function statusCopy(status: ActionPreview['status']) {
  if (status === 'pending') return 'Awaiting your approval';
  if (status === 'dismissed') return 'Dismissed';
  if (status === 'simulated' || status === 'approved') return 'Simulation complete';
  return 'Pending review';
}

function PreviewCard({
  request,
  preview,
  onApprove,
  onDismiss,
  onClear,
}: {
  request: RequestItem;
  preview: ActionPreview;
  onApprove: () => void;
  onDismiss: () => void;
  onClear: () => void;
}) {
  const pending = preview.status === 'pending';
  const simulated = preview.status === 'simulated' || preview.status === 'approved';
  return (
    <section className="preview-card enter" aria-labelledby="preview-heading" data-testid={`card-preview-${preview.id}`}>
      <div className="preview-top">
        <div className="preview-label"><span className="tiny-square"><Sparkles size={13} /></span> Proposed action</div>
        <span className={`status-pill ${pending ? 'status-pending' : simulated ? 'status-simulated' : 'status-dismissed'}`} data-testid={`status-action-${preview.id}`}>
          <span className="status-dot" />{statusCopy(preview.status)}
        </span>
      </div>
      <div className="preview-content">
        <div className="preview-service"><span className="service-icon"><Mail size={17} /></span><span>{preview.serviceLabel}</span><span className="service-chevron"><ChevronRight size={14} /></span></div>
        <h2 id="preview-heading" data-testid={`text-action-title-${preview.id}`}>{preview.title}</h2>
        <p className="preview-summary">{preview.summary}</p>
        <div className="details-box">
          <div className="detail-heading"><span>WHAT SAYDO WOULD DO</span><MoreHorizontal size={16} /></div>
          {preview.details.map((detail, index) => <div className="detail-row" key={index}><span className="detail-bullet">{String(index + 1).padStart(2, '0')}</span><span>{detail}</span></div>)}
        </div>
        <div className="request-origin">
          <div className="origin-icon"><MessageSquareText size={15} /></div>
          <div><span className="origin-caption">YOUR REQUEST</span><p data-testid={`text-request-${request.id}`}>{request.text}</p></div>
        </div>
      </div>
      {pending ? (
        <>
          <div className="approval-note"><LockKeyhole size={15} /><span>Nothing happens until you approve. This demo only simulates the result.</span></div>
          <div className="preview-actions">
            <button className="button button-quiet" onClick={onDismiss} data-testid="button-dismiss"><X size={16} /> Dismiss</button>
            <button className="button button-primary" onClick={onApprove} data-testid="button-approve"><Check size={16} /> Approve &amp; simulate</button>
          </div>
        </>
      ) : simulated ? (
        <div className="simulation-result" role="status" data-testid="notice-simulation">
          <div className="sim-check"><CheckCircle2 size={18} /></div>
          <div className="sim-copy"><strong>Simulation only — no external action taken</strong><span>Your approval was recorded locally. Nothing was sent, changed, or executed outside this page.</span></div>
          <button className="text-button" onClick={onClear} aria-label="Clear simulation" data-testid="button-clear-simulation"><X size={16} /></button>
        </div>
      ) : (
        <div className="dismissed-result" role="status" data-testid="notice-dismissed"><span>This proposal was dismissed. Nothing was sent or changed.</span><button className="text-button" onClick={onClear} data-testid="button-clear-dismissed">Clear</button></div>
      )}
    </section>
  );
}

function Home() {
  const [text, setText] = useState('');
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [preview, setPreview] = useState<ActionPreview | null>(null);
  const [error, setError] = useState('');

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Tell SAYDO what you would like help with.');
      return;
    }
    const nextRequest = { id: crypto.randomUUID(), text: trimmed, createdAt: new Date() };
    setRequest(nextRequest);
    setPreview(makePreview(trimmed));
    setText('');
    setError('');
  }
  function chooseExample(example: string) {
    setText(example);
    setError('');
    document.getElementById('request-input')?.focus();
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="home-main saydo-grid">
        <div className="hero-copy enter">
          <div className="eyebrow"><span className="eyebrow-mark"><Command size={13} /></span> YOUR PERSONAL ACTION DESK</div>
          <h1>You say.<br /><em>It does.</em></h1>
          <p className="hero-subtitle">One clear request. One proposed action.<br className="desktop-break" /> You stay in control at every step.</p>
        </div>

        <div className="workspace enter-delay">
          <div className="composer-panel">
            <div className="composer-topline">
              <div className="composer-title"><span className="step-count">01</span><span>Start with what you need</span></div>
              <span className="local-chip"><span className="local-chip-dot" /> DEMO MODE</span>
            </div>
            <form onSubmit={submitRequest} noValidate>
              <label className="sr-only" htmlFor="request-input">Describe an action you want help with</label>
              <textarea
                id="request-input"
                value={text}
                onChange={(event) => { setText(event.target.value); if (error) setError(''); }}
                placeholder="For example, send Maya the meeting notes from today…"
                rows={3}
                maxLength={500}
                data-testid="input-request"
                aria-describedby={error ? 'request-error' : 'request-hint'}
              />
              <div className="composer-bottom">
                <span id={error ? 'request-error' : 'request-hint'} className={error ? 'form-error' : 'composer-hint'} role={error ? 'alert' : undefined}>
                  {error || <><ShieldCheck size={14} /> Your request stays in this demo</>}
                </span>
                <span className="char-count">{text.length}/500</span>
                <button className="button button-primary send-button" type="submit" disabled={!text.trim()} data-testid="button-submit-request">
                  Preview action <ArrowRight size={16} />
                </button>
              </div>
            </form>
            <div className="suggestions">
              <span className="suggestions-label">TRY A REQUEST</span>
              {exampleRequests.map((example, index) => <button key={example} onClick={() => chooseExample(example)} className="suggestion" data-testid={`button-example-${index + 1}`}>{example}<ArrowUpRight size={13} /></button>)}
            </div>
          </div>

          <div className="approval-rail" aria-label="How SAYDO works">
            <div className="rail-step rail-done"><span className="rail-icon"><MessageSquareText size={15} /></span><span>Request</span></div>
            <span className="rail-line" />
            <div className="rail-step rail-current"><span className="rail-icon"><FileText size={15} /></span><span>Review</span></div>
            <span className="rail-line" />
            <div className="rail-step"><span className="rail-icon"><Check size={15} /></span><span>Approve</span></div>
          </div>

          {preview && request ? (
            <PreviewCard
              request={request}
              preview={preview}
              onApprove={() => setPreview((current) => current ? { ...current, status: 'simulated' } : null)}
              onDismiss={() => setPreview((current) => current ? { ...current, status: 'dismissed' } : null)}
              onClear={() => { setPreview(null); setRequest(null); }}
            />
          ) : (
            <div className="empty-preview" data-testid="empty-preview">
              <div className="empty-illustration"><div className="empty-sheet"><span /><span /><span /></div><div className="empty-check"><ShieldCheck size={20} /></div></div>
              <div><strong>Your action preview will appear here</strong><p>Review the details before you decide what happens next.</p></div>
              <span className="empty-arrow"><ArrowDown size={17} /></span>
            </div>
          )}
          <div className="workspace-foot"><span><LockKeyhole size={13} /> No accounts connected</span><span>Every action is a simulation</span></div>
        </div>
      </main>
      <footer className="site-footer"><span>© SAYDO, early access preview</span><span>Built around a simple rule: <strong>you decide.</strong></span><Link href="/architecture" data-testid="link-footer-architecture">See how it works <ArrowRight size={13} /></Link></footer>
    </div>
  );
}

const architectureSteps = [
  { num: '01', title: 'You make a request', caption: 'Plain language in. No forms to learn.', icon: MessageSquareText, body: 'Describe the outcome you want in your own words. The demo keeps your request in local page state.' },
  { num: '02', title: 'Intent gets interpreted', caption: 'The ask becomes a clear intent.', icon: Fingerprint, body: 'A future SAYDO system would identify the goal, relevant details, and what is still missing. In this MVP, example rules make a local preview.' },
  { num: '03', title: 'An action is planned', caption: 'A concrete proposal, not a surprise.', icon: Layers3, body: 'The plan names the service, action, recipient or destination, and the important details for you to check.' },
  { num: '04', title: 'You approve the plan', caption: 'The gate is always yours.', icon: ShieldCheck, body: 'Nothing moves forward until you explicitly choose to approve. Dismiss is just as available.' },
  { num: '05', title: 'A connector would act', caption: 'Here, it only simulates.', icon: Play, body: 'This prototype stops at a visible simulation. No connected account, external service, or real execution is involved.' },
];

function Architecture() {
  return (
    <div className="app-shell">
      <Header />
      <main className="architecture-main saydo-grid">
        <div className="architecture-heading enter">
          <Link href="/" className="back-link" data-testid="link-back-workspace"><ArrowLeft size={15} /> Workspace</Link>
          <div className="eyebrow"><span className="eyebrow-mark"><CircleHelp size={13} /></span> A SMALL, EXPLICIT FLOW</div>
          <h1>Nothing happens<br />behind your <em>back.</em></h1>
          <p>From the first sentence to the final step, SAYDO makes the plan visible — and leaves the decision with you.</p>
        </div>

        <div className="flow-board enter-delay">
          <div className="flow-board-top"><div><span className="step-count">THE SAYDO LOOP</span><h2>Request to result</h2></div><span className="approval-stamp"><LockKeyhole size={14} /> APPROVAL REQUIRED</span></div>
          <div className="flow-line" aria-hidden="true" />
          <div className="architecture-steps">
            {architectureSteps.map((step, index) => {
              const Icon = step.icon;
              return <article className={`architecture-step ${index === 3 ? 'approval-step' : ''}`} key={step.num} data-testid={`step-architecture-${step.num}`}>
                <div className="architecture-step-marker"><span>{step.num}</span><div className="architecture-icon"><Icon size={18} /></div></div>
                <div className="architecture-step-copy"><div className="step-caption">{step.caption}</div><h3>{step.title}</h3><p>{step.body}</p></div>
                {index === 3 && <span className="gate-label"><ShieldCheck size={13} /> HUMAN GATE</span>}
                {index === 4 && <span className="simulation-label">SIMULATED IN THIS MVP</span>}
              </article>;
            })}
          </div>
          <div className="flow-foot"><span><CheckCircle2 size={16} /> Your approval is always visible.</span><span>Prototype mode · no external execution</span></div>
        </div>

        <section className="promise-panel">
          <div className="promise-icon"><ShieldCheck size={22} /></div>
          <div><span className="eyebrow">A PROMISE, NOT A SETTING</span><h2>Review first. Every time.</h2><p>Approving here only records a local simulation. Nothing is sent, changed, or executed externally.</p></div>
          <Link href="/" className="button button-primary promise-cta" data-testid="link-try-saydo">Try the demo <ArrowRight size={15} /></Link>
        </section>

        <section className="architecture-notes">
          <div><span className="step-count">CURRENTLY IN THIS PREVIEW</span><p>Local interface, in-memory state, deterministic example parsing.</p></div>
          <div><span className="step-count">NOT CONNECTED</span><p>No live AI, external API, account access, or service permissions.</p></div>
        </section>
      </main>
      <footer className="site-footer"><span>© SAYDO, early access preview</span><span>Clear by design.</span><Link href="/" data-testid="link-footer-home">Back to workspace <ArrowRight size={13} /></Link></footer>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/architecture" component={Architecture} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;