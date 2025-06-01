import {
    Box,
    Button,
    Heading,
    Input,
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

const TestPage = () => {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [amplitude, setAmplitude] = useState(1); // Dynamic scale for ball
    const audioContextRef = useRef(null);
    const playTimeRef = useRef(0);
    const headerParsedRef = useRef(false);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const HEADER_SIZE = 44;

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
            const scale = 1 + (average / 256) * 0.5; // Adjusted for smoother scaling
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

    const handleGenerateAudio = async () => {
        if (!text) return;
        setIsLoading(true);
        setIsPlaying(true);
        headerParsedRef.current = false;
        playTimeRef.current = audioContextRef.current.currentTime;

        if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume();
        }

        try {
            const response = await fetch(
                "https://a503-34-41-50-147.ngrok-free.app/generate_audio",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                }
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch audio: ${response.status}`);
            }
            const reader = response.body.getReader();

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    setIsPlaying(false);
                    break;
                }
                if (value && value.byteLength > 0) {
                    let chunk = new Uint8Array(value);

                    if (!headerParsedRef.current) {
                        if (chunk.byteLength <= HEADER_SIZE) continue;
                        chunk = chunk.subarray(HEADER_SIZE);
                        headerParsedRef.current = true;
                    }

                    const sampleCount = chunk.byteLength / 2;
                    const float32Arr = new Float32Array(sampleCount);
                    for (let i = 0; i < sampleCount; i++) {
                        const lo = chunk[2 * i];
                        const hi = chunk[2 * i + 1];
                        let int16 = (hi << 8) | lo;
                        if (int16 & 0x8000) {
                            int16 = int16 - 0x10000;
                        }
                        float32Arr[i] = int16 / 32767;
                    }

                    const audioCtx = audioContextRef.current;
                    const sampleRate = 16000;
                    const audioBuffer = audioCtx.createBuffer(1, sampleCount, sampleRate);
                    audioBuffer.copyToChannel(float32Arr, 0);

                    const bufferSource = audioCtx.createBufferSource();
                    bufferSource.buffer = audioBuffer;
                    bufferSource.connect(analyserRef.current);
                    analyserRef.current.connect(audioCtx.destination);

                    playTimeRef.current = Math.max(
                        playTimeRef.current,
                        audioCtx.currentTime
                    );
                    bufferSource.start(playTimeRef.current);
                    playTimeRef.current += sampleCount / sampleRate;
                }
            }
        } catch (error) {
            console.error("Error generating/streaming audio:", error);
            setIsPlaying(false);
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
    const placeholderColor = useColorModeValue("gray.400", "gray.500");

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
                backdropFilter="blur(10px)" // Glassmorphism effect
                p={8}
                rounded="3xl"
                shadow="xl"
                maxW="375px" // iPhone-like width
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
                    Test TTS 0.1
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
                    animation={isPlaying ? `${glow} 1.5s ease-in-out infinite` : "none"}
                >
                    <Box
                        position="absolute"
                        w="90px"
                        h="90px"
                        bg="whiteAlpha.400"
                        rounded="full"
                        animation={isPlaying ? `${glow} 2s ease-in-out infinite` : "none"}
                    />
                </Box>

                <Input
                    placeholder="Nhập văn bản..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    size="lg"
                    rounded="2xl"
                    bg={useColorModeValue("whiteAlpha.600", "blackAlpha.600")}
                    border="none"
                    _focus={{
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.3)",
                        bg: useColorModeValue("whiteAlpha.800", "blackAlpha.800"),
                    }}
                    color={textColor}
                    _placeholder={{ color: placeholderColor }}
                    py={7}
                    transition="all 0.2s ease"
                />

                <Button
                    onClick={handleGenerateAudio}
                    isDisabled={!text || isLoading}
                    isLoading={isLoading}
                    loadingText="Đang tải..."
                    size="lg"
                    rounded="2xl"
                    bgGradient={
                        text && !isLoading
                            ? "linear(to-r, blue.500, purple.500)"
                            : "linear(to-r, gray.400, gray.600)"
                    }
                    color="white"
                    _hover={
                        text && !isLoading
                            ? { bgGradient: "linear(to-r, blue.600, purple.600)", transform: "scale(1.02)" }
                            : {}
                    }
                    _active={{ transform: "scale(0.98)" }}
                    fontWeight="500"
                    px={10}
                    py={7}
                    shadow="md"
                    transition="all 0.2s ease"
                >
                    Generate Audio
                </Button>
            </VStack>
        </Box>
    );
};

export default TestPage;