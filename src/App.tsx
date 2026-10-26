import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownUp, BellRing, CalendarDays, Check, CheckCircle2, ChevronDown, ClipboardList, Clock3, Download, FileText, HeartHandshake, Info, LayoutDashboard, Search, ShieldCheck, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { initialCases, priorityFor, priorityOrder, todayLocal, type AuditEntry, type CaseStatus, type CourtCase, type Priority } from './domain';

const TODAY = todayLocal();
const STORE = 'civicready-demo-v1';
const AUDIT = 'civicready-audit-v1';
const statusOptions: CaseStatus[] = ['Pending','Contacted','Confirmed'];
const tone: Record<Priority,string> = { Overdue:'danger', Urgent:'warning', Upcoming:'info', Scheduled:'neutral', Complete:'success' };
const niceDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
const stored = <T,>(key: string, fallback: T): T => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } };

function App() {
  const [cases, setCases] = useState<CourtCase[]>(() => stored(STORE,initialCases(TODAY)));
  const [audit, setAudit] = useState<AuditEntry[]>(() => stored(AUDIT,[]));
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('All cases');
  const [sort,setSort] = useState('priority');
  const [activePage,setActivePage] = useState<'dashboard'|'audit'|'approach'>('dashboard');
  const [selected,setSelected] = useState<CourtCase|null>(null);
  const [notice,setNotice] = useState('');
  const [apiStatus,setApiStatus] = useState<'checking'|'connected'|'offline'>('checking');

  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(cases)); },[cases]);
  useEffect(() => { localStorage.setItem(AUDIT, JSON.stringify(audit)); },[audit]);
  useEffect(() => {
    // The static GitHub Pages build works offline; a locally run Express API is optional.
    if (import.meta.env.PROD) { setApiStatus('offline'); return; }
    fetch('/api/health').then(async r => {
      if (!r.ok) throw new Error('API unavailable');
      const response = await fetch('/api/cases');
      if (!response.ok) throw new Error('API unavailable');
      setCases(await response.json() as CourtCase[]);
      setApiStatus('connected');
    }).catch(() => setApiStatus('offline'));
  },[]);

  const rows = useMemo(() => cases.filter(item => {
    const searchMatch = `${item.client} ${item.caseRef}`.toLowerCase().includes(query.toLowerCase());
    const priority = priorityFor(item,TODAY);
    return searchMatch && (filter === 'All cases' || filter === priority || filter === item.status);
  }).sort((a,b) => sort === 'date' ? a.hearingDate.localeCompare(b.hearingDate) : sort === 'name' ? a.client.localeCompare(b.client) : priorityOrder[priorityFor(a,TODAY)] - priorityOrder[priorityFor(b,TODAY)] || a.hearingDate.localeCompare(b.hearingDate)),[cases,query,filter,sort]);

  const stats = useMemo(() => ({
    total: cases.length,
    urgent: cases.filter(x => ['Overdue','Urgent'].includes(priorityFor(x,TODAY))).length,
    upcoming: cases.filter(x => priorityFor(x,TODAY)==='Upcoming').length,
    confirmed: cases.filter(x => x.status === 'Confirmed').length,
  }),[cases]);

  async function updateStatus(id:string,status:CaseStatus) {
    const item = cases.find(entry => entry.id === id);
    if (!item || item.status === status) return;
    if (apiStatus === 'connected') {
      try {
        const response = await fetch(`/api/cases/${encodeURIComponent(id)}/status`, { method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status}) });
        if (!response.ok) throw new Error('Could not save change');
      } catch { setNotice('API update failed. No changes were saved.');return; }
    }
    setCases(previous => previous.map(entry => entry.id === id ? {...entry,status,lastContact:status==='Contacted'?TODAY:entry.lastContact} : entry));
    setAudit(previous => [{ id:crypto.randomUUID(),at:new Date().toISOString(),caseRef:item.caseRef,action:`Status changed: ${item.status} → ${status}` },...previous]);
    setSelected(previous => previous?.id === id ? {...previous,status} : previous);
    setNotice(`${item.caseRef} updated to ${status.toLowerCase()}.`);
    window.setTimeout(() => setNotice(''),4000);
  }

  function exportCsv() {
    const cell = (value:string) => `"${value.replaceAll('"','""')}"`;
    const lines = [['Reference','Client','Hearing date','Priority','Status','Channel'], ...rows.map(item => [item.caseRef,item.client,item.hearingDate,priorityFor(item,TODAY),item.status,item.channel])];
    // Prefix spreadsheet formula markers to avoid CSV formula injection.
    const csv = lines.map(line => line.map(value => cell(/^[=+@\-]/.test(value) ? `'${value}` : value)).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href=url;a.download='civicready-cases.csv';a.click();URL.revokeObjectURL(url);
  }

  function resetDemo() { if (!window.confirm('Restore all fictional sample records and clear the audit log?')) return; setCases(initialCases(TODAY));setAudit([]);setSelected(null);setNotice('Demo data restored.'); }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><HeartHandshake size={23}/></div><div><div className="brand-name">civic<span>ready</span></div><div className="brand-caption">PUBLIC SERVICE TOOLS</div></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav aria-label="Main navigation" className="nav-stack">
        <button className={`side-link ${activePage==='dashboard'?'active':''}`} onClick={() => setActivePage('dashboard')}><LayoutDashboard size={18}/> Overview <span className="side-arrow">›</span></button>
        <button className={`side-link ${activePage==='audit'?'active':''}`} onClick={() => setActivePage('audit')}><ClipboardList size={18}/> Activity log</button>
        <button className={`side-link ${activePage==='approach'?'active':''}`} onClick={() => setActivePage('approach')}><ShieldCheck size={18}/> Our approach</button>
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-panel"><div className="d-flex gap-2 align-items-center mb-2"><Sparkles size={17} className="text-mint"/><strong>Built for people</strong></div><p>Simple, explainable tools for more reliable public services.</p><span>DEMONSTRATION PROJECT</span></div><div className="sidebar-foot"><span className="online-dot"/> Fictional data only <span>v1.0</span></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">WORKSPACE <span>/</span> <strong>{activePage==='dashboard'?'Overview':activePage==='audit'?'Activity log':'Our approach'}</strong></div><div className="top-right"><span className="demo-pill"><span className="online-dot"/> DEMO ENVIRONMENT</span><div className="avatar">CR</div></div></header>
      <div className="content-wrap">
        {activePage==='dashboard' ? <>
          <div className="page-heading"><div><div className="eyebrow"><span/> CASE SUPPORT OVERVIEW</div><h1>Good morning, team <span className="wave">✳</span></h1><p>Here’s what needs your attention across upcoming court dates.</p></div><div className="heading-date"><CalendarDays size={17}/>{new Date(`${TODAY}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div></div>
          <div className="hero-note"><div className="hero-icon"><BellRing size={21}/></div><div><strong>Every reminder matters.</strong><p>Help clients stay informed and prepared. Priorities are based only on hearing dates and follow-up status.</p></div><button onClick={() => setActivePage('approach')}>How it works <span>↗</span></button></div>
          <div className="stats-grid">
            <Stat label="Active cases" value={stats.total} detail="In the current workspace" icon={<FileText size={19}/>} color="blue" />
            <Stat label="Needs attention" value={stats.urgent} detail="Overdue or within 3 days" icon={<BellRing size={19}/>} color="coral" />
            <Stat label="Coming up soon" value={stats.upcoming} detail="Hearing in 4–7 days" icon={<Clock3 size={19}/>} color="amber" />
            <Stat label="Confirmed" value={stats.confirmed} detail="Client confirmation received" icon={<CheckCircle2 size={19}/>} color="green" />
          </div>
          <section className="data-panel"><div className="table-heading"><div><div className="section-kicker">CASE MANAGEMENT</div><h2>Upcoming hearings <span>{cases.length}</span></h2><p>A clear view of who may need a reminder or follow-up.</p></div><button className="outline-btn" onClick={exportCsv}><Download size={16}/> Export CSV</button></div>
            <div className="table-controls"><div className="search-wrap"><Search size={18}/><input aria-label="Search cases" placeholder="Search by name or case reference..." value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={15}/></button>}</div><div className="select-wrap"><SlidersHorizontal size={16}/><select aria-label="Filter cases" value={filter} onChange={event=>setFilter(event.target.value)}>{['All cases','Overdue','Urgent','Upcoming','Scheduled','Complete','Pending','Contacted','Confirmed'].map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={14}/></div><div className="select-wrap sort-wrap"><ArrowDownUp size={16}/><select aria-label="Sort cases" value={sort} onChange={e=>setSort(e.target.value)}><option value="priority">Priority</option><option value="date">Hearing date</option><option value="name">Client name</option></select><ChevronDown size={14}/></div></div>
            <div className="table-responsive"><table className="cases-table"><thead><tr><th>CLIENT / REFERENCE</th><th>HEARING DATE</th><th>PRIORITY</th><th>CONTACT</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{rows.map(item => { const priority=priorityFor(item,TODAY);return <tr key={item.id}><td><div className="client-cell"><div className="client-avatar">{item.client.split(' ').map(n=>n[0]).join('')}</div><div><strong>{item.client}</strong><small>{item.caseRef}</small></div></div></td><td><div className="date-cell">{niceDate(item.hearingDate)}</div><small>{priority==='Overdue'?'Date passed':`${Math.max(0,Math.round((Date.parse(item.hearingDate)-Date.parse(TODAY))/86400000))} days away`}</small></td><td><span className={`priority-badge ${tone[priority]}`}><i/>{priority}</span></td><td><span className="channel">{item.channel}{item.accessibilityNeed&&<span title="Accommodation requested" className="access-dot">*</span>}</span></td><td><span className={`status-label ${item.status.toLowerCase()}`}>{item.status==='Confirmed'&&<Check size={14}/>} {item.status}</span></td><td><button className="view-btn" onClick={()=>setSelected(item)}>View details <span>↗</span></button></td></tr>;})}</tbody></table>{rows.length===0&&<div className="empty-state">No cases match your filters. Try another search.</div>}</div>
            <div className="table-footer"><span>Showing <strong>{rows.length}</strong> of <strong>{cases.length}</strong> fictional cases</span><span><span className="legend-dot"/> Date-based, explainable prioritization</span></div>
          </section>
          <div className="bottom-note"><Info size={16}/><span><strong>Designed with care.</strong> This prototype never makes legal or eligibility decisions, and no real client information should be entered.</span><button onClick={resetDemo} disabled={apiStatus==='connected'} title={apiStatus==='connected'?'Restart the Node server to reset API data':'Restore browser demo records'}>{apiStatus==='connected'?'Restart API to reset':'Reset demo'}</button></div>
        </> : activePage==='audit' ? <><div className="page-heading"><div><div className="eyebrow"><span/> TRANSPARENCY</div><h1>Activity log</h1><p>A traceable history of status changes made in this browser.</p></div></div><section className="data-panel alt-panel"><div className="table-heading"><div><h2>Recent activity <span>{audit.length}</span></h2><p>Stored locally in your browser, not on a government system.</p></div></div>{audit.length ? <div className="activity-list">{audit.map(entry=><div className="activity-item" key={entry.id}><div className="activity-icon"><Activity size={17}/></div><div><strong>{entry.caseRef}</strong><p>{entry.action}</p></div><time>{new Date(entry.at).toLocaleString()}</time></div>)}</div> : <div className="empty-state large">No activity yet. Update a case status to see its audit entry here.</div>}</section></> : <><div className="page-heading"><div><div className="eyebrow"><span/> TRUST BY DESIGN</div><h1>Our approach</h1><p>Human-centered technology for high-stakes public services.</p></div></div><div className="approach-grid"><Approach icon={<ShieldCheck/>} title="Explainable rules" text="A deterministic rule prioritizes cases by hearing date and whether confirmation was received. No opaque scoring model."/><Approach icon={<HeartHandshake/>} title="People make decisions" text="Staff may record outreach and confirmation. The software does not recommend legal outcomes or automate contact."/><Approach icon={<ClipboardList/>} title="Accountable actions" text="Status changes appear in a local activity history. Real deployments would require authenticated, tamper-resistant server-side logs."/><Approach icon={<Info/>} title="Privacy-first scope" text="This is a fictional portfolio demo. No real client data, messaging integration, or production-grade access control is included."/></div><section className="data-panel rules-panel"><div className="section-kicker">DETERMINISTIC PRIORITY MODEL</div><h2>How a priority is assigned</h2><div className="rule-list">{[['Overdue','Hearing date is in the past and not confirmed'],['Urgent','Hearing is today or within 3 days'],['Upcoming','Hearing is in 4–7 days'],['Scheduled','Hearing is more than 7 days away'],['Complete','Client attendance confirmation is recorded']].map(([label,explanation])=><div key={label}><span className={`priority-badge ${tone[label as Priority]}`}><i/>{label}</span><span>{explanation}</span></div>)}</div><p className="rule-caption">Contact method and accessibility accommodations never affect priority ranking.</p></section></>}
      </div>
      <footer className="footer"><span>© 2026 CivicReady · Portfolio demonstration</span><span><span className={`api-dot ${apiStatus}`}/> API: {apiStatus==='connected'?'Connected locally':apiStatus==='checking'?'Checking':'Standalone demo mode'}</span></footer>
    </main>
    {notice&&<div className="toast-notice" role="status"><CheckCircle2 size={17}/>{notice}</div>}
    {selected&&<div className="modal-shade" onMouseDown={()=>setSelected(null)}><section className="detail-modal" role="dialog" aria-modal="true" aria-label={`${selected.client} case details`} onMouseDown={e=>e.stopPropagation()}><div className="detail-head"><div><div className="section-kicker">CASE DETAILS · {selected.caseRef}</div><h2>{selected.client}</h2></div><button aria-label="Close dialog" className="close-btn" onClick={()=>setSelected(null)}><X size={20}/></button></div><div className="detail-content"><div className="detail-grid"><div><small>HEARING DATE</small><strong>{niceDate(selected.hearingDate)}</strong></div><div><small>PRIORITY</small><span className={`priority-badge ${tone[priorityFor(selected,TODAY)]}`}><i/>{priorityFor(selected,TODAY)}</span></div><div><small>PREFERRED CHANNEL</small><strong>{selected.channel}</strong></div><div><small>ACCOMMODATION REQUEST</small><strong>{selected.accessibilityNeed?'Yes — follow up with client':'Not noted'}</strong></div></div><div className="status-editor"><label htmlFor="case-status">Update outreach status</label><p>Status changes are recorded in the activity log.</p><select id="case-status" value={selected.status} onChange={event=>updateStatus(selected.id,event.target.value as CaseStatus)}>{statusOptions.map(value=><option key={value}>{value}</option>)}</select></div><div className="modal-disclaimer"><Info size={17}/> For demonstration only. Always verify official court schedules independently.</div></div><div className="modal-actions"><button className="primary-btn" onClick={()=>setSelected(null)}>Done</button></div></section></div>}
  </div>;
}

function Stat({ label,value,detail,icon,color }:{label:string;value:number;detail:string;icon:React.ReactNode;color:string}) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${color}`}>{icon}</div></div><div className="stat-number">{String(value).padStart(2,'0')}</div><div className="stat-detail"><span className={`tiny-marker ${color}`}/>{detail}</div></div>; }
function Approach({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) { return <div className="approach-card"><div className="approach-icon">{icon}</div><h2>{title}</h2><p>{text}</p></div>; }
export default App;
