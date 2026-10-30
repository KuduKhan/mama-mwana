/** Data-saver is only an optional rendering hint; never infer any health details. */
type ConnectionInfo={saveData?:boolean;effectiveType?:string;addEventListener?:(name:string,callback:()=>void)=>void};
export function prefersLowData(connection:ConnectionInfo|null|undefined){
 return !!connection&&(connection.saveData===true||connection.effectiveType==='slow-2g'||connection.effectiveType==='2g');
}
export function setLowDataDisplayHint(){
 if(typeof navigator==='undefined'||typeof document==='undefined')return;
 const conn=(navigator as Navigator&{connection?:ConnectionInfo}).connection;
 const apply=()=>{document.documentElement.dataset.mmData=prefersLowData(conn)?'reduce':'normal';};
 apply();
 conn?.addEventListener?.('change',apply);
}
