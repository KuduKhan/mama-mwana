import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import type {ReactNode} from 'react';
export type MamaLocale='en'|'sw';
const strings:Record<string,readonly [string,string]>={
 'nav.home':['Overview','Muhtasari'],'nav.family':['Family journeys','Safari za familia'],
 'nav.pregnancy':['My pregnancy','Ujauzito wangu'],'nav.care':['Daily care','Huduma ya kila siku'],
 'nav.visits':['Antenatal visits','Ziara za kliniki ya ujauzito'],
 'nav.planner':['My care planner','Mpango wangu wa huduma'],
 'nav.hub':['Care journey hub','Safari ya huduma'],
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
 'app.language':['Language','Lugha'],
 'navGroup.daily':['Daily essentials','Huduma za kila siku'],
 'navGroup.family':['Family & milestones','Familia na hatua za ukuaji'],
 'navGroup.support':['Records & support','Kumbukumbu na msaada'],
 'home.todayEyebrow':['YOUR DAILY FOCUS','LENGO LA LEO'],
 'home.todayTitle':['Your day at a glance','Muhtasari wa siku yako'],
 'home.todaySubtitle':['Pick up where you left off. Personal reminders, not medical advice.','Endelea ulipoishia. Vikumbusho binafsi, si ushauri wa kitabibu.'],
 'home.careAction':['Continue daily care','Endelea na huduma za kila siku'],
 'home.checked':['checked','zilizowekwa alama'],
 'home.careDetail':['Your personal daily checklist','Orodha yako ya shughuli za kila siku'],
 'home.visitsAction':['Review planned visits','Angalia ziara zilizopangwa'],
 'home.nonePlanned':['No visit entered','Hakuna ziara iliyoingizwa'],
 'home.confirmVisit':['Planned in your journal · confirm with clinic','Imepangwa kwenye daftari · thibitisha na kliniki'],
 'home.addVisit':['Add a visit to your personal journal','Ongeza ziara kwenye daftari lako'],
 'home.journeyAction':['Explore care journey','Angalia safari ya huduma'],
 'home.visitsRecorded':['visit entries','taarifa za ziara'],
 'home.journeyDetail':['Your recorded moments, in one place','Kumbukumbu zako katika sehemu moja'],
 'family.snapshot':['Your family at a glance','Muhtasari wa familia yako'],
 'family.scope':['Only journeys in your current account. Select one to open its private care space.','Safari za akaunti yako pekee. Chagua safari ili kufungua sehemu yake binafsi.'],
 'family.quick':['Family quick switch','Badilisha safari ya familia'],
 'family.baby':['Baby','Mtoto'],
 'family.pregnancy':['Pregnancy journey','Safari ya ujauzito'],
 'family.birthDate':['Birth date','Tarehe ya kuzaliwa'],
 'family.dueDate':['Estimated due date','Tarehe inayokadiriwa ya kujifungua'],
 'family.upcoming':['planned visit(s)','ziara zilizopangwa'],
 'family.current':['Current','Inatumika'],
 'family.switch':['Open','Fungua'],
 'family.disclaimer':['Counts are based on your own journal entries, not verified clinic records.','Hesabu zinatokana na taarifa ulizoandika, si kumbukumbu zilizothibitishwa na kliniki.'],
 'a11y.heading':['Display and accessibility','Mwonekano na ufikivu'],
 'a11y.summary':['Customize how this device shows MamaMwana. No medical details are saved in these settings.','Badilisha jinsi kifaa hiki kinavyoonyesha MamaMwana. Hakuna taarifa za kitabibu zinazohifadhiwa katika mipangilio hii.'],
 'a11y.text':['Text size','Ukubwa wa maandishi'],
 'a11y.contrast':['Contrast','Utofauti wa rangi'],
 'a11y.motion':['Motion','Mwendo'],
 'a11y.standard':['Standard','Kawaida'],
 'a11y.large':['Large','Makubwa'],
 'a11y.largest':['Extra large','Makubwa zaidi'],
 'a11y.high':['Higher contrast','Utofauti zaidi'],
 'a11y.system':['Follow device','Fuata kifaa'],
 'a11y.reduce':['Reduce animations','Punguza miondoko'],
 'a11y.reset':['Reset display preferences','Rejesha mipangilio ya mwonekano'],
 'a11y.note':['These display choices apply only to this browser. Your care records and caregiver permissions are unchanged.','Chaguo hizi zinatumika kwenye kivinjari hiki pekee. Kumbukumbu zako na ruhusa za mlezi hazijabadilika.'],
 'a11y.close':['Close display preferences','Funga mipangilio ya mwonekano'],
 'caregiver.scope':['Review exactly what is shared','Pitia taarifa zinazoshirikiwa'],
 'caregiver.acceptScope':['I understand that this is read-only access to one child profile, not the full family health record.','Ninaelewa kuwa ninaweza kusoma taarifa za mtoto mmoja tu, si kumbukumbu zote za afya za familia.']
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
