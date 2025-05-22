import { useEffect, useRef } from 'react';
import { Box, Text, Flex, Button } from '@chakra-ui/react';
import { gsap } from 'gsap';

const KeyButton = ({ letter, color, delay }) => {
    const keyRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(
            keyRef.current,
            { scale: 0, opacity: 0, y: 50 },
            {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'elastic.out(1, 0.5)',
                delay: delay,
            }
        );
    }, [delay]);

    const handleClick = () => {
        gsap.to(keyRef.current, {
            y: 8,
            boxShadow: '0 4px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.3)',
            duration: 0.1,
            onComplete: () => {
                gsap.to(keyRef.current, {
                    y: 0,
                    boxShadow: '0 12px 24px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(255,255,255,0.4)',
                    duration: 0.2,
                });
            },
        });
    };

    const handleHover = () => {
        gsap.to(keyRef.current, {
            rotateX: 15,
            rotateY: 15,
            boxShadow: '0 16px 32px rgba(0,0,0,0.6), inset 0 -3px 6px rgba(255,255,255,0.5)',
            duration: 0.3,
        });
    };

    const handleHoverOut = () => {
        gsap.to(keyRef.current, {
            rotateX: 0,
            rotateY: 0,
            boxShadow: '0 12px 24px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(255,255,255,0.4)',
            duration: 0.3,
        });
    };

    return (
        <Button
            ref={keyRef}
            onClick={handleClick}
            onMouseEnter={handleHover}
            onMouseLeave={handleHoverOut}
            bgGradient={`linear(to-t, ${color}, ${color}D9)`}
            color="black"
            fontSize="3xl"
            fontWeight="bold"
            w="90px"
            h="90px"
            m="4"
            borderRadius="lg"
            border="6px solid"
            borderColor="gray.800"
            borderTopColor="gray.600"
            borderLeftColor="gray.600"
            borderRightColor="gray.900"
            borderBottomColor="gray.900"
            boxShadow="0 12px 24px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(255,255,255,0.4)"
            transform="perspective(800px)"
            transition="none"
            position="relative"
            _before={{
                content: '""',
                position: 'absolute',
                top: '4px',
                left: '4px',
                right: '4px',
                bottom: '4px',
                background: 'linear-gradient(to bottom right, rgba(255,255,255,0.4), rgba(0,0,0,0.2))',
                borderRadius: 'md',
                zIndex: -1,
            }}
            _after={{
                content: '""',
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                borderRadius: 'lg',
                boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.6), inset 0 -2px 8px rgba(0,0,0,0.3)',
                zIndex: -2,
            }}
        >
            {letter}
        </Button>
    );
};

const KeyboardHero = () => {
    const keys = [
        { letter: "O", color: "orange.500", delay: 0.1 },
        { letter: "V", color: "purple.300", delay: 0.2 },
        { letter: "E", color: "purple.500", delay: 0.3 },
        { letter: "R", color: "green.400", delay: 0.4 },
        { letter: "F", color: "blue.500", delay: 0.5 },
        { letter: "L", color: "yellow.400", delay: 0.6 },
        { letter: "O", color: "orange.500", delay: 0.7 },
        { letter: "W", color: "purple.300", delay: 0.8 },
    ];

    return (
        <Box
            bg="gray.100"
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            position="relative"
            overflow="hidden"
        >
            <Box
                position="absolute"
                inset="0"
                bgGradient="linear(to-br, blue.50, purple.50)"
                opacity="0.3"
                zIndex="-1"
                backgroundSize="40px 40px"
                backgroundImage="
          linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
        "
            />
            <Box textAlign="center">
                <Text
                    fontSize="5xl"
                    fontWeight="bold"
                    mb={8}
                    bgGradient="linear(to-r, purple.500, blue.500)"
                    bgClip="text"
                >
                    Mechanical Overflow
                </Text>
                <Flex wrap="wrap" justify="center" maxW="550px" mx="auto">
                    {keys.map((key, index) => (
                        <KeyButton
                            key={index}
                            letter={key.letter}
                            color={key.color}
                            delay={key.delay}
                        />
                    ))}
                </Flex>
                <Text mt={6} fontSize="lg" color="gray.600">
                    Click or hover the keys to interact!
                </Text>
            </Box>
        </Box>
    );
};

export default KeyboardHero;