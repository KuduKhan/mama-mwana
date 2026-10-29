/** Public source registry only. Unreviewed clinical translations must not be presented as approved. */
export type EducationTopic={
 id:'pregnancy'|'postnatal'|'growth';
 sourceLabel:string;sourceUrl:string;
 sourceVersion:string;
 clinicalReviewerId:null;clinicalReviewedAt:null;
 swClinicalReviewerId:null;swClinicalReviewedAt:null;
};
export const EDUCATION_REVIEW_REGISTER:readonly EducationTopic[]=[
 {id:'pregnancy',sourceLabel:'WHO antenatal care recommendations',sourceUrl:'https://www.who.int/publications/i/item/9789241549912',sourceVersion:'WHO 2016 publication',clinicalReviewerId:null,clinicalReviewedAt:null,swClinicalReviewerId:null,swClinicalReviewedAt:null},
 {id:'postnatal',sourceLabel:'WHO postnatal care recommendations',sourceUrl:'https://www.who.int/publications/i/item/9789240045989',sourceVersion:'WHO 2022 publication',clinicalReviewerId:null,clinicalReviewedAt:null,swClinicalReviewerId:null,swClinicalReviewedAt:null},
 {id:'growth',sourceLabel:'WHO child growth standards',sourceUrl:'https://www.who.int/tools/child-growth-standards',sourceVersion:'WHO source — verify current version',clinicalReviewerId:null,clinicalReviewedAt:null,swClinicalReviewerId:null,swClinicalReviewedAt:null}
];
/** This UI check is not an authorization mechanism; source approval requires independent, signed governance. */
export function isBilingualClinicallyReviewed(topic:EducationTopic){
 return Boolean(topic.clinicalReviewerId&&topic.clinicalReviewedAt&&topic.swClinicalReviewerId&&topic.swClinicalReviewedAt);
}
