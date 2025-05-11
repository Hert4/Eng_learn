import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    VStack,
    Heading,
    Text,
    Flex,
    Progress,
    useColorMode,
    useToast,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PersonalInfoForm from "../components/PersionalInfoForm";
import LanguageBackgroundForm from "../components/LanguageBackgroundForm";
import MicrophoneSetup from "../components/MicrophoneSetup";
import SpeakingTest from "../components/SpeakingTest";
import CompletionScreen from "../components/ComplementScreen";

const MotionBox = motion(Box);

const stages = [
    { title: "Personal Information", progress: 20 },
    { title: "Language Background", progress: 40 },
    { title: "Microphone Setup", progress: 60 },
    { title: "Speaking Test", progress: 80 },
    { title: "Completion", progress: 100 },
];

const SurveyPage = () => {
    const [stage, setStage] = useState(0);
    const [formData, setFormData] = useState({});
    const [recording, setRecording] = useState(false);
    const [micSetupAudioUrl, setMicSetupAudioUrl] = useState(null);
    const [speakingTestAudioUrl, setSpeakingTestAudioUrl] = useState(null);
    const [micAccess, setMicAccess] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const { colorMode } = useColorMode();
    const toast = useToast();
    const isLight = colorMode === "light";

    // Check microphone access
    useEffect(() => {
        const checkMicAccess = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setMicAccess(true);
            } catch (error) {
                console.error("Microphone access denied:", error);
                setMicAccess(false);
            }
        };
        checkMicAccess();
    }, []);

    // Clean up blob URLs
    useEffect(() => {
        return () => {
            if (micSetupAudioUrl) {
                console.log("Revoking micSetupAudioUrl:", micSetupAudioUrl);
                URL.revokeObjectURL(micSetupAudioUrl);
            }
            if (speakingTestAudioUrl) {
                console.log("Revoking speakingTestAudioUrl:", speakingTestAudioUrl);
                URL.revokeObjectURL(speakingTestAudioUrl);
            }
        };
    }, [micSetupAudioUrl, speakingTestAudioUrl]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const startRecording = async (stageIndex) => {
        try {
            audioChunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.addEventListener("dataavailable", (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    console.log("Data available, chunk size:", event.data.size);
                }
            });

            mediaRecorder.addEventListener("stop", () => {
                console.log("Audio chunks length:", audioChunksRef.current.length);
                if (audioChunksRef.current.length === 0) {
                    toast({
                        title: "Error",
                        description: "No audio data recorded",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                console.log("Audio blob size:", audioBlob.size);
                if (audioBlob.size < 100) {
                    toast({
                        title: "Error",
                        description: "Recorded audio is too short or invalid",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                const url = URL.createObjectURL(audioBlob);
                console.log("Audio URL:", url);
                if (stageIndex === 2) {
                    setMicSetupAudioUrl(url);
                } else if (stageIndex === 3) {
                    setSpeakingTestAudioUrl(url);
                }
                stream.getTracks().forEach((track) => track.stop());
                toast({
                    title: "Recording saved",
                    description: "Your audio has been successfully saved.",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
            });

            mediaRecorder.start(100);
            setRecording(true);

            setTimeout(() => {
                if (recording) {
                    stopRecording();
                }
            }, 120000);

            toast({
                title: "Recording started",
                description: "Speak clearly into your microphone",
                status: "info",
                duration: 2000,
                isClosable: true,
            });
        } catch (err) {
            console.error("Recording error:", err);
            toast({
                title: "Microphone access denied",
                description: "Please allow microphone access to continue",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const downloadAudio = () => {
        if (speakingTestAudioUrl) {
            const link = document.createElement("a");
            link.href = speakingTestAudioUrl;
            link.download = "speaking_test_audio.webm";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleNext = () => {
        if (stage < stages.length - 1) {
            setStage(stage + 1);
        }
    };

    const handleBack = () => {
        if (stage > 0) {
            setStage(stage - 1);
        }
    };

    const resetSurvey = () => {
        setStage(0);
        setFormData({});
        setMicSetupAudioUrl(null);
        setSpeakingTestAudioUrl(null);
        setRecording(false);
    };

    const renderCurrentStage = () => {
        switch (stage) {
            case 0:
                return <PersonalInfoForm formData={formData} handleInputChange={handleInputChange} />;
            case 1:
                return <LanguageBackgroundForm formData={formData} handleInputChange={handleInputChange} />;
            case 2:
                return (
                    <MicrophoneSetup
                        recording={recording}
                        startRecording={() => startRecording(2)}
                        stopRecording={stopRecording}
                        audioUrl={micSetupAudioUrl}
                        micAccess={micAccess}
                    />
                );
            case 3:
                return (
                    <SpeakingTest
                        recording={recording}
                        startRecording={() => startRecording(3)}
                        stopRecording={stopRecording}
                        audioUrl={speakingTestAudioUrl}
                        downloadAudio={downloadAudio}
                    />
                );
            case 4:
                return <CompletionScreen resetSurvey={resetSurvey} />;
            default:
                return null;
        }
    };

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg={isLight ? "gray.50" : "gray.800"}
            p={4}
        >
            <VStack spacing={8} w="full" maxW="2xl">
                <VStack spacing={2} w="full">
                    <Heading
                        size="xl"
                        fontWeight="bold"
                        color={isLight ? "blue.600" : "blue.300"}
                    >
                        OPIC Speaking Assessment
                    </Heading>
                    <Text color="gray.500">{stages[stage].title}</Text>
                    <Progress
                        value={stages[stage].progress}
                        size="sm"
                        w="full"
                        colorScheme="blue"
                        borderRadius="full"
                        hasStripe
                        isAnimated
                    />
                </VStack>

                <AnimatePresence mode="wait">
                    <MotionBox
                        key={stage}
                        w="full"
                        p={8}
                        bg={isLight ? "white" : "gray.700"}
                        borderRadius="xl"
                        boxShadow="md"
                        borderWidth="1px"
                        borderColor={isLight ? "gray.200" : "gray.600"}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderCurrentStage()}
                    </MotionBox>
                </AnimatePresence>

                {stage < stages.length - 1 && (
                    <Flex w="full" justify="space-between">
                        <Button
                            leftIcon={<ChevronLeft size={20} />}
                            onClick={handleBack}
                            isDisabled={stage === 0}
                            variant="outline"
                        >
                            Back
                        </Button>
                        <Button
                            rightIcon={<ChevronRight size={20} />}
                            onClick={handleNext}
                            colorScheme="blue"
                            isDisabled={
                                (stage === 0 && (!formData.name || !formData.ageGroup)) ||
                                (stage === 1 &&
                                    (!formData.englishLevel ||
                                        (formData.englishLevel === "beginner" &&
                                            !formData.supportNeeded) ||
                                        (formData.englishLevel === "advanced" &&
                                            !formData.certificationPrep))) ||
                                (stage === 2 && !micSetupAudioUrl) ||
                                (stage === 3 && !speakingTestAudioUrl)
                            }
                        >
                            {stage === stages.length - 2 ? "Submit" : "Next"}
                        </Button>
                    </Flex>
                )}
            </VStack>
        </Flex>
    );
};

export default SurveyPage;