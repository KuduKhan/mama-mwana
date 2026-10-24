export type Education = { title:string; summary:string; baby:string; mother:string; focus:string };
const notes: Record<number,string> = {
4:'Early implantation and important foundational changes are underway.',
5:'Early structures that will form the brain and spinal cord are developing.',
6:'The embryo is changing quickly; timing of visible findings on ultrasound varies.',
7:'Early facial structures and limb buds continue developing.',
8:'Major organ systems continue their early formation.',
9:'The embryo enters an important period of growth and refinement.',
10:'Small movements can begin even though you cannot feel them yet.',
11:'The developing baby has many recognisable body features.',
12:'Growth and organ maturation continue into the end of the first trimester.',
13:'The placenta supports the baby as development continues.',
14:'The second trimester begins, with ongoing growth and movement.',
15:'Bones and muscles continue to mature.',
16:'The baby is growing stronger; some parents may notice movement in coming weeks.',
17:'The baby continues to develop movement and responses.',
18:'Hearing structures continue developing.',
19:'Skin is becoming protected by developing protective coatings.',
20:'The anatomy scan is commonly discussed around this stage with your clinician.',
21:'Patterns of movement become more noticeable for many mothers.',
22:'The lungs and other organs keep developing, although they are not yet fully mature.',
23:'The developing baby continues growing and practising movements.',
24:'The lungs and nervous system are still developing rapidly.',
25:'Your baby continues building strength and refining reflexes.',
26:'Hearing and movement patterns continue developing.',
27:'The end of the second trimester approaches.',
28:'The third trimester begins, with major growth ahead.',
29:'The brain and nervous system continue to mature.',
30:'Your baby is gaining weight and refining body functions.',
31:'The baby continues developing sleep-wake patterns.',
32:'The lungs, brain and body continue maturing.',
33:'The baby is growing steadily and may be changing position.',
34:'More fat is being laid down beneath the skin.',
35:'The final weeks involve growth and preparation for life after birth.',
36:'Discuss signs of labour and your birth plan with your care team.',
37:'Your baby is near term; timing of birth still varies.',
38:'Final maturation and preparation for birth continue.',
39:'Your baby is full term; keep your clinical contact and birth plan ready.',
40:'Your estimated due date is near; it is an estimate, not a deadline.',
41:'Some pregnancies continue past their estimated due date; follow your clinician’s monitoring plan.',
42:'Prompt medical assessment and an individualized birth plan are especially important after 41 weeks.'
};
const trimesterGuide=[
  { title:'A foundation for life', mother:'Fatigue, nausea or changes in appetite may occur. Every pregnancy is different.',focus:'Ask about your antenatal booking, folic acid and iron guidance, and how to manage nausea safely.'},
  { title:'Growing together', mother:'Your bump may become more noticeable, and you may begin to feel the baby move.',focus:'Discuss the anatomy scan, balanced meals, oral health and activity appropriate for you.'},
  { title:'Preparing for hello', mother:'Sleep discomfort, pressure and tiredness may increase. Contact care if symptoms worry you.',focus:'Plan birth transport, newborn essentials and postnatal support. Learn your baby’s normal movement pattern.'}
];
export function educationForWeek(week:number):Education {
 const tri=week<=13?0:week<=27?1:2;
 const g=trimesterGuide[tri];
 return {title:g.title,summary:'Week '+week+' • '+(tri===0?'First':tri===1?'Second':'Third')+' trimester',baby:notes[Math.max(4,Math.min(42,week))]||'Every pregnancy develops at its own pace. Your care team can explain individual findings.',mother:g.mother,focus:g.focus};
}
export const CARE_TASKS=[
 {id:'hydrate',icon:'droplets',title:'Drink regularly',description:'Keep water available and drink through the day; follow your clinician’s advice for any fluid restrictions.'},
 {id:'nourish',icon:'utensils',title:'Choose a nourishing meal',description:'Include varied foods, well-washed produce and safely cooked protein. Ask about prescribed supplements.'},
 {id:'move',icon:'footprints',title:'Move gently, if cleared',description:'Try comfortable activity only if your pregnancy care provider has not advised against it.'},
 {id:'rest',icon:'moon',title:'Make space for rest',description:'Take a break and support your sleep and comfort.'},
 {id:'connect',icon:'heart',title:'Check in with yourself',description:'Notice how you feel and note any concerns to share with your care team.'}
];
export const POSTPARTUM_TASKS=[
 {id:'recover',icon:'heart-pulse',title:'Care for your recovery',description:'Rest when possible, eat and drink regularly and follow the care plan from your birth provider.'},
 {id:'feed',icon:'baby',title:'Notice baby’s feeding',description:'Follow your newborn feeding plan and contact your provider if feeding becomes difficult.'},
 {id:'sleep',icon:'moon',title:'Keep baby’s sleep space safe',description:'Always put baby down on the back on a firm, flat, clear surface.'},
 {id:'feelings',icon:'heart',title:'Check your emotional wellbeing',description:'Share overwhelming or persistent changes in mood with a healthcare professional.'},
 {id:'support',icon:'hand-heart',title:'Ask for practical support',description:'Invite trusted people to help with meals, chores or errands.'}
];
export const CHILDHOOD_TASKS=[
 {id:'talkplay',icon:'heart',title:'Connect, talk and play',description:'Offer affection, conversation and age-appropriate play; follow your child’s interests.'},
 {id:'food',icon:'utensils',title:'Support age-appropriate feeding',description:'Follow your child’s feeding stage and healthcare advice; offer nourishing, safely prepared foods when developmentally ready.'},
 {id:'safe',icon:'baby',title:'Make everyday spaces safer',description:'Review age-appropriate safe sleep, choking, injury prevention and supervision needs.'},
 {id:'grow',icon:'footprints',title:'Notice new discoveries',description:'Celebrate progress without comparing children. Ask your health professional about any concerns.'},
 {id:'wellbeing',icon:'hand-heart',title:'Care for yourself too',description:'Check your own wellbeing and lean on trusted support when needed.'}
];
export const MILESTONES=[
 {age:2,key:'2_smile',label:'Smiles when you speak or smile',area:'Social'},
 {age:2,key:'2_looks',label:'Watches you as you move',area:'Learning'},
 {age:4,key:'4_coo',label:'Makes cooing sounds',area:'Communication'},
 {age:4,key:'4_head',label:'Holds head steady when held',area:'Movement'},
 {age:6,key:'6_laugh',label:'Laughs and enjoys interaction',area:'Social'},
 {age:6,key:'6_reach',label:'Reaches to grab a toy',area:'Movement'},
 {age:9,key:'9_sit',label:'Sits without support',area:'Movement'},
 {age:9,key:'9_name',label:'Looks when you call their name',area:'Communication'},
 {age:12,key:'12_wave',label:'Waves bye-bye',area:'Social'},
 {age:12,key:'12_stand',label:'Pulls up to stand',area:'Movement'},
 {age:18,key:'18_walk',label:'Walks without holding on',area:'Movement'},
 {age:18,key:'18_words',label:'Tries to say several words beyond mama or dada',area:'Communication'},
 {age:24,key:'24_two',label:'Puts two words together',area:'Communication'},
 {age:24,key:'24_run',label:'Runs',area:'Movement'},
 {age:36,key:'36_talk',label:'Has short back-and-forth conversations',area:'Communication'},
 {age:36,key:'36_play',label:'Notices other children and joins play',area:'Social'},
 {age:48,key:'48_sentences',label:'Says sentences with four or more words',area:'Communication'},
 {age:48,key:'48_catch',label:'Catches a large ball most of the time',area:'Movement'},
 {age:60,key:'60_story',label:'Tells a story with at least two events',area:'Communication'},
 {age:60,key:'60_hop',label:'Hops on one foot',area:'Movement'}
];
export const SOURCES=[
 {title:'WHO antenatal care recommendations',url:'https://www.who.int/publications/i/item/9789241549912'},
 {title:'WHO maternal and newborn postnatal care',url:'https://www.who.int/publications/i/item/9789240045989'},
 {title:'CDC developmental milestones',url:'https://www.cdc.gov/act-early/milestones/index.html'},
 {title:'CDC urgent maternal warning signs',url:'https://www.cdc.gov/hearher/maternal-warning-signs/index.html'},
 {title:'AAP safe sleep guidance',url:'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx'}
];
