/** Refuse all hosted/tunneled endpoints when creating disposable Auth fixtures. */
export function assertLocalSupabaseEndpoint(value){
 const url=new URL(value);
 if(url.protocol!=='http:' || !['localhost','127.0.0.1','[::1]'].includes(url.hostname) || !url.port){
  throw new Error('REFUSED: fixtures may connect only to a loopback HTTP Supabase endpoint with explicit port.');
 }
 return url.toString();
}
