import type {ConnectedServiceId} from './connectedServicesV21';
import {requireConnectedCareAuthorization} from './connectedServicesV21';
/** Strict architecture contracts; no provider API implementation, credentials or network calls. */
export type CareServicePurpose='assigned-care'|'validated-growth'|'consented-message'|'referral'|'interoperability';
export type CareServiceBoundary={id:ConnectedServiceId;purpose:CareServicePurpose;
 requestFields:readonly string[];authorization:readonly string[];independentEvidence:readonly string[];
 state:'LOCKED';backendRequired:true};
export const V21_BACKEND_CONTRACTS:Readonly<Record<ConnectedServiceId,CareServiceBoundary>>=Object.freeze({
 clinician:{id:'clinician',purpose:'assigned-care',requestFields:['verifiedStaffId','facilityId','assignedCaseId','purpose','consentReference'],authorization:['active professional registration','facility membership','per-case assignment','explicit guardian/parent authorization','fresh session'],independentEvidence:['clinical review','tenant isolation','external penetration test','access audit'],state:'LOCKED',backendRequired:true},
 growth:{id:'growth',purpose:'validated-growth',requestFields:['measurementProvenance','referenceStandardVersion','ageContext','gestationContext'],authorization:['verified clinical reviewer','approved reference version','documented clinical workflow'],independentEvidence:['independent pediatric algorithm validation','adversarial edge-case fixtures'],state:'LOCKED',backendRequired:true},
 reminders:{id:'reminders',purpose:'consented-message',requestFields:['reviewedTemplateId','recipientToken','clinicianPlanReference','consentExpiresAt'],authorization:['revocable recorded consent','approved provider and template','anti-replay/idempotency guard'],independentEvidence:['provider delivery failure testing','message privacy review'],state:'LOCKED',backendRequired:true},
 coordination:{id:'coordination',purpose:'referral',requestFields:['senderOrg','recipientOrg','scopedCaseRef','reasonCode','authorizationExpiresAt'],authorization:['verified sender and receiver','consented purpose limitation','receipt and revocation'],independentEvidence:['partner contract','cross-organization isolation','audit trace'],state:'LOCKED',backendRequired:true},
 interop:{id:'interop',purpose:'interoperability',requestFields:['approvedGatewayId','resourceProfile','terminologyVersion','scope','purpose'],authorization:['licensed facility','government/DHA applicability determination','service credential and audited scope'],independentEvidence:['FHIR conformance','mapping/terminology review','privacy impact assessment'],state:'LOCKED',backendRequired:true}
});
export function getCareServiceContract(id:ConnectedServiceId):CareServiceBoundary{
 const c=V21_BACKEND_CONTRACTS[id];if(!c||c.state!=='LOCKED')throw new Error('MM_V21_CONTRACT_UNKNOWN');return c;
}
/** Deliberately impossible to activate from the public frontend. */
export function invokeConnectedCare():never{return requireConnectedCareAuthorization();}
