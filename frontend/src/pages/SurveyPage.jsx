import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Box,
    Button,
    VStack,
    Heading,
    Text,
    Flex,
    Progress,
    useColorMode,

} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PersonalInfoForm from "../components/PersionalInfoForm";
import LanguageBackgroundForm from "../components/LanguageBackgroundForm";
import MicrophoneSetup from "../components/MicrophoneSetup";
import SpeakingTest from "../components/SpeakingTest";
import CompletionScreen from "../components/ComplementScreen";
import useShowToast from "../hooks/showToast";
// import { useLoading } from "../hooks/useLoading";

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
    const [audioData, setAudioData] = useState({
        micSetup: { blob: null, url: null },
        speakingTest: { blob: null, url: null }
    });
    const [micAccess, setMicAccess] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const { colorMode } = useColorMode();
    const showToast = useShowToast();
    const isLight = colorMode === "light";

    // check submitting stase
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [analysisResults, setAnalysisResults] = useState(null)

    // Check microphone access
    useEffect(() => {
        const checkMicAccess = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                setMicAccess(true);
                console.log("Microphone access granted");
            } catch (error) {
                console.error("Microphone access denied:", error);
                setMicAccess(false);
                showToast("Error", "Microphone access denied", "error");
            }
        };
        checkMicAccess();

        return () => {
            // Cleanup stream on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                console.log("Cleaned up media stream");
            }
        };
    }, [showToast]);

    // Clean up audio URLs only on component unmount
    useEffect(() => {
        return () => {
            // Only clean up on unmount, not when navigating
            if (stage === stages.length - 1) { // When completing the survey
                Object.entries(audioData).forEach(([key, { url }]) => {
                    if (url) {
                        console.log(`Revoking URL for ${key} on unmount:`, url);
                        URL.revokeObjectURL(url);
                    }
                });
            }
        };
    }, [audioData, stage]);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const blobToBase64 = useCallback(async (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }, []);


    const [text, setText] = useState()

    const getSample = async () => {
        console.log(formData)
        let cate = ''
        if (formData.englishLevel === 'intermediate') {
            cate = 1
        }
        else if (formData.englishLevel === 'beginer') {
            cate = 0
        }
        else {
            cate = 2
        }
        try {
            const res = await fetch('https://107.114.184.16:3000/getSample', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: cate,
                    language: "en",
                }),
            });
            const data = await res.json();
            if (data.error) {
                const errorMessage = typeof data.error === 'string'
                    ? data.error
                    : data.error.message || 'An unknown error occurred';
                showToast("Error", errorMessage, "error");
                return false;
            }
            console.log(data);
            setText(data);
            return true;
        } catch (error) {
            console.log(error);
            showToast("Error", error, "error");
            return false;
        }
    }
    const sendAudioToFlask = useCallback(async () => {
        const speakingTestData = audioData["speakingTest"];
        if (!speakingTestData?.url) {
            showToast("Error", "No audio to upload", "error");
            return false;
        }

        setIsSubmitting(true); // Bật loading

        try {
            const base64Audio = await blobToBase64(speakingTestData.blob);
            const res = await fetch("https://107.114.184.16:3000/GetAccuracyFromRecordedAudio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: text?.real_transcript[0] || "Hello",
                    base64Audio,
                    language: "en",
                }),
            });

            const data = await res.json();
            if (data.error) {
                showToast("Upload Failed", data.error, "error");
                return false;
            }
            console.log(data)

            setAnalysisResults(data);
            console.log("Debug data:", analysisResults)
            showToast("Success", "Audio uploaded successfully", "success");
            return true;
        } catch (error) {
            console.error("Upload error:", error);
            showToast("Upload Failed", "An unexpected error occurred", "error");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [audioData, blobToBase64, showToast]);

    const [audio, setAudio] = useState()
    const getAudioFromText = async () => {
        try {
            const res = await fetch('https://107.114.184.16:3000/getAudioFromText', {
                method: "POST",
                headers: "application/json",
                body: {
                    value: text?.real_transcript[0] || "Hello"
                }
            })

            const data = res.json()
            if (data.error) {
                showToast('Error', data.error, 'error')
                return false
            }
            console.log("Get Audio data: ", data)

            setAudio(data)
            return true
        } catch (error) {
            console.log(error)
            showToast('Error', error, 'error')
            return false
        }

    }
    const startRecording = useCallback(async (stageIndex) => {
        try {
            audioChunksRef.current = [];
            if (!streamRef.current || streamRef.current.getTracks().every(track => !track.enabled)) {
                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log("New media stream acquired");
            }

            const mediaRecorder = new MediaRecorder(streamRef.current);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                if (audioChunksRef.current.length === 0) {
                    showToast("Error", "No audio data recorded", "error");
                    return;
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                if (audioBlob.size < 100) {
                    showToast("Error", "Recorded audio is too short or invalid", "error");
                    return;
                }

                const url = URL.createObjectURL(audioBlob);
                const key = stageIndex === 2 ? "micSetup" : "speakingTest";

                setAudioData(prev => ({
                    ...prev,
                    [key]: { blob: audioBlob, url }
                }));

                showToast("Success", "Recording saved", "success");
            };

            mediaRecorder.start(100);
            setRecording(true);
            showToast("Info", "Recording started", "info");

            // Auto-stop after 2 minutes
            setTimeout(() => {
                if (recording) stopRecording();
            }, 120000);
        } catch (err) {
            console.error("Recording error:", err);
            showToast("Error", "Microphone access denied", "error");
            setRecording(false);
        }
    }, [recording, showToast]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setRecording(false);
            console.log("Recording stopped");
        }
    }, []);

    const downloadAudio = useCallback(() => {
        const speakingTestData = audioData["speakingTest"];
        if (speakingTestData?.url) {
            const link = document.createElement("a");
            link.href = speakingTestData.url;
            link.download = "speaking_test_audio.webm";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            showToast("Error", "No audio available to download", "error");
        }
    }, [audioData, showToast]);

    const handleNext = async () => {
        if (stage === 1) {
            const success = await getSample()
            if (!success) return;
        }
        if (stage === 3) {
            const success = await sendAudioToFlask();
            if (!success) return;
        }
        if (stage < stages.length - 1) {
            setStage(stage + 1);
        }


    };

    const handleBack = () => {
        if (stage > 0) {
            // Don't clean up audio data when going back
            console.log("Navigating back to stage:", stage - 1, "Current audioData:", audioData);
            setStage(stage - 1);
        }
    };

    const resetSurvey = useCallback(() => {
        setStage(3);
        setFormData({});
        setAudioData(prev => {
            Object.entries(prev).forEach(([key, { url }]) => {
                if (url) {
                    console.log(`Revoking URL for ${key} on reset:`, url);
                    URL.revokeObjectURL(url);
                }
            });
            return {};
        });
        setRecording(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            console.log("Cleaned up media stream on reset");
        }
        getSample()
    }, []);

    const renderCurrentStage = () => {
        console.log("Rendering stage:", stage, "audioData:", audioData);
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
                        audioUrl={audioData["micSetup"]?.url}
                        micAccess={micAccess}
                    />
                );
            case 3:
                return (
                    <SpeakingTest
                        recording={recording}
                        startRecording={() => startRecording(3)}
                        stopRecording={stopRecording}
                        audioUrl={audioData["speakingTest"]?.url}
                        downloadAudio={downloadAudio}
                        text={text}
                        audio={audio}
                    />
                );
            case 4:
                return <CompletionScreen
                    resetSurvey={resetSurvey}
                    formData={formData}
                    audioData={audioData}
                    accuracyResult={analysisResults}
                />
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
                    <Heading size="xl" fontWeight="bold" color={isLight ? "blue.600" : "blue.300"}>
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
                            isLoading={isSubmitting}
                            loadingText="Submitting..."
                            isDisabled={
                                isSubmitting || // Disable khi đang loading
                                (stage === 0 && (!formData.name || !formData.ageGroup)) ||
                                (stage === 1 &&
                                    (!formData.englishLevel ||
                                        (formData.englishLevel === "beginner" && !formData.supportNeeded) ||
                                        (formData.englishLevel === "advanced" && !formData.certificationPrep))) ||
                                (stage === 2 && !audioData["micSetup"]?.url) ||
                                (stage === 3 && !audioData["speakingTest"]?.url)
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