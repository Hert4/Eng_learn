import React from 'react';
import {
  Box,
  Text,
  Flex,
  Icon,
  Link,
  Grid,
  GridItem,
  VStack,
  Portal,
  Button,
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram, FaDiscord } from 'react-icons/fa';
import { SiBuymeacoffee, SiBluesky } from 'react-icons/si';
import { MdPrint, MdStore } from 'react-icons/md';
import { LiaWindowCloseSolid } from "react-icons/lia";


const LinksPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const links = [
    { name: 'twitter', icon: FaTwitter, url: 'https://twitter.com' },
    { name: 'youtube', icon: FaYoutube, url: 'https://youtube.com' },
    { name: 'ko-fi', icon: SiBuymeacoffee, url: 'https://ko-fi.com' },
    { name: 'discord', icon: FaDiscord, url: 'https://discord.com' },
    { name: 'instagram', icon: FaInstagram, url: 'https://instagram.com' },
    { name: 'bluesky', icon: SiBluesky, url: 'https://bsky.app' },
    { name: 'art prints', icon: MdPrint, url: 'https://example.com/artprints' },
    { name: 'my location', icon: MdStore, url: 'https://example.com/merch' },
  ];

  return (
    <Portal>
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="400px"
        borderRadius="md"
        bg="white"
        boxShadow="lg"
        overflow="hidden"
        fontFamily="monospace"
      >
        {/* Header đen giống cửa sổ desktop */}
        <Box bg="gray.800" color="white" px={4} py={2}>
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold">links</Text>
            <Button
              variant="unstyled"
              minW="auto"
              h="auto"
              fontWeight="bold"
              cursor="pointer"
              onClick={onClose}
              _hover={{ color: 'gray.300' }}
            >
              <span
                onClick={onClose}
                className="cursor-pointer font-mono font-bold text-lg hover:text-red-500"
              >
                [X]
              </span>
            </Button>
          </Flex>
        </Box>

        {/* Nội dung */}
        <Box px={6} py={8}>
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

          <Box
            mt={10}
            p={3}
            textAlign="center"
            borderRadius="md"
            bg="gray.100"
          >
            <Text fontSize="sm" color="gray.600">
              clicking any of the links will open a new tab!
            </Text>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};

export default LinksPopup;
