import { Container, Text, Button, Input, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

const TestPage = () => {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const audioContextRef = useRef(null);
    const audioBufferSourceRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const handleGenerateAudio = async () => {
        if (!text) return;

        setIsLoading(true);
        audioChunksRef.current = []; // Reset audio chunks

        try {
            const response = await fetch("https://e2c2-35-204-241-101.ngrok-free.app/generate_audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch audio: ${response.status}`);
            }

            const reader = response.body.getReader();
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (value && value.byteLength > 0) {
                    chunks.push(value);
                }
            }

            // Combine all chunks into a single ArrayBuffer
            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
            const combinedBuffer = new Uint8Array(totalLength);
            let offset = 0;

            chunks.forEach(chunk => {
                combinedBuffer.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), offset);
                offset += chunk.byteLength;
            });

            // Decode the complete audio data
            const audioBuffer = await audioContextRef.current.decodeAudioData(combinedBuffer.buffer);

            // Play the audio
            if (audioBufferSourceRef.current) {
                audioBufferSourceRef.current.stop();
            }

            audioBufferSourceRef.current = audioContextRef.current.createBufferSource();
            audioBufferSourceRef.current.buffer = audioBuffer;
            audioBufferSourceRef.current.connect(audioContextRef.current.destination);
            audioBufferSourceRef.current.start();

        } catch (error) {
            console.error("Error generating audio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={4}>
                <Text fontSize="2xl">Text-to-Speech App</Text>
                <Input
                    placeholder="Enter text to convert to speech"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <Button
                    colorScheme="teal"
                    onClick={handleGenerateAudio}
                    isLoading={isLoading}
                    isDisabled={!text}
                >
                    Generate Audio
                </Button>
            </VStack>
        </Container>
    );
};

export default TestPage;