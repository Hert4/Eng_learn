import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    VStack,
    Heading,
    Text,
    Input,
    RadioGroup,
    Radio,
    Stack,
    useColorMode,
    Flex,
    useToast,
    IconButton,
    Progress,
    Card,
    CardBody,
    FormControl,
    FormLabel,
    Textarea,
    Tooltip,
    HStack,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Check, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

const MotionBox = motion(Box);

const stages = [
    { title: "Personal Information", progress: 20 },
    { title: "Language Background", progress: 40 },
    { title: "Microphone Setup", progress: 60 },
    { title: "Speaking Test", progress: 80 },
    { title: "Completion", progress: 100 },
];

const questions = {
    personal: [
        {
            id: "name",
            label: "What's your name?",
            type: "text",
            placeholder: "Enter your full name",
        },
        {
            id: "ageGroup",
            label: "Which age group do you belong to?",
            type: "radio",
            options: [
                { value: "under18", label: "Under 18" },
                { value: "18to35", label: "18-35" },
                { value: "36to60", label: "36-60" },
                { value: "60plus", label: "60+" },
            ],
        },
    ],
    language: [
        {
            id: "englishLevel",
            label: "How would you describe your English proficiency?",
            type: "radio",
            options: [
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
            ],
        },
        {
            id: "supportNeeded",
            label: "What kind of support do you need with English?",
            type: "textarea",
            placeholder: "e.g., grammar help, speaking practice...",
            showIf: (formData) => formData.englishLevel === "beginner",
        },
        {
            id: "certificationPrep",
            label: "Are you preparing for any certifications?",
            type: "radio",
            options: [
                { value: "ielts", label: "IELTS" },
                { value: "toefl", label: "TOEFL" },
                { value: "none", label: "None" },
            ],
            showIf: (formData) => formData.englishLevel === "advanced",
        },
        {
            id: "learningGoals",
            label: "What are your main goals for learning English?",
            type: "textarea",
            placeholder: "e.g., Travel, Work, Study abroad...",
        },
    ],
    speakingTest: [
        {
            id: "topic",
            label: "Tell us about your favorite hobby or activity",
            description:
                "You'll have 2 minutes to speak about this topic. Think about why you enjoy it, how often you do it, and any memorable experiences.",
        },
    ],
};

