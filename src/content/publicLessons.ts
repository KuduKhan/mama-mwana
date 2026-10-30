/** Authored general education, not reviewed medical content. Nothing from a private journey is used. */
export type PublicLesson={id:string;heading:readonly [string,string];summary:readonly [string,string];steps:readonly [string,string];sourceUrl:string;status:'general-unreviewed'};
export const PUBLIC_LESSONS:readonly PublicLesson[]=[
 {id:'questions',heading:['Prepare questions','Andaa maswali'],summary:['Make a list for a professional appointment.','Tengeneza orodha kwa ajili ya miadi ya kitaalamu.'],steps:['Write down your questions; confirm any care advice with your clinician.','Andika maswali yako; thibitisha ushauri wa afya na mtaalamu wako.'],sourceUrl:'https://www.who.int/publications/i/item/9789241549912',status:'general-unreviewed'},
 {id:'family',heading:['Build a support circle','Jenga mtandao wa msaada'],summary:['Share everyday practical responsibilities with trusted people.','Gawana majukumu ya kila siku na watu unaowaamini.'],steps:['Talk about who can help with meals, transport and other everyday tasks.','Zungumzeni kuhusu msaada wa chakula, usafiri na shughuli nyingine.'],sourceUrl:'https://www.who.int/publications/i/item/9789240045989',status:'general-unreviewed'},
 {id:'learning',heading:['Learn together','Jifunzeni pamoja'],summary:['Enjoy stories, singing and age-appropriate play without comparisons.','Furahieni hadithi, nyimbo na michezo bila kulinganisha watoto.'],steps:['Choose activities your family enjoys and discuss developmental concerns with a qualified provider.','Chagueni michezo mnayoipenda na jadilini wasiwasi wa ukuaji na mtaalamu.'],sourceUrl:'https://www.who.int/tools/child-growth-standards',status:'general-unreviewed'},
 {id:'privacy',heading:['Keep information private','Linda taarifa binafsi'],summary:['Treat personal records as private and check device access.','Linda kumbukumbu binafsi na ufikiaji wa kifaa.'],steps:['Use a device passcode; never forward account or family information without permission.','Tumia nambari ya siri ya kifaa; usitume taarifa za familia bila ruhusa.'],sourceUrl:'https://www.who.int/publications/i/item/9789240045989',status:'general-unreviewed'}
];
export function publicLessonText(id:string,language:'en'|'sw'):string{
 const lesson=PUBLIC_LESSONS.find(l=>l.id===id);
 if(!lesson)return '';
 const i=language==='sw'?1:0;
 return [lesson.heading[i],lesson.summary[i],lesson.steps[i],'','General educational prompt only; not independently reviewed medical content.','Source reference: '+lesson.sourceUrl].join('\n');
}
