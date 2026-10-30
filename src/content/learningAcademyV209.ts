/** Nonclinical comprehension and safe digital-literacy questions.
 * General education only: no patient, growth or diagnostic inference. */
export type AcademyTopic={id:string;heading:readonly [string,string];prompt:readonly [string,string];
 answers:readonly [readonly string[],readonly string[]];correct:number;explanation:readonly [string,string];
 source:string;status:'general-unreviewed'};
export const ACADEMY_TOPICS:readonly AcademyTopic[]=[
 {id:'questions',heading:['Preparing for a visit','Kuandaa ziara'],
 prompt:['Who should confirm the time and medical purpose of a visit?','Ni nani anayepaswa kuthibitisha muda na sababu ya ziara?'],
 answers:[['The health professional or clinic','An unverified online post','An automated journal reminder'],
  ['Mtaalamu wa afya au kliniki','Ujumbe mtandaoni usiothibitishwa','Kikumbusho cha kumbukumbu binafsi']],
 correct:0,explanation:['Journal dates are self-entered. Confirm details with the clinic.','Tarehe za kumbukumbu umeziandika mwenyewe. Thibitisha na kliniki.'],
 source:'https://www.who.int/publications/i/item/9789241549912',status:'general-unreviewed'},
 {id:'privacy',heading:['Family data privacy','Faragha ya familia'],
 prompt:['What is a good first step before sharing a family record?','Ni hatua gani nzuri kabla ya kushiriki kumbukumbu ya familia?'],
 answers:[['Check permission and the recipient','Post it publicly','Share your password'],
  ['Angalia ruhusa na anayepokea','Chapisha hadharani','Shiriki nenosiri lako']],
 correct:0,explanation:['Only share with authorized people for an agreed purpose.','Shiriki tu na waliopata ruhusa kwa madhumuni yaliyokubaliwa.'],
 source:'https://www.odpc.go.ke/',status:'general-unreviewed'},
 {id:'support',heading:['Practical support','Msaada wa kila siku'],
 prompt:['Which is an example of a practical, nonclinical family task?','Ni mfano upi wa kazi ya nyumbani isiyo ya kitabibu?'],
 answers:[['Arrange transport or groceries','Interpret a clinical growth chart','Prescribe medication'],
  ['Panga usafiri au ununuzi','Tafsiri chati ya ukuaji','Agiza dawa']],
 correct:0,explanation:['Household support is different from professional medical care.','Msaada wa nyumbani ni tofauti na huduma ya afya ya kitaalamu.'],
 source:'https://www.who.int/publications/i/item/9789240045989',status:'general-unreviewed'},
 {id:'source',heading:['Trustworthy learning','Kujifunza kwa uhakika'],
 prompt:['What should you check before relying on a health lesson?','Unapaswa kuangalia nini kabla ya kutegemea somo la afya?'],
 answers:[['Source, review status, and date','Only the bright design','Number of likes'],
  ['Chanzo, hali ya ukaguzi na tarehe','Muonekano mzuri pekee','Idadi ya waliopenda']],
 correct:0,explanation:['Content marked unreviewed is not approved medical guidance.','Maudhui yasiyokaguliwa si mwongozo wa kitabibu ulioidhinishwa.'],
 source:'https://www.who.int/publications/i/item/9789240045989',status:'general-unreviewed'}
];
export function academyAnswer(id:string,choice:number):{correct:boolean;explanation:readonly [string,string]}|null{
 const found=ACADEMY_TOPICS.find(topic=>topic.id===id);
 if(!found||!Number.isInteger(choice)||choice<0||choice>=found.answers[0].length)return null;
 return {correct:choice===found.correct,explanation:found.explanation};
}
