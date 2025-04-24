import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    IconButton,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerBody,
    VStack,
    Link,
    Button,
    useColorMode,
    Text,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTwitter, FaYoutube, FaInstagram, FaDiscord } from 'react-icons/fa';
import { SiBuymeacoffee, SiBluesky } from 'react-icons/si';
import { MdPrint, MdStore } from 'react-icons/md';
import LinksPopup from './Popup/LinksPopup.jsx';
import NotificationPopup from './Popup/NoficationPopup.jsx';
import { useSetRecoilState } from 'recoil';
import userAtom from '../atom/userAtom.js';
import { HiOutlineLogout } from "react-icons/hi";
import useShowToast from '../hooks/showToast.js';
import { Moon, Sun, UserCircle, Menu } from 'lucide-react';

const MotionBox = motion(Box);
const MotionLink = motion(Link);
const MotionButton = motion(Button);

const Header = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLinksOpen, setIsLinksOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [activeSection, setActiveSection] = useState('Home');
    const { colorMode, toggleColorMode } = useColorMode();

    const showToast = useShowToast()
    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);
    const closeLinks = () => setIsLinksOpen(false);

    const setUser = useSetRecoilState(userAtom)
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLinkClick = (section) => {
        setActiveSection(section);
        closeMenu();
    };

    const navItems = [
        { label: 'Home', href: '#' },
        { label: 'Exercise', href: '#exercise' },
        { label: 'Test', href: '#test' },
        { label: 'FAQ', href: '#faq' },
    ];

    const handleOpenLinks = () => {
        closeMenu();
        setIsLinksOpen(true);
    };

    const handleLogout = async () => {
        try {
            const res = await fetch('api/users/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (data.error) {
                console.log(data.error);
                return
            }

            localStorage.removeItem('user');
            setUser(null);
            showToast('Logout successful', 'You have been logged out successfully.', 'success')
        } catch (error) {
            console.log(error.message);
        }
    }

    // iOS color palette
    const iosColors = {
        light: {
            primary: '#007AFF',
            secondary: '#34C759',
            background: 'rgba(242, 242, 247, 0.8)',
            text: '#1C1C1E',
            navbar: 'rgba(249, 249, 249, 0.8)',
            button: '#007AFF',
            buttonText: 'white',
        },
        dark: {
            primary: '#0A84FF',
            secondary: '#30D158',
            background: 'rgba(28, 28, 30, 0.8)',
            text: '#FFFFFF',
            navbar: 'rgba(36, 36, 38, 0.8)',
            button: '#0A84FF',
            buttonText: 'white',
        }
    };

    const currentColors = iosColors[colorMode];

    return (
        <>
            <MotionBox
                as="nav"
                position="fixed"
                w="full"
                bg={scrollY > 50
                    ? (colorMode === 'light' ? 'rgba(249, 249, 249, 0.8)' : 'rgba(36, 36, 38, 0.8)')
                    : 'transparent'}
                backdropFilter="blur(20px)"
                zIndex="50"
                borderBottom={scrollY > 50 ? `1px solid ${colorMode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}` : 'none'}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{
                    type: 'spring',
                    damping: 20,
                    stiffness: 200
                }}
            >
                <Flex
                    maxW="7xl"
                    mx="auto"
                    px={{ base: 4, md: 6 }}
                    py={3}
                    align="center"
                    justify="space-between"
                >
                    {/* Logo with iOS-style typography */}
                    <MotionLink
                        as={Link}
                        href="/"
                        fontSize={{ base: 'xl', md: '2xl' }}
                        fontWeight="600"
                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                        color={currentColors.primary}
                        _hover={{ color: currentColors.primary, opacity: 0.8 }}
                        display="flex"
                        alignItems="center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Opic
                    </MotionLink>

                    {/* Desktop nav links - iOS-style segmented control */}
                    <Flex
                        display={{ base: 'none', md: 'flex' }}
                        align="center"
                        gap={1}
                        px={1}
                        py={1}
                        bg={colorMode === 'light' ? 'rgba(229, 229, 234, 0.5)' : 'rgba(44, 44, 46, 0.5)'}
                        rounded="xl"
                        boxShadow={colorMode === 'light' ? 'sm' : 'none'}
                        border={colorMode === 'light' ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)'}
                    >
                        {navItems.map(({ label, href }) => (
                            <MotionButton
                                key={label}
                                as="a"
                                href={href}
                                fontSize="sm"
                                fontWeight="500"
                                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                whiteSpace="nowrap"
                                px={5}
                                py={2}
                                rounded="lg"
                                bg={activeSection === label ? currentColors.primary : 'transparent'}
                                color={activeSection === label ? 'white' : currentColors.text}
                                _hover={{
                                    bg: activeSection === label ? currentColors.primary : colorMode === 'light' ? 'rgba(229, 229, 234, 0.8)' : 'rgba(44, 44, 46, 0.8)',
                                }}
                                onClick={() => handleLinkClick(label)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{
                                    type: 'spring',
                                    damping: 15,
                                    stiffness: 300
                                }}
                            >
                                {label}
                            </MotionButton>
                        ))}
                    </Flex>

                    {/* Desktop: Right side buttons */}
                    <Flex display={{ base: 'none', md: 'flex' }} align="center" gap={3}>
                        {/* Theme toggle - iOS style */}
                        <MotionButton
                            onClick={toggleColorMode}
                            variant="ghost"
                            size="sm"
                            p={2}
                            rounded="full"
                            bg={colorMode === 'light' ? 'rgba(229, 229, 234, 0.5)' : 'rgba(44, 44, 46, 0.5)'}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{
                                type: 'spring',
                                damping: 15,
                                stiffness: 300
                            }}
                        >
                            {colorMode === 'light' ? (
                                <Moon size={20} color={currentColors.text} />
                            ) : (
                                <Sun size={20} color={currentColors.text} />
                            )}
                        </MotionButton>

                        {/* Login or Profile (Desktop) */}
                        {user ? (
                            <MotionButton
                                as={RouterLink}
                                to={`${user.username}`}
                                variant="ghost"
                                size="sm"
                                p={2}
                                rounded="full"
                                bg={colorMode === 'light' ? 'rgba(229, 229, 234, 0.5)' : 'rgba(44, 44, 46, 0.5)'}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{
                                    type: 'spring',
                                    damping: 15,
                                    stiffness: 300
                                }}
                            >
                                <UserCircle size={20} color={currentColors.primary} />
                            </MotionButton>
                        ) : (
                            <MotionButton
                                as={RouterLink}
                                to="/auth"
                                size="sm"
                                px={4}
                                py={2}
                                rounded="lg"
                                bg="transparent"
                                color={currentColors.primary}
                                fontWeight="500"
                                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                _hover={{ bg: colorMode === 'light' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(10, 132, 255, 0.1)' }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{
                                    type: 'spring',
                                    damping: 15,
                                    stiffness: 300
                                }}
                            >
                                Sign In
                            </MotionButton>
                        )}

                        {user && (
                            <MotionButton
                                onClick={handleLogout}
                                size="sm"
                                px={4}
                                py={2}
                                rounded="lg"
                                bg="transparent"
                                color="#FF453A" // iOS red
                                fontWeight="500"
                                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                _hover={{ bg: colorMode === 'light' ? 'rgba(255, 69, 58, 0.1)' : 'rgba(255, 69, 58, 0.1)' }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{
                                    type: 'spring',
                                    damping: 15,
                                    stiffness: 300
                                }}
                            >
                                Log Out
                            </MotionButton>
                        )}

                        {/* About us - iOS-style filled button */}
                        <MotionButton
                            onClick={handleOpenLinks}
                            size="sm"
                            px={4}
                            py={2}
                            rounded="lg"
                            bg={currentColors.primary}
                            color="white"
                            fontWeight="500"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                            _hover={{ bg: colorMode === 'light' ? '#0066CC' : '#0A78E6' }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{
                                type: 'spring',
                                damping: 15,
                                stiffness: 300
                            }}
                        >
                            About
                        </MotionButton>
                    </Flex>

                    {/* Mobile: Hamburger menu */}
                    <IconButton
                        display={{ base: 'flex', md: 'none' }}
                        icon={<Menu size={24} />}
                        aria-label="Open Menu"
                        onClick={toggleMenu}
                        variant="ghost"
                        color={currentColors.text}
                        size="sm"
                        p={2}
                        rounded="full"
                        bg={colorMode === 'light' ? 'rgba(229, 229, 234, 0.5)' : 'rgba(44, 44, 46, 0.5)'}
                    />

                    {/* Mobile Drawer Menu - iOS style */}
                    <Drawer isOpen={isOpen} placement="right" onClose={closeMenu} size="full">
                        <DrawerOverlay bg="rgba(0,0,0,0.4)" backdropFilter="blur(5px)" />
                        <DrawerContent
                            bg={colorMode === 'light' ? 'rgba(242, 242, 247, 0.95)' : 'rgba(28, 28, 30, 0.95)'}
                            maxW="xs"
                            ml="auto"
                            borderLeft={colorMode === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)'}
                        >
                            <DrawerCloseButton
                                size="lg"
                                color={currentColors.text}
                                top="4"
                                right="4"
                                _hover={{ bg: 'transparent' }}
                            />
                            <DrawerBody
                                display="flex"
                                flexDir="column"
                                alignItems="stretch"
                                justifyContent="flex-start"
                                p={6}
                                pt="16"
                            >
                                <VStack spacing={2} textAlign="left" w="full">
                                    {navItems.map(({ label, href }) => {
                                        const sectionId = href.replace('#', '');
                                        return (
                                            <MotionButton
                                                key={label}
                                                as="a"
                                                href={href}
                                                variant="ghost"
                                                justifyContent="flex-start"
                                                fontSize="md"
                                                fontWeight="500"
                                                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                                px={4}
                                                py={3}
                                                rounded="lg"
                                                w="full"
                                                bg={activeSection === sectionId ? currentColors.primary : 'transparent'}
                                                color={activeSection === sectionId ? 'white' : currentColors.text}
                                                _hover={{
                                                    bg: activeSection === sectionId ? currentColors.primary : colorMode === 'light' ? 'rgba(229, 229, 234, 0.5)' : 'rgba(44, 44, 46, 0.5)',
                                                }}
                                                onClick={() => handleLinkClick(sectionId)}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{
                                                    type: 'spring',
                                                    damping: 15,
                                                    stiffness: 300
                                                }}
                                            >
                                                {label}
                                            </MotionButton>
                                        );
                                    })}

                                    {/* Mobile: Action buttons */}
                                    <VStack spacing={3} w="full" pt={8}>
                                        <MotionButton
                                            onClick={handleOpenLinks}
                                            w="full"
                                            size="md"
                                            px={4}
                                            py={3}
                                            rounded="lg"
                                            bg={currentColors.primary}
                                            color="white"
                                            fontWeight="500"
                                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                            _hover={{ bg: colorMode === 'light' ? '#0066CC' : '#0A78E6' }}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{
                                                type: 'spring',
                                                damping: 15,
                                                stiffness: 300
                                            }}
                                        >
                                            About
                                        </MotionButton>

                                        {user ? (
                                            <MotionButton
                                                as={RouterLink}
                                                to={`${user.username}`}
                                                variant="ghost"
                                                justifyContent="flex-start"
                                                w="full"
                                                size="md"
                                                px={4}
                                                py={3}
                                                rounded="lg"
                                                fontWeight="500"
                                                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                                color={currentColors.primary}
                                                _hover={{ bg: colorMode === 'light' ? 'rgba(229, 229, 234, 0.5)' : 'rgba(44, 44, 46, 0.5)' }}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{
                                                    type: 'spring',
                                                    damping: 15,
                                                    stiffness: 300
                                                }}
                                            >
                                                <UserCircle size={20} style={{ marginRight: 8 }} />
                                                My Profile
                                            </MotionButton>
                                        ) : (
                                            <MotionButton
                                                as={RouterLink}
                                                to="/auth"
                                                variant="ghost"
                                                justifyContent="flex-start"
                                                w="full"
                                                size="md"
                                                px={4}
                                                py={3}
                                                rounded="lg"
                                                fontWeight="500"
                                                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                                color={currentColors.primary}
                                                _hover={{ bg: colorMode === 'light' ? 'rgba(229, 229, 234, 0.5)' : 'rgba(44, 44, 46, 0.5)' }}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{
                                                    type: 'spring',
                                                    damping: 15,
                                                    stiffness: 300
                                                }}
                                            >
                                                Sign In
                                            </MotionButton>
                                        )}

                                        {user && (
                                            <MotionButton
                                                onClick={handleLogout}
                                                variant="ghost"
                                                justifyContent="flex-start"
                                                w="full"
                                                size="md"
                                                px={4}
                                                py={3}
                                                rounded="lg"
                                                fontWeight="500"
                                                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                                color="#FF453A"
                                                _hover={{ bg: colorMode === 'light' ? 'rgba(255, 69, 58, 0.1)' : 'rgba(255, 69, 58, 0.1)' }}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{
                                                    type: 'spring',
                                                    damping: 15,
                                                    stiffness: 300
                                                }}
                                            >
                                                <HiOutlineLogout style={{ marginRight: 8 }} />
                                                Log Out
                                            </MotionButton>
                                        )}

                                        {/* Theme toggle in mobile menu */}
                                        <MotionButton
                                            onClick={toggleColorMode}
                                            variant="ghost"
                                            justifyContent="flex-start"
                                            w="full"
                                            size="md"
                                            px={4}
                                            py={3}
                                            rounded="lg"
                                            fontWeight="500"
                                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                            color={currentColors.text}
                                            _hover={{ bg: colorMode === 'light' ? 'rgba(229, 229, 234, 0.5)' : 'rgba(44, 44, 46, 0.5)' }}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{
                                                type: 'spring',
                                                damping: 15,
                                                stiffness: 300
                                            }}
                                        >
                                            {colorMode === 'light' ? (
                                                <Moon size={20} style={{ marginRight: 8 }} />
                                            ) : (
                                                <Sun size={20} style={{ marginRight: 8 }} />
                                            )}
                                            {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                                        </MotionButton>
                                    </VStack>
                                </VStack>
                            </DrawerBody>
                        </DrawerContent>
                    </Drawer>
                </Flex>
            </MotionBox>

            {/* Popup hiển thị khi bấm About us */}
            <LinksPopup isOpen={isLinksOpen} onClose={closeLinks} />
        </>
    );
};

export default Header;