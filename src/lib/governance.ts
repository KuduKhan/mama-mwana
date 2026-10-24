import {isApprovedSource} from './safetyAssistant';
export interface ReviewCandidate {
 status:string;
 author_id:string|null;
 source_url:string;
}
export function canIndependentlyApprove(article:ReviewCandidate,reviewerId:string|null):boolean{
 return Boolean(reviewerId&&article.author_id&&article.author_id!==reviewerId&&article.status==='in_review'&&isApprovedSource(article.source_url));
}
export type DataRightType = 'access'|'correction'|'erasure';
export type DataRightStatus = 'received'|'in_review'|'resolved'|'declined';
export interface DataRightRequest {
 id:string;
 request_type:DataRightType;
 status:DataRightStatus;
 requested_at:string;
 resolved_at:string|null;
}
export const DATA_RIGHTS_LABELS:Record<DataRightType,string>={
 access:'Request a copy of account data',
 correction:'Request correction of account data',
 erasure:'Request account erasure review'
};
export function canRequestRight(type:DataRightType,existing:readonly DataRightRequest[]):boolean{
 return !existing.some(r=>r.request_type===type&&(r.status==='received'||r.status==='in_review'));
}
