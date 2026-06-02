/* ============================================================
   NÁTTARKLUBBIN — interactions + event rendering
   Events load from assets/events.json (kept up to date by the
   GitHub Action in scripts/update-events.mjs). The array below is
   an offline fallback used only if events.json can't be fetched.
   ============================================================ */

let EVENTS = [
  { date: "2026-06-05", artist: "Thorgerður", support: "Mentanarnáttin · 100 DKK · kl. 23", tags: ["DJ","Eclectic"], status: "tickets", url: "https://instagram.com/nattarklubbin" },
  { date: "2026-05-22", artist: "DJ JazzyJazz", support: "Marianna Winter afterparty · all night long", tags: ["DJ","Afterparty"], status: "past" },
  { date: "2026-05-01", artist: "Brynjolfur", support: "Faroese techno pioneer · Side Effect", tags: ["DJ","Techno"], status: "past" },
  { date: "2026-04-24", artist: "BUDA", support: "Copenhagen club legend · kl. 23–03:45", tags: ["DJ","House"], status: "past" },
  { date: "2026-04-18", artist: "Maria Fagranes", support: "Copenhagen · deep & melodic · kl. 23–03:45", tags: ["DJ","Melodic"], status: "past" },
  { date: "2026-04-17", artist: "DJ John Vincent (JVC)", support: "Copenhagen turntablist", tags: ["DJ","Turntablism"], status: "past" },
  { date: "2026-04-10", artist: "Mathias Mesteño", support: "Copenhagen legend · disco, hip hop, latin", tags: ["DJ","Disco"], status: "past" },
  { date: "2026-03-13", artist: "India", support: "Friday the 13th · rock / horror quiz night", tags: ["DJ","Rock"], status: "past" },
];

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function parseDate(iso) { const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d); }
function formatDate(iso) {
  const dt=parseDate(iso);
  return { line:`${dt.getFullYear()} · ${MONTHS[dt.getMonth()]}`, day:String(dt.getDate()).padStart(2,"0") };
}
function tagMarkup(tags){ return (tags||[]).map(t=>`<span class="tag">${t}</span>`).join(""); }
function actionMarkup(ev){
  if(ev.status==="soldout") return `<span class="event__cta" aria-disabled="true">At capacity</span>`;
  const url = ev.url || (ev.status!=="past" ? "https://instagram.com/nattarklubbin" : "");
  if(url) return `<a class="event__cta" href="${url}" target="_blank" rel="noopener">Info ↗</a>`;
  return "";
}
function eventMarkup(ev,{past=false}={}){
  const d=formatDate(ev.date);
  const ageTag=past?"":`<span class="tag tag--18">18+</span>`;
  const soldTag=ev.status==="soldout"?`<span class="tag tag--sold">At capacity</span>`:"";
  return `
    <li class="event reveal">
      <div class="event__date">${d.line}<span class="day">${d.day}</span></div>
      <div class="event__body">
        <h3 class="event__artist">${ev.artist}</h3>
        ${ev.support?`<p class="event__support">${ev.support}</p>`:""}
        <div class="event__tags">${tagMarkup(ev.tags)}${ageTag}${soldTag}</div>
      </div>
      <div class="event__action">${actionMarkup(ev)}</div>
    </li>`;
}

function renderEvents(){
  const today=new Date(); today.setHours(0,0,0,0);
  const upcoming=EVENTS.filter(e=>e.status!=="past"&&parseDate(e.date)>=today).sort((a,b)=>parseDate(a.date)-parseDate(b.date));
  const past=EVENTS.filter(e=>e.status==="past"||parseDate(e.date)<today).sort((a,b)=>parseDate(b.date)-parseDate(a.date));
  const cur=document.getElementById("current-list"), pst=document.getElementById("past-list");
  cur.innerHTML = upcoming.length
    ? upcoming.map(e=>eventMarkup(e)).join("")
    : `<li class="event"><div class="event__body"><p class="event__support">No dates announced yet — check back soon.</p></div></li>`;
  pst.innerHTML = past.map(e=>eventMarkup(e,{past:true})).join("");
  observeReveals();
}

/* Load the live event list; fall back silently to the embedded array. */
async function loadEvents(){
  try{
    const r=await fetch("assets/events.json",{cache:"no-store"});
    if(r.ok){ const data=await r.json(); if(Array.isArray(data)&&data.length) EVENTS=data; }
  }catch(e){ /* keep fallback */ }
}

let revealObserver;
function observeReveals(){
  if(!("IntersectionObserver" in window)){ document.querySelectorAll(".reveal").forEach(el=>el.classList.add("is-visible")); return; }
  if(!revealObserver){
    revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("is-visible"); revealObserver.unobserve(en.target);} });
    },{threshold:0.12});
  }
  document.querySelectorAll(".reveal:not(.is-visible)").forEach(el=>revealObserver.observe(el));
}

function initAgeGate(){
  const gate=document.getElementById("age-gate"), yes=document.getElementById("age-yes");
  if(sessionStorage.getItem("hk-age-ok")==="1"){ gate.classList.add("is-hidden"); return; }
  document.body.style.overflow="hidden";
  yes.addEventListener("click",()=>{
    sessionStorage.setItem("hk-age-ok","1");
    gate.classList.add("is-hidden");
    document.body.style.overflow="";
    document.getElementById("bg-video")?.play().catch(()=>{});
  });
}

function initSoundToggle(){
  const video=document.getElementById("bg-video"), btn=document.getElementById("sound-toggle"), label=btn.querySelector(".sound-toggle__label");
  btn.addEventListener("click",()=>{
    const muted=video.muted; video.muted=!muted;
    if(!muted){ btn.classList.remove("is-on"); btn.setAttribute("aria-pressed","false"); label.textContent="SOUND OFF"; }
    else { video.play().catch(()=>{}); btn.classList.add("is-on"); btn.setAttribute("aria-pressed","true"); label.textContent="SOUND ON"; }
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  document.getElementById("year").textContent=new Date().getFullYear();
  await loadEvents();
  renderEvents();
  initAgeGate();
  initSoundToggle();
});
