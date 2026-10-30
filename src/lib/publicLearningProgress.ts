import {ACADEMY_TOPICS} from '../content/learningAcademyV209';

// Only general-education quiz answer indices. No names, logins, clinical notes,
// care plans, baby measurements, identifiers, or network synchronization.
export const PUBLIC_LEARNING_KEY='mamamwana-public-learning-answers-v1';
export type PublicAnswers=Record<string,number>;
export function sanitizePublicAnswers(value:unknown):PublicAnswers{
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 const given=value as Record<string,unknown>,result:PublicAnswers={};
 for(const topic of ACADEMY_TOPICS){
  const answer=given[topic.id];
  if(Number.isInteger(answer)&&typeof answer==='number'&&answer>=0&&answer<topic.answers[0].length)
   result[topic.id]=answer;
 }
 return result;
}
export function readPublicAnswers(storage:Pick<Storage,'getItem'>|null):PublicAnswers{
 if(!storage)return {};
 try{const raw=storage.getItem(PUBLIC_LEARNING_KEY);return raw?sanitizePublicAnswers(JSON.parse(raw)):{};}
 catch{return {};}
}
export function storePublicAnswers(storage:Pick<Storage,'setItem'|'removeItem'>|null,answers:PublicAnswers):void{
 if(!storage)return;
 try{
  const valid=sanitizePublicAnswers(answers);
  if(Object.keys(valid).length)storage.setItem(PUBLIC_LEARNING_KEY,JSON.stringify(valid));
  else storage.removeItem(PUBLIC_LEARNING_KEY);
 }catch{/* Storage denied: education still works in memory. */}
}
