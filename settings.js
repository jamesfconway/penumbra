(() => {
  "use strict";
  const H=typeof module!=='undefined'&&module.exports?require('./hours.js'):TimezonePain;
  const names = ["green", "yellow", "red"];
  const makePalette = (s,l,a) => ({linked:true, colours:Object.fromEntries(names.map((n,i)=>[n,{h:[142,46,0][i],s,l,a}]))});
  const defaults = () => ({light:makePalette(62,45,0.30),dark:makePalette(62,62,0.32),schedule:H.defaultSchedule()});
  const clamp = (v,min,max,fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.max(min,Math.min(max,v)) : fallback;
  function normalize(raw) {
    const result = defaults();
    if(H.validSchedule(raw?.schedule)) result.schedule={...raw.schedule};
    for (const mode of ['light','dark']) {
      const p = raw?.[mode];
      if (!p) continue;
      result[mode].linked = typeof p.linked === 'boolean' ? p.linked : true;
      for (const n of names) {
        const c = p.colours?.[n], d=result[mode].colours[n];
        if (c) result[mode].colours[n]={h:clamp(c.h,0,360,d.h),s:clamp(c.s,0,100,d.s),l:clamp(c.l,0,100,d.l),a:clamp(c.a,0,1,d.a)};
      }
      if (result[mode].linked) link(result[mode], 'green');
    }
    return result;
  }
  function link(palette, source) {
    const {s,l,a}=palette.colours[source];
    for (const c of Object.values(palette.colours)) Object.assign(c,{s,l,a});
  }
  const css = (c, alpha=c.a) => `hsla(${c.h}, ${c.s}%, ${c.l}%, ${alpha})`;
  function hex(c) {
    const s=c.s/100,l=c.l/100,a=s*Math.min(l,1-l);
    return '#'+[0,8,4].map(n=>{const k=(n+c.h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0');}).join('');
  }
  function fromHex(value, alpha) {
    const [r,g,b]=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255);
    const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
    let h=0;
    if(d) h=60*(max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4);
    return {h:(h+360)%360,s:d?100*d/(1-Math.abs(2*l-1)):0,l:l*100,a:alpha};
  }
  const api={names,defaults,normalize,link,css,hex,fromHex};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else globalThis.TimezonePainSettings=api;
})();
