(() => {
  'use strict';
  const S=TimezonePainSettings, host=document.getElementById('palettes');
  const status=document.getElementById('status'), save=document.getElementById('save'), reset=document.getElementById('reset');
  let state=S.defaults(), ready=false, revision=0;
  const H=TimezonePain, timeKeys=['nightEnd','comfortableStart','comfortableEnd','nightStart'];
  const clock=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
  const timeFormatter=new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit',timeZone:'UTC'});
  const displayTime=m=>timeFormatter.format(new Date(Date.UTC(2000,0,1,0,m)));
  const timeRange=(start,end)=>`${displayTime(start)} to ${displayTime(end)}${end<start?' the next day':''}`;
  function descriptions() {
    const s=state.schedule;
    return {green:timeRange(s.comfortableStart,s.comfortableEnd),yellow:`${timeRange(s.nightEnd,s.comfortableStart)} and ${timeRange(s.comfortableEnd,s.nightStart)}`,red:timeRange(s.nightStart,s.nightEnd)};
  }
  function showSchedule() {for(const k of timeKeys) document.getElementById(k).value=clock(state.schedule[k]);}
  function readSchedule() {
    const schedule=Object.fromEntries(timeKeys.map(k=>[k,H.parseTime(document.getElementById(k).value)]));
    const valid=H.validSchedule(schedule);
    let error='';
    if(timeKeys.some(k=>schedule[k]===null)) error='Enter a start and end time for each range.';
    else if(schedule.comfortableStart===schedule.comfortableEnd || schedule.nightStart===schedule.nightEnd) error='Use a different start and end time for each range.';
    else if(!valid) error='Leave a gap between working hours and night hours. The ranges can’t overlap.';
    document.getElementById('schedule-error').textContent=error;
    for(const k of timeKeys) document.getElementById(k).setAttribute('aria-invalid',String(!valid));
    if(valid) state.schedule=schedule;
    return valid;
  }
  const labels={green:['Working hours',''],yellow:['Early and late hours',''],red:['Night hours','']};
  const modeLabel=mode=>`${mode==='light'?'Light':'Dark'} mode`;
  const controlLabel=(mode,key,label)=>`${modeLabel(mode)}, ${key==='shared'?'all colours':labels[key][0].toLowerCase()}, ${label.toLowerCase()}`;
  const range=(mode,key,field,label,value,max) => `<label class="range">${label}<input type="range" min="0" max="${max}" step="1" data-mode="${mode}" data-key="${key}" data-field="${field}" value="${value}" aria-label="${controlLabel(mode,key,label)}"><output>${value}%</output></label>`;
  function render() {
    host.innerHTML=['light','dark'].map(mode=>{
      const p=state[mode], c=p.colours.green;
      for(const n of S.names) labels[n][1]=descriptions()[n];
      return `<section class="panel" data-panel="${mode}"><h2>${modeLabel(mode)} colours</h2><p class="sub">Applies when Google Calendar uses ${mode} mode.</p><div class="preview ${mode}"><div class="preview-head"><span>Time zone 1</span><span>Time zone 2</span><span>Your time zone</span></div>${Array.from({length:4},(_,i)=>`<div class="preview-row">${[i+14,i+22,i+7].map(h=>`<span data-preview-hour="${h%24}">${displayTime((h%24)*60)}</span>`).join('')}</div>`).join('')}</div><label class="link"><input type="checkbox" data-mode="${mode}" data-link aria-label="${modeLabel(mode)}, adjust colours together" ${p.linked?'checked':''}>Adjust colours together</label><p class="help">Use the same saturation, lightness, and opacity for all three colours in this mode. You can still choose a different hue for each colour.</p><div class="shared" ${p.linked?'':'hidden'}>${range(mode,'shared','s','Saturation',Math.round(c.s),100)}${range(mode,'shared','l','Lightness',Math.round(c.l),100)}${range(mode,'shared','a','Opacity',Math.round(c.a*100),100)}</div>${S.names.map(n=>{const c=p.colours[n];return `<div class="colour-row"><div class="colour-title"><input type="color" value="${S.hex(c)}" data-mode="${mode}" data-colour="${n}" aria-label="${controlLabel(mode,n,'colour')}"><div><b>${labels[n][0]}</b><small>${labels[n][1]}</small></div><label class="hue">Hue <input type="number" min="0" max="360" value="${Math.round(c.h)}" data-mode="${mode}" data-key="${n}" data-field="h" aria-label="${controlLabel(mode,n,'hue')}">°</label></div>${p.linked?'':range(mode,n,'s','Saturation',Math.round(c.s),100)+range(mode,n,'l','Lightness',Math.round(c.l),100)+range(mode,n,'a','Opacity',Math.round(c.a*100),100)}</div>`;}).join('')}</section>`;
    }).join('');
    preview();
  }
  function preview() {
    for(const mode of ['light','dark']) {
      const panel=host.querySelector(`[data-panel="${mode}"]`), p=state[mode];
      for(const cell of panel.querySelectorAll('[data-preview-hour]')) {
        const h=Number(cell.dataset.previewHour);
        for(const n of S.names) for(const suffix of ['fill','edge']) cell.style.setProperty(`--tzp-${n}-${suffix}`,S.css(p.colours[n],suffix==='edge'?Math.max(.55,p.colours[n].a):p.colours[n].a));
        cell.style.backgroundImage=H.hourGradient(h*60,state.schedule,'edge')+', '+H.hourGradient(h*60,state.schedule,'fill');
        cell.style.backgroundSize='2px 100%, 100% 100%';cell.style.backgroundRepeat='no-repeat';
      }
      for(const picker of panel.querySelectorAll('[data-colour]')) picker.value=S.hex(p.colours[picker.dataset.colour]);
      for(const input of panel.querySelectorAll('[data-field]')) {
        const c=p.colours[input.dataset.key==='shared'?'green':input.dataset.key],field=input.dataset.field;
        const value=Math.round(field==='a'?c.a*100:c[field]);
        if(input!==document.activeElement) input.value=value;
        if(input.nextElementSibling?.tagName==='OUTPUT') input.nextElementSibling.value=value+'%';
      }
    }
  }
  host.addEventListener('input',e=>{
    if(!ready) return;
    const el=e.target,mode=el.dataset.mode,p=state[mode];if(!p) return;
    if(el.hasAttribute('data-link')) {
      p.linked=el.checked;if(p.linked) S.link(p,'green');render();
    } else if(el.dataset.colour) {
      const n=el.dataset.colour;p.colours[n]=S.fromHex(el.value,p.colours[n].a);
      if(p.linked) S.link(p,n);preview();
    } else if(el.dataset.field) {
      if(el.value==='' || !el.validity.valid) return;
      const n=el.dataset.key==='shared'?'green':el.dataset.key,f=el.dataset.field;
      p.colours[n][f]=Number(el.value)/(f==='a'?100:1);
      if(p.linked&&f!=='h') S.link(p,n);preview();
    } else return;
    revision++;status.textContent='Unsaved changes';
  });
  for(const k of timeKeys) document.getElementById(k).addEventListener('input',()=>{
    if(!ready) return;
    if(readSchedule()) render();
    revision++;status.textContent='Unsaved changes';
  });
  save.addEventListener('click',async()=>{
    if(!readSchedule()) {status.textContent='Check the time ranges before saving.';return;}
    const savingRevision=revision;save.disabled=true;
    try {await chrome.storage.local.set({palettes:S.normalize(state)});status.textContent=revision===savingRevision?'Changes saved':'Earlier changes saved. Save again to apply your latest changes.';}
    catch {status.textContent='Settings couldn’t be saved. Try again.';}
    finally {save.disabled=false;}
  });
  reset.addEventListener('click',()=>{state=S.defaults();revision++;showSchedule();readSchedule();render();status.textContent='Default settings selected. Select Save changes to apply them.';});
  chrome.storage.local.get('palettes').then(({palettes})=>{state=S.normalize(palettes);ready=true;showSchedule();render();save.disabled=false;reset.disabled=false;status.textContent='Settings loaded';}).catch(()=>{status.textContent='Saved settings couldn’t be loaded. Reopen this page to try again.';});
})();
