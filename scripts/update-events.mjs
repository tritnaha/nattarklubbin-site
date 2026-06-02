// Auto-update assets/events.json from @nattarklubbin Instagram captions.
// Hands-off, best-effort parsing (no human review). Designed for GitHub Actions.
// Fails SOFT: on any network/parse error it leaves events.json unchanged so the
// site keeps its last known-good state.
//
// Strategy: fetch posts server-side, parse {date, artist, status} from captions,
// then UNION with the existing file by a stable key ("if newer/unseen, add it").

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const USERNAME = 'nattarklubbin';
const APP_ID   = '936619743392459';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Instagram';
const OUT = new URL('../assets/events.json', import.meta.url);

const MONTHS = { jan:1,januar:1,january:1, feb:2,februar:2,february:2, mar:3,mars:3,march:3,
  apr:4,april:4,apríl:4, mai:5,may:5, jun:6,juni:6,june:6, jul:7,juli:7,july:7, aug:8,august:8,
  sep:9,sept:9,september:9, oct:10,okt:10,october:10,oktober:10, nov:11,november:11,
  dec:12,des:12,december:12,desember:12 };

const pad = n => String(n).padStart(2,'0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

const sleep = ms => new Promise(s=>setTimeout(s,ms));
async function ig(url, tries=4){
  for(let i=0;i<tries;i++){
    const r = await fetch(url,{headers:{'User-Agent':UA,'x-ig-app-id':APP_ID,
      'Accept':'*/*','Referer':`https://www.instagram.com/${USERNAME}/`}});
    if(r.ok) return r.json();
    if((r.status===429 || r.status>=500) && i<tries-1){
      const wait=5000*(i+1); console.error(`HTTP ${r.status} — backing off ${wait}ms`); await sleep(wait); continue;
    }
    throw new Error(`HTTP ${r.status} for ${url}`);
  }
}

async function fetchPosts(){
  const prof = await ig(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`);
  const user = prof.data.user;
  const uid = user.id;
  const posts = [];
  for(const e of (user.edge_owner_to_timeline_media?.edges||[])){
    const n=e.node, cap=n.edge_media_to_caption?.edges?.[0]?.node?.text||'';
    posts.push({ id:n.shortcode||n.id, ts:n.taken_at_timestamp, caption:cap });
  }
  let maxId=null, pages=0;
  while(pages<6){
    let r;
    try { r = await ig(`https://www.instagram.com/api/v1/feed/user/${uid}/?count=33`+(maxId?`&max_id=${maxId}`:'')); }
    catch(e){ console.error('pagination stopped:', e.message); break; }
    for(const it of (r.items||[])) posts.push({ id:it.code||it.id, ts:it.taken_at, caption:it.caption?.text||'' });
    pages++;
    if(!r.more_available) break;
    maxId=r.next_max_id;
    await new Promise(s=>setTimeout(s,1200));
  }
  const seen=new Set(), out=[];
  for(const p of posts) if(p.id && !seen.has(p.id)){ seen.add(p.id); out.push(p); }
  return out;
}

function parseDate(caption, ts){
  const post=new Date(ts*1000);
  const fix=(d,mo,y)=>{ let dt=new Date(y,mo-1,d);
    // if the parsed date is long before the post, it's probably next year
    if((post-dt)/86400000 > 200) dt=new Date(y+1,mo-1,d); return ymd(dt); };
  let m=caption.match(/\b(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})\b/);            // dd.mm.yy(yy)
  if(m){ let y=+m[3]; if(y<100) y+=2000; return fix(+m[1],+m[2],y); }
  m=caption.match(/\b(\d{1,2})\.?\s+([A-Za-zÁ-úøðÆæÅåØ]+)\.?(?:,?\s*(\d{4}))?/);  // 10 April[, 2026]
  if(m){ const mo=MONTHS[m[2].toLowerCase()]; if(mo) return fix(+m[1],mo,m[3]?+m[3]:post.getFullYear()); }
  if(/fr[ií]ggja|friday/i.test(caption)){                                      // "coming Friday"
    const d=new Date(post); d.setDate(d.getDate()+((5-d.getDay()+7)%7)); return ymd(d);
  }
  return ymd(post);
}

