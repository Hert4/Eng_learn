import React from 'react';
import { Box, Text, Icon, VStack } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import Popup from './Popup';

const NotificationPopup = ({ isOpen, onClose, type = 'success', message = 'Something happened!' }) => {
    const iconProps = {
        success: { icon: CheckCircleIcon, color: 'green.400' },
        error: { icon: WarningIcon, color: 'red.400' },
    };

    const { icon: IconType, color } = iconProps[type] || iconProps.success;

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="Notification">
            <VStack spacing={4} textAlign="center">
                <Icon as={IconType} boxSize={10} color={color} />
                <Text fontSize="lg">{message}</Text>
            </VStack>
        </Popup>
    );
};

export default NotificationPopup;
