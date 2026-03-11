'use client'

export default function HeroAnimation() {
  return (
    <div className="relative w-[420px]" style={{ aspectRatio: '420/520' }}>
      {/* Glow */}
      <div className="absolute inset-0 bg-primary-500/10 rounded-3xl blur-3xl scale-90 animate-pulse-slow pointer-events-none" />

      <style>{`
        /* ── TIMING CONSTANTS ────────────────────────────
           Total loop: 9 s
           0.0–3.5 s  → pantalla de test (preguntas)
           3.5–5.0 s  → barra llenándose + "analizando"
           5.0–9.0 s  → pantalla resultado IQ
        ──────────────────────────────────────────────── */

        /* Pantalla test: visible 0→3.5 s */
        @keyframes showTest {
          0%,38%   { opacity:1; transform:scale(1) translateY(0); }
          42%,100% { opacity:0; transform:scale(0.95) translateY(-6px); }
        }
        /* Pantalla resultado: visible 5.5→9 s */
        @keyframes showResult {
          0%,60%   { opacity:0; transform:scale(0.95) translateY(10px); }
          66%,96%  { opacity:1; transform:scale(1) translateY(0); }
          100%     { opacity:0; transform:scale(1.02) translateY(-4px); }
        }
        /* Barra de progreso: llena en 3→5 s */
        @keyframes fillBar {
          0%,32%   { width:0%; }
          55%,100% { width:100%; }
        }
        /* Overlay "analizando": visible 3.5→5.5 s */
        @keyframes showAnalyzing {
          0%,38%   { opacity:0; }
          42%,58%  { opacity:1; }
          64%,100% { opacity:0; }
        }
        /* Número IQ cuenta de 80 → 128 */
        @keyframes countIQ {
          0%,60%   { opacity:0; }
          68%      { opacity:1; }
          100%     { opacity:1; }
        }
        /* Respuestas seleccionadas una a una */
        @keyframes pickA {
          0%,2%    { opacity:0; transform:scale(0.6); }
          5%,38%   { opacity:1; transform:scale(1); }
          42%,100% { opacity:0; transform:scale(0.6); }
        }
        @keyframes pickB {
          0%,10%   { opacity:0; transform:scale(0.6); }
          13%,38%  { opacity:1; transform:scale(1); }
          42%,100% { opacity:0; transform:scale(0.6); }
        }
        @keyframes pickC {
          0%,20%   { opacity:0; transform:scale(0.6); }
          23%,38%  { opacity:1; transform:scale(1); }
          42%,100% { opacity:0; transform:scale(0.6); }
        }
        /* Highlight de pregunta activa */
        @keyframes hlQ1 {
          0%,0%    { opacity:1; }
          8%,100%  { opacity:0; }
        }
        @keyframes hlQ2 {
          0%,7%    { opacity:0; }
          9%,17%   { opacity:1; }
          19%,100% { opacity:0; }
        }
        @keyframes hlQ3 {
          0%,17%   { opacity:0; }
          19%,35%  { opacity:1; }
          38%,100% { opacity:0; }
        }
        /* Círculo de resultado */
        @keyframes drawCircle {
          0%,60%   { stroke-dashoffset:283; }
          90%,100% { stroke-dashoffset:0; }
        }
        /* Etiquetas resultado entran escalonadas */
        @keyframes fadeInUp1 {
          0%,63%   { opacity:0; transform:translateY(8px); }
          72%,100% { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInUp2 {
          0%,68%   { opacity:0; transform:translateY(8px); }
          78%,100% { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInUp3 {
          0%,73%   { opacity:0; transform:translateY(8px); }
          83%,100% { opacity:1; transform:translateY(0); }
        }
        /* Puntos del "analizando…" */
        @keyframes dot1 { 0%,100%{opacity:0.2} 20%{opacity:1} }
        @keyframes dot2 { 0%,100%{opacity:0.2} 40%{opacity:1} }
        @keyframes dot3 { 0%,100%{opacity:0.2} 60%{opacity:1} }

        .anim-loop { animation-duration:9s; animation-iteration-count:infinite; animation-timing-function:ease-in-out; }
        .show-test      { animation-name:showTest; }
        .show-result    { animation-name:showResult; }
        .show-analyzing { animation-name:showAnalyzing; }
        .fill-bar       { animation-name:fillBar; }
        .pick-a         { animation-name:pickA; }
        .pick-b         { animation-name:pickB; }
        .pick-c         { animation-name:pickC; }
        .hl-q1          { animation-name:hlQ1; }
        .hl-q2          { animation-name:hlQ2; }
        .hl-q3          { animation-name:hlQ3; }
        .draw-circle    { animation-name:drawCircle; animation-timing-function:cubic-bezier(.4,0,.2,1); }
        .count-iq       { animation-name:countIQ; }
        .fup1           { animation-name:fadeInUp1; }
        .fup2           { animation-name:fadeInUp2; }
        .fup3           { animation-name:fadeInUp3; }
        .dot1           { animation:dot1 1.2s ease-in-out infinite; }
        .dot2           { animation:dot2 1.2s ease-in-out infinite; }
        .dot3           { animation:dot3 1.2s ease-in-out infinite; }
      `}</style>

      {/* ── CARD WRAPPER ── */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10"
           style={{ background: 'linear-gradient(145deg,#0f172a 0%,#1e1b4b 100%)' }}>

        {/* Header bar (siempre visible) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8"
             style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-white">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 9.5L4 7.25l1.06-1.06 2.19 2.19 3.94-3.94L12.25 5.5 7.25 10.5z"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">Brain Metric</span>
          </div>
          {/* Barra de progreso header */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.1)' }}>
              <div className="anim-loop fill-bar h-full rounded-full"
                   style={{ background:'linear-gradient(90deg,#6366f1,#a78bfa)', width:'0%' }}/>
            </div>
            <span className="text-gray-400 text-xs">20 preg.</span>
          </div>
        </div>

        {/* ─────────── PANTALLA: TEST ─────────── */}
        <div className="anim-loop show-test absolute inset-0 top-[52px] flex flex-col px-5 pt-4 pb-5"
             style={{ opacity:1 }}>

          {/* Título pregunta */}
          <p className="text-gray-400 text-xs mb-3 text-center">¿Cuál completa la secuencia?</p>

          {/* Matriz 3×3 */}
          <div className="grid grid-cols-3 gap-1.5 mb-4 mx-auto"
               style={{ width:180 }}>
            {[
              /* fila 1 */ 'tl','tc','tr',
              /* fila 2 */ 'cl','cc','cr',
              /* fila 3 */ 'bl','bc','?'
            ].map((pos, i) => (
              <div key={i}
                   className="flex items-center justify-center rounded-lg"
                   style={{
                     width:54, height:54,
                     background: pos === '?' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                     border: pos === '?' ? '2px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                   }}>
                {pos === '?' ? (
                  <span className="text-primary-400 text-2xl font-bold">?</span>
                ) : (
                  <MatrixCell pos={pos} />
                )}
              </div>
            ))}
          </div>

          {/* Opciones A–F */}
          <p className="text-gray-400 text-xs mb-2 text-center">Elige tu respuesta:</p>
          <div className="grid grid-cols-3 gap-2 mx-auto" style={{ width:180 }}>
            {(['A','B','C','D','E','F'] as const).map((letter, i) => {
              const animClass = i === 2 ? 'pick-a anim-loop'
                              : i === 4 ? 'pick-b anim-loop'
                              : i === 0 ? 'pick-c anim-loop'
                              : ''
              const isSelected = i === 2 || i === 4 || i === 0
              return (
                <div key={letter} className="relative flex flex-col items-center gap-1">
                  <span className="text-gray-500 text-xs font-bold">{letter}</span>
                  <div className="rounded-lg flex items-center justify-center relative overflow-hidden"
                       style={{
                         width:54, height:54,
                         background:'rgba(255,255,255,0.03)',
                         border:'1px solid rgba(255,255,255,0.07)',
                       }}>
                    <OptionCell index={i} />
                    {/* Overlay de selección */}
                    {isSelected && (
                      <div className={`${animClass} absolute inset-0 rounded-lg flex items-center justify-center`}
                           style={{
                             background:'rgba(99,102,241,0.35)',
                             border:'2px solid #6366f1',
                             opacity:0,
                           }}>
                        <svg viewBox="0 0 20 20" className="w-6 h-6 fill-white">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Indicadores de pregunta */}
          <div className="flex justify-center gap-1.5 mt-4">
            {Array.from({length:8}).map((_,i) => (
              <div key={i} className="rounded-full transition-all"
                   style={{
                     width: i < 3 ? 6 : 4,
                     height: i < 3 ? 6 : 4,
                     background: i < 3
                       ? 'linear-gradient(135deg,#6366f1,#a78bfa)'
                       : 'rgba(255,255,255,0.12)',
                   }}/>
            ))}
            <span className="text-gray-500 text-xs ml-1">+12</span>
          </div>
        </div>

        {/* ─────────── OVERLAY: ANALIZANDO ─────────── */}
        <div className="anim-loop show-analyzing absolute inset-0 top-[52px] flex flex-col items-center justify-center gap-4"
             style={{ opacity:0, background:'rgba(10,12,28,0.92)', backdropFilter:'blur(4px)' }}>
          <div className="w-14 h-14 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin"/>
          <p className="text-white font-semibold text-sm">Analizando resultados</p>
          <div className="flex gap-1">
            <span className="dot1 w-2 h-2 rounded-full bg-primary-400"/>
            <span className="dot2 w-2 h-2 rounded-full bg-primary-400"/>
            <span className="dot3 w-2 h-2 rounded-full bg-primary-400"/>
          </div>
        </div>

        {/* ─────────── PANTALLA: RESULTADO ─────────── */}
        <div className="anim-loop show-result absolute inset-0 top-[52px] flex flex-col items-center justify-center px-6 pb-6"
             style={{ opacity:0 }}>

          {/* Círculo IQ */}
          <div className="relative mb-4">
            <svg width="150" height="150" viewBox="0 0 100 100">
              {/* Track */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="6"/>
              {/* Arco animado */}
              <circle cx="50" cy="50" r="45" fill="none"
                      stroke="url(#iqGrad)" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      className="anim-loop draw-circle"
                      style={{ transformOrigin:'50% 50%', transform:'rotate(-90deg)', strokeDashoffset:283 }}/>
              <defs>
                <linearGradient id="iqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
              {/* Número IQ */}
              <text x="50" y="44" textAnchor="middle" fill="white"
                    fontSize="22" fontWeight="800" fontFamily="system-ui">128</text>
              <text x="50" y="58" textAnchor="middle" fill="rgba(255,255,255,0.5)"
                    fontSize="9" fontWeight="600" fontFamily="system-ui" letterSpacing="2">IQ SCORE</text>
            </svg>
          </div>

          {/* Categoría */}
          <div className="anim-loop fup1 mb-1 px-4 py-1 rounded-full text-sm font-bold"
               style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))',
                        border:'1px solid rgba(99,102,241,0.4)', color:'#a78bfa', opacity:0 }}>
            🧠 Muy Superior
          </div>

          {/* Subtexto */}
          <p className="anim-loop fup2 text-gray-400 text-xs text-center mb-4"
             style={{ opacity:0 }}>
            Superas al <span className="text-primary-400 font-bold">96%</span> de la población
          </p>

          {/* Stats row */}
          <div className="anim-loop fup3 grid grid-cols-3 gap-2 w-full"
               style={{ opacity:0 }}>
            {[
              { label:'Preguntas', value:'18/20' },
              { label:'Percentil', value:'96°' },
              { label:'Tiempo', value:'14 min' },
            ].map(s => (
              <div key={s.label} className="rounded-xl py-2 text-center"
                   style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-white font-bold text-sm">{s.value}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA mini */}
          <div className="anim-loop fup3 mt-4 w-full rounded-xl py-2.5 text-center text-sm font-bold text-white"
               style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', opacity:0 }}>
            Ver resultado completo →
          </div>
        </div>
      </div>
    </div>
  )
}

/* Pequeñas figuras SVG para las celdas de la matriz */
function MatrixCell({ pos }: { pos: string }) {
  const shapes: Record<string, JSX.Element> = {
    tl: <svg viewBox="0 0 40 40" width="32" height="32"><circle cx="20" cy="20" r="10" fill="none" stroke="#6366f1" strokeWidth="2.5"/></svg>,
    tc: <svg viewBox="0 0 40 40" width="32" height="32"><circle cx="20" cy="20" r="10" fill="#6366f1" opacity="0.5"/></svg>,
    tr: <svg viewBox="0 0 40 40" width="32" height="32"><circle cx="20" cy="20" r="10" fill="#6366f1"/></svg>,
    cl: <svg viewBox="0 0 40 40" width="32" height="32"><rect x="10" y="10" width="20" height="20" rx="3" fill="none" stroke="#8b5cf6" strokeWidth="2.5"/></svg>,
    cc: <svg viewBox="0 0 40 40" width="32" height="32"><rect x="10" y="10" width="20" height="20" rx="3" fill="#8b5cf6" opacity="0.5"/></svg>,
    cr: <svg viewBox="0 0 40 40" width="32" height="32"><rect x="10" y="10" width="20" height="20" rx="3" fill="#8b5cf6"/></svg>,
    bl: <svg viewBox="0 0 40 40" width="32" height="32"><polygon points="20,8 32,30 8,30" fill="none" stroke="#a78bfa" strokeWidth="2.5"/></svg>,
    bc: <svg viewBox="0 0 40 40" width="32" height="32"><polygon points="20,8 32,30 8,30" fill="#a78bfa" opacity="0.5"/></svg>,
  }
  return shapes[pos] || null
}

function OptionCell({ index }: { index: number }) {
  const cells = [
    <svg key={0} viewBox="0 0 40 40" width="32" height="32"><polygon points="20,8 32,30 8,30" fill="#a78bfa"/></svg>,
    <svg key={1} viewBox="0 0 40 40" width="32" height="32"><circle cx="20" cy="20" r="10" fill="#6366f1" opacity="0.4"/></svg>,
    <svg key={2} viewBox="0 0 40 40" width="32" height="32"><polygon points="20,8 32,30 8,30" fill="#a78bfa" opacity="0.5"/></svg>,
    <svg key={3} viewBox="0 0 40 40" width="32" height="32"><rect x="10" y="10" width="20" height="20" rx="3" fill="#8b5cf6" opacity="0.3"/></svg>,
    <svg key={4} viewBox="0 0 40 40" width="32" height="32"><circle cx="20" cy="20" r="10" fill="#6366f1" opacity="0.7"/></svg>,
    <svg key={5} viewBox="0 0 40 40" width="32" height="32"><polygon points="20,8 32,30 8,30" fill="none" stroke="#a78bfa" strokeWidth="2.5"/></svg>,
  ]
  return cells[index] || null
}