const BAD=/DKK|[ÁA]RA|ALDURSMARK|ENTR[ÉE]|^KL\.?\d|N[ÁA]TTARKLUBB|HAVNAR|PRESENT|[OÓ]KEYPIS|ATGONG|^\d+$|^18/i;
const clean = s => s.replace(/^[\s\-–—:]+|[\s\-–—:.,]+$/g,'').replace(/\s+/g,' ').trim();

function parseArtist(caption){
  const lines=caption.split('\n').map(clean).filter(Boolean);
  for(const ln of lines){                       // prominent ALL-CAPS line = headline act
    const letters=ln.replace(/[^A-Za-zÁ-úØÆÅøæåÐð]/g,'');
    if(letters.length>=2 && letters.length<=26 && ln===ln.toUpperCase() && !BAD.test(ln)) return clean(ln);
  }
  const dj=caption.match(/\bDJ\s+([A-Za-zÁ-úøðÆæÅåØ0-9'’.\- ]{2,28})/);
  if(dj) return 'DJ '+clean(dj[1]);
  for(const ln of lines) if(!BAD.test(ln) && ln.length<=40) return clean(ln);
  return 'TBA';
}

function toEvent(post){
  const date=parseDate(post.caption,post.ts);
  const today=new Date(); today.setHours(0,0,0,0);
  let status = new Date(date+'T00:00:00') >= today ? 'tickets' : 'past';
  if(/[uú]tselt|sold ?out/i.test(post.caption)) status='soldout';
  const tags=['DJ']; if(/afterparty|aftan/i.test(post.caption)) tags.push('Afterparty');
  const t=post.caption.match(/Kl\.?\s*\d{1,2}[:.]?\d{0,2}\s*[–-]\s*\d{1,2}[:.]?\d{0,2}/i);
  return { date, artist:parseArtist(post.caption), support:t?clean(t[0]):'', tags, status,
           url:`https://www.instagram.com/p/${post.id}/`, igId:post.id, source:'instagram' };
}

function load(){ try { return existsSync(OUT) ? JSON.parse(readFileSync(OUT,'utf8')) : []; } catch { return []; } }
const keyOf = e => e.igId ? `ig:${e.igId}` : `m:${e.date}|${(e.artist||'').toLowerCase()}`;

async function main(){
  let posts;
  try { posts = await fetchPosts(); }
  catch(e){ console.error('FETCH FAILED — leaving events.json unchanged:', e.message); process.exit(0); }
  if(!posts.length){ console.error('No posts returned — leaving events.json unchanged.'); process.exit(0); }

  const existing=load();
  const byKey=new Map(existing.map(e=>[keyOf(e),e]));
  let added=0, updated=0;
  for(const p of posts){
    const ev=toEvent(p); const k=keyOf(ev);
    // skip if a curated/manual entry already covers same date + similar artist
    const dup=[...byKey.values()].find(e=>e.date===ev.date &&
      e.artist && ev.artist && e.artist.toLowerCase().slice(0,6)===ev.artist.toLowerCase().slice(0,6));
    if(byKey.has(k)){ const cur=byKey.get(k); if(cur.source==='instagram' && cur.status!==ev.status){cur.status=ev.status;updated++;} }
    else if(dup){ /* already represented */ }
    else { byKey.set(k,ev); added++; }
  }
  const merged=[...byKey.values()].sort((a,b)=> a.date<b.date?1:a.date>b.date?-1:0);
  writeFileSync(OUT, JSON.stringify(merged,null,2)+'\n');
  console.log(`posts=${posts.length} added=${added} statusUpdated=${updated} total=${merged.length}`);
}
main();
