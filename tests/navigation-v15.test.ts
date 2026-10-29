import {describe,it,expect} from 'vitest';
import {NAV,NAV_GROUPS,MOBILE_NAV,isTab} from '../src/ui/navigation';
describe('v1.5.0 unified navigation',()=>{
 it('preserves 13 unique feature pages in exactly one section',()=>{
  const ids=NAV.map(item=>item.id),grouped=NAV_GROUPS.flatMap(group=>[...group.ids]);
  expect(ids).toHaveLength(13);expect(new Set(ids).size).toBe(13);
  expect(grouped).toHaveLength(13);expect(new Set(grouped).size).toBe(13);
  expect([...grouped].sort()).toEqual([...ids].sort());
 });
 it('preserves five quick destinations and excludes unknown tabs',()=>{
  expect(MOBILE_NAV.map(item=>item.id)).toEqual(['home','care','planner','visits','baby']);
  for(const item of MOBILE_NAV)expect(isTab(item.id)).toBe(true);
  expect(isTab('not-a-tab')).toBe(false);
 });
});
