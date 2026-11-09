(() => {
  "use strict";
  const S=TimezonePainSettings;
  let settings=S.defaults(), pending=false;
  // Inspect Calendar's actual surface, not the OS theme. Start above our rows.
  function theme() {
    let el=document.querySelector('.R6TFwe') || document.body;
    while(el) {
      const rgb=getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number);
      if(rgb && rgb.length>=3 && (rgb.length===3 || rgb[3]>=0.95)) {
        return (rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722)<128?'dark':'light';
      }
      el=el.parentElement;
    }
    return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  }
  function update() {
    const root=document.documentElement;
    for(const mode of ['light','dark']) for(const n of S.names) {
      const c=settings[mode].colours[n];
      for(const [suffix,value] of [['fill',S.css(c)],['edge',S.css(c,Math.max(.55,c.a))]]) {
        const key=`--tzp-${mode}-${n}-${suffix}`;
        if(root.style.getPropertyValue(key)!==value) root.style.setProperty(key,value);
      }
    }
    const mode=theme();
    if(root.dataset.timezonePainTheme!==mode) root.dataset.timezonePainTheme=mode;
    TimezonePain.paint(document,settings.schedule);
  }
  function schedule() {
    if(pending) return;
    pending=true;
    requestAnimationFrame(()=>{pending=false;update();});
  }
  update();
  chrome.storage.local.get('palettes').then(({palettes})=>{settings=S.normalize(palettes);schedule();}).catch(()=>{});
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area==='local'&&changes.palettes) {settings=S.normalize(changes.palettes.newValue);schedule();}
  });
  new MutationObserver(schedule).observe(document.documentElement,{
    subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',schedule);
  window.addEventListener('pageshow',schedule);
})();
