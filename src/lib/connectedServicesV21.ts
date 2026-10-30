/**
 * v2.1+ architecture preview only. No clinical service may read, write, send
 * notifications, interpret measurements or exchange records through this module.
 * Browser flags, demo accounts and CI results cannot grant clinical approval.
 */
export type ConnectedServiceId='clinician'|'growth'|'reminders'|'coordination'|'interop';
export type ConnectedCareService={
 id:ConnectedServiceId;title:string;summary:string;requirements:readonly string[];
 workflowPreview:readonly string[];status:'LOCKED';
};
export const CONNECTED_CARE_SERVICES:readonly ConnectedCareService[]=Object.freeze([
 {id:'clinician',title:'Clinician workspace',summary:'A verified-care-team review and documentation workflow is planned; no clinician account is provisioned here.',requirements:['Verified professional credentials and facility approval','Backend-only roles, RLS and independently approved clinical SOPs'],workflowPreview:['Verify professional and facility authorization','Open only explicitly assigned, consented cases','Submit reviewed documentation with dual controls'],status:'LOCKED'},
 {id:'growth',title:'Validated growth interpretation',summary:'WHO-standard clinical growth interpretation is not active. Current parent-entered measurement trends are not diagnoses.',requirements:['Independent pediatric validation of standard, age and sex inputs','Reference versioning, prematurity handling, uncertainty and clinical safety review'],workflowPreview:['Check professionally validated measurements','Apply the approved reference in a backend clinical service','Independent clinical interpretation, review and audit'],status:'LOCKED'},
 {id:'reminders',title:'Approved clinical reminders',summary:'No clinical push, SMS, email or automated dose/visit scheduling is available.',requirements:['Clinician-governed schedule and content approval','Consent, opt-out, privacy-safe message templates and reliable delivery testing'],workflowPreview:['Confirm clinician-supplied timing','Check consent and recipient preference','Send reviewed private-safe communications from protected backend'],status:'LOCKED'},
 {id:'coordination',title:'Verified care coordination',summary:'No facility referral or caregiver data sharing is activated by this preview.',requirements:['Provider and organization verification','Guardian/parent consent scope, revocation, purpose limitation and audit'],workflowPreview:['Verify referral sender and destination','Receive purpose-limited explicit authorization','Exchange minimum required information with audited confirmation'],status:'LOCKED'},
 {id:'interop',title:'FHIR/HIE integration',summary:'There is no live FHIR endpoint, Health Information Exchange connection or hospital credential.',requirements:['DHA certification and facility-specific go-live permission where applicable','Authenticated backend integration, FHIR conformance, terminology/privacy mapping and audit'],workflowPreview:['Complete approved terminology and data-contract mapping','Validate synthetic conformance fixtures in a separate test service','Authorize, monitor and audit a contracted integration'],status:'LOCKED'}
]);
/** This is an unconditional fail-closed boundary, including when callers pass fake authorization. */
export function requireConnectedCareAuthorization(_requested?:unknown):never{
 throw new Error('MM_V21_CLINICAL_NO_GO: Connected care is unavailable until independent approval and a separately reviewed backend release.');
}
export function connectedCarePreview(id:ConnectedServiceId):ConnectedCareService{
 const service=CONNECTED_CARE_SERVICES.find(s=>s.id===id);
 if(!service)throw new Error('Unknown connected care capability');
 return service;
}
