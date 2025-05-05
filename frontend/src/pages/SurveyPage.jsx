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
    Avatar,
    HStack,
    Tooltip
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Check, ChevronLeft, ChevronRight, Upload, Volume2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

const MotionBox = motion(Box);

const stages = [
    { title: "Personal Information", progress: 20 },
    { title: "Language Background", progress: 40 },
    { title: "Microphone Setup", progress: 60 },
    { title: "Speaking Test", progress: 80 },
    { title: "Completion", progress: 100 }
];

const questions = {
    personal: [
        {
            id: "name",
            label: "What's your name?",
            type: "text",
            placeholder: "Enter your full name"
        },
        {
            id: "ageGroup",
            label: "Which age group do you belong to?",
            type: "radio",
            options: [
                { value: "under18", label: "Under 18" },
                { value: "18to35", label: "18-35" },
                { value: "36to60", label: "36-60" },
                { value: "60plus", label: "60+" }
            ]
        }
    ],
    language: [
        {
            id: "englishLevel",
            label: "How would you describe your English proficiency?",
            type: "radio",
            options: [
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" }
            ]
        },
        {
            id: "learningGoals",
            label: "What are your main goals for learning English?",
            type: "textarea",
            placeholder: "e.g., Travel, Work, Study abroad..."
        }
    ],
    speakingTest: [
        {
            id: "topic",
            label: "Tell us about your favorite hobby or activity",
            description: "You'll have 2 minutes to speak about this topic. Think about why you enjoy it, how often you do it, and any memorable experiences."
        }
    ]
};

const SurveyPage = () => {
    const [stage, setStage] = useState(0);
    const [formData, setFormData] = useState({});
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const audioRef = useRef(null);
    const wavesurferRef = useRef(null);
    const waveformRef = useRef(null);
    const { colorMode } = useColorMode();
    const toast = useToast();
    const [micAccess, setMicAccess] = useState(false);

    const isLight = colorMode === "light";

    // Initialize WaveSurfer
    useEffect(() => {
        if (waveformRef.current && !wavesurferRef.current) {
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: isLight ? '#4299E1' : '#90CDF4',
                progressColor: isLight ? '#3182CE' : '#63B3ED',
                cursorColor: '#718096',
                barWidth: 2,
                barRadius: 3,
                cursorWidth: 1,
                height: 80,
                barGap: 2,
                responsive: true
            });

            wavesurferRef.current.on('ready', () => {
                setDuration(wavesurferRef.current.getDuration());
            });

            wavesurferRef.current.on('audioprocess', () => {
                setCurrentTime(wavesurferRef.current.getCurrentTime());
            });

            wavesurferRef.current.on('finish', () => {
                setIsPlaying(false);
            });
        }

        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
                wavesurferRef.current = null;
            }
        };
    }, [isLight]);

    // Load audio when URL changes
    useEffect(() => {
        if (audioUrl && wavesurferRef.current) {
            wavesurferRef.current.load(audioUrl);
        }
    }, [audioUrl]);

    // Check microphone access
    useEffect(() => {
        const checkMicAccess = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setMicAccess(true);
            } catch (err) {
                setMicAccess(false);
            }
        };
        checkMicAccess();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            setAudioChunks([]);

            mediaRecorder.start(100); // Collect data every 100ms for smoother visualization

            mediaRecorder.addEventListener("dataavailable", (event) => {
                if (event.data.size > 0) {
                    setAudioChunks((prev) => [...prev, event.data]);
                }
            });

            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(audioUrl);
                stream.getTracks().forEach(track => track.stop());
            });

            setRecording(true);
            toast({
                title: "Recording started",
                description: "Speak clearly into your microphone",
                status: "info",
                duration: 2000,
                isClosable: true
            });
        } catch (err) {
            console.error("Recording error:", err);
            toast({
                title: "Microphone access denied",
                description: "Please allow microphone access to continue",
                status: "error",
                duration: 5000,
                isClosable: true
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state !== "inactive") {
            mediaRecorderRef.current?.stop();
            setRecording(false);
            toast({
                title: "Recording saved",
                status: "success",
                duration: 2000,
                isClosable: true
            });
        }
    };

    const togglePlayback = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
            setIsPlaying(!isPlaying);
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
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const renderCurrentStage = () => {
        switch (stage) {
            case 0: // Personal Information
                return (
                    <VStack spacing={6} align="stretch">
                        {questions.personal.map((question) => (
                            <FormControl key={question.id}>
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
                        {questions.language.map((question) => (
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
                            <Tooltip label={micAccess ? "Microphone ready" : "Microphone access required"} placement="top">
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
                            <Text color={recording ? "green.500" : "gray.500"} fontWeight="medium">
                                {recording ? "Recording..." : micAccess ? "Click to record" : "Microphone not available"}
                            </Text>
                        </Box>

                        {audioUrl && (
                            <Card w="full" variant="outline">
                                <CardBody>
                                    <VStack spacing={4}>
                                        <Box ref={waveformRef} w="full" />
                                        <HStack w="full" justify="space-between">
                                            <Text fontSize="sm" color="gray.500">
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </Text>
                                            <Button
                                                leftIcon={isPlaying ? <Volume2 /> : <Volume2 />}
                                                onClick={togglePlayback}
                                                size="sm"
                                                variant="ghost"
                                            >
                                                {isPlaying ? "Pause" : "Play"}
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}

                        <Text fontSize="sm" color="gray.500" textAlign="center">
                            Record a short test to ensure your microphone is working properly.
                            Speak a few sentences and play it back to verify the quality.
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
                                                    <Box ref={waveformRef} w="full" />
                                                    <HStack w="full" justify="space-between">
                                                        <Text fontSize="sm" color="gray.500">
                                                            {formatTime(currentTime)} / {formatTime(duration)}
                                                        </Text>
                                                        <Button
                                                            leftIcon={isPlaying ? <Volume2 /> : <Volume2 />}
                                                            onClick={togglePlayback}
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            {isPlaying ? "Pause" : "Play"}
                                                        </Button>
                                                    </HStack>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    )}

                                    <Text fontSize="sm" color="gray.500">
                                        You can record multiple times until you're satisfied with your response.
                                    </Text>
                                </VStack>
                            </Box>
                        ))}
                    </VStack>
                );

            case 4: // Completion
                return (
                    <VStack spacing={8} textAlign="center" py={8}>
                        <Box
                            as={Check}
                            size={80}
                            color="#38A169"
                            strokeWidth={2}
                            mx="auto"
                        />
                        <Heading size="lg">Test Submitted Successfully!</Heading>
                        <Text fontSize="lg" color="gray.500">
                            Thank you for completing the OPIC exercise test. Your results will be reviewed shortly.
                        </Text>
                        <Button
                            colorScheme="blue"
                            size="lg"
                            mt={6}
                            onClick={() => {
                                setStage(0);
                                setFormData({});
                                setAudioUrl(null);
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
                    <Text color="gray.500">
                        {stages[stage].title}
                    </Text>
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