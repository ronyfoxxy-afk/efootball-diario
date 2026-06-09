'use client'
import { useState } from 'react'

const FORMACOES: Record<string, {pos: string, x: number, y: number}[]> = {
  '4-3-3': [
    {pos:'GK',x:50,y:88},
    {pos:'RB',x:15,y:70},{pos:'CB',x:35,y:72},{pos:'CB',x:65,y:72},{pos:'LB',x:85,y:70},
    {pos:'CM',x:25,y:50},{pos:'CM',x:50,y:48},{pos:'CM',x:75,y:50},
    {pos:'RW',x:15,y:25},{pos:'CF',x:50,y:18},{pos:'LW',x:85,y:25},
  ],
  '4-4-2': [
    {pos:'GK',x:50,y:88},
    {pos:'RB',x:15,y:70},{pos:'CB',x:35,y:72},{pos:'CB',x:65,y:72},{pos:'LB',x:85,y:70},
    {pos:'RM',x:10,y:48},{pos:'CM',x:35,y:50},{pos:'CM',x:65,y:50},{pos:'LM',x:90,y:48},
    {pos:'ST',x:35,y:20},{pos:'ST',x:65,y:20},
  ],
  '4-2-3-1': [
    {pos:'GK',x:50,y:88},
    {pos:'RB',x:15,y:72},{pos:'CB',x:35,y:74},{pos:'CB',x:65,y:74},{pos:'LB',x:85,y:72},
    {pos:'CDM',x:35,y:56},{pos:'CDM',x:65,y:56},
    {pos:'RM',x:15,y:38},{pos:'CAM',x:50,y:36},{pos:'LM',x:85,y:38},
    {pos:'ST',x:50,y:16},
  ],
  '3-4-3': [
    {pos:'GK',x:50,y:88},
    {pos:'CB',x:25,y:72},{pos:'CB',x:50,y:74},{pos:'CB',x:75,y:72},
    {pos:'RM',x:10,y:52},{pos:'CM',x:35,y:50},{pos:'CM',x:65,y:50},{pos:'LM',x:90,y:52},
    {pos:'RW',x:15,y:25},{pos:'CF',x:50,y:18},{pos:'LW',x:85,y:25},
  ],
  '5-3-2': [
    {pos:'GK',x:50,y:88},
    {pos:'RWB',x:8,y:65},{pos:'CB',x:28,y:72},{pos:'CB',x:50,y:74},{pos:'CB',x:72,y:72},{pos:'LWB',x:92,y:65},
    {pos:'CM',x:25,y:48},{pos:'CM',x:50,y:46},{pos:'CM',x:75,y:48},
    {pos:'ST',x:35,y:20},{pos:'ST',x:65,y:20},
  ],
  '4-1-4-1': [
    {pos:'GK',x:50,y:88},
    {pos:'RB',x:15,y:72},{pos:'CB',x:35,y:74},{pos:'CB',x:65,y:74},{pos:'LB',x:85,y:72},
    {pos:'CDM',x:50,y:58},
    {pos:'RM',x:10,y:42},{pos:'CM',x:33,y:44},{pos:'CM',x:67,y:44},{pos:'LM',x:90,y:42},
    {pos:'ST',x:50,y:16},
  ],
}

const COR_POS: Record<string,string> = {
  GK:'#f59e0b',
  CB:'#3b82f6', LB:'#3b82f6', RB:'#3b82f6', LWB:'#3b82f6', RWB:'#3b82f6',
  CDM:'#8b5cf6', CM:'#8b5cf6', CAM:'#8b5cf6', RM:'#8b5cf6', LM:'#8b5cf6', MO:'#8b5cf6',
  ST:'#22d3a0', CF:'#22d3a0', LW:'#22d3a0', RW:'#22d3a0',
}

// Jogadores de exemplo do eFHub (ID real = foto real)
const JOGADORES_EXEMPLO = [
  { nome:'Messi',    id:'88039045074057', rating:97, pos:'CF'  },
  { nome:'Ronaldo',  id:'88039045074049', rating:96, pos:'ST'  },
  { nome:'Mbappé',   id:'88039045074061', rating:95, pos:'LW'  },
  { nome:'Neymar',   id:'88039045074065', rating:94, pos:'RW'  },
  { nome:'Gullit',   id:'88039045074069', rating:96, pos:'CAM' },
  { nome:'Van Basten',id:'88039045074073',rating:97, pos:'ST'  },
  { nome:'Platini',  id:'88040387119839', rating:87, pos:'CAM' },
  { nome:'Matthaus', id:'88039045074405', rating:87, pos:'CM'  },
  { nome:'Ronaldinho',id:'88039045074081',rating:95, pos:'CF'  },
  { nome:'Zidane',   id:'88039045074085', rating:96, pos:'CM'  },
  { nome:'Buffon',   id:'88039045074089', rating:94, pos:'GK'  },
]

