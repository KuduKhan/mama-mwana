import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';
export function Brand({inverse=false}:{inverse?:boolean}){
 return <div className={'brand '+(inverse?'brand-inverse':'')}>
   <span className="brand-icon"><img src="/icon.svg" width={48} height={48} alt="" aria-hidden="true"/></span>
   <div className="brand-title">mama<span>mwana</span><small>EVERY LITTLE BEGINNING MATTERS</small></div>
 </div>;
}
export function Button({children,onClick,type='button',variant='primary',disabled=false,Icon}:{
 children:ReactNode;onClick?:()=>void;type?:'button'|'submit';variant?:'primary'|'secondary'|'subtle'|'danger';disabled?:boolean;Icon?:LucideIcon
}){return <button type={type} onClick={onClick} className={'btn btn-'+variant} disabled={disabled}>{Icon&&<Icon size={17}/>}<span>{children}</span></button>;}
export function SectionTitle({eyebrow,title,subtitle,action}:{eyebrow:string;title:string;subtitle?:string;action?:ReactNode}){
 return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>;
}
export function Panel({children,className=''}:{children:ReactNode;className?:string}){return <section className={'panel '+className}>{children}</section>;}
export function ProgressBar({value}:{value:number}){return <div className="progress-rail" role="progressbar" aria-label="Completion progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{width:String(Math.min(100,Math.max(0,value)))+'%'}}/></div>;}
