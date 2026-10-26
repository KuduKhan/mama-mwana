import {ShieldCheck} from 'lucide-react';
export default function BetaNoticeV10(){
 return <div className="beta10-notice" role="status"><ShieldCheck size={18} aria-hidden="true"/><span>
  <strong>MamaMwana v1.2.1 preview — controlled beta</strong>. Medical, legal, security and deployment approval is pending.
  Do not enter real patient information until production readiness has been independently verified.
 </span></div>;
}
