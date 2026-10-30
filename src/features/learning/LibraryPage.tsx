import {Activity,Baby,BookHeart,ExternalLink,Stethoscope,Utensils} from 'lucide-react';
import {Panel,SectionTitle} from '../../ui/primitives';
import PublicLearningV204 from '../../components/PublicLearningV204';
import LearningAcademyV209 from '../../components/LearningAcademyV209';
import {EducationReviewV16} from '../../components/ConnectedFamilyV16';
import {SOURCES} from '../../content/education';
import {WarningCard} from '../../ui/FeedbackPanels';
/** Isolated feature view: no hidden access to App state, Auth or patient records. */
export default function LibraryPage({onEmergency}:{onEmergency:()=>void}){
 return <div className="page-content"><SectionTitle eyebrow="KNOWLEDGE WITH CARE" title="Health & learning library" subtitle="Practical education grounded in trusted health organizations. Always follow your own care team’s advice."/>
  <PublicLearningV204/>
  <LearningAcademyV209/>
  <EducationReviewV16/>
  <div className="library-grid"><Panel className="library-card"><span className="small-round mint"><Utensils size={22}/></span><h3>Food and hydration</h3><p>Eat varied, nutritious and safely prepared foods. Wash produce, cook meat and eggs thoroughly, avoid unpasteurized dairy, and discuss supplements and any special dietary needs with your care team.</p></Panel><Panel className="library-card"><span className="small-round peach"><Activity size={22}/></span><h3>Movement and comfort</h3><p>With an uncomplicated pregnancy and medical clearance, gentle movement can be beneficial. Stop if you experience concerning symptoms and seek professional advice. From 28 weeks, go to sleep on your side.</p></Panel><Panel className="library-card"><span className="small-round lilac"><Baby size={22}/></span><h3>After baby arrives</h3><p>Newborns need safe sleep on their backs, feeding support and routine newborn checks. Mothers need postnatal assessments, pain and wound support, and attention to emotional wellbeing.</p></Panel><Panel className="library-card"><span className="small-round sand"><Stethoscope size={22}/></span><h3>Health appointments</h3><p>Use your country’s current maternal and child health handbook and clinician-provided schedule for visits, immunizations and investigations. MamaMwana does not automatically prescribe them.</p></Panel></div>
  <Panel className="resources-panel"><div className="eyebrow">EVIDENCE & REFERENCES</div><h3>Learn from trusted sources</h3><div className="resource-links">{SOURCES.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer"><span><BookHeart size={18}/>{s.title}</span><ExternalLink size={17}/></a>)}</div><p className="footnote">General education content • Initial review October 2026 • Requires professional clinical review before use in a live health service. Not a medical device, diagnosis or individualized treatment plan.</p></Panel>
  <WarningCard onOpen={onEmergency}/>
 </div>;
}
