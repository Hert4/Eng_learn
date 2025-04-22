import React from 'react';
import {
    Box,
    Text,
    Flex,
    Button,
    Portal,
} from '@chakra-ui/react';
import Draggable from 'react-draggable';

const Popup = ({ isOpen, onClose, title = 'Popup', children }) => {
    if (!isOpen) return null;

    return (
        <Portal>
            <Draggable handle=".drag-handle">
                <Box
                    position="fixed"
                    top="37%"
                    left="37%"
                    transform="translate(-50%, -50%)"
                    width="400px"
                    borderRadius="md"
                    bg="white"
                    boxShadow="2xl"
                    fontFamily="monospace"
                    overflow="hidden"
                    zIndex={9999}
                >
                    <Box
                        className="drag-handle"
                        bg="gray.800"
                        color="white"
                        px={4}
                        py={2}
                        borderTopRadius="md"

                    >
                        <Flex justify="space-between" align="center">
                            <Text fontWeight="bold">{title}</Text>
                            <Button
                                variant="unstyled"
                                onClick={onClose}
                                _hover={{ color: 'gray.300' }}
                            >
                                [X]
                            </Button>
                        </Flex>
                    </Box>

                    <Box px={6} py={8}>
                        {children}
                    </Box>
                </Box>
            </Draggable>
        </Portal>
    );
};

export default Popup;
