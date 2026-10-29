import {ShieldCheck} from 'lucide-react';
import {APP_DISPLAY_VERSION} from '../lib/release';
export default function BetaNoticeV10(){
 return <div className="beta10-notice" role="status"><ShieldCheck size={18} aria-hidden="true"/><span>
  <strong>MamaMwana {APP_DISPLAY_VERSION} — controlled preview</strong>. Medical, legal, security and deployment approval is pending.
  Do not enter real patient information until production readiness has been independently verified.
 </span></div>;
}
