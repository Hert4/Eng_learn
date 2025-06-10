import React, { useState, useEffect, useRef } from 'react';
import { useMicVAD } from '@ricky0123/vad-react';
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
    Progress,
    Alert,
    AlertIcon,
    useColorModeValue
} from '@chakra-ui/react';
import { keyframes } from '@chakra-ui/system';
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [progress, setProgress] = useState(0);
    const [transcription, setTranscription] = useState('');
    const [response, setResponse] = useState('');
    const [socketStatus, setSocketStatus] = useState('disconnected');
    const [inputText, setInputText] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);

    const audioRef = useRef(null);
    const socketRef = useRef(null);
    const toast = useToast();
    const animation = `${pulse} 2s infinite`;
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const ringColor = useColorModeValue('blue.500', 'blue.200');

    // Initialize WebSocket connection
    useEffect(() => {
        const connectWebSocket = () => {
            const wsUrl = 'wss://f83c-34-45-118-241.ngrok-free.app/ws';
            socketRef.current = new WebSocket(wsUrl);

            socketRef.current.onopen = () => {
                setSocketStatus('connected');
                toast({
                    title: 'Đã kết nối với server',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right'
                });
            };

            socketRef.current.onclose = () => {
                setSocketStatus('disconnected');
                toast({
                    title: 'Mất kết nối với server',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right'
                });
                setTimeout(connectWebSocket, 5000);
            };

            socketRef.current.onerror = (error) => {
                console.error('Lỗi WebSocket:', error);
                toast({
                    title: 'Lỗi WebSocket',
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
                            title: 'Lỗi xử lý',
                            description: data.message,
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                            position: 'top-right'
                        });
                        setIsProcessing(false);
                        break;
                    default:
                        console.log('Loại tin nhắn không xác định:', data.type);
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

    // Use VAD for automatic speech detection
    const vad = useMicVAD({
        startOnLoad: false,
        onSpeechEnd: (audio) => {
            const wavBuffer = floatToWav(audio);
            setIsProcessing(true);
            setProgress(0);
            setTranscription('');
            setResponse('');
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(wavBuffer);
            } else {
                toast({
                    title: 'Không kết nối với server',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right'
                });
                setIsProcessing(false);
            }
        },
        onSpeechStart: () => {
            toast({
                title: 'Bắt đầu nói',
                status: 'info',
                duration: 2000,
                isClosable: true,
                position: 'top-right'
            });
        },
    });

    // Control VAD based on processing and speaking states
    useEffect(() => {
        if (vad.loading) return;
        if (isProcessing || isSpeaking) {
            vad.pause();
        } else {
            vad.start();
        }
    }, [vad.loading, isProcessing, isSpeaking, vad]);

    // Helper function to convert Float32Array to WAV ArrayBuffer
    const floatToWav = (floatArray, numChannels = 1, sampleRate = 16000) => {
        const bytesPerSample = 2;
        const blockAlign = numChannels * bytesPerSample;
        const buffer = new ArrayBuffer(44 + floatArray.length * bytesPerSample);
        const view = new DataView(buffer);

        // WAV header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + floatArray.length * bytesPerSample, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bytesPerSample * 8, true);
        writeString(view, 36, 'data');
        view.setUint32(40, floatArray.length * bytesPerSample, true);

        // Convert Float32Array to Int16Array
        const int16Array = new Int16Array(floatArray.length);
        for (let i = 0; i < floatArray.length; i++) {
            int16Array[i] = Math.max(-32768, Math.min(32767, floatArray[i] * 32767));
        }

        // Copy data to buffer
        new Int16Array(buffer, 44, floatArray.length).set(int16Array);
        return buffer;
    };

    // Helper function to write string to DataView
    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('audio.*')) {
            toast({
                title: 'Loại tệp không hợp lệ',
                description: 'Vui lòng tải lên tệp âm thanh',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right'
            });
            return;
        }

        setAudioBlob(URL.createObjectURL(file));
        setIsProcessing(true);
        setProgress(0);
        setTranscription('');
        setResponse('');

        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            socketRef.current.send(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
    };

    // Send text input to server
    const handleSendText = () => {
        if (!inputText.trim()) return;

        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            toast({
                title: 'Không kết nối với server',
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
            {/* Connection status */}
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
                    animation={vad.listening || isSpeaking ? animation : undefined}
                    transition="all 0.3s ease"
                    _hover={{
                        transform: 'scale(1.02)',
                        boxShadow: '2xl'
                    }}
                >
                    {/* Center microphone or processing indicator */}
                    <IconButton
                        isRound
                        size="lg"
                        icon={vad.listening ? <FaMicrophone /> : <FaStop />}
                        colorScheme={vad.listening ? 'blue' : 'red'}
                        isDisabled={isProcessing}
                        boxShadow="md"
                        position="absolute"
                        zIndex={2}
                        fontSize="24px"
                    />

                    {/* Sound waves animation when listening or speaking */}
                    {(vad.listening || isSpeaking) && (
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
                        aria-label="Nhập văn bản"
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
                        Tải lên
                        <Input
                            type="file"
                            id="audio-upload"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            display="none"
                        />
                    </Button>
                </HStack>

                {/* Text input */}
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
                                placeholder="Nhập tin nhắn của bạn..."
                                isDisabled={isProcessing}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                                autoFocus
                            />
                            <IconButton
                                icon={<MdSend />}
                                colorScheme="blue"
                                onClick={handleSendText}
                                isDisabled={!inputText.trim() || isProcessing}
                                aria-label="Gửi văn bản"
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
                            <Text fontWeight="bold" color="blue.800">Bạn:</Text>
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
                            <Text fontWeight="bold" color="gray.800">Trợ lý:</Text>
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
                            Đang xử lý... {progress}%
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