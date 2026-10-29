import type {LucideIcon} from 'lucide-react';
import {Sparkles} from 'lucide-react';
import {APP_DISPLAY_VERSION} from '../lib/release';

type Tone='sage'|'peach'|'lilac';
interface Props{
 eyebrow:string;title:string;description:string;
 Icon:LucideIcon;tone?:Tone;
}
/** Presentation-only shell. Release label reflects package.json, never a migration revision. */
export default function CurrentFeatureHeading({eyebrow,title,description,Icon,tone='sage'}:Props){
 return <header className={'section-heading mm-current-feature mm-tone-'+tone}>
  <div className="mm-current-feature-heading">
   <span className="mm-current-feature-icon" aria-hidden="true"><Icon size={25} strokeWidth={1.8}/></span>
   <div className="mm-current-feature-copy"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div>
  </div>
  <span className="mm-current-release"><Sparkles size={13} aria-hidden="true"/> MamaMwana {APP_DISPLAY_VERSION}</span>
 </header>;
}
