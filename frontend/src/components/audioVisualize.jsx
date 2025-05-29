import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import p5 from 'p5';
import useShowToast from '../hooks/showToast';
//  https://github.com/SesameAILabs/csm/issues/75
const AudioVisualize = ({
    audioData,
    isRecording,
    onStartRecording,
    onStopRecording
}) => {
    const canvasParentRef = useRef(null);

    const scaleCanvas = (scale) => {
        const canvas = canvasParentRef.current?.querySelector('canvas');
        if (canvas) {
            canvas.style.transform = `scale(${scale})`;
            canvas.style.transition = 'transform 0.2s ease';
        }
    };
    const sketchRef = useRef(null);
    const [boxStyle, setBoxStyle] = useState({
        transform: 'scale(1)',
        boxShadow: '0 0 40px rgba(0, 204, 255, 0.2)',

    });
    const audioContextRef = useRef(null)
    const analyserRef = useRef(null)
    const sourceRef = useRef(null)
    const showToast = useShowToast()

    const initialized = useRef(false);
    const handleClick = () => {
        if (isRecording) {
            onStopRecording();
        } else {
            onStartRecording();

        }
    };
    useEffect(() => {

        if (initialized.current) return
        initialized.current = true;
        let globalAngle = 0;
        let p5Instance;
        let analyser;
        let dataArray;

        // Thiết lập Web Audio API
        // const setupAudio = async () => {
        //     try {
        //         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        //         const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        //         const source = audioContext.createMediaStreamSource(stream);
        //         analyser = audioContext.createAnalyser();
        //         analyser.fftSize = 500;
        //         source.connect(analyser);
        //         dataArray = new Uint8Array(analyser.frequencyBinCount);
        //     } catch (err) {
        //         console.error('Lỗi khi truy cập microphone:', err);
        //     }
        // };

        const setupAudio = () => {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;
            dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        };

        const processAudio = async () => {
            if (audioData && audioContextRef.current && analyser.current) {
                try {
                    if (sourceRef.current) {
                        sourceRef.current.disconnect()
                        sourceRef.current = null
                    }

                    const byteCharacters = atob(audioData)
                    const byteNumbers = new Array(byteCharacters.length)
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i)
                    }
                    const byteArray = new Uint8Array(byteNumbers)
                    const audioBlob = new Blob([byteArray], { type: 'audio/wav' })


                    audio.crossOrigin = "anonymous"

                    sourceRef.current = audioContextRef.current.createMediaElementSource(audio)
                    sourceRef.current.connect(analyser.current)
                    analyserRef.current.connect(audioContextRef.current.destination)

                    if (audioContextRef.current.state === 'suspended') {
                        audioContextRef.current.resume();
                    }
                    audio.play();

                    audio.onended = () => {
                        if (sourceRef.current) {
                            sourceRef.current.disconnect();
                            sourceRef.current = null;
                        }
                        URL.revokeObjectURL(audioUrl);
                    };
                } catch (error) {
                    console.log(error);

                }
            }
        }

        const sketch = (p) => {
            p.setup = () => {
                // Clear any existing canvas inside the parent
                const parent = canvasParentRef.current;
                while (parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }

                const size = Math.min(p.windowWidth, p.windowHeight, 500);
                const canvas = p.createCanvas(size, size);
                canvas.parent(parent);

                p.background(0);
                setupAudio();
            };


            p.draw = () => {
                p.clear();
                p.blendMode(p.ADD);
                p.translate(p.width / 2, p.height / 2);

                // Tính mức âm thanh
                let audioLevel = 0;
                if (analyser && dataArray) {
                    analyser.getByteFrequencyData(dataArray);
                    audioLevel = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                    audioLevel = p.map(audioLevel, 0, 255, 0, 1);
                }

                // Chọn màu boxShadow đồng bộ với nhân
                const colorIndex = Math.floor((globalAngle % 3) / 1) % 3; // Chuyển đổi màu mỗi 1 đơn vị globalAngle
                const colors = [
                    'rgba(0, 204, 255, 0.2)', // Cyan
                    'rgba(51, 153, 76, 0.2)', // Green
                    'rgba(255, 85, 255, 0.2)', // Magenta
                ];
                let shadowColor = colors[colorIndex];

                // Cập nhật style của Box khi có âm thanh
                if (audioLevel > 0.1) {
                    const scaleFactor = 1 + audioLevel * 0.3; // Phóng to tối đa 30%
                    const glowIntensity = audioLevel * 0.5; // Độ sáng tối đa 0.5
                    // Điều chỉnh alpha của màu dựa trên glowIntensity
                    shadowColor = colors[colorIndex].replace(/0\.2\)$/, `${glowIntensity})`);
                    setBoxStyle({
                        transform: `scale(${scaleFactor})`,
                        boxShadow: `0 0 60px ${shadowColor}`,
                    });
                } else {
                    setBoxStyle({
                        transform: 'scale(1)',
                        boxShadow: `0 0 40px ${shadowColor}`,
                    });
                }

                // Điều chỉnh globalAngle dựa trên âm thanh
                const angleIncrement = audioLevel > 0.1 ? 0.03 : 0.01;

                // Cyan
                p.stroke(0, 80, 100, 20);
                for (let i = 0; i < 360; i += 1) {
                    let ang = (p.noise(0, i / 500, globalAngle) * 720 + i) * p.PI / 180;
                    let pos = p5.Vector.fromAngle(ang);
                    let magn = 50 + p.noise(0, i / 100, -globalAngle * 3) * 100 * (1 + Math.sin(i * p.PI / 180));
                    pos.setMag(magn);
                    p.line(0, 0, pos.x, pos.y);
                }

                // Green
                p.stroke(20, 60, 30, 20);
                for (let i = 0; i < 360; i += 1.5) {
                    let ang = (p.noise(100, i / 500, globalAngle) * 720 + i) * p.PI / 180;
                    let pos = p5.Vector.fromAngle(ang);
                    let magn = 50 + p.noise(100, i / 100, -globalAngle * 3) * 100 * (1 + Math.sin(i * p.PI / 180));
                    pos.setMag(magn);
                    p.line(0, 0, pos.x, pos.y);
                }

                // Magenta
                p.stroke(150, 50, 150, 20);
                for (let i = 0; i < 360; i += 1.5) {
                    let ang = (p.noise(200, i / 500, globalAngle) * 720 + i) * p.PI / 180;
                    let pos = p5.Vector.fromAngle(ang);
                    let magn = 50 + p.noise(200, i / 100, -globalAngle * 3) * 100 * (1 + Math.sin(i * p.PI / 180));
                    pos.setMag(magn);
                    p.line(0, 0, pos.x, pos.y);
                }

                globalAngle += angleIncrement;
            };

            p.windowResized = () => {
                const size = Math.min(p.windowWidth, p.windowHeight, 500);
                p.resizeCanvas(size, size);
            };
        };

        p5Instance = new p5(sketch);
        sketchRef.current = p5Instance;

        processAudio()

        // return () => {
        //     initialized.current = false
        //     p5Instance.remove();
        // };


        return () => {
            if (sourceRef.current) {
                sourceRef.current.disconnect();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }

            initialized.current = false
            p5Instance.remove();
        };
    }, []);

    return (
        <Box

            justifySelf={'center'}
            ref={canvasParentRef}
            width="clamp(100px, 25vmin, 250px)"
            height="clamp(100px, 25vmin, 250px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            // overflow="hidden"
            // bg="black.500"
            style={boxStyle}
            transition="transform 0.1s ease, box-shadow 0.1s ease"
            // borderWidth={1}
            borderColor={'gray'}
            onClick={() => {
                handleClick
            }}
            onMouseEnter={() => scaleCanvas(1.5)}
            onMouseLeave={() => scaleCanvas(1)}
            onMouseDown={() => scaleCanvas(0.5)}
            onMouseUp={() => scaleCanvas(1.5)}
            cursor="pointer"
        />
    );
};

export default AudioVisualize;