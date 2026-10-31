import type {LucideIcon} from 'lucide-react';
import type {Tab} from './navigation';

/**
 * MamaMwana's accessible glass-ceramic icon shell.
 * Decorative artwork has no tab stop; semantic names remain on the owning control.
 * Stacked Lucide vectors create a subtle sculpted edge without canvas/WebGL.
 */
export type GlassTone='sage'|'teal'|'rose'|'peach'|'amber'|'lilac'|'blue';
export type GlassSize='xs'|'sm'|'md'|'lg';
export type GlassMode='tile'|'symbol';

const TAB_TONES:Readonly<Record<Tab,GlassTone>>={
 home:'sage',family:'teal',pregnancy:'rose',care:'sage',visits:'amber',
 birth:'peach',baby:'rose',records:'blue',guidance:'lilac',privacy:'teal',
 library:'amber',planner:'lilac',hub:'teal'
};
export function toneForTab(tab:Tab):GlassTone{return TAB_TONES[tab];}

export function GlassCeramicIcon({Icon,tone='sage',size='md',mode='tile',label,className=''}:{
 Icon:LucideIcon; tone?:GlassTone; size?:GlassSize; mode?:GlassMode;
 label?:string; className?:string;
}){
 const named=typeof label==='string'&&label.trim().length>0;
 return <span
  className={['mm-gc','mm-gc--'+mode,'mm-gc--'+size,className].filter(Boolean).join(' ')}
  data-tone={tone}
  role={named?'img':undefined}
  aria-label={named?label:undefined}
  aria-hidden={named?undefined:true}
 >
  <span className="mm-gc__ambient" aria-hidden="true"/>
  <Icon className="mm-gc__symbol mm-gc__symbol--depth" strokeWidth={2.75} aria-hidden="true" focusable="false"/>
  <Icon className="mm-gc__symbol mm-gc__symbol--face" strokeWidth={2.2} aria-hidden="true" focusable="false"/>
  <span className="mm-gc__shine" aria-hidden="true"/>
 </span>;
}
