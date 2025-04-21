import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Link,
    IconButton,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerBody,
    VStack,
    Button,
    useColorMode,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionLink = motion(Link);
const MotionButton = motion(Button);

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [activeSection, setActiveSection] = useState('Home');
    const { colorMode, toggleColorMode } = useColorMode();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);



    // Scroll handler for dynamic header background
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle link click to set active section
    const handleLinkClick = (section) => {
        setActiveSection(section);
        closeMenu();
    };

    const navItems = [
        { label: 'Home', href: '#' },
        { label: 'Exercise', href: '#exercise' },
        { label: 'Test', href: '#test' },
        { label: 'FQA', href: '#fqa' },
    ];

    return (
        <MotionBox
            as="nav"
            position="fixed"
            w="full"
            bg={scrollY > 50 ? (colorMode === 'light' ? 'whiteAlpha.900' : 'gray.800') : 'linear-gradient(90deg, rgba(49, 130, 206, 0.1), rgba(255, 255, 255, 0.2))'}
            backdropFilter="blur(12px)"
            zIndex="50"
            shadow={scrollY > 50 ? 'md' : 'none'}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <Flex maxW="7xl" mx="auto" px={{ base: 4, md: 6 }} py={4} align="center" justify="space-between">
                {/* Logo */}
                <MotionLink
                    href="/"
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="bold"
                    color={colorMode === 'light' ? '#3182ce' : 'white'}
                    _hover={{ color: '#2563eb' }}
                    display="flex"
                    alignItems="center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    whileHover={{ scale: 1.05 }}
                >
                    Opic
                </MotionLink>

                {/* Desktop Menu */}
                <Flex
                    display={{ base: 'none', md: 'flex' }}
                    align="center"
                    gap={2}
                    px={3}
                    py={1}
                    bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                    rounded="full"
                    boxShadow="sm"
                    overflowX="auto"
                    className="hide-scrollbar" // custom CSS nếu muốn ẩn scrollbar
                >
                    {navItems.map(({ label, href }) => (
                        <MotionLink
                            key={label}
                            href={href}
                            fontSize="md"
                            fontWeight="semibold"
                            whiteSpace="nowrap"
                            px={6}
                            py={2.5}
                            rounded="full"
                            bg={activeSection === label ? '#3182ce' : 'transparent'}
                            color={activeSection === label ? 'white' : colorMode === 'light' ? 'gray.700' : 'gray.200'}
                            _hover={{
                                bg: activeSection === label ? '#2563eb' : colorMode === 'light' ? 'gray.200' : 'gray.600',
                                color: activeSection === label ? 'white' : '#3182ce',
                            }}
                            onClick={() => handleLinkClick(label)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                        >
                            {label}
                        </MotionLink>
                    ))}
                </Flex>


                {/* Desktop Auth Buttons */}
                <Flex display={{ base: 'none', md: 'flex' }} align="center" gap={4}>
                    <MotionButton
                        onClick={toggleColorMode}
                        variant="ghost"
                        fontSize="sm"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {colorMode === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </MotionButton>
                    <MotionLink
                        href="/auth"
                        px={4}
                        py={2}
                        fontSize="sm"
                        fontWeight="medium"
                        color={colorMode === 'light' ? '#3182ce' : 'white'}
                        _hover={{ color: '#2563eb' }}
                        whileHover={{ scale: 1.1 }}
                    >
                        Login
                    </MotionLink>
                    <MotionButton
                        as={Link}
                        href="#"
                        bg="#3182ce"
                        color="white"
                        px={6}
                        py={2}
                        rounded="full"
                        fontSize="sm"
                        _hover={{ bg: '#2563eb' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started
                    </MotionButton>
                </Flex>

                {/* Mobile Menu Button */}
                <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    icon={<HamburgerIcon fontSize="2xl" />}
                    aria-label="Open Menu"
                    onClick={toggleMenu}
                    variant="ghost"
                    color={colorMode === 'light' ? '#3182ce' : 'white'}
                />

                {/* Mobile Drawer */}
                <Drawer isOpen={isOpen} placement="right" onClose={closeMenu}>
                    <DrawerOverlay />
                    <DrawerContent
                        motionProps={{
                            initial: { x: '100%' },
                            animate: { x: 0 },
                            exit: { x: '100%' },
                            transition: { duration: 0.3, ease: 'easeInOut' },
                        }}
                    >
                        <DrawerCloseButton color="#3182ce" />
                        <DrawerBody display="flex" flexDir="column" alignItems="center" justifyContent="center" p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'}>
                            <VStack spacing={6} textAlign="center" w="full">
                                {['features', 'how-it-works', 'pricing', 'testimonials'].map((section) => (
                                    <MotionLink
                                        key={section}
                                        href={`#${section}`}
                                        fontSize="xl"
                                        fontWeight="medium"
                                        color={activeSection === section ? '#3182ce' : colorMode === 'light' ? 'gray.800' : 'white'}
                                        bg={activeSection === section ? '#3182ce10' : 'transparent'}
                                        px={4}
                                        py={2}
                                        rounded="lg"
                                        _hover={{ color: '#3182ce', bg: '#3182ce10' }}
                                        onClick={() => handleLinkClick(section)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        w="full"
                                        aria-current={activeSection === section ? 'page' : undefined}
                                    >
                                        {section.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')}
                                    </MotionLink>
                                ))}
                                <VStack spacing={4} w="full" maxW="xs" pt={8}>
                                    <MotionButton
                                        as={Link}
                                        href="#"
                                        w="full"
                                        bg="#3182ce"
                                        color="white"
                                        px={6}
                                        py={3}
                                        rounded="full"
                                        fontWeight="medium"
                                        _hover={{ bg: '#2563eb' }}
                                        onClick={closeMenu}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Get Started
                                    </MotionButton>
                                    <MotionButton
                                        as={Link}
                                        href="#"
                                        w="full"
                                        color="#3182ce"
                                        px={6}
                                        py={3}
                                        rounded="full"
                                        fontWeight="medium"
                                        _hover={{ bg: '#3182ce10' }}
                                        variant="outline"
                                        onClick={closeMenu}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Login
                                    </MotionButton>
                                </VStack>
                            </VStack>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </Flex>
        </MotionBox>
    );
};

export default Header;
