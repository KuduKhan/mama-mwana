import {ArrowRight,BookOpenText,HeartHandshake,ShieldCheck,Sparkles} from 'lucide-react';
import {APP_DISPLAY_VERSION} from '../lib/release';
import {useMamaLocale} from '../lib/locale';
/** Non-clinical preview announcement. No personal data or implied approval. */
export default function ReleaseShowcaseV20({onFamily,onLearning}:{onFamily:()=>void;onLearning:()=>void}){
 const {locale}=useMamaLocale();
 return <section className="mm20-showcase" aria-labelledby="mm20-showcase-title">
  <div className="mm20-showcase-body">
   <span className="mm20-edition"><Sparkles size={15} aria-hidden="true"/> {APP_DISPLAY_VERSION}</span>
   <h2 id="mm20-showcase-title">{locale==='sw'?'Familia yako, hatua zote kwa pamoja.':'A calmer way to keep family care connected.'}</h2>
   <p>{locale==='sw'?'Safari za familia, vikumbusho na elimu ya afya katika sehemu moja. Huu ni mfano wa elimu; si huduma ya kitabibu iliyoidhinishwa.':'A thoughtful place for family journeys, gentle reminders and learning. This is an educational preview—not an approved clinical service.'}</p>
   <div className="mm20-showcase-actions">
    <button type="button" onClick={onFamily}><HeartHandshake size={18} aria-hidden="true"/>{locale==='sw'?'Safari za familia':'Family journeys'}<ArrowRight size={16} aria-hidden="true"/></button>
    <button type="button" className="mm20-showcase-secondary" onClick={onLearning}><BookOpenText size={18} aria-hidden="true"/>{locale==='sw'?'Maktaba ya elimu':'Explore learning'}</button>
   </div>
  </div>
  <div className="mm20-showcase-aside" aria-label={locale==='sw'?'Mipaka ya mfano':'Preview boundaries'}>
   <span className="mm20-aside-mark"><ShieldCheck size={24} aria-hidden="true"/></span>
   <strong>{locale==='sw'?'Faragha ni muhimu':'Built around your privacy'}</strong>
   <span>{locale==='sw'?'Sehemu 13 za mfano':'13 connected spaces'}</span>
   <small>{locale==='sw'?'Taarifa za mfano pekee · Hakuna taarifa halisi za wagonjwa':'Sample data only · No live patient records'}</small>
  </div>
 </section>;
}
