import React, { useState } from "react";
import { VStack, Box, Text, Button, useColorMode, Flex } from "@chakra-ui/react";
import { Mic, Download, AudioLines, Play, Grid } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import useShowToast from "../hooks/showToast";

const questions = [
    {
        id: "topic",
        label: "Tell us about your favorite hobby or activity",
        description:
            "You'll have 2 minutes to speak about this topic. Think about why you enjoy it, how often you do it, and any memorable experiences.",
    },
];



const SpeakingTest = ({
    recording,
    startRecording,
    stopRecording,
    audioUrl,
    downloadAudio,
    text,
    audio
}) => {
    const { colorMode } = useColorMode();
    const isLight = colorMode === "light";
    let synth = window.speechSynthesis;
    let voice_language = "en";
    let voices = null;
    let languageFound = true;
    let voice_synth = null;

    const changeLanguage = (language) => {
        voices = synth.getVoices();
        console.log("Voice", voices);

        voice_language = language;
        languageFound = false;
        let languageIdentifier, languageName;
        switch (language) {
            case 'en':
                languageIdentifier = 'en';
                languageName = "Microsoft Zira - English (United States)";
                break;
        };

        for (let idx = 0; idx < voices.length; idx++) {
            if (voices[idx].lang.slice(0, 2) == languageIdentifier && voices[idx].name == languageName) {
                voice_synth = voices[idx];
                languageFound = true;
                break;
            }

        }
        // If specific voice not found, search anything with the same language 
        if (!languageFound) {
            for (let idx = 0; idx < voices.length; idx++) {
                if (voices[idx].lang.slice(0, 2) == languageIdentifier) {
                    voice_synth = voices[idx];
                    languageFound = true;
                    break;
                }
            }
        }
    }

    const handlePlay = () => {
        if (voice_synth == null)
            changeLanguage(voice_language);

        var utterThis = new SpeechSynthesisUtterance(text?.real_transcript);
        utterThis.voice = voice_synth;
        utterThis.rate = 0.7;
        synth.speak(utterThis);

    }
    return (
        <VStack spacing={8} align="stretch" textAlign={'center'} >

            {questions.map((question) => (

                <Box key={question.id} position={'relative'}>
                    <Flex direction={'row'}  >
                        <Button
                            // left={0}
                            // position={'absolute'}
                            onClick={handlePlay}
                            background={'transparent'}
                        >
                            <Play />
                        </Button>

                        <Text fontSize="xl" fontWeight="semibold" alignContent={'center'} >
                            {/* {question.label} */}

                            {text.real_transcript} {" "}

                        </Text>
                    </Flex>


                    <Text color="gray.500" mb={6}>
                        {/* {question.description} */}
                        <i>/{text.ipa_transcript}/</i>
                    </Text>
                    {audio && <AudioPlayer audioUrl={audio} isLight={isLight} />}
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