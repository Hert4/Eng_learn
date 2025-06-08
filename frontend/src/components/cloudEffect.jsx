import { Box } from '@chakra-ui/react'
import React, { useState, useEffect, useRef } from 'react'
import BIRDS from 'vanta/dist/vanta.birds.min.js'

// Make sure window.THREE is defined, e.g. by including three.min.js in the document head using a <script> tag

const CloudEffect = ({ backgroundColor, color1, color2, quantity }) => {
  const [vantaEffect, setVantaEffect] = useState(null)
  const myRef = useRef(null)

  useEffect(() => {
    let effect = null;

    if (myRef.current) {
      effect = BIRDS({
        el: myRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        quantity: quantity || 5,
        backgroundColor: backgroundColor || '0xffffff',
        color1: color1 || '0xff0000',
        color2: color2 || '0xd1ff',
        birdSize: 5
      })
    }

    setVantaEffect(effect)

    return () => {
      if (effect) effect.destroy()
    }
  }, [quantity, color1, color2, backgroundColor]) // Re-init effect when any prop changes

  return (
    <Box
      ref={myRef}
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      m={0}
      p={0}
      zIndex={-1}
    />
  )
}

export default CloudEffect