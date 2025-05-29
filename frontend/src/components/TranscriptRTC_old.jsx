
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Flex,
    Text,
    VStack,
    Spinner,
    useToast,
    Textarea,
    Container,
    Input,
} from '@chakra-ui/react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import AudioVisualize from './AudioVisualize';
import Live2DComponent from './live2dModel';

const VoiceAssistant = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [manualTranscript, setManualTranscript] = useState('');
    const [assistantResponse, setAssistantResponse] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [micPermission, setMicPermission] = useState('unknown');
    const wsRef = useRef(null);
    const recognitionRef = useRef(null);
    const toast = useToast();

    //set state stire data
    const [audioData, setAudioData] = useState(null);

    const wsUrl = 'https://107.114.184.16:8000/ws/assistant';

    useEffect(() => {
        checkMicPermission();
        if (!isConnected) {
            connectWebSocket();
            return
        }
        setupSpeechRecognition();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            stopRecording();
        };
    }, []);

    const checkMicPermission = async () => {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
            setMicPermission(permissionStatus.state);
            permissionStatus.onchange = () => {
                setMicPermission(permissionStatus.state);
                if (permissionStatus.state === 'denied') {
                    toast({
                        title: 'Microphone Permission Denied',
                        description: 'Please enable microphone access in your browser settings.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            };
        } catch (error) {
            console.error('Error checking microphone permission:', error);
            setMicPermission('denied');
        }
    };

    const setupSpeechRecognition = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            toast({
                title: 'Speech Recognition Not Supported',
                description: 'Your browser does not support the Web Speech API. Try using Chrome or Edge.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPiece = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPiece;
                } else {
                    interimTranscript += transcriptPiece;
                }
            }

            setTranscript(finalTranscript + interimTranscript);
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                if (interimTranscript) {
                    wsRef.current.send(JSON.stringify({ transcript: interimTranscript, is_final: false }));
                }
                if (finalTranscript) {
                    wsRef.current.send(JSON.stringify({ transcript: finalTranscript, is_final: true }));
                }
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            toast({
                title: 'Speech Recognition Error',
                description: `Error: ${event.error}. Please try again or check microphone settings.`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            if (event.error === 'no-speech' || event.error === 'aborted') {
                stopRecording();
            }
        };

        recognitionRef.current.onend = () => {
            if (isRecording) {
                console.log('Speech recognition ended unexpectedly, restarting...');
                recognitionRef.current.start();
            }
        };
    };

    const connectWebSocket = () => {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            setIsConnected(true);
            console.log('WebSocket connected');
            toast({
                title: 'Connected to server',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        };

        wsRef.current.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                if (data.error) {
                    toast({
                        title: 'Error',
                        description: data.error,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }

                if (data.type === 'transcript') {
                    setTranscript(data.transcript);
                    setIsProcessing(data.is_complete);
                } else if (data.type === 'assistant_response') {
                    setAssistantResponse(data.response);
                    if (data.audio) {
                        try {
                            setAudioData(data.audio)
                            const audioBlob = base64ToBlob(data.audio, 'audio/wav');
                            const audioUrl = URL.createObjectURL(audioBlob);
                            const audio = new Audio(audioUrl);
                            audio.play();
                            console.log('Playing assistant audio response');
                        } catch (error) {
                            console.error('Audio playback error:', error);
                            toast({
                                title: 'Audio Playback Error',
                                description: 'Failed to play assistant response.',
                                status: 'error',
                                duration: 5000,
                                isClosable: true,
                            });
                        }
                    }
                }
            } catch (error) {
                setAudioData(null)
                console.error('Error processing WebSocket message:', error);
            }
        };

        wsRef.current.onclose = () => {
            setIsConnected(false);
            console.log('WebSocket disconnected');
            toast({
                title: 'Disconnected from server',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            // setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        };
    };

    const base64ToBlob = (base64, mime) => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mime });
    };

    const startRecording = async () => {
        if (micPermission !== 'granted') {
            toast({
                title: 'Microphone Permission Required',
                description: 'Please allow microphone access to start recording.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (!recognitionRef.current) {
            toast({
                title: 'Speech Recognition Unavailable',
                description: 'Speech recognition is not supported in this browser.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            recognitionRef.current.start();
            setIsRecording(true);
            console.log('Recording started');
            toast({
                title: 'Recording started',
                status: 'info',
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error starting recording:', error);
            toast({
                title: 'Recording Error',
                description: 'Failed to start speech recognition. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        setIsProcessing(false);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ transcript: '', is_final: true }));
        }
        console.log('Recording stopped');
    };

    const handleManualSubmit = () => {
        if (manualTranscript.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ transcript: manualTranscript, is_final: true }));
            setManualTranscript('');
            console.log('Manual transcript sent:', manualTranscript);
        }
    };

    return (
        <Container maxW="container.md" py={8}>
            <AudioVisualize audioData={audioData} />
            {/* <Live2DComponent /> */}

            <VStack spacing={4} align="stretch" >
                <Text fontSize="2xl" fontWeight="bold">Voice Assistant</Text>
                <Flex justify="space-between" align="center">
                    <Button
                        leftIcon={isRecording ? <FaStop /> : <FaMicrophone />}
                        colorScheme={isRecording ? 'red' : 'teal'}
                        onClick={isRecording ? stopRecording : startRecording}
                        isDisabled={!isConnected || micPermission !== 'granted'}
                    >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    <Text color={isConnected ? 'green.500' : 'red.500'}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </Text>
                </Flex>
                {micPermission === 'denied' && (
                    <Text color="red.500">Microphone access denied. Please enable in browser settings.</Text>
                )}
                {micPermission === 'unknown' && (
                    <Text color="yellow.500">Checking microphone permission...</Text>
                )}
                {isProcessing && (
                    <Flex align="center">
                        <Spinner size="sm" mr={2} />
                        <Text>Processing...</Text>
                    </Flex>
                )}
                <Box>
                    <Text fontWeight="semibold">Transcript:</Text>
                    <Textarea
                        value={transcript}
                        readOnly
                        placeholder="Your speech will appear here..."
                        minH="100px"
                    />
                </Box>
                <Box>
                    <Text fontWeight="semibold">Assistant Response:</Text>
                    <Textarea
                        value={assistantResponse}
                        readOnly
                        placeholder="Assistant response will appear here..."
                        minH="100px"
                    />
                </Box>
                <Box>
                    <Text fontWeight="semibold">Manual Input (for testing):</Text>
                    <Flex>
                        <Input
                            value={manualTranscript}
                            onChange={(e) => setManualTranscript(e.target.value)}
                            placeholder="Type a message to test..."
                            mr={2}
                        />
                        <Button onClick={handleManualSubmit} colorScheme="teal" isDisabled={!isConnected}>
                            Send
                        </Button>
                    </Flex>
                </Box>
            </VStack>
        </Container>
    );
};

export default VoiceAssistant;