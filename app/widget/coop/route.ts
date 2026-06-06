import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://clgbognxfbcjzbouxhfi.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsZ2JvZ254ZmJjanpib3V4aGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDcyODgsImV4cCI6MjA5NjE4MzI4OH0.dOGaJon-zaB_tPKMzcaFPKIztNmZWMptDY0RjgkQvb0'

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Co-op Widget</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:transparent;font-family:'Barlow',sans-serif;padding:10px;min-width:300px;max-width:460px}
.widget{background:rgba(6,10,15,0.93);border:1px solid rgba(0,229,110,0.2);border-radius:14px;overflow:hidden;box-shadow:0 0 32px rgba(0,229,110,0.06)}
.hdr{background:rgba(0,229,110,0.07);border-bottom:1px solid rgba(0,229,110,0.12);padding:9px 14px;display:flex;align-items:center;justify-content:space-between}
.hdr-l{display:flex;align-items:center;gap:7px}
.dot{width:7px;height:7px;background:#00e56e;border-radius:50%;animation:pulse 1.5s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.55)}}
.hdr-t{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:13px;color:#00e56e;text-transform:uppercase;letter-spacing:1.5px}
.hdr-c{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;color:#5a7190;letter-spacing:.8px}
.body{padding:8px}
.empty{text-align:center;color:#5a7190;font-size:12px;padding:20px;font-style:italic}
.sala{background:rgba(13,21,32,.85);border:1px solid rgba(255,255,255,.05);border-radius:9px;margin-bottom:7px;overflow:hidden}
.sala.ok{border-color:rgba(0,229,110,.3)}
.sh{display:flex;align-items:center;justify-content:space-between;padding:7px 11px;border-bottom:1px solid rgba(255,255,255,.04)}
.sid{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:14px;color:#f0f4f8;text-transform:uppercase;letter-spacing:.3px}
.ssenha{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:16px;color:#e8b84b}
.badge{font-size:8px;font-weight:700;color:#00e56e;background:rgba(0,229,110,.1);border:1px solid rgba(0,229,110,.2);padding:1px 6px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;margin-left:5px}
.jogs{padding:5px 7px}
.jog{display:flex;align-items:center;gap:7px;padding:3px 5px;border-radius:5px}
.jog:nth-child(odd){background:rgba(255,255,255,.02)}
.num{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;color:#00e56e;width:14px;text-align:center;flex-shrink:0}
.nome{font-size:12px;color:#d4d8e0;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vaga{display:flex;align-items:center;gap:7px;padding:3px 5px;border-radius:5px;border:1px dashed rgba(255,255,255,.05);margin-top:2px}
.vt{font-size:10px;color:#1c2638;font-style:italic}
.ftr{padding:7px 14px;border-top:1px solid rgba(255,255,255,.04);display:flex;align-items:center;gap:6px}
.flogo{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:10px;letter-spacing:.8px;text-transform:uppercase}
.flogo span{color:#00e56e}
.ftxt{font-size:9px;color:#1c2638;letter-spacing:.5px;text-transform:uppercase}
</style>
</head>
<body>
<div class="widget">
  <div class="hdr">
    <div class="hdr-l"><div class="dot"></div><div class="hdr-t">⚡ Co-op 5×5 — Ao vivo</div></div>
    <div class="hdr-c" id="cnt">–</div>
  </div>
  <div class="body" id="bd"><div class="empty">Conectando...</div></div>
  <div class="ftr">
    <div class="flogo"><span>e</span>FOOTBALL NEWS</div>
    <div class="ftxt">· efootball-diario.vercel.app/coop</div>
  </div>
</div>
<script>
const URL='${SUPABASE_URL}',KEY='${SUPABASE_KEY}';
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
async function upd(){
  try{
    const r=await fetch(URL+'/rest/v1/coop_queue?status=eq.waiting&order=created_at.asc',{headers:{'apikey':KEY,'Authorization':'Bearer '+KEY}});
    const d=await r.json();
    const salas={};d.forEach(p=>{if(!salas[p.sala_id])salas[p.sala_id]=[];salas[p.sala_id].push(p)});
    document.getElementById('cnt').textContent=d.length+(d.length===1?' jogador':' jogadores');
    const bd=document.getElementById('bd');
    if(!Object.keys(salas).length){bd.innerHTML='<div class="empty">Fila vazia — acesse <strong style="color:#00e56e">efootball-diario.vercel.app/coop</strong></div>';return}
    bd.innerHTML=Object.entries(salas).map(([sid,jgs])=>{
      const ok=jgs.length>=5;
      const jh=jgs.map((j,i)=>'<div class="jog"><span class="num">'+(i+1)+'</span><span class="nome">'+esc(j.player_name)+'</span></div>').join('');
      const vh=Array(Math.max(0,5-jgs.length)).fill('<div class="vaga"><span class="num" style="color:#1c2638">·</span><span class="vt">vaga livre</span></div>').join('');
      return '<div class="sala'+(ok?' ok':'')+'"><div class="sh"><div style="display:flex;align-items:center"><span class="sid">Sala #'+sid+'</span>'+(ok?'<span class="badge">Completa</span>':'')+'</div><span class="ssenha">🔑 '+esc(jgs[0].sala_senha)+'</span></div><div class="jogs">'+jh+vh+'</div></div>';
    }).join('');
  }catch(e){console.error(e)}
}
upd();setInterval(upd,4000);
</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache',
      'X-Frame-Options': 'ALLOWALL',
    }
  })
}
