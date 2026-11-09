document.getElementById('configure').addEventListener('click',()=>chrome.runtime.openOptionsPage());
function show(raw) {
  const settings=TimezonePainSettings.normalize(raw),s=settings.schedule;
  const formatter=new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit',timeZone:'UTC'});
  const clock=m=>formatter.format(new Date(Date.UTC(2000,0,1,0,m)));
  const range=(start,end)=>`${clock(start)} to ${clock(end)}${end<start?' the next day':''}`;
  document.getElementById('green-time').textContent=range(s.comfortableStart,s.comfortableEnd);
  document.getElementById('yellow-time').textContent=`${range(s.nightEnd,s.comfortableStart)}\n${range(s.comfortableEnd,s.nightStart)}`;
  document.getElementById('red-time').textContent=range(s.nightStart,s.nightEnd);
  const p=settings[matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'];
  for(const n of TimezonePainSettings.names) document.querySelector('i.'+n).style.background=TimezonePainSettings.css(p.colours[n],1);
}
chrome.storage.local.get('palettes').then(({palettes})=>show(palettes)).catch(()=>show(null));
chrome.storage.onChanged.addListener((c,area)=>{if(area==='local'&&c.palettes)show(c.palettes.newValue);});
