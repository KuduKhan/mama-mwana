import {ArrowRight,ShieldAlert,X} from 'lucide-react';
import {SOURCES} from '../content/education';
/** Shared, presentational feedback surfaces. Neither performs clinical interpretation. */
export function Notification({message,onClose}:{message:string;onClose:()=>void}){return <div className="toast" role="status">{message}<button aria-label="Dismiss notification" onClick={onClose}><X size={16}/></button></div>;}

export function WarningCard({onOpen}:{onOpen:()=>void}){return <button className="warning-card" onClick={onOpen}><span className="warning-icon"><ShieldAlert size={20}/></span><span><strong>Know when to get help</strong><small>Important signs for mother and baby</small></span><ArrowRight size={18}/></button>;}
export function SourcesSmall(){return <div className="source-row">Sources: {SOURCES.slice(0,3).map((s,i)=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{i>0?' · ':''}{s.title.replace(' recommendations','')}</a>)}</div>;}

