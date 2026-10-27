export type TextScale='standard'|'large'|'largest';
export type ContrastMode='standard'|'high';
export type MotionMode='system'|'reduce';
export type DisplayPreferences={textScale:TextScale;contrast:ContrastMode;motion:MotionMode};
export const DISPLAY_KEY='mamamwana-ui-display-v1';
export const DEFAULT_DISPLAY:DisplayPreferences={textScale:'standard',contrast:'standard',motion:'system'};
export function normalizeDisplay(input:unknown):DisplayPreferences{
 if(!input||typeof input!=='object')return {...DEFAULT_DISPLAY};
 const data=input as Record<string,unknown>;
 return {
  textScale:data.textScale==='large'||data.textScale==='largest'?data.textScale:'standard',
  contrast:data.contrast==='high'?'high':'standard',
  motion:data.motion==='reduce'?'reduce':'system'
 };
}
export function readDisplay(storage?:Pick<Storage,'getItem'>):DisplayPreferences{
 try{
  const raw=storage?.getItem(DISPLAY_KEY);
  return raw?normalizeDisplay(JSON.parse(raw)):({...DEFAULT_DISPLAY});
 }catch{return {...DEFAULT_DISPLAY};}
}
