import React, { useEffect, useState } from 'react';
import {
    Box, Flex, Text, Heading, Button, Link, Image, Grid, VStack, HStack, Avatar, Icon,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    useColorMode,
    Card, CardHeader, CardBody, CardFooter, IconButton,
} from '@chakra-ui/react';
import {
    FaArrowRight, FaStar, FaStarHalfAlt, FaBook, FaPlayCircle, FaChartLine,
    FaMicrophone, FaClock, FaHeadset, FaCheck, FaHome, FaQuestionCircle,
} from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { motion, useReducedMotion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/Footer';
import { HiLightBulb } from 'react-icons/hi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Live2DComponent from '../components/live2dModel'
// Motion wrapper for Chakra components
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
const MotionBox = motion(Box);
const MotionButton = motion(Button);



// Fade-in animation component added 3d styl
const FadeInSection = ({ children, animation = 'fade-in', delay = 0 }) => {
    const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
    const [isVisible, setIsVisible] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const [autoAnimation, setAutoAnimation] = useState({ rotateX: 0, rotateY: 0, z: 0 });

    // Handle initial visibility
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inView) setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [inView]);

    // Auto 3D animation with random intervals
    useEffect(() => {
        if (!isVisible || shouldReduceMotion) return;

        const triggerRandomAnimation = () => {
            const randomRotateX = Math.random() * 6 - 3; // -3 to 3 degrees
            const randomRotateY = Math.random() * 6 - 3; // -3 to 3 degrees
            const randomZ = Math.random() * 10 - 5; // -5 to 5 pixels
            setAutoAnimation({ rotateX: randomRotateX, rotateY: randomRotateY, z: randomZ });
        };

        // Initial animation
        triggerRandomAnimation();

        // Set random interval for animation
        const interval = setInterval(() => {
            triggerRandomAnimation();
        }, Math.random() * 3000 + 2000); // Random between 2-5 seconds

        return () => clearInterval(interval);
    }, [isVisible, shouldReduceMotion]);

    const variants = {
        hidden: {
            opacity: 0,
            y: animation.includes('slide-up') ? 30 : 0,
            x: animation.includes('slide-left') ? -30 : animation.includes('slide-right') ? 30 : 0,
            scale: animation.includes('scale-up') ? 0.95 : 1,
            rotateX: animation.includes('3d-tilt') ? 10 : 0,
            rotateY: animation.includes('3d-tilt') ? 10 : 0,
            z: animation.includes('3d-tilt') ? -20 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotateX: autoAnimation.rotateX,
            rotateY: autoAnimation.rotateY,
            z: autoAnimation.z,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
                delay,
                rotateX: { duration: 0.8, ease: 'easeInOut' },
                rotateY: { duration: 0.8, ease: 'easeInOut' },
                z: { duration: 0.8, ease: 'easeInOut' },
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            variants={variants}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        >
            {children}
        </motion.div>
    );
};

