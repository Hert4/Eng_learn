// hooks/useFloatingLogo.js
import { useEffect, useRef } from 'react';
import { animate, createScope, createSpring, createDraggable } from 'animejs';

export default function useFloatingLogo(ref) {
  const scope = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    scope.current = createScope({ root: ref }).add(() => {
      animate('.logo', {
        scale: [
          { to: 1.25, ease: 'inOut(3)', duration: 200 },
          { to: 1, ease: createSpring({ stiffness: 300 }) }
        ],
        loop: true,
        loopDelay: 250,
      });

      createDraggable('.logo', {
        container: [0, 0, 0, 0],
        releaseEase: createSpring({ stiffness: 200 })
      });

      // Lopp 
      animate('.logo', {
        rotate: [0, 360],
        duration: 5000,
        loop: true,
        ease: 'linear'
      });
    });

    return () => {
      scope.current?.revert();
    };
  }, [ref]);
}
