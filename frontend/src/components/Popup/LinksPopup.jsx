import React from 'react';
import {
    Grid,
    GridItem,
    Link,
    VStack,
    Icon,
    Text,
    Box,
} from '@chakra-ui/react';
import {
    FaTwitter,
    FaYoutube,
    FaInstagram,
    FaDiscord,
} from 'react-icons/fa';
import { SiBuymeacoffee, SiBluesky } from 'react-icons/si';
import { MdPrint, MdStore } from 'react-icons/md';
import Popup from './Popup';

const LinksPopup = ({ isOpen, onClose }) => {
    const links = [
        { name: 'twitter', icon: FaTwitter, url: 'https://twitter.com' },
        { name: 'youtube', icon: FaYoutube, url: 'https://youtube.com' },
        { name: 'ko-fi', icon: SiBuymeacoffee, url: 'https://ko-fi.com' },
        { name: 'discord', icon: FaDiscord, url: 'https://discord.com' },
        // { name: 'instagram', icon: FaInstagram, url: 'https://instagram.com' },
        // { name: 'bluesky', icon: SiBluesky, url: 'https://bsky.app' },
        // { name: 'art prints', icon: MdPrint, url: 'https://example.com/artprints' },
        // { name: 'my location', icon: MdStore, url: 'https://example.com/merch' },
    ];

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="About us">
            <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                {links.map((link) => (
                    <GridItem key={link.name} textAlign="center">
                        <Link href={link.url} isExternal _hover={{ textDecoration: 'none' }}>
                            <VStack spacing={2}>
                                <Box
                                    boxSize={12}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    borderRadius="md"
                                    boxShadow="2px 3px 0px rgba(0,0,0,0.3)"
                                >
                                    <Icon as={link.icon} boxSize={6} color="black" />
                                </Box>
                                <Text fontSize="sm" color="black">
                                    {link.name}
                                </Text>
                            </VStack>
                        </Link>
                    </GridItem>
                ))}
            </Grid>

            <Box mt={10} p={3} textAlign="center" borderRadius="md" bg="gray.100">
                <Text fontSize="sm" color="gray.600">
                    clicking any of the links will open a new tab!
                </Text>
            </Box>
        </Popup>
    );
};

export default LinksPopup;
