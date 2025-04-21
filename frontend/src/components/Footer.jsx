import React from 'react';
import {
    Box,
    Grid,
    Link,
    Text,
    VStack,
    HStack,
    Icon,
    Flex,
} from '@chakra-ui/react';
import {
    FaTwitter,
    FaFacebook,
    FaLinkedin,
    FaGithub,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const Footer = () => {
    return (
        <Box as="footer" bg="gray.900" color="white" pt={16} pb={8} px={6}>
            <Box maxW="7xl" mx="auto">
                <Grid
                    templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
                    gap={8}
                    mb={12}
                >
                    {/* Company */}
                    <VStack align="start">
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                            Company
                        </Text>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            About
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Careers
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Blog
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Press
                        </Link>
                    </VStack>

                    {/* Product */}
                    <VStack align="start">
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                            Product
                        </Text>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Features
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Pricing
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Integrations
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Roadmap
                        </Link>
                    </VStack>

                    {/* Resources */}
                    <VStack align="start">
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                            Resources
                        </Text>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Help Center
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Community
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Webinars
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            API Docs
                        </Link>
                    </VStack>

                    {/* Legal */}
                    <VStack align="start">
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                            Legal
                        </Text>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Privacy
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Terms
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Security
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            GDPR
                        </Link>
                    </VStack>
                </Grid>

                <Box borderTop="1px" borderColor="gray.800" pt={8}>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align="center"
                    >
                        <VStack align={{ base: 'center', md: 'start' }} mb={{ base: 4, md: 0 }}>
                            <Link
                                href="#"
                                fontSize="2xl"
                                fontWeight="bold"
                                color="white"
                                _hover={{ color: 'indigo.400' }}
                                display="flex"
                                alignItems="center"
                            >
                                <HiSparkles color="gold" style={{ marginRight: '4px' }} />
                                Lumina
                            </Link>
                            <Text fontSize="sm" color="gray.500">
                                Solving complex problems with simple solutions.
                            </Text>
                        </VStack>

                        <HStack spacing={6}>
                            <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                                <Icon as={FaTwitter} fontSize="xl" />
                            </Link>
                            <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                                <Icon as={FaFacebook} fontSize="xl" />
                            </Link>
                            <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                                <Icon as={FaLinkedin} fontSize="xl" />
                            </Link>
                            <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                                <Icon as={FaGithub} fontSize="xl" />
                            </Link>
                        </HStack>
                    </Flex>
                </Box>

                <Text mt={8} textAlign="center" fontSize="sm" color="gray.500">
                    © 2023 Lumina, Inc. All rights reserved.
                </Text>
            </Box>
        </Box>
    );
};

export default Footer;
