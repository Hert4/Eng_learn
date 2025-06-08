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
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const VoiceAssistant = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [manualTranscript, setManualTranscript] = useState('');
    const [assistantResponse, setAssistantResponse] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [micPermission, setMicPermission] = useState('unknown');
    const recognitionRef = useRef(null);
    const toast = useToast();
    const [audioData, setAudioData] = useState(null);
    const peerConnectionRef = useRef(null);
    const dataChannelRef = useRef(null);
    const audioContextRef = useRef(null);

    // Configuration for WebRTC
    const config = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ]
    };

    useEffect(() => {
        checkMicPermission();
        setupSpeechRecognition();
        initializeWebRTC();

        return () => {
            stopRecording();
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const initializeWebRTC = async () => {
        try {
            // Create peer connection
            peerConnectionRef.current = new RTCPeerConnection(config);

            // Set up data channel for text communication
            dataChannelRef.current = peerConnectionRef.current.createDataChannel('assistantData');

            // Set up event handlers
            peerConnectionRef.current.onicecandidate = handleICECandidate;
            peerConnectionRef.current.onconnectionstatechange = handleConnectionStateChange;
            dataChannelRef.current.onopen = handleDataChannelOpen;
            dataChannelRef.current.onclose = handleDataChannelClose;
            dataChannelRef.current.onmessage = handleDataChannelMessage;

            // Create offer and send to signaling server
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            // In a real app, you would send the offer to your signaling server
            // For this example, we'll simulate the answer creation
            simulateSignaling(offer);

        } catch (error) {
            console.error('WebRTC initialization error:', error);
            toast({
                title: 'Connection Error',
                description: 'Failed to initialize voice connection',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const simulateSignaling = async (offer) => {
        // In a real app, you would send the offer to your signaling server
        // and receive an answer from the backend. Here we simulate that process.

        // Create a fake remote peer connection
        const remotePeer = new RTCPeerConnection(config);
        remotePeer.ondatachannel = (event) => {
            const remoteChannel = event.channel;
            remoteChannel.onmessage = (e) => {
                // Simulate backend processing
                const data = JSON.parse(e.data);
                if (data.type === 'transcript') {
                    // Simulate AI response
                    setTimeout(() => {
                        const response = {
                            type: 'assistant_response',
                            response: `This is a simulated response to: "${data.transcript}"`,
                            audio: null // In real app, this would be base64 audio
                        };
                        remoteChannel.send(JSON.stringify(response));
                    }, 1000);
                }
            };
        };

        await remotePeer.setRemoteDescription(offer);
        const answer = await remotePeer.createAnswer();
        await remotePeer.setLocalDescription(answer);

        // Simulate receiving the answer
        await peerConnectionRef.current.setRemoteDescription(answer);
    };

    const handleICECandidate = (event) => {
        if (event.candidate) {
            // Send ICE candidate to signaling server
            console.log('ICE candidate:', event.candidate);
        }
    };

    const handleConnectionStateChange = () => {
        const connectionState = peerConnectionRef.current.connectionState;
        console.log('Connection state:', connectionState);

        if (connectionState === 'connected') {
            setIsConnected(true);
            toast({
                title: 'Connected to assistant',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } else if (connectionState === 'disconnected' || connectionState === 'failed') {
            setIsConnected(false);
            toast({
                title: 'Disconnected from assistant',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDataChannelOpen = () => {
        console.log('Data channel opened');
        setIsConnected(true);
    };

    const handleDataChannelClose = () => {
        console.log('Data channel closed');
        setIsConnected(false);
    };

    const handleDataChannelMessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);

            if (data.type === 'assistant_response') {
                setAssistantResponse(data.response);
                if (data.audio) {
                    setAudioData(data.audio);
                    playAudio(data.audio);
                }
            } else if (data.type === 'processing') {
                setIsProcessing(data.is_processing);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    };

    const playAudio = (base64Audio) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webAudioContext)();
        }

        const audioBlob = base64ToBlob(base64Audio, 'audio/wav');
        const audioUrl = URL.createObjectURL(audioBlob);

        fetch(audioUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
            })
            .catch(error => {
                console.error('Audio playback error:', error);
                toast({
                    title: 'Audio Playback Error',
                    description: 'Failed to play assistant response.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            });
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

            // Send transcript via WebRTC data channel
            if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
                if (interimTranscript) {
                    dataChannelRef.current.send(
                        JSON.stringify({
                            type: 'transcript',
                            transcript: interimTranscript,
                            is_final: false
                        })
                    );
                }
                if (finalTranscript) {
                    dataChannelRef.current.send(
                        JSON.stringify({
                            type: 'transcript',
                            transcript: finalTranscript,
                            is_final: true
                        })
                    );
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
        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
            dataChannelRef.current.send(
                JSON.stringify({
                    type: 'transcript',
                    transcript: '',
                    is_final: true
                })
            );
        }
        toast({
            title: "Recording Ended",
            status: 'warning',
            duration: 3000,
            isClosable: true,
        });
        console.log('Recording stopped');
    };

    const handleManualSubmit = () => {
        if (manualTranscript.trim() && dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
            dataChannelRef.current.send(
                JSON.stringify({
                    type: 'transcript',
                    transcript: manualTranscript,
                    is_final: true
                })
            );
            setManualTranscript('');
            console.log('Manual transcript sent:', manualTranscript);
        }
    };

    return (
        <Container
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            centerContent
            maxW="container.lg"
            py={{ base: 16, md: 24 }}
            px={{ base: 2, md: 4 }}
        >
            <VStack
                spacing={4}
                align='stretch'
                direction={'column'}
                width={{ base: '2xl', lg: '4xl' }}
            >
                <MotionBox
                    align='center'
                    my={4}
                    p={32}
                    borderWidth={'1px'}
                    transition={{ duration: 0.4 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 11, y: 0 }}
                    borderRadius={'2xl'}
                    backdropBlur={"blur(20px"}
                    border={'12px'}
                    aspectRatio={1}
                >
                    <AudioVisualize
                        audioData={audioData}
                        isRecording={isRecording}
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                    />
                </MotionBox>

                <Flex
                    justify="space-between"
                    align="center"
                    direction={'column'}
                >
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
                    <Text color={isConnected ? 'green.500' : 'red.500'} py={4}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </Text>
                </Flex>

                <Box>
                    <Textarea
                        textAlign={'center'}
                        border={'none'}
                        value={transcript}
                        readOnly
                        placeholder="Your speech will appear here..."
                    />
                </Box>
                <Box>
                    <Textarea
                        textAlign={'center'}
                        border={'none'}
                        value={assistantResponse}
                        readOnly
                        placeholder="Assistant response appear here..."
                    />
                </Box>
                <Box>
                    <Text fontWeight="semibold">Manual Input (for testing):</Text>
                    <Flex >
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