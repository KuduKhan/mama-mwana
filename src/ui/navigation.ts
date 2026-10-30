import {Baby,BookHeart,Bot,CalendarDays,ClipboardList,Heart,House,Leaf,ListTodo,LockKeyhole,NotebookPen,ScrollText,Users} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
export type Tab = 'home'|'family'|'pregnancy'|'care'|'visits'|'birth'|'baby'|'records'|'guidance'|'privacy'|'library'|'planner'|'hub';
export type NavItem = {id:Tab; label:string; Icon:LucideIcon};
export const NAV:NavItem[]=[
 {id:'home',label:'Overview',Icon:House},
 {id:'family',label:'Family journeys',Icon:Users},
 {id:'pregnancy',label:'My pregnancy',Icon:Heart},
 {id:'care',label:'Daily care',Icon:Leaf},
 {id:'visits',label:'Antenatal visits',Icon:CalendarDays},
 {id:'planner',label:'My care planner',Icon:ListTodo},
 {id:'hub',label:'Care journey hub',Icon:NotebookPen},
 {id:'birth',label:'Birth preparation',Icon:ClipboardList},
 {id:'baby',label:'Baby & growth',Icon:Baby},
 {id:'records',label:'Clinical timeline',Icon:ScrollText},
 {id:'guidance',label:'Care guidance',Icon:Bot},
 {id:'privacy',label:'Privacy & records',Icon:LockKeyhole},
 {id:'library',label:'Health library',Icon:BookHeart}
];
export const NAV_GROUPS:readonly {key:string;labelKey:string;label:string;ids:readonly Tab[]}[]=[
 {key:'daily',labelKey:'navGroup.daily',label:'Daily essentials',ids:['home','care','planner','visits']},
 {key:'family',labelKey:'navGroup.family',label:'Family & milestones',ids:['family','pregnancy','hub','birth','baby']},
 {key:'support',labelKey:'navGroup.support',label:'Records & support',ids:['records','guidance','privacy','library']}
];

export const MOBILE_NAV:readonly NavItem[]=[
 {id:'home',label:'Home',Icon:House},
 {id:'family',label:'Journey',Icon:Users},
 {id:'planner',label:'Planner',Icon:ListTodo},
 {id:'library',label:'Learn',Icon:BookHeart},
 {id:'privacy',label:'Me',Icon:LockKeyhole}
];
/** All 13 product sections remain accessible through the search drawer. */
export const PRIMARY_FOR_TAB:Readonly<Record<Tab,Tab>>={
 home:'home',care:'home',family:'family',pregnancy:'family',birth:'family',baby:'family',hub:'family',
 planner:'planner',visits:'planner',library:'library',guidance:'library',privacy:'privacy',records:'privacy'
};
export function primaryForTab(tab:Tab):Tab{return PRIMARY_FOR_TAB[tab];}
export const isTab=(value:unknown):value is Tab=>typeof value==='string'&&NAV.some(item=>item.id===value);
