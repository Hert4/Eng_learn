import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Image,
    Text,
    useColorMode,
    Grid,
    GridItem,
    Card,
    Divider,
    CardBody,
    CardFooter,
    ButtonGroup,
    CardHeader,
    Avatar,
    Img,
    IconButton,
    useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { GitHubIcon, XIcon, LinkedInIcon } from "@chakra-ui/icons";

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

                    <Flex

                        zIndex={'100'}
                        right={20}
                        w={'750px'}
                        top={15}
                        h={'500px'}
                        pos="absolute"
                        gap={2}

                    >
                        <Card
                            position="absolute"
                            right={20}
                            top={14}
                            w="80"
                            flex="flex-col"
                            justifyContent="center"
                            alignItems="center"
                            dropShadow="xl"
                            shadow="black/10 dark:shadow-white/10"
                            justify='center'

                        >
                            <CardHeader mt={8}>
                                <Img
                                    src="https://i.pravatar.cc/150?img=58"
                                    alt="user avatar"
                                    position="absolute"
                                    top="-12"
                                    rounded="full"
                                    w="24"
                                    h="24"
                                    objectFit="cover"
                                    right={15}
                                />
                                <Heading textAlign="center">Nguyen Khanh</Heading>
                                <Text fontWeight="normal" color="primary">
                                    {/* Add description here */}
                                </Text>
                            </CardHeader>
                            <CardBody textAlign="center" pb={2}>
                                <Text>
                                    I really enjoy transforming ideas into functional software that
                                    exceeds expectations
                                </Text>
                            </CardBody>
                            {/* <CardFooter>
                                <Box display="flex" justifyContent="space-around">
                                    <Link href="" isExternal rel="noreferrer noopener" _hover={{ color: 'gray.500' }}>
                                        <IconButton icon={<GitHubIcon />} aria-label="Github icon" size="sm" />
                                    </Link>
                                    <Link href="" isExternal rel="noreferrer noopener" _hover={{ color: 'gray.500' }}>
                                        <IconButton icon={<XIcon />} aria-label="X icon" size="sm" />
                                    </Link>
                                    <Link href="" isExternal rel="noreferrer noopener" _hover={{ color: 'gray.500' }}>
                                        <IconButton icon={<LinkedInIcon />} aria-label="Linkedin icon" size="sm" />
                                    </Link>
                                </Box>
                            </CardFooter> */}
                        </Card>


                    </Flex>
                </Box>

            </Box >
        </>
    )
}

export default Page

