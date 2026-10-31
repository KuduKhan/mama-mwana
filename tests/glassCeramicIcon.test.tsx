import {describe,expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {Baby,House,ShieldCheck} from 'lucide-react';
import {GlassCeramicIcon,toneForTab} from '../src/ui/GlassCeramicIcon';
import {MOBILE_NAV,NAV} from '../src/ui/navigation';

describe('MamaMwana glass-ceramic icon contract',()=>{
 it('defines a semantic color for every app section',()=>{
  expect(NAV).toHaveLength(13);
  for(const item of NAV)expect(toneForTab(item.id)).toMatch(/^(sage|teal|rose|peach|amber|lilac|blue)$/);
  expect(MOBILE_NAV.every(item=>NAV.some(nav=>nav.id===item.id))).toBe(true);
 });
 it('keeps decorative icons out of the screen-reader tree',()=>{
  const html=renderToStaticMarkup(<GlassCeramicIcon Icon={Baby} tone="rose" size="lg"/>);
  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toContain('role="img"');
  expect(html).toContain('data-tone="rose"');
  expect((html.match(/<svg /g)||[])).toHaveLength(2);
 });
 it('supports a named standalone icon without creating a focus target',()=>{
  const html=renderToStaticMarkup(<GlassCeramicIcon Icon={House} label="Home" mode="symbol"/>);
  expect(html).toContain('role="img"');
  expect(html).toContain('aria-label="Home"');
  expect(html).not.toContain('tabindex="0"');
  const privacy=renderToStaticMarkup(<GlassCeramicIcon Icon={ShieldCheck} tone="teal"/>);
  expect(privacy).toContain('data-tone="teal"');
 });
});
