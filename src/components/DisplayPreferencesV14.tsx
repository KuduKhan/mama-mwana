import {useAccessibility} from '../lib/accessibility';
import {useMamaLocale} from '../lib/locale';
import type {ContrastMode,MotionMode,TextScale} from '../lib/a11yPreferences';
export default function DisplayPreferencesV14(){
 const {preferences,setPreferences,reset}=useAccessibility();
 const {t}=useMamaLocale();
 return <section className="mm14-preferences" aria-labelledby="mm14-preferences-title">
  <h3 id="mm14-preferences-title">{t('a11y.heading','Display and accessibility')}</h3>
  <p>{t('a11y.summary','Customize how this device shows MamaMwana. No medical details are saved in these settings.')}</p>
  <div className="mm14-preferences-grid">
   <label>{t('a11y.text','Text size')}
    <select aria-label={t('a11y.text','Text size')} value={preferences.textScale} onChange={e=>setPreferences({...preferences,textScale:e.target.value as TextScale})}>
     <option value="standard">{t('a11y.standard','Standard')}</option><option value="large">{t('a11y.large','Large')}</option><option value="largest">{t('a11y.largest','Extra large')}</option>
    </select>
   </label>
   <label>{t('a11y.contrast','Contrast')}
    <select aria-label={t('a11y.contrast','Contrast')} value={preferences.contrast} onChange={e=>setPreferences({...preferences,contrast:e.target.value as ContrastMode})}>
     <option value="standard">{t('a11y.standard','Standard')}</option><option value="high">{t('a11y.high','Higher contrast')}</option>
    </select>
   </label>
   <label>{t('a11y.motion','Motion')}
    <select aria-label={t('a11y.motion','Motion')} value={preferences.motion} onChange={e=>setPreferences({...preferences,motion:e.target.value as MotionMode})}>
     <option value="system">{t('a11y.system','Follow device')}</option><option value="reduce">{t('a11y.reduce','Reduce animations')}</option>
    </select>
   </label>
  </div>
  <button type="button" className="mm14-reset" onClick={reset}>{t('a11y.reset','Reset display preferences')}</button>
  <small>{t('a11y.note','These display choices apply only to this browser. Your care records and caregiver permissions are unchanged.')}</small>
 </section>;
}
