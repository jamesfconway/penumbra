/* Runs in Chrome's isolated extension world; no page scripts or network access. */
(() => {
  "use strict";
  function parseTime(text) {
    const normalized = String(text).trim().replace(/[\u200e\u200f\u202a-\u202e]/g, "");
    const match = normalized.match(/^(\d{1,2})(?::([0-5]\d))?\s*([ap])\.?m\.?$/i);
    if (match) {
      const hour = Number(match[1]);
      if (hour < 1 || hour > 12) return null;
      return (hour % 12 + (match[3].toLowerCase() === "p" ? 12 : 0)) * 60 + Number(match[2] || 0);
    }
    const clock = normalized.match(/^(\d{1,2}):([0-5]\d)$/);
    if (!clock || Number(clock[1]) > 23) return null;
    return Number(clock[1]) * 60 + Number(clock[2]);
  }
  const defaultSchedule = () => ({nightEnd:360,comfortableStart:540,comfortableEnd:1020,nightStart:1260});
  const scheduleKeys=['nightEnd','comfortableStart','comfortableEnd','nightStart'];
  function validSchedule(s) {
    if(!s || !scheduleKeys.every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<1440)) return false;
    const points=scheduleKeys.map(k=>(s[k]-s.nightEnd+1440)%1440);
    return points[0]<points[1]&&points[1]<points[2]&&points[2]<points[3];
  }
  function painAt(minutes, schedule=defaultSchedule()) {
    if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 1440) return null;
    const relative=(minutes-schedule.nightEnd+1440)%1440;
    const start=(schedule.comfortableStart-schedule.nightEnd+1440)%1440;
    const end=(schedule.comfortableEnd-schedule.nightEnd+1440)%1440;
    const night=(schedule.nightStart-schedule.nightEnd+1440)%1440;
    if(relative>=start&&relative<end) return "green";
    if(relative<night) return "yellow";
    return "red";
  }
  // Restrict changes to actual hour rows. Google also renders hidden sizing
  // copies of every timezone, which must not be coloured or made visible.
  function hourGradient(time,schedule,suffix) {
    const stops=[0,...scheduleKeys.map(k=>(schedule[k]-time+1440)%1440).filter(m=>m>0&&m<60).sort((a,b)=>a-b),60];
    return 'linear-gradient(to bottom, '+stops.slice(0,-1).map((start,i)=>{
      const band=painAt((time+start)%1440,schedule);
      return `var(--tzp-${band}-${suffix}) ${start/60*100}% ${stops[i+1]/60*100}%`;
    }).join(', ')+')';
  }
  function paint(root, schedule=defaultSchedule()) {
    let painted = 0;
    for (const row of root.querySelectorAll(".R6TFwe > .XsRa1c")) {
      const label = row.querySelector(".wO6pL");
      const time = label ? parseTime(label.textContent) : null;
      const pain = time === null ? null : painAt(time,schedule);
      if (pain === null) {
        row.removeAttribute("data-timezone-pain");
        row.style.removeProperty('--tzp-hour-fill');
        row.style.removeProperty('--tzp-hour-edge');
        continue;
      }
      for(const suffix of ['fill','edge']) {
        const value=hourGradient(time,schedule,suffix),key=`--tzp-hour-${suffix}`;
        if(row.style.getPropertyValue(key)!==value) row.style.setProperty(key,value);
      }
      if (row.getAttribute("data-timezone-pain") !== pain) {
        row.setAttribute("data-timezone-pain", pain);
      }
      painted++;
    }
    return painted;
  }
  const api = Object.freeze({parseTime, painAt, paint, defaultSchedule, validSchedule, hourGradient});
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalThis.TimezonePain = api;
})();
