import {
    Box,
    Button,
    Heading,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@chakra-ui/system";
import React, { useEffect, useRef, useState } from "react";

// Keyframe for subtle pulsating glow
const glow = keyframes`
  0% { box-shadow: 0 0 10px rgba(66, 153, 225, 0.5); }
  50% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.8); }
  100% { box-shadow: 0 0 10px rgba(66, 153, 225, 0.5); }
`;

// Helper function to convert raw audio to WAV
async function createWavBlob(audioBlob, sampleRate = 16000) {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const wavBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
}

// Function to convert AudioBuffer to WAV (adds WAV headers)
function audioBufferToWav(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    let offset = 0;
    writeString(view, offset, 'RIFF'); offset += 4;
    view.setUint32(offset, 36 + audioBuffer.length * numChannels * 2, true); offset += 4;
    writeString(view, offset, 'WAVE'); offset += 4;
    writeString(view, offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * numChannels * 2, true); offset += 4;
    view.setUint16(offset, numChannels * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString(view, offset, 'data'); offset += 4;
    view.setUint32(offset, audioBuffer.length * numChannels * 2, true); offset += 4;

    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < audioBuffer.length; i++) {
        view.setInt16(offset, channelData[i] * 0x7FFF, true);
        offset += 2;
    }

    return buffer;
}

const TestPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [amplitude, setAmplitude] = useState(1);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const audioChunksRef = useRef([]);
    const animationFrameRef = useRef(null);
    const audioPlaybackRef = useRef(new Audio());

    // Initialize AudioContext and AnalyserNode
    useEffect(() => {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Real-time amplitude update for ball scaling
    useEffect(() => {
        const updateAmplitude = () => {
            if (!isPlaying || !analyserRef.current) {
                setAmplitude(1);
                return;
            }
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const scale = 1 + (average / 256) * 0.5;
            setAmplitude(scale);
            animationFrameRef.current = requestAnimationFrame(updateAmplitude);
        };

        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(updateAmplitude);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying]);

    // Start recording audio
    const startRecording = async () => {
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            recorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorderRef.current.onstop = sendAudio;
            recorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    // Stop recording and send audio
    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stop();
            streamRef.current.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setIsLoading(true);
        }
    };

    // Send audio to backend and play response
    const sendAudio = async () => {
        try {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const wavBlob = await createWavBlob(blob, 16000);
            const formData = new FormData();
            formData.append('audio', wavBlob, 'audio.wav');

            const response = await fetch('https://ed30-35-231-49-229.ngrok-free.app/process_audio', {
                method: 'POST',
                body: formData,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                let errorMessage = 'Server error';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (error) {
                    errorMessage = `${response.status} ${response.statusText}`;
                    console.error("Error parsing error response:", error);

                }
                throw new Error(errorMessage);
            }

            const audioData = await response.blob();
            const audioUrl = URL.createObjectURL(audioData);
            audioPlaybackRef.current.src = audioUrl;
            audioPlaybackRef.current.play();

            // Connect audio to analyser for visualization
            if (audioContextRef.current.state === "suspended") {
                await audioContextRef.current.resume();
            }
            const source = audioContextRef.current.createMediaElementSource(audioPlaybackRef.current);
            source.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);

            setIsPlaying(true);
            audioPlaybackRef.current.onended = () => setIsPlaying(false);
        } catch (error) {
            console.error("Error processing audio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // iOS-like color scheme
    const bgGradient = useColorModeValue(
        "linear(to-b, blue.200, white)",
        "linear(to-b, gray.900, black)"
    );
    const cardBg = useColorModeValue("whiteAlpha.800", "blackAlpha.800");
    const textColor = useColorModeValue("gray.800", "white");

    return (
        <Box
            minH="100vh"
            bgGradient={bgGradient}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
            <VStack
                spacing={8}
                bg={cardBg}
                backdropFilter="blur(10px)"
                p={8}
                rounded="3xl"
                shadow="xl"
                maxW="375px"
                w="full"
                align="center"
                border="1px"
                borderColor={useColorModeValue("whiteAlpha.400", "whiteAlpha.200")}
                transition="all 0.3s ease"
            >
                <Heading
                    fontSize="xl"
                    fontWeight="600"
                    color={textColor}
                    textAlign="center"
                >
                    Real-time Audio Chat
                </Heading>

                {/* Pulsating Ball */}
                <Box
                    w="120px"
                    h="120px"
                    bgGradient="radial(blue.500, blue.700)"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    overflow="hidden"
                    transform={`scale(${amplitude})`}
                    transition="transform 0.05s ease"
                    animation={isPlaying || isRecording ? `${glow} 1.5s ease-in-out infinite` : "none"}
                >
                    <Box
                        position="absolute"
                        w="90px"
                        h="90px"
                        bg="whiteAlpha.400"
                        rounded="full"
                        animation={isPlaying || isRecording ? `${glow} 2s ease-in-out infinite` : "none"}
                    />
                </Box>

                <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    isLoading={isLoading}
                    loadingText="Processing..."
                    size="lg"
                    rounded="2xl"
                    bgGradient={
                        isRecording
                            ? "linear(to-r, red.500, orange.500)"
                            : "linear(to-r, blue.500, purple.500)"
                    }
                    color="white"
                    _hover={{
                        bgGradient: isRecording
                            ? "linear(to-r, red.600, orange.600)"
                            : "linear(to-r, blue.600, purple.600)",
                        transform: "scale(1.02)"
                    }}
                    _active={{ transform: "scale(0.98)" }}
                    fontWeight="500"
                    px={10}
                    py={7}
                    shadow="md"
                    transition="all 0.2s ease"
                >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
            </VStack>
        </Box>
    );
};

export default TestPage;