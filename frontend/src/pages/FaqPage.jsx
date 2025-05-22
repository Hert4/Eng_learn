import React, { useEffect, useRef } from 'react';
import { Box, Text, VStack, HStack, IconButton, Link, useColorMode, Image } from '@chakra-ui/react';
import { FaTwitter, FaInfoCircle, FaLink, FaFolder, FaQuestionCircle, FaEnvelope } from 'react-icons/fa';
import { SiKofi, SiZalo } from "react-icons/si";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import MobileNav from '../components/mobileNav';
import KeyboardHero from '../components/KeyboardHero';
// Register GSAP plugins
gsap.registerPlugin(InertiaPlugin);

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

const FaqPage = () => {
    const { colorMode } = useColorMode();
    const rootRef = useRef(null);
    const iconRefs = useRef([]);

    // Mouse movement variables
    const mouseData = useRef({
        oldX: 0,
        oldY: 0,
        deltaX: 0,
        deltaY: 0
    });

    useEffect(() => {
        if (!rootRef.current || !iconRefs.current.length) return;

        const root = rootRef.current;

        const handleMouseMove = (e) => {
            // Calculate horizontal movement since the last mouse position
            mouseData.current.deltaX = e.clientX - mouseData.current.oldX;
            // Calculate vertical movement since the last mouse position
            mouseData.current.deltaY = e.clientY - mouseData.current.oldY;
            // Update old coordinates with the current mouse position
            mouseData.current.oldX = e.clientX;
            mouseData.current.oldY = e.clientY;
        };

        // Function to apply animation to an icon
        const applyIconAnimation = (icon) => {
            const tl = gsap.timeline({
                onComplete: () => {
                    tl.kill();
                }
            });
            tl.timeScale(1.2);

            tl.to(icon, {
                inertia: {
                    x: {
                        velocity: mouseData.current.deltaX * 30,
                        end: 0
                    },
                    y: {
                        velocity: mouseData.current.deltaY * 30,
                        end: 0
                    },
                },
            });

            tl.fromTo(icon, {
                rotate: 0
            }, {
                duration: 0.4,
                rotate: (Math.random() - 0.5) * 30,
                yoyo: true,
                repeat: 1,
                ease: 'power1.inOut'
            }, '<');
        };

        // Add mouse enter event to each icon
        iconRefs.current.forEach(icon => {
            if (icon) {
                icon.addEventListener("mouseenter", () => applyIconAnimation(icon));
            }
        });

        root.addEventListener("mousemove", handleMouseMove);

        return () => {
            root.removeEventListener("mousemove", handleMouseMove);
            iconRefs.current.forEach(icon => {
                if (icon) {
                    icon.removeEventListener("mouseenter", () => applyIconAnimation(icon));
                }
            });
        };
    }, []);

    // Function to add ref to iconRefs array
    const addToIconRefs = (el, index) => {
        iconRefs.current[index] = el;
    };

    return (
        <Box
            ref={rootRef}
            minH="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            px={[2, 4, 6]}
            position="relative"
            overflow="hidden"
        >
            <MobileNav />


            {/* Main card with iOS-style rounded corners and shadow */}
            <MotionBox
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                borderRadius={["2xl", "3xl"]}
                p={[4, 6, 8]}
                maxW={["100%", "90%", "2xl"]}
                w="full"
                boxShadow="xl"
                textAlign="center"
                border="1px solid"
                borderColor="gray.200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Title and description */}
                <VStack spacing={[2, 3, 4]}>
                    <Text
                        fontSize={["2xl", "3xl", "4xl"]}
                        fontWeight="bold"
                        color={colorMode === 'light' ? 'gray.800' : 'white'}
                    >
                        Hello World!
                    </Text>
                    <Image
                        src='./public/images/please.webp'
                        h={'240px'}
                        borderRadius={'xl'}
                        loading="eager"
                        decoding="sync"
                    />
                    <Text
                        fontSize={["sm", "md", "lg"]}
                        color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                        px={[2, 0]}
                    >
                        Contact if you have any questions or need help with our website.
                    </Text>

                    {/* Navigation icons */}
                    <HStack
                        spacing={[2, 3, 4]}
                        mt={[4, 5, 6]}
                        wrap="wrap"
                        justify="center"
                    >
                        {[FaInfoCircle, FaLink, FaFolder, FaQuestionCircle, FaEnvelope].map((Icon, index) => (
                            <MotionIconButton
                                key={index}
                                ref={el => addToIconRefs(el, index)}
                                icon={<Icon />}
                                aria-label={Icon.name}
                                variant="ghost"
                                size="lg"
                                width={["50px", "60px", "80px"]}
                                height={["50px", "60px", "80px"]}
                                fontSize={["20px", "30px", "40px"]}
                                borderRadius="full"
                                _hover={{ bg: 'blue.500', color: 'white' }}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                                willChange="transform"
                                cursor="pointer"
                            />
                        ))}
                    </HStack>
                </VStack>
            </MotionBox>

            {/* Footer with social icons */}
            <Box
                position={["relative", "absolute"]}
                bottom={[0, 4]}
                w="full"
                textAlign="center"
            >
                <HStack
                    spacing={[2, 3, 4]}
                    justify="center"
                    wrap="wrap"
                >
                    {[
                        { icon: FaTwitter, label: "Twitter", color: "blue.500", href: "https://twitter.com" },
                        { icon: SiZalo, label: "Zalo", color: "blue.500", href: "https://zalo.me" },
                        { icon: SiKofi, label: "Ko-fi", color: "pink.500", href: "https://ko-fi.com" }
                    ].map((item, index) => (
                        <Link key={index} href={item.href} isExternal>
                            <MotionIconButton
                                icon={<item.icon />}
                                aria-label={item.label}
                                variant="ghost"
                                width={["40px", "50px", "60px"]}
                                height={["40px", "50px", "60px"]}
                                fontSize={["20px", "25px", "30px"]}
                                color={colorMode === 'light' ? 'gray.600' : 'white'}
                                _hover={{ color: item.color }}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                            />
                        </Link>
                    ))}
                </HStack>

                <Text
                    fontSize={["xs", "sm"]}
                    mt={[2, 3]}
                    color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                >
                    © 2025 Automation SW - G
                </Text>
            </Box>
        </Box>
    );
};

export default FaqPage;