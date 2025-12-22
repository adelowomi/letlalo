'use client';

import { useEffect, useRef } from 'react';

export function LetlaloPattern() {
  const patternRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (patternRef.current) {
        const scrolled = window.scrollY;
        patternRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden opacity-[0.08]">
      <div
        ref={patternRef}
        className="absolute inset-0 flex flex-col gap-4 transition-transform duration-75 ease-out"
        style={{ top: '-20%', height: '140%' }}
      >
        {[...Array(16)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex shrink-0 justify-center whitespace-nowrap text-[60px] font-black leading-none tracking-[0.2em] md:text-[100px]"
            style={{
              WebkitTextStroke: rowIndex % 2 === 1 ? '2px currentColor' : 'none',
              WebkitTextFillColor: rowIndex % 2 === 1 ? 'transparent' : 'currentColor',
            }}
          >
            LETLALO
          </div>
        ))}
      </div>
    </div>
  );
}