const HomePage = () => {


    const { colorMode } = useColorMode();
    const iosColors = {
        light: {
            primary: '#007AFF',
            secondary: '#34C759',
            background: 'rgba(242, 242, 247, 0.9)',
            text: '#1C1C1E',
            navbar: 'rgba(249, 249, 249, 0.94)',
            button: '#007AFF',
            buttonText: 'white',
            glass: 'rgba(255, 255, 255, 0.7)',
        },
        dark: {
            primary: '#0A84FF',
            secondary: '#30D158',
            background: 'rgba(28, 28, 30, 0.9)',
            text: '#FFFFFF',
            navbar: 'rgba(36, 36, 38, 0.94)',
            button: '#0A84FF',
            buttonText: 'white',
            glass: 'rgba(44, 44, 46, 0.7)',
        },
    };
    const currentColors = iosColors[colorMode];
    const shouldReduceMotion = useReducedMotion();

    // 3D tilt effect for hero image
    const heroImageVariants = {
        initial: { y: 30, scale: 1, rotateX: 0, rotateY: 0, z: 0 },
        animate: {
            y: [30, -30],
            scale: [1, 1.02],
            transition: {
                y: { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
                scale: { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
            },
        },
        hover: {
            rotateX: 5,
            rotateY: 5,
            z: 20,
            transition: { duration: 0.3, ease: 'easeOut' },
        },
    };

    useEffect(() => {
        const handleScroll = () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 50) {
                nav.classList.add('shadow-md');
                nav.classList.remove('shadow-sm');
            } else {
                nav.classList.remove('shadow-md');
                nav.classList.add('shadow-sm');
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Box
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            color={currentColors.text}
            bg={colorMode === 'light' ? 'rgba(229, 229, 234, 0.6)' : 'rgba(44, 44, 46, 0.6)'}
            minH="100vh"
            scrollBehavior="smooth"
        >
            {/* Bottom Navigation Bar */}
            <Box
                as="nav"
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                bg={currentColors.navbar}
                backdropFilter="blur(20px)"
                borderTop="1px"
                borderColor={currentColors.glass}
                p={2}
                zIndex={50}
                display={{ base: 'flex', md: 'none' }}
                justifyContent="space-around"
            >
                {[
                    { icon: FaHome, label: 'Home', href: '/' },
                    { icon: FaBook, label: 'Exercise', href: '/exercise' },
                    { icon: FaMicrophone, label: 'Test', href: '/test' },
                    { icon: FaQuestionCircle, label: 'FAQ', href: '/faq' },
                ].map((item, index) => (
                    <Link
                        key={index}
                        as={RouterLink}
                        to={item.href}
                        display="flex"
                        flexDir="column"
                        alignItems="center"
                        color={currentColors.primary}
                        _hover={{ color: currentColors.secondary }}
                    >
                        <Icon as={item.icon} boxSize={6} />
                        <Text fontSize="xs">{item.label}</Text>
                    </Link>
                ))}
            </Box>

            {/* Hero Section */}
            <MotionBox
                as="section"
                id="hero"
                bgGradient={
                    colorMode === 'light'
                        ? 'linear-gradient(to bottom, rgb(108, 202, 242), rgb(210, 247, 246), transparent 60%)'
                        : 'linear-gradient(to bottom, rgb(1, 21, 66), rgba(36, 36, 38, 0.94), transparent 80%)'
                }
                py={{ base: 16, md: 24 }}
                px={{ base: 4, md: 6 }}
                position="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, duration: shouldReduceMotion ? 0 : 1 }}
            >
                <Box maxW="7xl" mx="auto">
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 8, md: 12 }} alignItems="center">
                        <FadeInSection animation="fade-in slide-left">
                            <VStack align="start" spacing={6}>
                                <Heading
                                    as="h1"
                                    fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                                    fontWeight="extrabold"
                                    lineHeight="tight"
                                    letterSpacing="-0.02em"
                                >
                                    <Box as="span" bgGradient="linear(to-r, #007AFF, #ca0aff)" bgClip="text">
                                        OPIC
                                    </Box>{' '}
                                    EXAMATION
                                </Heading>
                                <Text fontSize={{ base: 'md', md: 'lg' }} maxW="lg" opacity={0.9} lineHeight="tall">
                                    Master English speaking and listening with Opic
                                </Text>
                                <HStack spacing={4} flexWrap="wrap">
                                    <MotionButton
                                        as={RouterLink}
                                        to="/exercise"
                                        bgGradient="linear(to-r, #007AFF, #ca0aff)"
                                        color="white"
                                        px={8}
                                        py={6}
                                        rounded="full"
                                        fontWeight="semibold"
                                        fontSize="lg"
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: '0 8px 20px rgba(0, 122, 255, 0.4)',
                                            rotateX: 5,
                                            rotateY: 5,
                                            z: 10,
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                        style={{ perspective: '1000px' }}
                                        _hover={' #ca0aff'}

                                    >
                                        Start excersice
                                    </MotionButton>
                                    <MotionButton
                                        as={RouterLink}
                                        to="/"
                                        variant="link"
                                        color={currentColors.primary}
                                        fontWeight="semibold"
                                        fontSize="lg"
                                        whileHover={{ x: 5, color: currentColors.secondary }}
                                        whileTap={{ scale: 0.95 }}
                                        display="flex"
                                        alignItems="center"
                                    >
                                        Explore Features <Icon as={FaArrowRight} ml={2} />
                                    </MotionButton>
                                </HStack>
                            </VStack>
                        </FadeInSection>
                        <FadeInSection animation="fade-in slide-right 3d-tilt">
                            <MotionBox
                                position="relative"
                                display="flex"
                                justifyContent="center"
                                variants={heroImageVariants}
                                initial="initial"
                                animate="animate"
                                whileHover={shouldReduceMotion ? {} : "hover"}
                                style={{ perspective: '1000px' }}
                            >
                                <Image
                                    src="./images/developer.svg"
                                    alt="English Learning"
                                    rounded="3xl"
                                    objectFit="cover"
                                    maxH={{ base: '300px', md: '500px' }}
                                    w="full"
                                    style={{ transformStyle: 'preserve-3d' }}
                                />
                            </MotionBox>
                            {/* <Live2DComponent /> */}
                        </FadeInSection>
                    </Grid>
                </Box>
            </MotionBox>

            {/* Features Section */}
            <Box as="section" id="features" py={20} px={{ base: 4, md: 6 }} color={currentColors.text}>
                <Box maxW="7xl" mx="auto">
                    <FadeInSection animation="fade-in scale-up">
                        <VStack textAlign="center" mb={16} spacing={4}>
                            <Heading
                                as="h2"
                                fontSize={{ base: '2xl', md: '4xl' }}
                                fontWeight="extrabold"
                                lineHeight="tight"
                            >
                                Your Path to{' '}
                                <Box as="span" bgGradient="linear(to-r, #007AFF, #ca0aff)" bgClip="text">
                                    English Fluency
                                </Box>
                            </Heading>
                            <Text fontSize="lg" maxW="2xl" mx="auto" opacity={0.9}>
                                Interactive tools and lessons to help you speak, read, and write English confidently.
                            </Text>
                        </VStack>
                    </FadeInSection>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                        {[
                            { icon: FaBook, title: 'Interactive Lessons', desc: 'Engaging video and text-based lessons.', delay: 0 },
                            { icon: FaMicrophone, title: 'Pronunciation Practice', desc: 'AI-powered feedback to perfect your speaking skills.', delay: 0.05 },
                            { icon: FaChartLine, title: 'Track Progress', desc: 'Monitor your improvement with detailed analytics.', delay: 0.1 },
                            { icon: FaClock, title: 'Daily Challenges', desc: 'Quick exercises to keep you learning every day.', delay: 0.15 },
                            { icon: FaPlayCircle, title: 'Listening Practice', desc: 'Real-world audio to boost comprehension.', delay: 0.2 },
                            { icon: FaHeadset, title: '24/7 Support', desc: 'Get help from our team anytime.', delay: 0.25 },
                        ].map((feature, index) => (
                            <FadeInSection key={index} animation="fade-in slide-up 3d-tilt" delay={feature.delay}>
                                <MotionBox
                                    p={6}
                                    rounded="2xl"
                                    bg={currentColors.glass}
                                    backdropFilter="blur(10px)"
                                    border="1px"
                                    borderColor={currentColors.glass}
                                    initial={{ rotateX: 0, rotateY: 0, z: 0 }}
                                    whileHover={
                                        shouldReduceMotion
                                            ? {}
                                            : {
                                                rotateX: 8,
                                                rotateY: 8,
                                                z: 30,
                                                boxShadow: '0 15px 30px rgba(0, 122, 255, 0.3)',
                                                transition: { duration: 0.3, ease: 'easeOut' },
                                            }
                                    }
                                    whileTap={{ scale: 0.98 }}
                                    style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
                                >
                                    <Flex
                                        w={12}
                                        h={12}
                                        align="center"
                                        justify="center"
                                        bgGradient="linear(to-r, #007AFF, #0A84FF)"
                                        rounded="lg"
                                        color="white"
                                        mb={4}
                                    >
                                        <Icon as={feature.icon} fontSize="xl" />
                                    </Flex>
                                    <Heading as="h3" fontSize="lg" fontWeight="bold" mb={2}>
                                        {feature.title}
                                    </Heading>
                                    <Text fontSize="sm" opacity={0.8}>
                                        {feature.desc}
                                    </Text>
                                </MotionBox>
                            </FadeInSection>
                        ))}
                    </Grid>
                    <FadeInSection animation="fade-in scale-up">
                        <Box textAlign="center" mt={12}>
                            <Button
                                as={Link}
                                href="#features"
                                variant="link"
                                color={currentColors.primary}
                                fontWeight="semibold"
                                fontSize="lg"
                                display="flex"
                                alignItems="center"
                                mx="auto"

                            >
                                Discover All Features <Icon as={FaArrowRight} ml={2} />
                            </Button>
                        </Box>
                    </FadeInSection>
                </Box>
            </Box >

            {/* Testimonials Section */}
            <Box Box as="section" id="testimonials" py={20} px={{ base: 4, md: 6 }}>
                <Box maxW="7xl" mx="auto">
                    <FadeInSection animation="fade-in scale-up">
                        <VStack textAlign="center" mb={16} spacing={4}>
                            <Heading
                                as="h2"
                                fontSize={{ base: '2xl', md: '4xl' }}
                                fontWeight="extrabold"
                                lineHeight="tight"
                            >
                                What Our{' '}
                                <Box as="span" bgGradient="linear(to-r, #007AFF, #ca0aff)" bgClip="text">
                                    Learners Say
                                </Box>
                            </Heading>
                            <Text fontSize="lg" maxW="2xl" mx="auto" opacity={0.9}>
                                Hear from students who’ve achieved fluency with our platform.
                            </Text>
                        </VStack>
                    </FadeInSection>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                        {[
                            { name: 'Human-1', title: 'Student', quote: 'I’m speaking English confidently after just 3 months!', stars: 5, delay: 0 },
                            { name: 'Human-2', title: 'Freelancer', quote: 'The pronunciation tool is a game-changer.', stars: 5, delay: 0.1 },
                            { name: 'Human-3', title: 'Teacher', quote: 'My students love the interactive lessons!', stars: 4.5, delay: 0.2 },
                        ].map((testimonial, index) => (
                            <FadeInSection key={index} animation="fade-in slide-up 3d-tilt" delay={testimonial.delay}>
                                <MotionBox
                                    bg={currentColors.glass}
                                    p={6}
                                    rounded="2xl"
                                    shadow="md"
                                    backdropFilter="blur(10px)"
                                    border="1px"
                                    borderColor={currentColors.glass}
                                    initial={{ rotateX: 0, rotateY: 0, z: 0 }}
                                    whileHover={
                                        shouldReduceMotion
                                            ? {}
                                            : {
                                                rotateX: 5,
                                                rotateY: -5,
                                                z: 20,
                                                boxShadow: '0 10px 20px rgba(0, 122, 255, 0.2)',
                                                transition: { duration: 0.3, ease: 'easeOut' },
                                            }
                                    }
                                    whileTap={{ scale: 0.98 }}
                                    style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
                                >
                                    <HStack align="center" mb={4}>
                                        <Avatar
                                            name={testimonial.name}
                                            size="md"
                                            bgGradient="linear(to-r, #007AFF, #0A84FF)"
                                        />
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="bold" fontSize="md">
                                                {testimonial.name}
                                            </Text>
                                            <Text fontSize="sm" opacity={0.7}>
                                                {testimonial.title}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="sm" opacity={0.8} mb={4}>
                                        {testimonial.quote}
                                    </Text>
                                    <HStack color="yellow.400">
                                        {Array.from({ length: Math.floor(testimonial.stars) }, (_, i) => (
                                            <Icon key={i} as={FaStar} />
                                        ))}
                                        {testimonial.stars % 1 !== 0 && <Icon as={FaStarHalfAlt} />}
                                    </HStack>
                                </MotionBox>
                            </FadeInSection>
                        ))}
                    </Grid>
                </Box>
            </Box >

            {/* FAQ Section (unchanged for brevity, but can add 3D effects if desired) */}
            <Box Box as="section" id="faq" py={20} px={{ base: 4, md: 6 }}>
                <Box maxW="4xl" mx="auto">
                    <FadeInSection animation="fade-in">
                        <Heading
                            as="h2"
                            fontSize={{ base: '2xl', md: '4xl' }}
                            fontWeight="extrabold"
                            mb={12}
                            textAlign="center"
                            lineHeight="tight"
                        >
                            Frequently Asked{' '}
                            <Box as="span" bgGradient="linear(to-r, #007AFF, #ca0aff)" bgClip="text">
                                Questions
                            </Box>
                        </Heading>
                        <Accordion allowToggle>
                            {[
                                {
                                    question: 'How do I start ?',
                                    answer: 'Make some excersice before go to real test.',
                                },
                                {
                                    question: 'Can I practice speaking?',
                                    answer: 'Yes! Our AI-powered tool provides real-time pronunciation feedback.',
                                },
                                {
                                    question: 'Is the app beginner-friendly?',
                                    answer: 'Depend on you.',
                                },
                                {
                                    question: 'How do I track my progress?',
                                    answer: 'Go to your profile we save your previous test.',
                                },
                            ].map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    border="none"
                                    rounded="xl"
                                    overflow="hidden"
                                    mb={4}
                                    bg={currentColors.glass}
                                    backdropFilter="blur(10px)"
                                >
                                    <AccordionButton
                                        px={6}
                                        py={5}
                                        _hover={{ bg: 'rgba(0, 122, 255, 0.1)' }}
                                        transition="background 0.3s"
                                    >
                                        <Box
                                            flex="1"
                                            textAlign="left"
                                            fontSize="md"
                                            fontWeight="semibold"
                                        >
                                            {faq.question}
                                        </Box>
                                        <AccordionIcon color={currentColors.primary} />
                                    </AccordionButton>
                                    <AccordionPanel px={6} pb={5} fontSize="sm" opacity={0.8}>
                                        {faq.answer}
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        <Box textAlign="center" mt={10}>
                            <Button
                                as={Link}
                                href="#support"
                                variant="link"
                                color={currentColors.primary}
                                fontWeight="semibold"
                                fontSize="lg"
                                _hover={{ color: '#ca0aff', textDecoration: 'underline' }}
                                display="flex"
                                alignItems="center"
                                mx="auto"
                            >
                                Contact Support <Icon as={FaArrowRight} ml={2} />
                            </Button>
                        </Box>
                    </FadeInSection>
                </Box>
            </Box >
            <Footer />
        </Box >
    );
};

export default HomePage;