import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, Heading, Button, Link, Image, Grid, VStack, HStack, Avatar, Icon, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import { FaArrowRight, FaStar, FaStarHalfAlt, FaBolt, FaShieldAlt, FaChartLine, FaSync, FaPaintBrush, FaHeadset, FaCheck } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';


// Fading motion
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

const HomePage = () => {
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
        <Box fontFamily="Inter, sans-serif" color="gray.900" bg="gray.50" overflowX="hidden">
            {/* <Header /> */}

            {/* Hero Section */}
            <Box as="section" bgGradient="radial-gradient(circle at 80% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 60%)" py={{ base: 24, md: 36 }} px={6} position="relative" overflow="hidden">
                <Box maxW="7xl" mx="auto" position="relative" zIndex="10">
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={12} alignItems="center">
                        <FadeInSection animation="fade-in slide-left">
                            <Heading as="h1" fontSize={{ base: '4xl', md: '6xl' }} fontWeight="bold" lineHeight="tight" mb={6}>
                                <Box as="span" bgGradient="linear(to-r, indigo.600, pink.500)" bgClip="text">Revolutionize</Box> Your Digital Experience
                            </Heading>
                            <Text fontSize="lg" color="gray.600" mb={8} maxW="lg">
                                Lumina brings all your tools together into one powerful platform to supercharge your productivity and workflow.
                            </Text>
                            <Flex flexWrap="wrap" gap={4}>
                                <Button as={Link} href="#" bgGradient="linear(to-r, indigo.600, pink.500)" color="white" px={8} py={4} rounded="full" fontWeight="medium" _hover={{ shadow: 'lg', transform: 'scale(1.05)' }} transition="all 0.3s">
                                    Start Free Trial
                                </Button>
                                <Button as={Link} href="#features" variant="link" color="indigo.600" fontWeight="medium" _hover={{ color: 'indigo.800' }} display="flex" alignItems="center">
                                    See How It Works <Icon as={FaArrowRight} ml={2} mt={1} />
                                </Button>
                            </Flex>
                            <Flex mt={10} align="center" gap={4}>
                                <HStack spacing={-2}>
                                    <Avatar src="https://randomuser.me/api/portraits/women/12.jpg" size="md" border="2px" borderColor="white" />
                                    <Avatar src="https://randomuser.me/api/portraits/men/43.jpg" size="md" border="2px" borderColor="white" />
                                    <Avatar src="https://randomuser.me/api/portraits/women/34.jpg" size="md" border="2px" borderColor="white" />
                                </HStack>
                                <Box fontSize="sm" color="gray.600">
                                    <Text>Trusted by <Text as="span" fontWeight="bold" color="gray.800">25,000+</Text> users</Text>
                                    <Flex align="center" mt={1}>
                                        <Icon as={FaStar} color="yellow.400" mr={1} />
                                        <Text fontWeight="medium">4.9/5</Text>
                                        <Text color="gray.500" ml={1}>(2,458 reviews)</Text>
                                    </Flex>
                                </Box>
                            </Flex>
                        </FadeInSection>
                        <FadeInSection animation="fade-in slide-right">
                            <Box position="relative" display="flex" justifyContent="center">
                                <Image
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                                    alt="Hero Image"
                                    rounded="2xl"
                                    shadow="xl"
                                    objectFit="cover"
                                    maxH="500px"
                                    w="full"
                                    animation="floating 6s ease-in-out infinite"
                                    sx={{
                                        '@keyframes floating': {
                                            '0%': { transform: 'translateY(0px)' },
                                            '50%': { transform: 'translateY(-15px)' },
                                            '100%': { transform: 'translateY(0px)' },
                                        },
                                    }}
                                />
                                <Box position="absolute" bottom={-6} left={-6} w={32} h={32} bg="indigo.100" rounded="2xl" zIndex={-1} animation="pulse 2s infinite" />
                                <Box position="absolute" top={-6} right={-6} w={24} h={24} bg="pink.100" rounded="full" zIndex={-1} animation="pulse 2s infinite 0.3s" />
                            </Box>
                        </FadeInSection>
                    </Grid>
                </Box>
                <Box position="absolute" bottom={-20} left={-20} w={64} h={64} bg="indigo.200" rounded="full" opacity={0.2} filter="blur(48px)" />
                <Box position="absolute" top={-20} right={-20} w={64} h={64} bg="pink.200" rounded="full" opacity={0.2} filter="blur(48px)" />
            </Box>

            {/* Trusted By Section */}
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

            {/* Features Section */}
            <Box as="section" id="features" py={20} px={6} bg="white">
                <Box maxW="7xl" mx="auto">
                    <FadeInSection animation="fade-in scale-up">
                        <Box textAlign="center" mb={16}>
                            <Text as="span" display="inline-block" py={1} px={3} bg="indigo.100" color="indigo.600" rounded="full" fontSize="sm" fontWeight="medium" mb={3}>FEATURES</Text>
                            <Heading as="h2" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="extrabold" mb={4}>
                                Powerful Features Designed for <Box as="span" bgGradient="linear(to-r, indigo.600, pink.500)" bgClip="text">Your Success</Box>
                            </Heading>
                            <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                                Lumina combines the most powerful tools in one intuitive platform to give you complete control over your workflow.
                            </Text>
                        </Box>
                    </FadeInSection>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
                        {[
                            { icon: FaBolt, title: 'Lightning Fast', desc: 'Experience unparalleled speed with our optimized architecture that loads in milliseconds.', bg: 'indigo.50', color: 'indigo.600', delay: 0 },
                            { icon: FaShieldAlt, title: 'Bank-Grade Security', desc: 'Enterprise-level security with end-to-end encryption to keep your data protected.', bg: 'pink.50', color: 'pink.600', delay: 0.1 },
                            { icon: FaChartLine, title: 'Advanced Analytics', desc: 'Powerful insights and visualizations to help you make data-driven decisions.', bg: 'emerald.50', color: 'emerald.600', delay: 0.2 },
                            { icon: FaSync, title: 'Real-Time Sync', desc: 'All your data syncs across devices instantly, keeping everyone in your team updated.', bg: 'blue.50', color: 'blue.600', delay: 0.3 },
                            { icon: FaPaintBrush, title: 'Custom Branding', desc: 'Fully customize the platform with your brand colors, logo, and domain.', bg: 'purple.50', color: 'purple.600', delay: 0.4 },
                            { icon: FaHeadset, title: '24/7 Support', desc: 'Our expert team is always available to help you with any questions or issues.', bg: 'amber.50', color: 'amber.600', delay: 0.5 },
                        ].map((feature, index) => (
                            <FadeInSection key={index} animation="fade-in slide-up" delay={feature.delay}>
                                <Box
                                    bg="white"
                                    p={8}
                                    rounded="xl"
                                    border="1px"
                                    borderColor="gray.100"
                                    _hover={{ transform: 'translateY(-5px)', shadow: 'lg', borderColor: 'indigo.100' }}
                                    transition="all 0.3s"
                                >
                                    <Flex w={14} h={14} align="center" justify="center" bg={feature.bg} rounded="lg" color={feature.color} mb={6}>
                                        <Icon as={feature.icon} fontSize="2xl" />
                                    </Flex>
                                    <Heading as="h3" fontSize="xl" fontWeight="bold" mb={3}>{feature.title}</Heading>
                                    <Text color="gray.600">{feature.desc}</Text>
                                </Box>
                            </FadeInSection>
                        ))}
                    </Grid>
                    <FadeInSection animation="fade-in scale-up">
                        <Box textAlign="center" mt={16}>
                            <Button as={Link} href="#" variant="link" color="indigo.600" fontWeight="medium" _hover={{ color: 'indigo.800' }} display="flex" alignItems="center" mx="auto">
                                Explore all features <Icon as={FaArrowRight} ml={2} mt={1} />
                            </Button>
                        </Box>
                    </FadeInSection>
                </Box>
            </Box>

            {/* How It Works Section */}
            <Box as="section" id="how-it-works" py={20} px={6} bg="gray.50">
                <Box maxW="7xl" mx="auto">
                    <FadeInSection animation="fade-in scale-up">
                        <Box textAlign="center" mb={16}>
                            <Text as="span" display="inline-block" py={1} px={3} bg="indigo.100" color="indigo.600" rounded="full" fontSize="sm" fontWeight="medium" mb={3}>HOW IT WORKS</Text>
                            <Heading as="h2" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="extrabold" mb={4}>
                                Get Started in <Box as="span" bgGradient="linear(to-r, indigo.600, pink.500)" color={"darkblue"} bgClip="text">3 Simple Steps</Box>
                            </Heading>
                            <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                                Setting up Lumina is quick and easy. Get up and running in minutes, not days.
                            </Text>
                        </Box>
                    </FadeInSection>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
                        {[
                            { step: 1, title: 'Create Your Account', desc: 'Sign up with your email or social account in just 30 seconds.', bg: 'indigo.100', color: 'indigo.600', delay: 0 },
                            { step: 2, title: 'Setup Your Workspace', desc: 'Connect your tools and customize your dashboard in minutes.', bg: 'pink.100', color: 'pink.600', delay: 0.1 },
                            { step: 3, title: 'Start Being Productive', desc: 'Experience the power of streamlined workflows right away.', bg: 'emerald.100', color: 'emerald.600', delay: 0.2 },
                        ].map((step, index) => (
                            <FadeInSection key={index} animation="fade-in slide-up" delay={step.delay}>
                                <Box bg="white" p={8} rounded="xl" shadow="sm" _hover={{ shadow: 'md' }} transition="shadow 0.3s">
                                    <Flex w={16} h={16} align="center" justify="center" rounded="full" bg={step.bg} color={step.color} fontWeight="bold" fontSize="xl" mb={6}>
                                        {step.step}
                                    </Flex>
                                    <Heading as="h3" fontSize="xl" fontWeight="bold" mb={3}>{step.title}</Heading>
                                    <Text color="gray.600" mb={4}>{step.desc}</Text>
                                </Box>
                            </FadeInSection>
                        ))}
                    </Grid>
                    <FadeInSection animation="fade-in scale-up">
                        <Box textAlign="center" mt={16}>
                            <Button as={Link} href="#" bgGradient="linear(to-r, indigo.600, pink.500)" color="white" px={8} py={3} rounded="full" fontWeight="medium" _hover={{ shadow: 'lg' }} display="flex" alignItems="center" mx="auto">
                                Get Started Now <Icon as={FaArrowRight} ml={2} mt={1} />
                            </Button>
                        </Box>
                    </FadeInSection>
                </Box>
            </Box>

            {/* Testimonials Section */}
            <Box as="section" id="testimonials" py={20} px={6} bg="white">
                <Box maxW="7xl" mx="auto">
                    <FadeInSection animation="fade-in scale-up">
                        <Box textAlign="center" mb={16}>
                            <Text as="span" display="inline-block" py={1} px={3} bg="indigo.100" color="indigo.600" rounded="full" fontSize="sm" fontWeight="medium" mb={3}>TESTIMONIALS</Text>
                            <Heading as="h2" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="extrabold" mb={4}>
                                What Our <Box as="span" bgGradient="linear(to-r, indigo.600, pink.500)" bgClip="text">Customers Say</Box>
                            </Heading>
                            <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                                Don't just take our word for it. Here's what our users have to say about their experience.
                            </Text>
                        </Box>
                    </FadeInSection>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
                        {[
                            { img: 'https://randomuser.me/api/portraits/women/32.jpg', name: 'Sarah Johnson', title: 'CEO, TechSolutions', quote: 'Lumina has completely transformed how our team collaborates. Our productivity has increased by over 60% since we started using it.', stars: 5, delay: 0 },
                            { img: 'https://randomuser.me/api/portraits/men/44.jpg', name: 'Michael Chen', title: 'Marketing Director', quote: 'The analytics dashboard alone is worth the price. We\'ve uncovered growth opportunities we never knew existed.', stars: 5, delay: 0.1 },
                            { img: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Emma Rodriguez', title: 'Product Manager', quote: 'I love how intuitive the interface is. Our team was up and running with no training needed.', stars: 4.5, delay: 0.2 },
                        ].map((testimonial, index) => (
                            <FadeInSection key={index} animation="fade-in slide-up" delay={testimonial.delay}>
                                <Box bg="white" p={8} rounded="xl" shadow="md">
                                    <Flex align="center" mb={6}>
                                        <Avatar src={testimonial.img} size="md" mr={4} />
                                        <Box>
                                            <Text fontWeight="bold">{testimonial.name}</Text>
                                            <Text fontSize="sm" color="gray.500">{testimonial.title}</Text>
                                        </Box>
                                    </Flex>
                                    <Text color="gray.600" mb={6}>{testimonial.quote}</Text>
                                    <HStack color="yellow.400">
                                        {Array.from({ length: Math.floor(testimonial.stars) }, (_, i) => <Icon key={i} as={FaStar} />)}
                                        {testimonial.stars % 1 !== 0 && <Icon as={FaStarHalfAlt} />}
                                    </HStack>
                                </Box>
                            </FadeInSection>
                        ))}
                    </Grid>
                </Box>
            </Box>

            {/* Pricing Section */}
            <Box as="section" id="pricing" py={20} px={6} bg="indigo.50">
                <Box maxW="7xl" mx="auto">
                    <FadeInSection animation="fade-in scale-up">
                        <Box textAlign="center" mb={16}>
                            <Text as="span" display="inline-block" py={1} px={3} bg="indigo.100" color="indigo.600" rounded="full" fontSize="sm" fontWeight="medium" mb={3}>PRICING</Text>
                            <Heading as="h2" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="extrabold" mb={4}>
                                Simple, <Box as="span" bgGradient="linear(to-r, indigo.600, pink.500)" bgClip="text">Transparent Pricing</Box>
                            </Heading>
                            <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                                Choose the plan that fits your needs. No hidden fees, cancel anytime.
                            </Text>
                        </Box>
                    </FadeInSection>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8} maxW="5xl" mx="auto">
                        {[
                            {
                                name: 'Basic',
                                desc: 'Perfect for individuals getting started',
                                price: 9,
                                features: ['Up to 3 users', 'Basic analytics', 'Email support'],
                                popular: false,
                                delay: 0,
                            },
                            {
                                name: 'Pro',
                                desc: 'For teams and growing businesses',
                                price: 29,
                                features: ['Up to 10 users', 'Advanced analytics', 'Priority support', 'API access'],
                                popular: true,
                                delay: 0.1,
                            },
                            {
                                name: 'Enterprise',
                                desc: 'For large organizations',
                                price: 99,
                                features: ['Unlimited users', 'Premium analytics', '24/7 dedicated support', 'Custom integrations', 'White-label options'],
                                popular: false,
                                delay: 0.2,
                            },
                        ].map((plan, index) => (
                            <FadeInSection key={index} animation="fade-in slide-up" delay={plan.delay}>
                                <Box
                                    bg="white"
                                    p={8}
                                    rounded="xl"
                                    shadow={plan.popular ? 'lg' : 'sm'}
                                    borderWidth={4}
                                    borderColor={plan.popular ? 'indigo.100' : 'transparent'}
                                    _hover={{ borderColor: 'indigo.100' }}
                                    transition="all 0.3s"
                                    position="relative"
                                >
                                    {plan.popular && (
                                        <Box position="absolute" top={0} right={0} bg="indigo.600" color="white" px={3} py={1} roundedBottomLeft="lg" roundedTopRight="lg" fontSize="xs" fontWeight="bold">
                                            POPULAR
                                        </Box>
                                    )}
                                    <Box mb={6}>
                                        <Heading as="h3" fontSize="xl" fontWeight="bold" mb={2}>{plan.name}</Heading>
                                        <Text color="gray.600">{plan.desc}</Text>
                                    </Box>
                                    <Box mb={8}>
                                        <Text as="span" fontSize="4xl" fontWeight="bold">${plan.price}</Text>
                                        <Text as="span" color="gray.500">/month</Text>
                                    </Box>
                                    <VStack align="start" spacing={3} mb={8}>
                                        {plan.features.map((feature, i) => (
                                            <Flex key={i} align="center" color="gray.600">
                                                <Icon as={FaCheck} color="emerald.500" mr={2} />
                                                <Text>{feature}</Text>
                                            </Flex>
                                        ))}
                                    </VStack>
                                    <Button
                                        as={Link}
                                        href="#"
                                        w="full"
                                        py={3}
                                        px={4}
                                        bg={plan.popular ? 'linear(to-r, indigo.600, pink.500)' : 'gray.100'}
                                        color={plan.popular ? 'white' : 'gray.800'}
                                        fontWeight="medium"
                                        rounded="lg"
                                        _hover={plan.popular ? { shadow: 'lg' } : { bg: 'gray.200' }}
                                    >
                                        Get Started
                                    </Button>
                                </Box>
                            </FadeInSection>
                        ))}
                    </Grid>
                    <FadeInSection animation="fade-in scale-up">
                        <Box textAlign="center" mt={12}>
                            <Text color="gray.600" mb={6}>Need something custom? We've got you covered.</Text>
                            <Button as={Link} href="#" variant="link" color="indigo.600" fontWeight="medium" _hover={{ color: 'indigo.800' }} display="flex" alignItems="center" mx="auto">
                                Contact our sales team <Icon as={FaArrowRight} ml={2} mt={1} />
                            </Button>
                        </Box>
                    </FadeInSection>
                </Box>
            </Box>

            {/* CTA Section
            <Box as="section" py={20} px={6} bgGradient="linear(to-r, indigo.600, pink.500)" color="white">
                <FadeInSection animation="fade-in scale-up">
                    <Box maxW="4xl" mx="auto" textAlign="center">
                        <Heading as="h2" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="extrabold" mb={6}>Ready to Transform Your Workflow?</Heading>
                        <Text fontSize="xl" color="indigo.100" mb={10} maxW="2xl" mx="auto">
                            Join thousands of businesses that are already working smarter with Lumina.
                        </Text>
                        <Flex flexDir={{ base: 'column', sm: 'row' }} gap={4} justify="center">
                            <Button as={Link} href="#" bg="white" color="indigo.600" px={8} py={4} rounded="full" fontWeight="bold" _hover={{ bg: 'gray.100' }} transition="all 0.3s">
                                Start Free Trial
                            </Button>
                            <Button as={Link} href="#" bg="transparent" border="2px" borderColor="white" px={8} py={4} rounded="full" fontWeight="bold" _hover={{ bg: 'whiteAlpha.100' }} transition="all 0.3s">
                                Schedule Demo
                            </Button>
                        </Flex>
                    </Box>
                </FadeInSection>
            </Box> */}

            {/* FAQ Section */}
            <Box as="section" py={20} px={6} bg="white">
                <Box maxW="4xl" mx="auto">
                    <FadeInSection animation="fade-in">
                        <Heading as="h2" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="extrabold" mb={12} textAlign="center">
                            Frequently Asked <Box as="span" bgGradient="linear(to-r, indigo.600, pink.500)" bgClip="text">Questions</Box>
                        </Heading>
                        <Accordion allowToggle>
                            {[
                                {
                                    question: 'How secure is Lumina?',
                                    answer: 'Lumina employs bank-grade security measures including end-to-end encryption, two-factor authentication, and regular security audits. We follow industry best practices to ensure your data is always protected.',
                                },
                                {
                                    question: 'Can I cancel anytime?',
                                    answer: 'Absolutely! There are no long-term contracts. You can cancel your subscription anytime from your account settings with just a few clicks. We\'ll even help you export your data if you\'d like to take it elsewhere.',
                                },
                                {
                                    question: 'What integrations do you support?',
                                    answer: 'Lumina integrates with all major platforms including Google Workspace, Microsoft 365, Slack, Salesforce, Zapier, and hundreds more through our API. Our integrations are constantly expanding based on customer needs.',
                                },
                                {
                                    question: 'Is there a mobile app?',
                                    answer: 'Yes! Lumina has fully-featured iOS and Android apps that are available for download on their respective app stores. All your data syncs seamlessly between devices.',
                                },
                            ].map((faq, index) => (
                                <AccordionItem key={index} border="1px" borderColor="gray.200" rounded="lg" overflow="hidden" mb={4}>
                                    <AccordionButton px={6} py={6} _hover={{ bg: 'gray.50' }} transition="background 0.3s">
                                        <Box flex="1" textAlign="left" fontSize="lg" fontWeight="medium">{faq.question}</Box>
                                        <AccordionIcon color="indigo.600" />
                                    </AccordionButton>
                                    <AccordionPanel px={6} pb={6} color="gray.600">
                                        {faq.answer}
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        <Box textAlign="center" mt={10}>
                            <Text color="gray.600" mb={4}>Still have questions?</Text>
                            <Button as={Link} href="#" variant="link" color="indigo.600" fontWeight="medium" _hover={{ color: 'indigo.800' }} display="flex" alignItems="center" mx="auto">
                                Contact our support team <Icon as={FaArrowRight} ml={2} mt={1} />
                            </Button>
                        </Box>
                    </FadeInSection>
                </Box>
            </Box>

        </Box>
    );
};

export default HomePage;