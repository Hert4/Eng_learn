import {
    Box,
    Button,
    Input,
    Text,
    VStack,
    HStack,
    useToast,
    extendTheme,
    ChakraProvider,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";

// Custom Chakra UI theme
const theme = extendTheme({
    styles: {
        global: {
            body: {
                bg: "gray.50",
                color: "gray.800",
            },
        },
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: "semibold",
                borderRadius: "md",
            },
        },
        Input: {
            baseStyle: {
                field: {
                    borderRadius: "md",
                    bg: "white",
                    borderColor: "gray.300",
                },
            },
        },
    },
});

const TestPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [eouProb, setEouProb] = useState(null);
    const [generatedText, setGeneratedText] = useState("");
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState(null);
    const toast = useToast();
    const mediaRecorder = useRef(null);
    const pc = useRef(null);
    const dataChannel = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.current.onstop = async () => {
                const blob = new Blob(chunks, { type: "audio/wav" });
                const arrayBuffer = await blob.arrayBuffer();
                if (dataChannel.current && dataChannel.current.readyState === "open") {
                    dataChannel.current.send(arrayBuffer);
                } else {
                    toast({
                        title: "WebRTC connection not established",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            };
            mediaRecorder.current.start();
            setIsRecording(true);
            toast({ title: "Recording started", status: "info", duration: 3000, isClosable: true });
        } catch (error) {
            setError(error.message);
            toast({
                title: "Error accessing microphone",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            toast({ title: "Recording stopped", status: "info", duration: 3000, isClosable: true });
        }
    };

    const sendText = () => {
        if (textInput && dataChannel.current && dataChannel.current.readyState === "open") {
            dataChannel.current.send(textInput);
            setTextInput("");
        } else {
            toast({
                title: "Cannot send text",
                description: "WebRTC connection not established or no text entered",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const setupWebRTC = async () => {
        try {
            pc.current = new RTCPeerConnection();
            dataChannel.current = pc.current.createDataChannel("data");
            dataChannel.current.onmessage = (event) => {
                if (typeof event.data === "string") {
                    const response = JSON.parse(event.data);
                    if (response.error) {
                        setError(response.error);
                        setEouProb(response.eou_prob ? response.eou_prob.toFixed(2) : null);
                        toast({
                            title: "Processing error",
                            description: response.error,
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    } else {
                        setEouProb(response.eou_prob.toFixed(2));
                        setGeneratedText(response.text);
                        setError(null);
                    }
                } else {
                    const blob = new Blob([event.data], { type: "audio/wav" });
                    setAudioUrl(URL.createObjectURL(blob));
                }
            };
            dataChannel.current.onopen = () => {
                console.log("Data channel opened");
            };
            dataChannel.current.onclose = () => {
                console.log("Data channel closed");
            };
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            const response = await fetch("http://localhost:8080/offer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
            });
            if (!response.ok) {
                throw new Error("Failed to establish WebRTC connection");
            }
            const answer = await response.json();
            await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            setError(error.message);
            toast({
                title: "WebRTC setup failed",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        setupWebRTC();
        return () => {
            if (pc.current) {
                pc.current.close();
                console.log("WebRTC connection closed");
            }
        };
    }, []);

    return (
        <ChakraProvider theme={theme}>
            <Box p={8} maxW="container.md" mx="auto" minH="100vh">
                <VStack spacing={6} align="stretch">
                    <Text fontSize="3xl" fontWeight="bold" textAlign="center" color="blue.600">
                        Speech and Text Processing App
                    </Text>
                    <HStack spacing={4} justify="center">
                        <Button
                            colorScheme={isRecording ? "red" : "green"}
                            size="lg"
                            onClick={isRecording ? stopRecording : startRecording}
                            px={6}
                        >
                            {isRecording ? "Stop Recording" : "Start Recording"}
                        </Button>
                    </HStack>
                    <HStack spacing={4}>
                        <Input
                            placeholder="Enter your prompt"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            size="lg"
                            bg="white"
                            shadow="sm"
                        />
                        <Button colorScheme="blue" size="lg" onClick={sendText} px={6}>
                            Send Text
                        </Button>
                    </HStack>
                    {eouProb && (
                        <Box bg="white" p={4} rounded="md" shadow="sm">
                            <Text fontWeight="semibold">EOU Probability: {eouProb}</Text>
                        </Box>
                    )}
                    {generatedText && (
                        <Box bg="white" p={4} rounded="md" shadow="sm">
                            <Text fontWeight="semibold">Generated Text:</Text>
                            <Text>{generatedText}</Text>
                        </Box>
                    )}
                    {audioUrl && (
                        <Box bg="white" p={4} rounded="md" shadow="sm">
                            <Text fontWeight="semibold">Generated Audio:</Text>
                            <audio controls src={audioUrl} style={{ width: "100%" }} />
                        </Box>
                    )}
                    {error && (
                        <Box bg="red.50" p={4} rounded="md" shadow="sm">
                            <Text fontWeight="semibold" color="red.600">Error: {error}</Text>
                        </Box>
                    )}
                </VStack>
            </Box>
        </ChakraProvider>
    );
};

export default TestPage;