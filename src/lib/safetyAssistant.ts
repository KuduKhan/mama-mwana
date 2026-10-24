export type Stage = 'pregnancy' | 'postpartum' | 'childhood';
export type SafetyKind = 'urgent'|'education'|'boundary';
export interface GuideResponse {
 kind:SafetyKind;
 title:string;
 answer:string;
 sourceLabel?:string;
 sourceUrl?:string;
 topic?:string;
}
const WHO_POSTNATAL='https://www.who.int/publications/i/item/9789240045989';
const WHO_ANC='https://www.who.int/publications/i/item/9789241549912';
const WHO_FEED='https://www.who.int/health-topics/breastfeeding';
const WHO_GROWTH='https://www.who.int/tools/child-growth-standards';
const CDC_URGENT='https://www.cdc.gov/hearher/maternal-warning-signs/index.html';
const CDC_MILESTONE='https://www.cdc.gov/act-early/milestones/index.html';
const AAP_SLEEP='https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx';

/**
 * Conservative, on-device keyword routing for general education only.
 * Explicitly NOT validated symptom triage. An unrecognised symptom must never
 * trigger a reassuring answer. No LLM, network call, storage or profiling.
 */
const urgentSignals=[
 /\b(bleeding|hemorrhag|haemorrhag|seizure|convulsion|unconscious|fainting)\b/i,
 /\b(severe|intense|unbearable|worst)\s+(headache|abdominal pain|stomach pain|pain|swelling)\b/i,
 /\b(shortness of breath|difficulty breathing|trouble breathing|chest pain|can't breathe|cannot breathe)\b/i,
 /\b(vision loss|blurred vision|blurry vision|seeing spots)\b/i,
 /\b(reduced|decreased|no|stopped|less)\s+(fetal|foetal|baby)\s+(movement|kicks|moving)\b/i,
 /\b(baby|newborn|infant)\s+(not feeding|won't feed|isn't feeding|not breathing|unresponsive|blue lips|seizure)\b/i,
 /\b(suicid|self[- ]?harm|harm myself|hurt myself|harm my baby|hurt my baby)\b/i,
 /\b(high fever|fever in (my )?(baby|newborn)|baby has fever|newborn has fever)\b/i
];
const clinicalQueries=/\b(symptom|medicine|medication|dose|dosage|antibiotic|diagnos|treatment|prescri|sick|illness|blood pressure|contraction|lab result|scan result|ultrasound result|abnormal)\b/i;
const topics=[
 {id:'food',test:/\b(food|eat|diet|meal|nutrition|hydration|drink|water|supplement)\b/i,title:'Nourishment and hydration',answer:'Choose varied, safely prepared foods and drink regularly. Needs differ during pregnancy and breastfeeding; discuss supplements, restrictions and persistent vomiting with your own care team.',sourceLabel:'WHO antenatal care',sourceUrl:WHO_ANC},
 {id:'exercise',test:/\b(exercise|activity|walk|movement|yoga|workout)\b/i,title:'Movement and comfort',answer:'Gentle movement can support wellbeing, but safety depends on medical history, stage and symptoms. Ask your maternity care professional what is suitable for you and stop if concerning symptoms arise.',sourceLabel:'WHO antenatal care',sourceUrl:WHO_ANC},
 {id:'sleep',test:/\b(sleep|bed|rest|position|side)\b/i,title:'Rest and sleep',answer:'During pregnancy, talk with your maternity team about comfortable sleep positioning, especially later in pregnancy. For babies, use back sleeping on a separate firm, flat, clear surface without soft bedding.',sourceLabel:'AAP safe infant sleep',sourceUrl:AAP_SLEEP},
 {id:'feeding',test:/\b(breastfeed|latch|nursing|formula|milk|feeding)\b/i,title:'Early feeding support',answer:'Watch for effective feeding and seek skilled help promptly if your baby feeds poorly or you experience pain or concerns. Feeding choices and clinical needs should be discussed with your infant care team.',sourceLabel:'WHO breastfeeding information',sourceUrl:WHO_FEED},
 {id:'visits',test:/\b(appointment|antenatal|clinic|check.?up|midwife|doctor|vaccin|immuni)\b/i,title:'Health visits and follow-up',answer:'Keep your clinic appointments and your official maternal and child health handbook. Confirm individual follow-up and vaccinations with your clinician, especially if visits or doses were missed.',sourceLabel:'WHO antenatal care',sourceUrl:WHO_ANC},
 {id:'growth',test:/\b(growth|weight|length|milestone|develop)\b/i,title:'Growth and developmental observations',answer:'A record of measurements or milestones is not a diagnosis. Discuss your child’s growth, skills, corrected age if born preterm, or any loss of skills with a qualified clinician.',sourceLabel:'WHO child growth standards',sourceUrl:WHO_GROWTH},
 {id:'recovery',test:/\b(postpartum|after birth|recovery|healing|mood|anxiety|sad|stress)\b/i,title:'Recovery and emotional wellbeing',answer:'Your recovery and emotional wellbeing matter. Follow your postnatal plan and tell your healthcare professional about persistent pain, low mood, anxiety or any other worries. For immediate danger, seek urgent help.',sourceLabel:'WHO postnatal care',sourceUrl:WHO_POSTNATAL}
] as const;

export function getGuidance(input:string,stage?:Stage):GuideResponse {
 const q=input.trim().slice(0,600);
 if(!q)return {kind:'boundary',title:'What would you like to learn?',answer:'Choose a learning topic or ask a general question about pregnancy, postpartum recovery or baby care.'};
 if(urgentSignals.some(pattern=>pattern.test(q))){
  return {kind:'urgent',title:'Please seek urgent medical help',answer:'Some of the signs you mentioned can be serious for a pregnant or postpartum parent or a baby. This app cannot assess emergencies. Get an immediate in-person medical assessment or contact local emergency services. If pregnant or recently pregnant, tell the healthcare team. Do not wait for an app response.',sourceLabel:'CDC urgent maternal warning signs',sourceUrl:CDC_URGENT};
 }
 if(clinicalQueries.test(q)){
  return {kind:'boundary',title:'A healthcare professional should assess this',answer:'MamaMwana cannot diagnose symptoms, interpret medical results, recommend medicine or decide whether treatment is needed. Please contact a qualified healthcare professional. If this feels urgent or is getting worse, seek immediate medical help.',sourceLabel:'CDC maternal warning signs',sourceUrl:CDC_URGENT};
 }
 const matched=topics.find(t=>t.test.test(q));
 if(matched){
  const context=stage==='pregnancy'?'This is general information for pregnancy. ':stage==='postpartum'?'This is general information after birth. ':stage==='childhood'?'This is general information for early childhood. ':'';
  return {kind:'education',title:matched.title,answer:context+matched.answer,sourceLabel:matched.sourceLabel,sourceUrl:matched.sourceUrl,topic:matched.id};
 }
 return {kind:'boundary',title:'I can only offer general learning guidance',answer:'I do not have a reliable answer to this question. Ask your health professional for specific advice. You can explore food, safe sleep, feeding, antenatal visits, growth, recovery or general activity guidance.'};
}
export function isApprovedSource(url:string):boolean{
 try{
  const u=new URL(url);
  const host=u.hostname.toLowerCase();
  return u.protocol==='https:'&&['who.int','cdc.gov','health.go.ke','odpc.go.ke'].some(allowed=>host===allowed||host.endsWith('.'+allowed));
 }catch{return false;}
}
