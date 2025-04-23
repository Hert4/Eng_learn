import {
    Box,
    Button,
    Flex,
    Grid,
    GridItem,
    Heading,
    Image,
    Text,
    useColorMode
} from '@chakra-ui/react'
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

const MotionButton = motion(Button);


const FadeInSection = ({ children, animation = 'fade-in', delay = 0 }) => {
    const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay the visibility check to ensure IntersectionObserver initializes
        const timer = setTimeout(() => {
            if (inView) {
                setIsVisible(true);
            }
        }, 100); // Small delay to allow observer to initialize

        return () => clearTimeout(timer);
    }, [inView]);

    return (
        <Box
            ref={ref}
            opacity={isVisible ? 1 : 0}
            transform={
                isVisible
                    ? 'none'
                    : animation.includes('slide-up')
                        ? 'translateY(30px)'
                        : animation.includes('slide-left')
                            ? 'translateX(-30px)'
                            : animation.includes('slide-right')
                                ? 'translateX(30px)'
                                : 'scale(0.95)'
            }
            transition={`opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`}
        >
            {children}
        </Box>
    );
};
const Page = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <>
            <Box >
                <Box bgGradient="radial-gradient(circle at 80% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 60%)"
                    py={{ base: 24, md: 36 }}
                    px={6}
                    position="relative"
                    overflow="hidden"
                >
                    <Box maxW="7xl" mx="auto" position="relative" zIndex="10">
                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={12}>
                            <FadeInSection>
                                <Flex fontSize={{ base: '5xl', md: '6xl' }} mb={6}  >
                                    <Heading>
                                        <Box
                                            as='span'
                                            bgGradient={"linear(to-r,#F596D3 ,#D247BF)"}
                                            bgClip={'text'}
                                        >
                                            Opic
                                        </Box>{" "}
                                        examine for Everyone
                                    </Heading>
                                </Flex>
                                <Flex>
                                    <Text mb={4}>
                                        Unlock your potential: Master the test, elevate yourself.
                                    </Text>
                                </Flex>
                                <Flex>
                                    <MotionButton
                                        bgGradient="linear(to-r, green.400, green.300)"
                                        color="white"
                                        px={5}
                                        py={2}
                                        rounded="full"
                                        fontSize="sm"
                                        fontWeight="medium"
                                        _hover={{ bgGradient: "linear(to-r, green.500, green.500)", boxShadow: "lg", shadow: 'lg', transform: 'scale(1.05)' }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition="all 0.3s"
                                    >
                                        Get Started
                                    </MotionButton>
                                </Flex>
                            </FadeInSection>
                        </Grid>
                    </Box>
                </Box>

            </Box >
            {/* Added more component here ... */}

            <Box as="section" py={12} bg="gray.50">
                <Box maxW="7xl" mx="auto" px={6}>
                    <Text textAlign="center" color="gray.500" fontSize="sm" mb={8}>TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</Text>
                    <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={8} alignItems="center" justifyItems="center">
                        <Image src="https://logo.clearbit.com/google.com" alt="Google" h={8} opacity={0.6} _hover={{ opacity: 1 }} transition="opacity 0.3s" />
                        <Image src="https://logo.clearbit.com/microsoft.com" alt="Microsoft" h={8} opacity={0.6} _hover={{ opacity: 1 }} transition="opacity 0.3s" />
                        <Image src="https://logo.clearbit.com/airbnb.com" alt="Airbnb" h={8} opacity={0.6} _hover={{ opacity: 1 }} transition="opacity 0.3s" />
                        <Image src="https://logo.clearbit.com/spotify.com" alt="Spotify" h={8} opacity={0.6} _hover={{ opacity: 1 }} transition="opacity 0.3s" />
                    </Grid>
                </Box>
            </Box>
        </>
    )
}

export default Page

