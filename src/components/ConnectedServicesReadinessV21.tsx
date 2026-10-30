import {useState} from 'react';
import {ArrowRight,LockKeyhole,Network,ShieldAlert} from 'lucide-react';
import {CONNECTED_CARE_SERVICES,connectedCarePreview} from '../lib/connectedServicesV21';
import type {ConnectedServiceId} from '../lib/connectedServicesV21';
/** Public static workflow specification; no clinical records or integration requests. */
export default function ConnectedServicesReadinessV21(){
 const [selected,setSelected]=useState<ConnectedServiceId>('clinician');
 const item=connectedCarePreview(selected);
 return <section className="mm21-readiness" aria-labelledby="mm21-title">
  <header className="mm21-heading"><span className="mm21-icon"><Network size={21} aria-hidden="true"/></span><div><div className="eyebrow">v2.1+ · POST-APPROVAL ARCHITECTURE</div><h3 id="mm21-title">Connected healthcare services</h3><p>Explore future workflows. All clinical capabilities are locked; no practitioner access, patient record exchange, diagnosis or clinical notification is enabled.</p></div><span className="mm21-state"><LockKeyhole size={13} aria-hidden="true"/> NOT AUTHORIZED</span></header>
  <div className="mm21-layout"><div className="mm21-options" role="group" aria-label="Connected services roadmap">
  {CONNECTED_CARE_SERVICES.map(service=><button key={service.id} type="button" aria-pressed={selected===service.id} onClick={()=>setSelected(service.id)}><span>{service.title}</span><small>Locked · requires external approval</small><ArrowRight size={16} aria-hidden="true"/></button>)}
  </div><article className="mm21-detail" aria-live="polite"><h4>{item.title}</h4><p>{item.summary}</p><strong>Future workflow (architecture only)</strong><ol>{item.workflowPreview.map(step=><li key={step}>{step}</li>)}</ol><strong>Required before any activation</strong><ul>{item.requirements.map(requirement=><li key={requirement}>{requirement}</li>)}</ul></article></div>
  <p className="mm21-boundary"><ShieldAlert size={18} aria-hidden="true"/> No clinical release approvals or actual care-provider integrations have been obtained through this preview. The application’s independent NO-GO controls remain active.</p>
 </section>;
}