const SurveyPage = () => {
    const [stage, setStage] = useState(0);
    const [formData, setFormData] = useState({});
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isAudioLoaded, setIsAudioLoaded] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioRef = useRef(null);
    const wavesurferRef = useRef(null);
    const waveformRef = useRef(null);
    const { colorMode } = useColorMode();
    const toast = useToast();
    const [micAccess, setMicAccess] = useState(false);
    const isLight = colorMode === "light";
    const audioChunksRef = useRef([]);

    // Initialize WaveSurfer
    useEffect(() => {
        if (waveformRef.current && !wavesurferRef.current && audioUrl) {
            console.log("Initializing WaveSurfer with container:", waveformRef.current);
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: isLight ? "#4299E1" : "#90CDF4",
                progressColor: isLight ? "#3182CE" : "#63B3ED",
                cursorColor: "#718096",
                barWidth: 2,
                barRadius: 3,
                cursorWidth: 1,
                height: 80,
                barGap: 2,
                responsive: true,
            });

            wavesurferRef.current.on("load", () => {
                console.log("WaveSurfer loading audio:", audioUrl);
            });

            wavesurferRef.current.on("ready", () => {
                setDuration(wavesurferRef.current.getDuration());
                setIsAudioLoaded(true);
                console.log("WaveSurfer ready, duration:", wavesurferRef.current.getDuration());
            });

            wavesurferRef.current.on("audioprocess", (time) => {
                setCurrentTime(time);
                console.log("WaveSurfer audioprocess, currentTime:", time);
            });

            wavesurferRef.current.on("play", () => {
                setIsPlaying(true);
                console.log("WaveSurfer playing");
            });

            wavesurferRef.current.on("pause", () => {
                setIsPlaying(false);
                console.log("WaveSurfer paused");
            });

            wavesurferRef.current.on("finish", () => {
                setIsPlaying(false);
                console.log("WaveSurfer finished");
            });

            wavesurferRef.current.on("error", (err) => {
                console.error("WaveSurfer error:", err);
                setIsAudioLoaded(false);
                toast({
                    title: "Error",
                    description: "Failed to load audio waveform",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });

            // Load audio
            console.log("Loading audio into WaveSurfer:", audioUrl);
            wavesurferRef.current.load(audioUrl);
        }

        return () => {
            if (wavesurferRef.current) {
                console.log("Destroying WaveSurfer");
                wavesurferRef.current.destroy();
                wavesurferRef.current = null;
            }
        };
    }, [isLight, audioUrl]);

    // Sync audio element with WaveSurfer
    useEffect(() => {
        if (audioRef.current && wavesurferRef.current) {
            audioRef.current.addEventListener("play", () => {
                if (!isPlaying) {
                    wavesurferRef.current.play();
                }
            });
            audioRef.current.addEventListener("pause", () => {
                if (isPlaying) {
                    wavesurferRef.current.pause();
                }
            });
            audioRef.current.addEventListener("timeupdate", () => {
                setCurrentTime(audioRef.current.currentTime);
            });
        }
    }, [isPlaying]);

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

    // Clean up blob URL
    useEffect(() => {
        return () => {
            if (audioUrl) {
                console.log("Revoking audio URL:", audioUrl);
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const startRecording = async () => {
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
                if (audioBlob.size === 0) {
                    toast({
                        title: "Error",
                        description: "Invalid audio data",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                const url = URL.createObjectURL(audioBlob);
                console.log("Audio URL:", url);
                setAudioBlob(audioBlob);
                setAudioUrl(url);
                stream.getTracks().forEach((track) => track.stop());
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
            toast({
                title: "Recording saved",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        }
    };

    const togglePlayback = () => {
        if (wavesurferRef.current && isAudioLoaded) {
            wavesurferRef.current.playPause();
            setIsPlaying(!isPlaying);
            console.log("Toggling WaveSurfer playback, isPlaying:", !isPlaying);
        } else {
            toast({
                title: "Error",
                description: "Audio waveform not loaded yet",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log("Playback failed, isAudioLoaded:", isAudioLoaded);
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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const renderCurrentStage = () => {
        switch (stage) {
            case 0: // Personal Information
                return (
                    <VStack spacing={6} align="stretch">
                        {questions.personal.map((question) => (
                            <FormControl
                                key={question.id}
                                borderBottom="1px"
                                borderColor="blackAlpha.800"
                                paddingBottom={4}
                            >
                                <FormLabel fontSize="lg" fontWeight="semibold" mb={3}>
                                    {question.label}
                                </FormLabel>
                                {question.type === "text" && (
                                    <Input
                                        placeholder={question.placeholder}
                                        value={formData[question.id] || ""}
                                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                                        size="lg"
                                        variant="filled"
                                    />
                                )}
                                {question.type === "radio" && (
                                    <RadioGroup
                                        value={formData[question.id] || ""}
                                        onChange={(value) => handleInputChange(question.id, value)}
                                    >
                                        <Stack direction="column" spacing={3}>
                                            {question.options.map((option) => (
                                                <Radio key={option.value} value={option.value} size="lg">
                                                    {option.label}
                                                </Radio>
                                            ))}
                                        </Stack>
                                    </RadioGroup>
                                )}
                            </FormControl>
                        ))}
                    </VStack>
                );

            case 1: // Language Background
                return (
                    <VStack spacing={6} align="stretch">
                        {questions.language
                            .filter((q) => !q.showIf || q.showIf(formData))
                            .map((question) => (
                                <FormControl key={question.id}>
                                    <FormLabel fontSize="lg" fontWeight="semibold" mb={3}>
                                        {question.label}
                                    </FormLabel>
                                    {question.type === "radio" ? (
                                        <RadioGroup
                                            value={formData[question.id] || ""}
                                            onChange={(value) => handleInputChange(question.id, value)}
                                        >
                                            <Stack direction="column" spacing={3}>
                                                {question.options.map((option) => (
                                                    <Radio key={option.value} value={option.value} size="lg">
                                                        {option.label}
                                                    </Radio>
                                                ))}
                                            </Stack>
                                        </RadioGroup>
                                    ) : (
                                        <Textarea
                                            placeholder={question.placeholder}
                                            value={formData[question.id] || ""}
                                            onChange={(e) => handleInputChange(question.id, e.target.value)}
                                            size="lg"
                                            variant="filled"
                                            minH="120px"
                                        />
                                    )}
                                </FormControl>
                            ))}
                    </VStack>
                );

            case 2: // Microphone Setup
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
                        {audioUrl && (
                            <Card w="full" variant="outline">
                                <CardBody>
                                    <VStack spacing={4}>
                                        <Box ref={waveformRef} w="full" minH="80px" />
                                        <audio ref={audioRef} src={audioUrl} />
                                        <HStack w="full" justify="space-between">
                                            <Text fontSize="sm" color="gray.500">
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </Text>
                                            <Button
                                                leftIcon={isPlaying ? <Volume2 /> : <Volume2 />}
                                                onClick={togglePlayback}
                                                size="sm"
                                                variant="ghost"
                                                isDisabled={!isAudioLoaded}
                                            >
                                                {isPlaying ? "Pause" : "Play"}
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                            Nói thử xem nào !!!
                        </Text>
                    </VStack>
                );

            case 3: // Speaking Test
                return (
                    <VStack spacing={8} align="stretch">
                        {questions.speakingTest.map((question) => (
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
                                        <Card w="full" variant="outline">
                                            <CardBody>
                                                <VStack spacing={4}>
                                                    <Box ref={waveformRef} w="full" minH="80px" />
                                                    <audio ref={audioRef} src={audioUrl} />
                                                    <HStack w="full" justify="space-between">
                                                        <Text fontSize="sm" color="gray.500">
                                                            {formatTime(currentTime)} /{" "}
                                                            {formatTime(duration)}
                                                        </Text>
                                                        <Button
                                                            leftIcon={
                                                                isPlaying ? <Volume2 /> : <Volume2 />
                                                            }
                                                            onClick={togglePlayback}
                                                            size="sm"
                                                            variant="ghost"
                                                            isDisabled={!isAudioLoaded}
                                                        >
                                                            {isPlaying ? "Pause" : "Play"}
                                                        </Button>
                                                    </HStack>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    )}
                                    <Text fontSize="sm" color="gray.500">
                                        You can record multiple times until you're satisfied with
                                        your response.
                                    </Text>
                                </VStack>
                            </Box>
                        ))}
                    </VStack>
                );

            case 4: // Completion
                return (
                    <VStack spacing={8} textAlign="center" py={8}>
                        <Box as={Check} size={80} color="#38A169" strokeWidth={2} mx="auto" />
                        <Heading size="lg">Test Submitted Successfully!</Heading>
                        <Text fontSize="lg" color="gray.500">
                            Thank you for completing the OPIC exercise test. Your results will
                            be reviewed shortly.
                        </Text>
                        <Button
                            colorScheme="blue"
                            size="lg"
                            mt={6}
                            onClick={() => {
                                setStage(0);
                                setFormData({});
                                setAudioUrl(null);
                                setAudioBlob(null);
                                setIsAudioLoaded(false);
                            }}
                        >
                            Start New Test
                        </Button>
                    </VStack>
                );

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
                                (stage === 2 && !audioUrl)
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