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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';
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
import { Menu, MoonIcon, SunIcon, User2Icon, UserCircle } from "lucide-react";


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

    return (
        <>
            <MotionBox
                as="nav"
                position="abosolute" //fixed is base
                w="full"
                bg={scrollY > 50
                    ? (colorMode === 'light' ? 'whiteAlpha.900' : 'gray.800')
                    : (colorMode === 'light'
                        ? 'linear-gradient(90deg, rgba(49, 130, 206, 0.1), rgba(255, 255, 255, 0.2))'
                        : 'linear-gradient(90deg, rgba(49, 130, 206, 0.1), rgba(0, 0, 0, 0.2))')}
                backdropFilter="blur(12px)"
                zIndex="50"
                shadow={scrollY > 50 ? 'md' : 'none'}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <Flex maxW="7xl" mx="auto" px={{ base: 4, md: 6 }} py={2} align="center" justify="space-between">

                    {/* Logo */}
                    <MotionLink
                        as={Link}
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

                    {/* Desktop nav links */}
                    <Flex
                        display={{ base: 'none', md: 'flex' }}
                        align="center"
                        gap={2}
                        px={3}
                        py={1}
                        bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                        rounded="full"
                        boxShadow="sm"
                        marginLeft={4}
                    // overflowX="auto"
                    // className="hide-scrollbar"

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

                    {/* Desktop: Theme Toggle + Login/Profile + About us */}
                    <Flex display={{ base: 'none', md: 'flex' }} align="center" gap={4}>
                        <MotionButton
                            onClick={toggleColorMode}
                            variant="ghost"
                            fontSize="md"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* {colorMode === 'light' ? '🌙' : '☀️'} */}
                            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                        </MotionButton>

                        {/* Login or Profile (Desktop) */}
                        {user ? (
                            <MotionButton
                                as={RouterLink}
                                to={`${user.username}`}
                                px={4}
                                variant="ghost"
                                py={2}
                                fontSize="md"
                                color={colorMode === 'light' ? '#3182ce' : 'white'}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <UserCircle />
                            </MotionButton>
                        ) : (
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
                        )}

                        {user && (
                            <MotionButton
                                onClick={handleLogout}
                                leftIcon={<HiOutlineLogout />}
                                bgGradient="linear(to-r, red.400, pink.400)"
                                color="white"
                                px={5}
                                py={2}
                                rounded="full"
                                fontSize="sm"
                                fontWeight="medium"
                                _hover={{ bgGradient: "linear(to-r, red.500, pink.500)", boxShadow: "lg" }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Logout
                            </MotionButton>
                        )}


                        {/* About us */}
                        <MotionButton
                            onClick={handleOpenLinks}
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
                            About us
                        </MotionButton>
                    </Flex>

                    {/* Mobile: Hamburger menu */}
                    <IconButton
                        display={{ base: 'flex', md: 'none' }}
                        icon={<HamburgerIcon fontSize="2xl" />}
                        aria-label="Open Menu"
                        onClick={toggleMenu}
                        variant="ghost"
                        color={colorMode === 'light' ? '#3182ce' : 'white'}
                    />

                    {/* Mobile Drawer Menu */}
                    <Drawer isOpen={isOpen} placement="right" onClose={closeMenu}>
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton color="#3182ce" />
                            <DrawerBody display="flex" flexDir="column" alignItems="center" justifyContent="center" p={6} bg={colorMode === 'light' ? 'white' : 'gray.800'}>
                                <VStack spacing={6} textAlign="center" w="full">
                                    {navItems.map(({ label, href }) => {
                                        const sectionId = href.replace('#', '');
                                        return (
                                            <MotionLink
                                                key={label}
                                                href={href}
                                                fontSize="lg"  // Lớn hơn cho dễ chạm
                                                fontWeight="medium"
                                                px={4}
                                                py={3}  // Padding rộng hơn cho mobile
                                                rounded="lg"  // Bo góc nhẹ
                                                w="full"  // Chiếm full width
                                                bg={activeSection === sectionId ? '#3182ce' : 'transparent'}
                                                color={activeSection === sectionId ? 'white' : colorMode === 'light' ? 'gray.800' : 'gray.100'}
                                                _hover={{
                                                    bg: activeSection === sectionId ? '#2563eb' : colorMode === 'light' ? 'gray.100' : 'gray.700',
                                                }}
                                                onClick={() => handleLinkClick(sectionId)}
                                                whileHover={{ scale: 1.02 }}  // Hiệu ứng nhẹ hơn
                                                whileTap={{
                                                    scale: 0.98,
                                                    backgroundColor: '#3182ce20'  // Hiệu ứng ấn rõ ràng
                                                }}
                                                transition={{
                                                    duration: 0.15,  // Thời gian ngắn hơn
                                                    ease: "easeOut"
                                                }}
                                            >
                                                {label}
                                            </MotionLink>
                                        );
                                    })}

                                    {/* 📱 Mobile: About us + Login/Profile */}
                                    <VStack spacing={4} w="full" maxW="xs" pt={8}>
                                        <MotionButton
                                            onClick={handleOpenLinks}
                                            w="full"
                                            bg="#3182ce"
                                            color="white"
                                            px={6}
                                            py={3}
                                            rounded="full"
                                            fontWeight="medium"
                                            _hover={{ bg: '#2563eb' }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            About us
                                        </MotionButton>

                                        {user ? (
                                            <MotionLink
                                                as={RouterLink}
                                                to={`${user.username}`}
                                                px={4}
                                                py={2}
                                                fontSize="md"
                                                fontWeight="medium"
                                                color={colorMode === 'light' ? '#3182ce' : 'white'}
                                                _hover={{ color: '#2563eb' }}
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                <UserCircle />

                                            </MotionLink>
                                        ) : (
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
                                        )}

                                        {user && (
                                            <MotionButton
                                                onClick={handleLogout}
                                                leftIcon={<HiOutlineLogout />}
                                                bgGradient="linear(to-r, red.400, pink.400)"
                                                color="white"
                                                px={5}
                                                py={2}
                                                rounded="full"
                                                fontSize="sm"
                                                fontWeight="medium"
                                                _hover={{ bgGradient: "linear(to-r, red.500, pink.500)", boxShadow: "lg" }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Logout
                                            </MotionButton>
                                        )}

                                    </VStack>
                                </VStack>
                            </DrawerBody>
                        </DrawerContent>
                    </Drawer>

                </Flex>

            </MotionBox>

            {/* Popup hiển thị khi bấm About us */}
            <LinksPopup isOpen={isLinksOpen} onClose={closeLinks} />
            {/* <NotificationPopup isOpen={isLinksOpen} onClose={closeLinks} message='Cho tớ tiền đi mà Quân' /> */}
        </>
    );
};

export default Header;
