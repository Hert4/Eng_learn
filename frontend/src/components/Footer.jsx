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
            <VStack maxW="7xl" mx="auto" >
                <Grid
                    templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
                    gap={{ base: 50, md: 400 }}
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
                            Facebook
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Youtube
                        </Link>
                    </VStack>

                    <VStack align="start">
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                            Company
                        </Text>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            About
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Facebook
                        </Link>
                        <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                            Youtube
                        </Link>
                    </VStack>

                </Grid>

                <Box borderTop="1px" borderColor="gray.800" pt={8} >
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align="center"
                        gap={{ base: 50, md: 200 }}
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
                                S/W Automation P
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
                    © Landing page made by S/W Automation P.
                </Text>
            </VStack>
        </Box>
    );
};

export default Footer;
