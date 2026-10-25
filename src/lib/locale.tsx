import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import type {ReactNode} from 'react';
export type MamaLocale='en'|'sw';
const strings:Record<string,readonly [string,string]>={
 'nav.home':['Overview','Muhtasari'],'nav.family':['Family journeys','Safari za familia'],
 'nav.pregnancy':['My pregnancy','Ujauzito wangu'],'nav.care':['Daily care','Huduma ya kila siku'],
 'nav.visits':['Antenatal visits','Ziara za kliniki ya ujauzito'],
 'nav.planner':['My care planner','Mpango wangu wa huduma'],
 'nav.birth':['Birth preparation','Maandalizi ya kujifungua'],
 'nav.baby':['Baby & growth','Mtoto na ukuaji'],
 'nav.records':['Clinical timeline','Historia ya taarifa za kliniki'],
 'nav.guidance':['Care guidance','Mwongozo wa huduma'],
 'nav.privacy':['Privacy & records','Faragha na kumbukumbu'],
 'nav.library':['Health library','Maktaba ya afya'],
 'auth.welcome':['Welcome to MamaMwana','Karibu MamaMwana'],
 'auth.signin':['Sign in','Ingia'],'auth.signup':['Create account','Fungua akaunti'],
 'auth.email':['Email address','Anwani ya barua pepe'],'auth.password':['Password','Nenosiri'],
 'auth.begin':['Begin your beautiful journey','Anza safari yako ya thamani'],
 'auth.return':['Welcome back, mama','Karibu tena, mama'],
 'auth.demo':['Explore interactive demo','Jaribu toleo la maonyesho'],
 'auth.demoDetails':['Sample entries only • Nothing stored','Taarifa za mfano pekee • Hakuna kinachohifadhiwa'],
 'app.hello':['Hello','Hujambo'],'app.family':['Family','Familia'],
 'app.logout':['Sign out','Toka'],'app.demoExit':['Exit demo','Toka kwenye maonyesho'],
 'app.space':['YOUR SAFE SPACE','SEHEMU SALAMA YAKO'],'app.growing':['Growing together','Tunakua pamoja'],
 'app.journey':['YOUR JOURNEY','SAFARI YAKO'],'app.help':['When to seek help','Wakati wa kutafuta msaada'],
 'app.private':['Private account','Akaunti binafsi'],'app.demo':['Unsaved demo','Maonyesho hayajahifadhiwa'],
 'app.saving':['Saving…','Inahifadhiwa…'],'app.saved':['Save failed','Imeshindikana kuhifadhi'],
 'app.warn':['Health warning signs','Dalili za hatari kiafya'],
 'app.educational':['Educational support, never a substitute for professional healthcare','Msaada wa elimu, si mbadala wa huduma ya kitaalamu ya afya'],
 'app.review':['Medical content in English is awaiting independent Kiswahili clinical review. Seek urgent care directly for danger signs.','Maudhui ya afya ya Kiingereza yanasubiri mapitio ya kitaalamu ya Kiswahili. Kwa dalili za hatari, tafuta huduma ya dharura moja kwa moja.'],
 'app.language':['Language','Lugha']
};
export function textFor(locale:MamaLocale,key:string,fallback?:string){
 const v=strings[key];return v?(locale==='sw'?v[1]:v[0]):fallback??key;
}
type ContextShape={locale:MamaLocale;setLocale:(next:MamaLocale)=>void;t:(key:string,fallback?:string)=>string};
const Context=createContext<ContextShape>({locale:'en',setLocale:()=>{},t:(key,fallback)=>textFor('en',key,fallback)});
export function LocaleProvider({children}:{children:ReactNode}){
 const [locale,setLocale]=useState<MamaLocale>(()=>{
  try{return window.localStorage.getItem('mamamwana-language')==='sw'?'sw':'en';}catch{return 'en';}
 });
 useEffect(()=>{
  document.documentElement.lang=locale;
  try{window.localStorage.setItem('mamamwana-language',locale);}catch{/* optional non-clinical preference */}
 },[locale]);
 const ctx=useMemo(()=>({locale,setLocale,t:(key:string,fallback?:string)=>textFor(locale,key,fallback)}),[locale]);
 return <Context.Provider value={ctx}>{children}</Context.Provider>;
}
export function useMamaLocale(){return useContext(Context);}
