import {useEffect,useRef} from 'react';
/** Keyboard-only modal behavior: trap Tab, support Escape, restore original focus. */
export function useModalFocus(open:boolean,onDismiss:()=>void,restoreSelector?:string){
 const dialogRef=useRef<HTMLDivElement|null>(null);
 const dismissRef=useRef(onDismiss);
 dismissRef.current=onDismiss;
 useEffect(()=>{
  if(!open||!dialogRef.current)return;
  const dialog=dialogRef.current;
  const before=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const focusable=()=>Array.from(dialog.querySelectorAll<HTMLElement>(
   'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )).filter(element=>element.getClientRects().length>0);
  (focusable()[0]??dialog).focus();
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismissRef.current();return;}
   if(event.key!=='Tab')return;
   const items=focusable();
   if(!items.length){event.preventDefault();dialog.focus();return;}
   const first=items[0],last=items[items.length-1];
   if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){
    event.preventDefault();last.focus();
   }else if(!event.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){
    event.preventDefault();first.focus();
   }
  };
  document.addEventListener('keydown',onKey,true);
  return ()=>{
   document.removeEventListener('keydown',onKey,true);
   // Some parent sections are recreated on close. Resolve the returned focus
   // target from the new DOM instead of relying on a detached button node.
   if(before?.isConnected)before.focus();
   else if(restoreSelector)queueMicrotask(()=>{
    document.querySelector<HTMLElement>(restoreSelector)?.focus();
   });
  };
 },[open]);
 return dialogRef;
}
