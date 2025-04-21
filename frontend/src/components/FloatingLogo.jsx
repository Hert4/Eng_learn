// FloatingLogo.jsx
import { useRef } from 'react';
import reactLogo from '../assets/chatgpt-6.svg';
import '../../src/index.css'
import useFloatingLogo from '../hooks/floatingLogo';
import { Box, Image } from '@chakra-ui/react';

function FloatingLogo() {
    const logoRef = useRef(null);
    useFloatingLogo(logoRef);

    return (
        <Box
            ref={logoRef}
            position="fixed"
            bottom="4"
            right="4"
            zIndex="overlay"
            cursor="grab"
        >
            <Image
                src={reactLogo}
                alt="Messenger logo"
                className="logo react"
                boxSize="60px"
            />
        </Box>
    );
}


export default FloatingLogo;
