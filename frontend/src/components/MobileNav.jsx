import { Box, Icon, Text, useColorMode } from "@chakra-ui/react"
import { FaHome, FaQuestionCircle } from "react-icons/fa";
import { FaBook, FaMicrophone } from "react-icons/fa6";
import { Link as RouterLink } from 'react-router-dom';
import { Link } from "@chakra-ui/react";



const MobileNav = () => {
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
    return (
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
    )
}

export default MobileNav