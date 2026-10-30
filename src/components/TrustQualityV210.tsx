import {Accessibility,CheckCircle2,LockKeyhole,ShieldCheck,Smartphone} from 'lucide-react';
import {APP_DISPLAY_VERSION} from '../lib/release';
import {useMamaLocale} from '../lib/locale';
/** Public transparency, never a clinical certificate or live CI-status dashboard. */
export default function TrustQualityV210({isDemo}:{isDemo:boolean}){
 const {locale}=useMamaLocale();
 const cards=locale==='sw'?[
  ['Uwezo wa majaribio','Muonekano wa simu na masomo ya umma hukaguliwa kwa majaribio ya kiotomatiki.'],
  ['Faragha ya data','Jaribio la mfano pekee. Hakuna ushiriki mpya wa data au ruhusa za kitabibu.'],
  ['Ukaguzi wa kujitegemea','Tathmini ya wataalamu, usalama na vifaa halisi bado inahitajika.']
 ]:[
  ['Technical checks','Automated responsive, privacy and browser tests are part of the release process.'],
  ['Limited data scope','This demo adds no provider access, health interpretation or patient-data sharing.'],
  ['Independent reviews','Physical-device, clinical, privacy and penetration-test signoff remains outstanding.']
 ];
 const Icons=[Smartphone,ShieldCheck,Accessibility];
 return <section className="mm210-trust" aria-labelledby="mm210-title">
  <div className="mm210-head"><span className="mm210-emblem"><CheckCircle2 size={21} aria-hidden="true"/></span><div>
   <span className="eyebrow">{APP_DISPLAY_VERSION} · QUALITY & TRUST</span>
   <h3 id="mm210-title">{locale==='sw'?'Ubora na uwazi':'Quality, privacy & transparency'}</h3>
   <p>{locale==='sw'?'Maelezo haya si cheti cha matibabu.':'An honest status of what this preview offers and what still needs approval.'}</p>
  </div></div>
  <div className="mm210-grid">{cards.map(([title,desc],i)=>{const Icon=Icons[i];return <article key={title}><Icon size={19} aria-hidden="true"/><strong>{title}</strong><p>{desc}</p></article>})}</div>
  <div className="mm210-decision"><LockKeyhole size={18} aria-hidden="true"/><strong>CLINICAL NO-GO</strong>
   <span>{isDemo?'Sample-data experience only.':'Account access is not an authorization for clinical production.'} No independent stable-release approval has been recorded.</span></div>
 </section>;
}
