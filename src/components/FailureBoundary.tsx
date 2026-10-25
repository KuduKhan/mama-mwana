import React from 'react';
import type {ErrorInfo,ReactNode} from 'react';

/** Do not render exception messages, props or clinical data into an error screen. */
export default class FailureBoundary extends React.Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(_error:Error,_info:ErrorInfo){
  // Intentionally omit automatic third-party error reporting for health data.
  // Production telemetry must be independently privacy-reviewed and redacted.
 }
 render(){
  if(!this.state.failed)return this.props.children;
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#faf9f4',color:'#153f36'}}>
   <section role="alert" style={{maxWidth:480,textAlign:'center',lineHeight:1.7}}>
    <h1>MamaMwana needs to reload</h1>
    <p>We could not display this screen safely. Your existing saved information has not been intentionally changed. Any unsaved edits may need to be entered again.</p>
    <button type="button" onClick={()=>window.location.reload()} style={{padding:'12px 22px',border:0,borderRadius:12,background:'#277b5e',color:'#fff',cursor:'pointer'}}>Reload securely</button>
   </section>
  </main>;
 }
}
