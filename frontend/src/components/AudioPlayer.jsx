import React, { useEffect, useRef, useState } from "react";
import {
    Card,
    CardBody,
    VStack,
    HStack,
    Text,
    Button,
    useToast,
    Box
} from "@chakra-ui/react";
import { Volume2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

const AudioPlayer = ({ audioUrl, isLight }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isAudioLoaded, setIsAudioLoaded] = useState(false);
    const [isAudioValid, setIsAudioValid] = useState(false);
    const audioRef = useRef(null);
    const wavesurferRef = useRef(null);
    const waveformRef = useRef(null);
    const toast = useToast();

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    // Validate audio URL before loading
    useEffect(() => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.onloadedmetadata = () => {
                if (audio.duration > 0 && !isNaN(audio.duration)) {
                    setIsAudioValid(true);
                    console.log("Audio is valid, duration:", audio.duration);
                } else {
                    setIsAudioValid(false);
                    console.error("Invalid audio duration:", audio.duration);
                    toast({
                        title: "Error",
                        description: "The recorded audio is invalid or too short.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            };
            audio.onerror = () => {
                setIsAudioValid(false);
                console.error("Error loading audio URL:", audioUrl);
                toast({
                    title: "Error",
                    description: "Failed to load the audio file.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            };
        } else {
            setIsAudioValid(false);
        }
    }, [audioUrl, toast]);

    // Initialize WaveSurfer only if audio is valid
    useEffect(() => {
        if (waveformRef.current && isAudioValid && !wavesurferRef.current && audioUrl) {
            console.log("Initializing WaveSurfer with container:", waveformRef.current);
            try {
                wavesurferRef.current = WaveSurfer.create({
                    container: waveformRef.current,
                    waveColor: isLight ? "#4299E1" : "#90CDF4",
                    progressColor: isLight ? "#3182CE" : "#63B3ED",
                    cursorColor: "#718096",
                    barWidth: 2,
                    barRadius: 3,
                    cursorWidth: 1,
                    height: 80,
                    barGap: 2,
                    responsive: true,
                    normalize: true, // Normalize to prevent scaling issues
                    backend: "WebAudio", // Use WebAudio backend for better compatibility
                });

                wavesurferRef.current.on("ready", () => {
                    const waveDuration = wavesurferRef.current.getDuration();
                    if (waveDuration > 0) {
                        setDuration(waveDuration);
                        setIsAudioLoaded(true);
                        console.log("WaveSurfer ready, duration:", waveDuration);
                    } else {
                        console.error("WaveSurfer ready but invalid duration:", waveDuration);
                        setIsAudioLoaded(false);
                        toast({
                            title: "Error",
                            description: "Audio duration is invalid.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                });

                wavesurferRef.current.on("audioprocess", (time) => {
                    setCurrentTime(time);
                });

                wavesurferRef.current.on("play", () => {
                    setIsPlaying(true);
                });

                wavesurferRef.current.on("pause", () => {
                    setIsPlaying(false);
                });

                wavesurferRef.current.on("finish", () => {
                    setIsPlaying(false);
                });

                wavesurferRef.current.on("error", (err) => {
                    console.error("WaveSurfer error:", err);
                    setIsAudioLoaded(false);
                    toast({
                        title: "Error",
                        description: "Failed to load audio waveform.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                });

                console.log("Loading audio into WaveSurfer:", audioUrl);
                wavesurferRef.current.load(audioUrl);
            } catch (err) {
                console.error("WaveSurfer initialization failed:", err);
                setIsAudioLoaded(false);
                toast({
                    title: "Error",
                    description: "Failed to initialize audio waveform.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        return () => {
            if (wavesurferRef.current) {
                console.log("Destroying WaveSurfer");
                try {
                    wavesurferRef.current.destroy();
                } catch (err) {
                    console.error("Error destroying WaveSurfer:", err);
                }
                wavesurferRef.current = null;
            }
        };
    }, [audioUrl, isLight, isAudioValid, toast]);

    // Sync audio element with WaveSurfer
    useEffect(() => {
        if (audioRef.current && wavesurferRef.current) {
            audioRef.current.addEventListener("play", () => {
                if (!isPlaying) {
                    wavesurferRef.current.play();
                }
            });
            audioRef.current.addEventListener("pause", () => {
                if (isPlaying) {
                    wavesurferRef.current.pause();
                }
            });
            audioRef.current.addEventListener("timeupdate", () => {
                setCurrentTime(audioRef.current.currentTime);
            });
        }
    }, [isPlaying]);

    const togglePlayback = () => {
        if (wavesurferRef.current && isAudioLoaded) {
            wavesurferRef.current.playPause();
            setIsPlaying(!isPlaying);
            console.log("Toggling WaveSurfer playback, isPlaying:", !isPlaying);
        } else {
            toast({
                title: "Error",
                description: "Audio waveform not loaded yet or invalid.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log("Playback failed, isAudioLoaded:", isAudioLoaded);
        }
    };

    if (!isAudioValid) {
        return null; // Don't render if audio is invalid
    }

    return (
        <Card w="full" variant="outline">
            <CardBody>
                <VStack spacing={4}>
                    <Box ref={waveformRef} w="full" minH="80px" />
                    <audio ref={audioRef} src={audioUrl} />
                    <HStack w="full" justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </Text>
                        <Button
                            leftIcon={isPlaying ? <Volume2 /> : <Volume2 />}
                            onClick={togglePlayback}
                            size="sm"
                            variant="ghost"
                            isDisabled={!isAudioLoaded}
                        >
                            {isPlaying ? "Pause" : "Play"}
                        </Button>
                    </HStack>
                </VStack>
            </CardBody>
        </Card>
    );
};

export default AudioPlayer;