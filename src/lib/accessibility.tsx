import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import type {ReactNode} from 'react';
import {DISPLAY_KEY,DEFAULT_DISPLAY,readDisplay} from './a11yPreferences';
import type {DisplayPreferences} from './a11yPreferences';
type AccessContext={preferences:DisplayPreferences;setPreferences:(next:DisplayPreferences)=>void;reset:()=>void};
const Context=createContext<AccessContext>({preferences:DEFAULT_DISPLAY,setPreferences:()=>{},reset:()=>{}});
export function AccessibilityProvider({children}:{children:ReactNode}){
 const [preferences,setPreferences]=useState<DisplayPreferences>(()=>{
  try{return readDisplay(window.localStorage);}catch{return {...DEFAULT_DISPLAY};}
 });
 useEffect(()=>{
  const doc=document.documentElement;
  doc.dataset.mmText=preferences.textScale;
  doc.dataset.mmContrast=preferences.contrast;
  doc.dataset.mmMotion=preferences.motion;
  doc.dataset.mmTheme=preferences.theme;
  try{window.localStorage.setItem(DISPLAY_KEY,JSON.stringify(preferences));}catch{/* optional UI-only preference */}
 },[preferences]);
 const value=useMemo(()=>({preferences,setPreferences,reset:()=>setPreferences({...DEFAULT_DISPLAY})}),[preferences]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAccessibility(){return useContext(Context);}
