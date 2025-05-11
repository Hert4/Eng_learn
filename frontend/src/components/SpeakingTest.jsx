import React from "react";
import { VStack, Box, Text, Button, useColorMode } from "@chakra-ui/react";
import { Mic, Download } from "lucide-react";
import AudioPlayer from "./AudioPlayer";

const questions = [
    {
        id: "topic",
        label: "Tell us about your favorite hobby or activity",
        description:
            "You'll have 2 minutes to speak about this topic. Think about why you enjoy it, how often you do it, and any memorable experiences.",
    },
];

const SpeakingTest = ({ recording, startRecording, stopRecording, audioUrl, downloadAudio }) => {
    const { colorMode } = useColorMode();
    const isLight = colorMode === "light";

    return (
        <VStack spacing={8} align="stretch">
            {questions.map((question) => (
                <Box key={question.id}>
                    <Text fontSize="xl" fontWeight="semibold" mb={2}>
                        {question.label}
                    </Text>
                    <Text color="gray.500" mb={6}>
                        {question.description}
                    </Text>
                    <VStack spacing={6}>
                        {!recording ? (
                            <Button
                                colorScheme="blue"
                                leftIcon={<Mic />}
                                onClick={startRecording}
                                size="lg"
                                w="full"
                            >
                                Start Recording
                            </Button>
                        ) : (
                            <Button
                                colorScheme="red"
                                leftIcon={<Mic />}
                                onClick={stopRecording}
                                size="lg"
                                w="full"
                            >
                                Stop Recording (2:00 max)
                            </Button>
                        )}
                        {audioUrl && (
                            <>
                                <AudioPlayer audioUrl={audioUrl} isLight={isLight} />
                                <Button
                                    leftIcon={<Download />}
                                    onClick={downloadAudio}
                                    size="sm"
                                    variant="outline"
                                    w="full"
                                >
                                    Download Recording
                                </Button>
                            </>
                        )}
                        <Text fontSize="sm" color="gray.500">
                            You can record multiple times until you're satisfied with your response.
                        </Text>
                    </VStack>
                </Box>
            ))}
        </VStack>
    );
};

export default SpeakingTest;