import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertTriangle, BookHeart, CheckCircle2, ExternalLink, HeartHandshake, LockKeyhole, MessageCircle, Plus, ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getGuidance, isApprovedSource } from '../lib/safetyAssistant';
import {canIndependentlyApprove} from '../lib/governance';
import type { GuideResponse, Stage } from '../lib/safetyAssistant';

interface Article { author_id:string|null; id:string; title:string; summary:string; body:string; source_url:string; topic:string; locale:string; status:string; version:number }
interface Props { stage:Stage; allowStageContext:boolean; userId:string|null; isDemo:boolean }
const SAMPLES=[
  'What are nourishing food choices during pregnancy?',
  'How can I help my baby sleep safely?',
  'What should I discuss at my next antenatal visit?',
  'How do developmental milestones work?'
];
export default function GuidanceV04({stage,allowStageContext,userId,isDemo}:Props){
 const [question,setQuestion]=useState('');
 const [result,setResult]=useState<GuideResponse|null>(null);
 const [articles,setArticles]=useState<Article[]>([]);
 const [isReviewer,setIsReviewer]=useState(false);
 const [reviewQueue,setReviewQueue]=useState<Article[]>([]);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(false);
 const [draftTitle,setDraftTitle]=useState('');
 const [draftSummary,setDraftSummary]=useState('');
 const [draftBody,setDraftBody]=useState('');
 const [draftSource,setDraftSource]=useState('');
 const [draftTopic,setDraftTopic]=useState('general');
 const [reviewBusy,setReviewBusy]=useState(false);
 useEffect(()=>{
  let live=true;
  setArticles([]);setIsReviewer(false);setReviewQueue([]);
  if(isDemo||!userId||!supabase)return;
  const client=supabase;setLoading(true);
  void Promise.all([
   client.from('education_articles').select('id,title,summary,body,source_url,topic,locale,status,version,author_id').eq('status','approved').order('updated_at',{ascending:false}).limit(20),
   client.from('clinical_reviewers').select('is_active').eq('user_id',userId).maybeSingle()
  ]).then(async ([published,assignment])=>{
   if(!live)return;
   if(published.error){setError('Reviewed education library is not connected. Apply the v0.4 migration.');setLoading(false);return;}
   setArticles(((published.data??[]) as Article[]).filter(a=>isApprovedSource(a.source_url)));
   const reviewer=Boolean(assignment.data?.is_active);
   setIsReviewer(reviewer);
   if(reviewer){
    const queue=await client.from('education_articles').select('id,title,summary,body,source_url,topic,locale,status,version,author_id').in('status',['draft','in_review']).order('updated_at',{ascending:false}).limit(50);
    if(live){if(queue.error)setError(queue.error.message);else setReviewQueue(((queue.data??[]) as Article[]));}
   }
   if(live)setLoading(false);
  }).catch(()=>{if(live){setLoading(false);setError('Unable to load reviewed guidance.');}});
  return ()=>{live=false;};
 },[isDemo,userId]);
 function ask(event?:FormEvent,example?:string){event?.preventDefault();const text=example??question;setQuestion(text);setResult(getGuidance(text,allowStageContext?stage:undefined));}
 async function createDraft(e:FormEvent){
  e.preventDefault();setError('');
  if(!supabase||!isReviewer||!userId)return;
  if(!isApprovedSource(draftSource)){setError('Use an official HTTPS source from WHO, CDC or Kenya Ministry of Health.');return;}
  if(draftTitle.trim().length<5||draftBody.trim().length<30){setError('A useful title and at least 30 characters of draft content are required.');return;}
  setReviewBusy(true);
  const {data,error:saveError}=await supabase.from('education_articles').insert({
    slug:'guide-'+crypto.randomUUID(),title:draftTitle.trim().slice(0,150),summary:draftSummary.trim().slice(0,500),
    body:draftBody.trim().slice(0,10000),topic:draftTopic.trim().slice(0,80),locale:'en',
    source_url:draftSource,author_id:userId,status:'in_review'
  }).select('id,title,summary,body,source_url,topic,locale,status,version,author_id').single();
  setReviewBusy(false);
  if(saveError){setError(saveError.message);return;}
  if(data){setReviewQueue(q=>[data as Article,...q]);setDraftBody('');setDraftTitle('');setDraftSummary('');setDraftSource('');}
 }
 async function approve(article:Article){
  if(!isReviewer||!userId||!supabase||!canIndependentlyApprove(article,userId))return;
  if(!isApprovedSource(article.source_url)){setError('This reference is not an allowed public health source.');return;}
  if(!window.confirm('Confirm that you are the clinically authorized reviewer and that you personally checked this exact version and source. Publish it?'))return;
  setReviewBusy(true);setError('');
  const {error:saveError}=await supabase.from('education_articles').update({
   status:'approved',reviewed_by:userId,reviewed_at:new Date().toISOString()
  }).eq('id',article.id).eq('status','in_review').neq('author_id',userId).select('id').single();
  setReviewBusy(false);
  if(saveError){setError(saveError.message);return;}
  setReviewQueue(q=>q.filter(a=>a.id!==article.id));
  setArticles(a=>[{...article,status:'approved'},...a]);
 }
 return <div className="page-content v4-page">
  <div className="section-heading"><div><div className="eyebrow">MAMAMWANA GUIDANCE • V0.5</div><h2>Ask about your journey</h2><p>A source-linked educational guide with clear clinical safety boundaries.</p></div></div>
  <div className="v4-guidance-head">
   <span><HeartHandshake size={27}/></span><div><strong>Learning support, not a diagnosis</strong><p>Questions are processed in this browser session. No LLM, external AI service or chat history storage is used. This early guide is keyword-based and cannot reliably assess symptoms or emergencies.</p></div>
  </div>
  <section className="panel v4-guide-form">
   <div className="eyebrow">YOUR QUESTION</div>
   <form onSubmit={e=>ask(e)}>
    <label htmlFor="mama-question">Ask a general education question</label>
    <textarea id="mama-question" value={question} onChange={e=>setQuestion(e.target.value.slice(0,600))} maxLength={600} rows={4} placeholder="e.g. What should I know about baby sleep?"/>
    <div className="v4-form-bottom"><small>{allowStageContext?'Stage-only context enabled by your privacy preference.':'No personal journey context is used.'}</small><button type="submit" disabled={!question.trim()}><MessageCircle size={17}/> Find guidance</button></div>
   </form>
   <div className="v4-sample-chips">{SAMPLES.map(s=><button onClick={()=>ask(undefined,s)} key={s}>{s}</button>)}</div>
  </section>
  {result&&<section className={'panel v4-answer '+(result.kind==='urgent'?'v4-urgent':result.kind==='boundary'?'v4-boundary':'')} role="status">
   <div className="v4-answer-icon">{result.kind==='urgent'?<ShieldAlert size={24}/>:result.kind==='boundary'?<AlertTriangle size={23}/>:<BookHeart size={23}/>}</div>
   <div><span className="eyebrow">{result.kind==='urgent'?'URGENT • SEEK IN-PERSON HELP':result.kind==='boundary'?'CLINICAL BOUNDARY':'GENERAL EDUCATION • SOURCE-LINKED'}</span><h3>{result.title}</h3><p>{result.answer}</p>{result.sourceUrl&&<a rel="noopener noreferrer" target="_blank" href={result.sourceUrl}>{result.sourceLabel??'Public health reference'} <ExternalLink size={15}/></a>}</div>
  </section>}
  <section className="panel v4-library"><div className="panel-heading"><div><div className="eyebrow">CLINICALLY REVIEWED MATERIALS</div><h3>Reviewed learning articles</h3></div><ShieldCheck size={22}/></div>
   <p className="muted">Only articles explicitly approved by a database-assigned clinical reviewer are shown here. Source-linked answers above are <strong>not</strong> themselves certified as clinically reviewed.</p>
   {loading?<p className="v4-hint">Loading library…</p>:articles.length===0?<p className="v4-empty">No clinician-approved MamaMwana articles have been published yet. The review workflow must be completed before showing that label.</p>:<div className="v4-article-grid">{articles.map(a=><article key={a.id} className="v4-article"><span className="v4-approved"><CheckCircle2 size={14}/> Reviewed • v{a.version}</span><h4>{a.title}</h4><p>{a.summary}</p><details><summary>Read this article</summary><p className="v4-article-body">{a.body}</p></details><a href={a.source_url} rel="noopener noreferrer" target="_blank">Official source <ExternalLink size={13}/></a></article>)}</div>}
  </section>
  {isReviewer&&<section className="panel v4-review"><div className="eyebrow">RESTRICTED • AUTHORIZED REVIEWER</div><h3>Clinical content review desk</h3><p className="muted">Database-assigned clinicians may submit drafts. A different, independently authorized clinician must approve each submitted version. Published articles cannot be changed in place; every approval is logged. This still requires an external clinical governance policy.</p>
   <form onSubmit={createDraft} className="v4-review-form">
    <label>Article title<input required minLength={5} maxLength={150} value={draftTitle} onChange={e=>setDraftTitle(e.target.value)}/></label>
    <label>Summary<input maxLength={500} value={draftSummary} onChange={e=>setDraftSummary(e.target.value)}/></label>
    <label>Topic<input maxLength={80} value={draftTopic} onChange={e=>setDraftTopic(e.target.value)}/></label>
    <label>Official source URL<input required type="url" value={draftSource} onChange={e=>setDraftSource(e.target.value)}/></label>
    <label>Clinically reviewed text<textarea rows={5} minLength={30} maxLength={10000} value={draftBody} onChange={e=>setDraftBody(e.target.value)}/></label>
    <button disabled={reviewBusy} type="submit"><Plus size={16}/> Submit for review</button>
   </form>
   <h4>Awaiting approval</h4>
   {reviewQueue.length===0?<p className="v4-hint">No pending articles.</p>:reviewQueue.map(a=><div key={a.id} className="v4-review-entry"><div><strong>{a.title}</strong><p>{a.body}</p><a href={a.source_url} target="_blank" rel="noopener noreferrer">Check source <ExternalLink size={13}/></a></div>{canIndependentlyApprove(a,userId)?<button disabled={reviewBusy} onClick={()=>approve(a)}><ShieldCheck size={15}/> Approve independently</button>:<span className="v5-awaiting-label">{a.author_id===userId?'You submitted this • awaiting another clinician':'Independent review unavailable'}</span>}</div>)}
  </section>}
  {error&&<p className="v4-error" role="alert">{error}</p>}
  <p className="footnote"><LockKeyhole size={14}/> Not for medical emergencies. Do not enter names, record numbers or other identifying health information in the question field. The application does not send questions to an external AI provider.</p>
 </div>;
}
