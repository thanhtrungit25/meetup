import React from 'react'

const ReactionsOverlay = ({ reactions = [] }) => {

  if (!reactions || reactions.length === 0) return null;

  return (
    <div className='absolute inset-0 pointer-events-none z-40 overflow-hidden'>
      {reactions.map((r, index) => {
        // Generate pseudo-random left percentage based on id
        const hash = r.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const leftPercent = 15 + (hash % 70); // Between 15% and 85%

        return (
          <div
            key={r.id || index}
            className="absolute bottom-16 flex flex-col items-center animate-float-up"
            style={{
              left: `${leftPercent}%`,
              animationDuration: '3.5s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'forwards',
            }}
          >
            <span className="text-4xl sm:text-5xl filter drop-shadow-lg transform transition-transform hover:scale-125">
              {r.emoji}
            </span>
            {r.userName && (
              <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/75 text-white text-[10px] font-semibold backdrop-blur-xs shadow-md">
                {r.userName}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ReactionsOverlay