import React from "react";
import { VStack, Text, IconButton, Tooltip, useColorMode, Box } from "@chakra-ui/react";
import { Mic } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
// import useShowToast from "../hooks/showToast";
const MicrophoneSetup = ({
    recording,
    startRecording,
    stopRecording,
    audioUrl,
    micAccess,
}) => {
    const { colorMode } = useColorMode();
    const isLight = colorMode === "light";


    return (
        <VStack spacing={8} align="center">
            <Text fontSize="xl" textAlign="center" fontWeight="semibold">
                Let's check your microphone setup

            </Text>

            <Box textAlign="center">
                <Tooltip
                    label={micAccess ? "Microphone ready" : "Microphone access required"}
                    placement="top"
                >
                    <IconButton
                        aria-label="Record Mic"
                        icon={<Mic size={32} />}
                        onClick={recording ? stopRecording : startRecording}
                        colorScheme={recording ? "red" : "blue"}
                        isRound
                        size="lg"
                        w="80px"
                        h="80px"
                        mb={4}
                        animation={recording ? "pulse 1.5s infinite" : "none"}
                    />
                </Tooltip>
                <Text
                    color={recording ? "green.500" : "gray.500"}
                    fontWeight="medium"
                >
                    {recording
                        ? "Recording..."
                        : micAccess
                            ? "Click to record"
                            : "Microphone not available"}
                </Text>
            </Box>
            {audioUrl && <AudioPlayer audioUrl={audioUrl} isLight={isLight} />}
            <Text fontSize="sm" color="gray.500" textAlign="center" fontWeight={'400'}>
                Speak to microphone
            </Text>
        </VStack>
    );
};

export default MicrophoneSetup;