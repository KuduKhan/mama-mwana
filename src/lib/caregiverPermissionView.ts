export type InvitationView={status:'pending'|'accepted'|'revoked';expires_at:string;shared_until:string|null};
export type AccessStatus='pending'|'active'|'expired'|'revoked';
/** Visual status only; Supabase RLS and guarded RPCs remain authoritative for access. */
export function caregiverAccessStatus(item:InvitationView,now=new Date()):AccessStatus{
 if(item.status==='revoked')return 'revoked';
 if(item.status==='pending')return Date.parse(item.expires_at)>now.getTime()?'pending':'expired';
 return item.shared_until&&Date.parse(item.shared_until)>now.getTime()?'active':'expired';
}
