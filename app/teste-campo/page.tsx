'use client'
import { useState } from 'react'

const FORMACOES: Record<string, {pos: string, x: number, y: number}[]> = {
  '4-3-3': [
    {pos:'GK',x:50,y:90},
    {pos:'RB',x:15,y:70},{pos:'CB',x:35,y:72},{pos:'CB',x:65,y:72},{pos:'LB',x:85,y:70},
    {pos:'CM',x:25,y:50},{pos:'CM',x:50,y:48},{pos:'CM',x:75,y:50},
    {pos:'RW',x:15,y:25},{pos:'CF',x:50,y:20},{pos:'LW',x:85,y:25},
  ],
  '4-4-2': [
    {pos:'GK',x:50,y:90},
    {pos:'RB',x:15,y:70},{pos:'CB',x:35,y:72},{pos:'CB',x:65,y:72},{pos:'LB',x:85,y:70},
    {pos:'RM',x:10,y:48},{pos:'CM',x:35,y:50},{pos:'CM',x:65,y:50},{pos:'LM',x:90,y:48},
    {pos:'ST',x:35,y:22},{pos:'ST',x:65,y:22},
  ],
  '4-2-3-1': [
    {pos:'GK',x:50,y:90},
    {pos:'RB',x:15,y:72},{pos:'CB',x:35,y:74},{pos:'CB',x:65,y:74},{pos:'LB',x:85,y:72},
    {pos:'CDM',x:35,y:56},{pos:'CDM',x:65,y:56},
    {pos:'RM',x:15,y:38},{pos:'CAM',x:50,y:36},{pos:'LM',x:85,y:38},
    {pos:'ST',x:50,y:18},
  ],
  '3-4-3': [
    {pos:'GK',x:50,y:90},
    {pos:'CB',x:25,y:72},{pos:'CB',x:50,y:74},{pos:'CB',x:75,y:72},
    {pos:'RM',x:10,y:52},{pos:'CM',x:35,y:50},{pos:'CM',x:65,y:50},{pos:'LM',x:90,y:52},
    {pos:'RW',x:15,y:25},{pos:'CF',x:50,y:20},{pos:'LW',x:85,y:25},
  ],
  '5-3-2': [
    {pos:'GK',x:50,y:90},
    {pos:'RWB',x:8,y:65},{pos:'CB',x:28,y:72},{pos:'CB',x:50,y:74},{pos:'CB',x:72,y:72},{pos:'LWB',x:92,y:65},
    {pos:'CM',x:25,y:48},{pos:'CM',x:50,y:46},{pos:'CM',x:75,y:48},
    {pos:'ST',x:35,y:22},{pos:'ST',x:65,y:22},
  ],
  '4-1-4-1': [
    {pos:'GK',x:50,y:90},
    {pos:'RB',x:15,y:72},{pos:'CB',x:35,y:74},{pos:'CB',x:65,y:74},{pos:'LB',x:85,y:72},
    {pos:'CDM',x:50,y:58},
    {pos:'RM',x:10,y:42},{pos:'CM',x:33,y:44},{pos:'CM',x:67,y:44},{pos:'LM',x:90,y:42},
    {pos:'ST',x:50,y:18},
  ],
}

const COR_POS: Record<string,string> = {
  GK:'#f59e0b', CB:'#3b82f6', LB:'#3b82f6', RB:'#3b82f6', LWB:'#3b82f6', RWB:'#3b82f6',
  CDM:'#8b5cf6', CM:'#8b5cf6', CAM:'#8b5cf6', RM:'#8b5cf6', LM:'#8b5cf6',
  ST:'#22d3a0', CF:'#22d3a0', LW:'#22d3a0', RW:'#22d3a0',
}

