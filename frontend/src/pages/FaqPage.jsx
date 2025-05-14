import React from 'react';
import { Box, Text, VStack, HStack, IconButton, Link, useColorMode, Image } from '@chakra-ui/react';
import { FaTwitter, FaInfoCircle, FaLink, FaFolder, FaQuestionCircle, FaEnvelope } from 'react-icons/fa';
import { SiKofi, SiZalo } from "react-icons/si";
import { motion } from "framer-motion";

// Framer Motion components
const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

const FaqPage = () => {
    const { colorMode } = useColorMode();

    return (
        <Box
            minH="100vh"
            // bgGradient="linear(to-b, gray.900, blue.900)"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            px={[2, 4, 6]}
        // bg={'red'}
        >
            {/* Main card with iOS-style rounded corners and shadow */}
            <MotionBox
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                borderRadius={["2xl", "3xl"]} // Smaller radius on mobile
                p={[4, 6, 8]} // Responsive padding
                maxW={["100%", "90%", "2xl"]} // Full width on mobile, 90% on tablet, 2xl on desktop
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
                <VStack spacing={[2, 3, 4]}> {/* Responsive spacing */}
                    <Text
                        fontSize={["2xl", "3xl", "4xl"]} // Responsive font size
                        fontWeight="bold"
                        color={colorMode === 'light' ? 'gray.800' : 'white'}
                    >
                        Hello World!
                    </Text>
                    <Image src='./public/images/please.webp'
                        h={'240px'}
                        borderRadius={'xl'}
                        loading="eager"
                        decoding="sync" />
                    <Text
                        fontSize={["sm", "md", "lg"]} // Responsive font size
                        color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                        px={[2, 0]} // Add padding on mobile for better text wrapping
                    >
                        Contact if you have any questions or need help with our website.
                    </Text>
                    {/* Navigation icons */}
                    <HStack
                        spacing={[2, 3, 4]} // Responsive spacing
                        mt={[4, 5, 6]} // Responsive margin-top
                        wrap="wrap" // Allow icons to wrap on small screens
                        justify="center"
                    >
                        <MotionIconButton
                            icon={<FaInfoCircle />}
                            aria-label="About"
                            variant="ghost"
                            size="lg"
                            width={["50px", "60px", "80px"]} // Responsive button size
                            height={["50px", "60px", "80px"]}
                            fontSize={["20px", "30px", "40px"]} // Responsive icon size
                            borderRadius="full"
                            _hover={{ bg: 'blue.500', color: 'white' }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        />
                        <MotionIconButton
                            icon={<FaLink />}
                            aria-label="Links"
                            variant="ghost"
                            size="lg"
                            width={["50px", "60px", "80px"]}
                            height={["50px", "60px", "80px"]}
                            fontSize={["20px", "30px", "40px"]}
                            borderRadius="full"
                            _hover={{ bg: 'blue.500', color: 'white' }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        <MotionIconButton
                            icon={<FaFolder />}
                            aria-label="Work`Work"
                            variant="ghost"
                            size="lg"
                            width={["50px", "60px", "80px"]}
                            height={["50px", "60px", "80px"]}
                            fontSize={["20px", "30px", "40px"]}
                            borderRadius="full"
                            _hover={{ bg: 'blue.500', color: 'white' }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        />
                        <MotionIconButton
                            icon={<FaQuestionCircle />}
                            aria-label="FAQ"
                            variant="ghost"
                            size="lg"
                            width={["50px", "60px", "80px"]}
                            height={["50px", "60px", "80px"]}
                            fontSize={["20px", "30px", "40px"]}
                            borderRadius="full"
                            _hover={{ bg: 'blue.500', color: 'white' }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        />
                        <MotionIconButton
                            icon={<FaEnvelope />}
                            aria-label="Contact"
                            variant="ghost"
                            size="lg"
                            width={["50px", "60px", "80px"]}
                            height={["50px", "60px", "80px"]}
                            fontSize={["20px", "30px", "40px"]}
                            borderRadius="full"
                            _hover={{ bg: 'blue.500', color: 'white' }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        />
                    </HStack>
                </VStack>
            </MotionBox>

            {/* Footer with social icons */}
            <Box
                position={["relative", "absolute"]} // Relative on mobile to avoid overlap
                bottom={[0, 4]} // No bottom offset on mobile
                mt={[4, 0]} // Margin-top on mobile for spacing
                w="full"
                textAlign="center"
            >
                <HStack
                    spacing={[2, 3, 4]} // Responsive spacing
                    justify="center"
                    wrap="wrap" // Allow wrapping on small screens
                >
                    <Link href="https://twitter.com" isExternal>
                        <MotionIconButton
                            icon={<FaTwitter />}
                            aria-label="Twitter"
                            variant="ghost"
                            width={["40px", "50px", "60px"]} // Responsive button size
                            height={["40px", "50px", "60px"]}
                            fontSize={["20px", "25px", "30px"]} // Responsive icon size
                            color={colorMode === 'light' ? 'gray.600' : 'white'}
                            _hover={{ color: 'blue.500' }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        />
                    </Link>
                    <Link href="https://zalo.me" isExternal>
                        <MotionIconButton
                            icon={<SiZalo />}
                            aria-label="Zalo"
                            variant="ghost"
                            width={["40px", "50px", "60px"]}
                            height={["40px", "50px", "60px"]}
                            fontSize={["20px", "25px", "30px"]}
                            color={colorMode === 'light' ? 'gray.600' : 'white'}
                            _hover={{ color: 'blue.500' }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        />
                    </Link>
                    <Link href="https://ko-fi.com" isExternal>
                        <MotionIconButton
                            icon={<SiKofi />}
                            aria-label="Ko-fi"
                            variant="ghost"
                            width={["40px", "50px", "60px"]}
                            height={["40px", "50px", "60px"]}
                            fontSize={["20px", "25px", "30px"]}
                            color={colorMode === 'light' ? 'gray.600' : 'white'}
                            _hover={{ color: 'pink.500' }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        />
                    </Link>
                </HStack>
                <Text
                    fontSize={["xs", "sm"]} // Responsive font size
                    mt={[2, 3]} // Responsive margin-top
                    color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                >
                    © 2025 Automation SW - G
                </Text>
            </Box>
        </Box >
    );
};

export default FaqPage;