function CampoFormacao({ formacao, jogadores }: { formacao: string, jogadores: typeof JOGADORES_EXEMPLO }) {
  const slots = FORMACOES[formacao] || FORMACOES['4-3-3']
  
  return (
    <div style={{ position:'relative', width:'100%', maxWidth:420, margin:'0 auto' }}>
      <svg viewBox="0 0 100 105" style={{ width:'100%', borderRadius:12, overflow:'hidden' }}>
        {/* Campo */}
        <defs>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#166534"/>
            <stop offset="100%" stopColor="#14532d"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="105" fill="url(#grass)"/>
        
        {/* Listras */}
        {Array.from({length:10}).map((_,i) => (
          <rect key={i} x="0" y={i*10} width="100" height="5" fill="#15803d" opacity="0.4"/>
        ))}
        
        {/* Linhas do campo */}
        <rect x="4" y="4" width="92" height="97" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"/>
        <line x1="4" y1="52" x2="96" y2="52" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"/>
        <circle cx="50" cy="52" r="11" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"/>
        <circle cx="50" cy="52" r="0.7" fill="rgba(255,255,255,0.8)"/>
        
        {/* Área ataque */}
        <rect x="22" y="4" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4"/>
        <rect x="35" y="4" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4"/>
        <rect x="42" y="1" width="16" height="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4"/>
        
        {/* Área defesa */}
        <rect x="22" y="85" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4"/>
        <rect x="35" y="94" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4"/>
        <rect x="42" y="100" width="16" height="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4"/>

        {/* Jogadores */}
        {slots.map((slot, i) => {
          const jogador = jogadores[i]
          const cor = COR_POS[slot.pos] || '#22d3a0'
          const imgUrl = jogador ? `https://efimg.com/efootballhub22/images/player_cards/${jogador.id}_l.png` : null
          
          return (
            <g key={i}>
              {/* Sombra */}
              <circle cx={slot.x} cy={slot.y+0.5} r="5.5" fill="rgba(0,0,0,0.3)" opacity="0.5"/>
              
              {/* Círculo de fundo */}
              <circle cx={slot.x} cy={slot.y} r="5.5" fill={cor} stroke="white" strokeWidth="0.8"/>
              
              {/* Foto do jogador (clipPath) */}
              <clipPath id={`clip-${i}`}>
                <circle cx={slot.x} cy={slot.y} r="5"/>
              </clipPath>
              {imgUrl && (
                <image
                  href={imgUrl}
                  x={slot.x-5} y={slot.y-5}
                  width="10" height="10"
                  clipPath={`url(#clip-${i})`}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              
              {/* Rating badge */}
              {jogador && (
                <g>
                  <rect x={slot.x+2.5} y={slot.y-7} width="6" height="3" rx="1" fill={cor} stroke="white" strokeWidth="0.3"/>
                  <text x={slot.x+5.5} y={slot.y-5.2} textAnchor="middle" dominantBaseline="middle"
                    fontSize="2" fontWeight="bold" fill="white" fontFamily="sans-serif">
                    {jogador.rating}
                  </text>
                </g>
              )}
              
              {/* Nome abaixo */}
              <rect x={slot.x-7} y={slot.y+5.8} width="14" height="3.5" rx="1" fill="rgba(0,0,0,0.7)"/>
              <text x={slot.x} y={slot.y+7.7} textAnchor="middle" dominantBaseline="middle"
                fontSize="2" fontWeight="bold" fill="white" fontFamily="sans-serif">
                {jogador ? jogador.nome.substring(0,8) : slot.pos}
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
  const [useJogadores, setUseJogadores] = useState(true)

  return (
    <div style={{ minHeight:'100vh', background:'#09090b', color:'#e4e4e7', fontFamily:'sans-serif', padding:'2rem 1rem' }}>
      <div style={{ maxWidth:480, margin:'0 auto' }}>
        <h1 style={{ fontWeight:900, fontSize:26, color:'#e8b84b', textTransform:'uppercase', marginBottom:'0.25rem', textAlign:'center', letterSpacing:2 }}>
          ⚽ Painel de Formação
        </h1>
        <p style={{ textAlign:'center', color:'#52525b', marginBottom:'1.5rem', fontSize:13 }}>
          Fotos reais dos jogadores via eFHub
        </p>
        
        {/* Seletor de formação */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginBottom:'1rem' }}>
          {Object.keys(FORMACOES).map(f => (
            <button key={f} onClick={() => setFormacao(f)}
              style={{ padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700, fontSize:12,
                background: formacao===f ? '#e8b84b' : '#18181c',
                color: formacao===f ? '#0a0800' : '#71717a',
                outline: formacao===f ? 'none' : '1px solid #2d2d35'
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Toggle jogadores */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:'1rem' }}>
          <button onClick={() => setUseJogadores(!useJogadores)}
            style={{ padding:'5px 14px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700, fontSize:11,
              background: useJogadores ? 'rgba(34,211,160,0.15)' : '#18181c',
              color: useJogadores ? '#22d3a0' : '#71717a',
              outline: `1px solid ${useJogadores ? 'rgba(34,211,160,0.3)' : '#2d2d35'}`
            }}>
            {useJogadores ? '👥 Com jogadores' : '📋 Só posições'}
          </button>
        </div>

        {/* Campo */}
        <div style={{ background:'#111115', border:'1px solid #1d1d20', borderRadius:16, padding:'1.25rem', marginBottom:'1rem' }}>
          <div style={{ textAlign:'center', marginBottom:'0.75rem' }}>
            <span style={{ fontWeight:900, fontSize:24, color:'#e8b84b', letterSpacing:3 }}>{formacao}</span>
          </div>
          <CampoFormacao formacao={formacao} jogadores={useJogadores ? JOGADORES_EXEMPLO : []} />
          
          {/* Legenda */}
          <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:'1rem', flexWrap:'wrap' }}>
            {[['#f59e0b','GK'],['#3b82f6','DEF'],['#8b5cf6','MEI'],['#22d3a0','ATA']].map(([cor,label]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#71717a' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:cor }}/>
                {label}
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'#3f3f46', lineHeight:1.6 }}>
          No site: o Ruud detecta os jogadores mencionados no artigo e monta o campo automaticamente com as fotos do eFHub.
        </p>
      </div>
    </div>
  )
}