function CampoFormacao({ formacao }: { formacao: string }) {
  const jogadores = FORMACOES[formacao] || FORMACOES['4-3-3']
  
  return (
    <div style={{ position:'relative', width:'100%', maxWidth:400, margin:'0 auto' }}>
      <svg viewBox="0 0 100 110" style={{ width:'100%', borderRadius:12, overflow:'hidden' }}>
        {/* Campo */}
        <rect x="0" y="0" width="100" height="110" fill="#166534"/>
        
        {/* Listras */}
        {[0,10,20,30,40,50,60,70,80,90,100].map((y,i) => (
          <rect key={i} x="0" y={y} width="100" height="5" fill={i%2===0?"#15803d":"#166534"} opacity="0.5"/>
        ))}
        
        {/* Bordas */}
        <rect x="5" y="5" width="90" height="100" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
        
        {/* Linha do meio */}
        <line x1="5" y1="55" x2="95" y2="55" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
        
        {/* Círculo central */}
        <circle cx="50" cy="55" r="12" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
        <circle cx="50" cy="55" r="0.8" fill="rgba(255,255,255,0.7)"/>
        
        {/* Área grande (ataque - cima) */}
        <rect x="20" y="5" width="60" height="18" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
        {/* Área pequena (ataque) */}
        <rect x="33" y="5" width="34" height="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
        
        {/* Área grande (defesa - baixo) */}
        <rect x="20" y="87" width="60" height="18" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
        {/* Área pequena (defesa) */}
        <rect x="33" y="97" width="34" height="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>

        {/* Gol (cima) */}
        <rect x="40" y="3" width="20" height="4" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5"/>
        {/* Gol (baixo) */}
        <rect x="40" y="103" width="20" height="4" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5"/>

        {/* Jogadores */}
        {jogadores.map((j, i) => {
          const cor = COR_POS[j.pos] || '#22d3a0'
          return (
            <g key={i}>
              <circle cx={j.x} cy={j.y} r="4.5" fill={cor} stroke="white" strokeWidth="0.8" opacity="0.95"/>
              <text x={j.x} y={j.y+1} textAnchor="middle" dominantBaseline="middle" 
                fontSize="2.8" fontWeight="bold" fill="white" fontFamily="sans-serif">
                {j.pos}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function TesteCampo() {
  const [formacao, setFormacao] = useState('4-3-3')

  return (
    <div style={{ minHeight:'100vh', background:'#09090b', color:'#e4e4e7', fontFamily:'sans-serif', padding:'2rem 1rem' }}>
      <div style={{ maxWidth:500, margin:'0 auto' }}>
        <h1 style={{ fontFamily:'sans-serif', fontWeight:900, fontSize:28, color:'#e8b84b', textTransform:'uppercase', marginBottom:'0.5rem', textAlign:'center' }}>
          ⚽ Painel de Formação
        </h1>
        <p style={{ textAlign:'center', color:'#71717a', marginBottom:'1.5rem', fontSize:14 }}>Teste visual — escolha uma formação</p>
        
        {/* Seletor */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:'1.5rem' }}>
          {Object.keys(FORMACOES).map(f => (
            <button key={f} onClick={() => setFormacao(f)}
              style={{ padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
                background: formacao===f ? '#e8b84b' : '#18181c',
                color: formacao===f ? '#0a0800' : '#71717a',
                outline: formacao===f ? 'none' : '1px solid #2d2d35'
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Campo */}
        <div style={{ background:'#111115', border:'1px solid #1d1d20', borderRadius:16, padding:'1.5rem', marginBottom:'1rem' }}>
          <div style={{ textAlign:'center', marginBottom:'1rem' }}>
            <span style={{ fontWeight:900, fontSize:22, color:'#e8b84b', letterSpacing:2 }}>{formacao}</span>
          </div>
          <CampoFormacao formacao={formacao} />
          
          {/* Legenda */}
          <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:'1rem', flexWrap:'wrap' }}>
            {[['#f59e0b','Goleiro'],['#3b82f6','Defesa'],['#8b5cf6','Meio'],['#22d3a0','Ataque']].map(([cor,label]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#71717a' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:cor }}/>
                {label}
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'#52525b' }}>
          Este componente pode ser embutido automaticamente nos posts quando detectar uma formação
        </p>
      </div>
    </div>
  )
}
