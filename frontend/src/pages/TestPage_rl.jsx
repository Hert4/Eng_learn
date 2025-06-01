import { Box, Button, Heading, Input } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";

const TestPage = () => {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const audioContextRef = useRef(null);
    const playTimeRef = useRef(0);
    const headerParsedRef = useRef(false);
    const HEADER_SIZE = 44; // Kích thước header WAV do backend tạo ra

    // Khởi tạo AudioContext khi component mount
    useEffect(() => {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const handleGenerateAudio = async () => {
        if (!text) return;
        setIsLoading(true);

        // Reset lại trước mỗi lần generate
        headerParsedRef.current = false;
        // Bắt đầu schedule từ thời điểm now
        playTimeRef.current = audioContextRef.current.currentTime;

        // Nếu AudioContext đang "suspended", resume để có thể play
        if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume();
        }

        try {
            const response = await fetch(
                "https://d8d5-34-41-50-147.ngrok-free.app/generate_audio",
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

            // Đọc từng chunk streaming
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value && value.byteLength > 0) {
                    let chunk = new Uint8Array(value);

                    // Lần đọc đầu: bỏ header WAV (44 bytes)
                    if (!headerParsedRef.current) {
                        if (chunk.byteLength <= HEADER_SIZE) {
                            // Trong trường hợp header chưa đủ 44 bytes (rất hiếm), skip
                            continue;
                        }
                        chunk = chunk.subarray(HEADER_SIZE);
                        headerParsedRef.current = true;
                    }

                    // Chuyển PCM int16 → Float32
                    const sampleCount = chunk.byteLength / 2;
                    const float32Arr = new Float32Array(sampleCount);
                    for (let i = 0; i < sampleCount; i++) {
                        const lo = chunk[2 * i];
                        const hi = chunk[2 * i + 1];
                        let int16 = hi << 8 | lo;
                        if (int16 & 0x8000) {
                            int16 = int16 - 0x10000;
                        }
                        float32Arr[i] = int16 / 32767;
                    }

                    // Tạo AudioBuffer và fill dữ liệu
                    const audioCtx = audioContextRef.current;
                    const sampleRate = 16000; // backend gửi 16kHz
                    const audioBuffer = audioCtx.createBuffer(1, sampleCount, sampleRate);
                    audioBuffer.copyToChannel(float32Arr, 0);

                    // Tạo BufferSource, connect
                    const bufferSource = audioCtx.createBufferSource();
                    bufferSource.buffer = audioBuffer;
                    bufferSource.connect(audioCtx.destination);

                    // ==== CHỖ ĐƯỢC SỬA ====  
                    // Đảm bảo playTime không ở "quá khứ" so với currentTime
                    playTimeRef.current = Math.max(playTimeRef.current, audioCtx.currentTime);

                    // Start tại thời điểm playTimeRef
                    bufferSource.start(playTimeRef.current);

                    // Tăng playTimeRef theo độ dài chunk (tính bằng giây)
                    playTimeRef.current += sampleCount / sampleRate;
                    // =====================

                    // Lặp tới chunk tiếp theo
                }
            }
        } catch (error) {
            console.error("Error generating/streaming audio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            maxW={'600px'}
            margin={"auto"}
            padding={"0 16px"}
            textAlign={"center"}
            pt={300}
        >
            <Heading style={{ marginBottom: "16px" }}>Text-to-Speech Streaming</Heading>
            <Input
                type="text"
                placeholder="Nhập văn bản..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                    marginBottom: "12px",
                }}
            />
            <Button
                onClick={handleGenerateAudio}
                disabled={!text || isLoading}
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: text && !isLoading ? "#319795" : "#ccc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: text && !isLoading ? "pointer" : "not-allowed",
                }}
            >
                {isLoading ? "Đang tải..." : "Generate Audio"}
            </Button>

        </Box>
    );
};

export default TestPage;
