import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    Text,
    useToast,
    VStack,
    HStack,
    IconButton,
    Spinner,
    Progress,
    Alert,
    AlertIcon,
    useColorModeValue
} from '@chakra-ui/react';
import { keyframes } from '@chakra-ui/system';  // Correct import for keyframes
import { FaMicrophone, FaStop, FaPlay, FaUpload, FaKeyboard } from 'react-icons/fa';
import { MdSend } from 'react-icons/md';

// Animation for the sound wave
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const waveAnimation = keyframes`
  0% { height: 10px; }
  50% { height: 30px; }
  100% { height: 10px; }
`;


const TestPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [response, setResponse] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [socketStatus, setSocketStatus] = useState('disconnected');
    const [inputText, setInputText] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const socketRef = useRef(null);
    const toast = useToast();
    const animation = `${pulse} 2s infinite`;
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const ringColor = useColorModeValue('blue.500', 'blue.200');

    // Initialize WebSocket connection
    useEffect(() => {
        const connectWebSocket = () => {
            // Replace with your ngrok URL
            const wsUrl = 'wss://d2c4-34-55-196-65.ngrok-free.app/ws';

            socketRef.current = new WebSocket(wsUrl);

            socketRef.current.onopen = () => {
                setSocketStatus('connected');
                toast({
                    title: 'Connected to server',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right'
                });
            };

            socketRef.current.onclose = () => {
                setSocketStatus('disconnected');
                toast({
                    title: 'Disconnected from server',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right'
                });

                // Attempt to reconnect after 5 seconds
                setTimeout(connectWebSocket, 5000);
            };

            socketRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                toast({
                    title: 'WebSocket error',
                    description: error.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: 'top-right'
                });
            };

            socketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'transcription':
                        setTranscription(data.text);
                        setProgress(33);
                        break;
                    case 'response':
                        setResponse(data.text);
                        setProgress(66);
                        break;
                    case 'audio':
                        if (data.audioUrl) {
                            setAudioBlob(data.audioUrl);
                            setProgress(100);
                            setIsProcessing(false);

                            // Play the audio automatically
                            setTimeout(() => {
                                if (audioRef.current) {
                                    audioRef.current.play();
                                }
                            }, 500);
                        }
                        break;
                    case 'progress':
                        setProgress(data.value);
                        break;
                    case 'error':
                        toast({
                            title: 'Processing error',
                            description: data.message,
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                            position: 'top-right'
                        });
                        setIsProcessing(false);
                        break;
                    default:
                        console.log('Unknown message type:', data.type);
                }
            };
        };

        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [toast]);

    // Handle audio playback events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsSpeaking(true);
        const handleEnded = () => setIsSpeaking(false);
        const handlePause = () => setIsSpeaking(false);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('pause', handlePause);
        };
    }, [audioBlob]);

    // Start recording audio
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const audioChunks = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                setAudioBlob(URL.createObjectURL(audioBlob));
                handleSendAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            toast({
                title: 'Recording started',
                status: 'info',
                duration: 2000,
                isClosable: true,
                position: 'top-right'
            });
        } catch (error) {
            console.error('Error starting recording:', error);
            toast({
                title: 'Recording error',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right'
            });
        }
    };

    // Stop recording audio
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            toast({
                title: 'Recording stopped',
                status: 'info',
                duration: 2000,
                isClosable: true,
                position: 'top-right'
            });
        }
    };

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('audio.*')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload an audio file',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right'
            });
            return;
        }

        setAudioBlob(URL.createObjectURL(file));
        handleSendAudio(file);
    };

    // Send audio to server via WebSocket
    const handleSendAudio = (audioBlob) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            toast({
                title: 'Not connected to server',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right'
            });
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setTranscription('');
        setResponse('');

        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            socketRef.current.send(arrayBuffer);
        };
        reader.readAsArrayBuffer(audioBlob);
    };

    // Send text input to server
    const handleSendText = () => {
        if (!inputText.trim()) return;

        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            toast({
                title: 'Not connected to server',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right'
            });
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setTranscription(inputText);
        setResponse('');

        socketRef.current.send(JSON.stringify({
            type: 'text',
            text: inputText
        }));

        setInputText('');
        setShowTextInput(false);
    };

    // Create animated sound waves
    const SoundWaves = () => (
        <HStack spacing={1} align="center" height="40px">
            {[...Array(5)].map((_, i) => (
                <Box
                    key={i}
                    width="4px"
                    height="10px"
                    bg={ringColor}
                    borderRadius="full"
                    animation={`${waveAnimation} ${0.5 + i * 0.1}s infinite`}
                />
            ))}
        </HStack>
    );

    return (
        <Box
            p={6}
            maxW="500px"
            mx="auto"
            minH="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
        >
            {/* Connection status - subtle indicator */}
            <Box position="absolute" top={4} right={4}>
                <Box
                    w="12px"
                    h="12px"
                    borderRadius="full"
                    bg={socketStatus === 'connected' ? 'green.500' : 'red.500'}
                    boxShadow={`0 0 8px ${socketStatus === 'connected' ? 'green.500' : 'red.500'}`}
                />
            </Box>

            <VStack spacing={8} align="center" w="full">
                {/* Main voice assistant circle */}
                <Box
                    position="relative"
                    w="250px"
                    h="250px"
                    borderRadius="full"
                    bg={bgColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="xl"
                    border={`4px solid ${ringColor}`}
                    animation={isRecording || isSpeaking ? animation : undefined}
                    transition="all 0.3s ease"
                    _hover={{
                        transform: 'scale(1.02)',
                        boxShadow: '2xl'
                    }}
                >
                    {/* Center microphone or stop button */}
                    <IconButton
                        isRound
                        size="lg"
                        icon={isRecording ? <FaStop /> : <FaMicrophone />}
                        colorScheme={isRecording ? 'red' : 'blue'}
                        onClick={isRecording ? stopRecording : startRecording}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        isDisabled={isProcessing}
                        boxShadow="md"
                        position="absolute"
                        zIndex={2}
                        fontSize="24px"
                    />

                    {/* Sound waves animation when recording or speaking */}
                    {(isRecording || isSpeaking) && (
                        <Box position="absolute" bottom="20%">
                            <SoundWaves />
                        </Box>
                    )}

                    {/* Progress ring when processing */}
                    {isProcessing && (
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            borderRadius="full"
                            border="4px solid"
                            borderColor="transparent"
                            borderTopColor="blue.500"
                            style={{
                                transform: 'rotate(0deg)',
                                animation: 'spin 1s linear infinite'
                            }}
                        />
                    )}
                </Box>

                {/* Secondary controls */}
                <HStack spacing={4}>
                    <IconButton
                        icon={<FaKeyboard />}
                        aria-label="Text input"
                        onClick={() => setShowTextInput(!showTextInput)}
                        colorScheme="gray"
                        isRound
                    />
                    <Button
                        leftIcon={<FaUpload />}
                        as="label"
                        htmlFor="audio-upload"
                        cursor="pointer"
                        isDisabled={isProcessing}
                        variant="outline"
                        rounded="full"
                    >
                        Upload
                        <Input
                            type="file"
                            id="audio-upload"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            display="none"
                        />
                    </Button>
                </HStack>

                {/* Text input that slides in */}
                {showTextInput && (
                    <Box
                        w="full"
                        p={4}
                        bg="white"
                        borderRadius="lg"
                        boxShadow="md"
                        transition="all 0.3s ease"
                    >
                        <HStack>
                            <Input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type your message..."
                                isDisabled={isProcessing}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                                autoFocus
                            />
                            <IconButton
                                icon={<MdSend />}
                                colorScheme="blue"
                                onClick={handleSendText}
                                isDisabled={!inputText.trim() || isProcessing}
                                aria-label="Send text"
                            />
                        </HStack>
                    </Box>
                )}

                {/* Transcription and response */}
                <VStack spacing={4} w="full" maxH="300px" overflowY="auto" px={4}>
                    {transcription && (
                        <Box
                            w="full"
                            p={4}
                            bg="blue.50"
                            borderRadius="lg"
                            boxShadow="sm"
                            alignSelf="flex-start"
                        >
                            <Text fontWeight="bold" color="blue.800">You:</Text>
                            <Text>{transcription}</Text>
                        </Box>
                    )}

                    {response && (
                        <Box
                            w="full"
                            p={4}
                            bg="gray.100"
                            borderRadius="lg"
                            boxShadow="sm"
                            alignSelf="flex-end"
                        >
                            <Text fontWeight="bold" color="gray.800">Assistant:</Text>
                            <Text>{response}</Text>
                        </Box>
                    )}

                    {audioBlob && !showTextInput && (
                        <Box w="full" mt={2}>
                            <audio
                                ref={audioRef}
                                src={audioBlob}
                                controls
                                style={{ width: '100%', borderRadius: '9999px' }}
                            />
                        </Box>
                    )}
                </VStack>

                {/* Processing indicator */}
                {isProcessing && (
                    <Box w="full" px={4}>
                        <Progress
                            value={progress}
                            size="sm"
                            colorScheme="blue"
                            hasStripe
                            isAnimated
                            borderRadius="full"
                        />
                        <Text textAlign="center" mt={2} fontSize="sm" color="gray.500">
                            Processing... {progress}%
                        </Text>
                    </Box>
                )}
            </VStack>

            {/* Hidden audio element */}
            <audio ref={audioRef} src={audioBlob} />
        </Box>
    );
};

export default TestPage;