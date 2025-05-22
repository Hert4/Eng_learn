import { useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    useToast,
    Avatar,
    Flex,
    Heading,
    IconButton,
    Spinner,
    useColorModeValue,
    Input,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaEllipsisVertical } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { BsRobot } from "react-icons/bs";
import { HiOutlineChevronDown } from "react-icons/hi";
import FloatingLogo from "./FloatingLogo";
import ReactMarkdown from 'react-markdown'
import Markdown from "react-markdown";
// Animation variants cho phong cách iPhone
const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 100 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.8, y: 100, transition: { duration: 0.2 } },
};

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const AIModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const messagesEndRef = useRef(null);

    // Premium iOS colors
    const bubbleBgUser = "#007AFF";
    const bubbleBgAI = useColorModeValue("#F2F2F7", "#1C1C1E");
    const textColorUser = "white";
    const textColorAI = useColorModeValue("black", "white");
    const inputBg = useColorModeValue("white", "#2C2C2E");
    const headerBg = useColorModeValue("#FBFBFD", "#1C1C1E");
    const footerBg = useColorModeValue("#FBFBFD", "#1C1C1E");
    const modalBg = useColorModeValue("#FBFBFD", "#000000");
    const placeholderColor = useColorModeValue("#8E8E93", "#8E8E93");
    const timeTextColor = useColorModeValue("#8E8E93", "#8E8E93");
    const borderColorHeaderFooter = useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.08)");
    const borderColorInput = useColorModeValue("rgba(0,0,0,0.1)", "rgba(255,255,255,0.1)");
    const iconColor = useColorModeValue("gray.600", "gray.400");

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    // Format chat history for API
    const formatChatHistory = () => {
        return chatHistory
            .map(([userMsg, aiMsg]) => [
                userMsg ? `User: ${userMsg}` : "",
                aiMsg ? `Assistant: ${aiMsg}` : "",
            ])
            .flat()
            .filter(Boolean)
            .join("\n");
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        setIsLoading(true);
        const newHistory = [...chatHistory, [message, null]];
        setChatHistory(newHistory);

        try {
            const SYSTEM_PROMPT = `You are Neura, a highly experienced English language instructor. Only answer questions related to learning English. Use innovative, fun, and effective teaching methods, and encourage practice with native speakers. Create a supportive and inclusive environment.`;

            const formattedHistory = formatChatHistory();
            const fullPrompt = `${formattedHistory}\nUser: ${message}`;


            const res = await fetch("https://107.114.184.16:3000/generate", {
                method: "POST",
                referrerPolicy: "unsafe-url",
                headers: {
                    "Content-Type": "application/json",
                    // 'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    model: "qwen2.5-coder:7b",
                    system: SYSTEM_PROMPT,
                    prompt: fullPrompt,
                    stream: false,
                }),
            });

            const data = await res.json();
            if (!data?.response) throw new Error("No response from AI");

            setChatHistory((prev) => [...prev.slice(0, -1), [message, data.response]]);
        } catch (error) {
            console.error("Error:", error);
            toast({
                title: "AI Error",
                description: "Failed to process AI response",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setChatHistory((prev) => [...prev.slice(0, -1)]);
        } finally {
            setIsLoading(false);
            setMessage("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            <Button
                h="60px"
                w="60px"
                position="fixed"
                bottom={{ base: "64px", md: "64px" }}
                right={{ base: "16px", md: "32px" }}
                onClick={() => setIsOpen(!isOpen)}
                zIndex="1000"
                borderRadius="full"
                boxShadow="0px 8px 24px rgba(0, 122, 255, 0.25)"
                _hover={{ transform: "scale(1.05)" }}
                _active={{ transform: "scale(0.95)" }}
                transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                background={'transparent'}

            >
                <FloatingLogo />
            </Button>

            {isOpen && (
                <MotionBox
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 md:bottom-32 md:right-8 md:inset-auto z-50"
                >
                    <Box
                        bg={modalBg}
                        borderRadius={{ base: "0", md: "2xl" }}
                        w={{ base: "100vw", md: "400px" }}
                        h={{ base: "100vh", md: "auto" }}
                        maxH={{ base: "100vh", md: "80vh" }}
                        minH={{ base: "100vh", md: "300px" }}
                        display="flex"
                        flexDirection="column"
                        boxShadow={{ base: "none", md: "0px 16px 48px rgba(0, 0, 0, 0.2)" }}
                        overflow="hidden"
                    >
                        {/* Header */}
                        <Box
                            bg={headerBg}
                            p={3}
                            borderBottom="1px solid"
                            borderColor={borderColorHeaderFooter}
                        >
                            <Flex align="center" justify="space-between">
                                <Flex align="center" gap={2}>
                                    <Avatar
                                        icon={<BsRobot size={16} />}
                                        bg="linear-gradient(135deg, #007AFF 0%, #34C759 100%)"
                                        color="white"
                                        size="sm"
                                    />
                                    <Box>
                                        <Heading size="sm" fontWeight="600">Neura</Heading>
                                        <Flex align="center" gap={1} fontSize="xs" color={placeholderColor}>
                                            <Box w="6px" h="6px" borderRadius="full" bg="#34C759" />
                                            <Box>{isLoading ? "Responding..." : "Online"}</Box>
                                        </Flex>
                                    </Box>
                                </Flex>
                                <Flex gap={1}>
                                    <IconButton
                                        icon={<FaEllipsisVertical size={14} />}
                                        variant="ghost"
                                        size="sm"
                                        borderRadius="full"
                                        color={iconColor}
                                    />
                                    <IconButton
                                        icon={<HiOutlineChevronDown size={18} />}
                                        variant="ghost"
                                        size="sm"
                                        borderRadius="full"
                                        onClick={() => setIsOpen(false)}
                                        color={iconColor}
                                    />
                                </Flex>
                            </Flex>
                        </Box>

                        {/* Chat Area */}
                        <Box flex="1" p={4} overflowY="auto" bg={modalBg}>
                            {chatHistory.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" h="100%" color={placeholderColor} gap={4}>
                                    <Box
                                        bg={bubbleBgAI}
                                        p={4}
                                        borderRadius="20px"
                                        maxW="85%"
                                        boxShadow="0px 4px 16px rgba(0, 0, 0, 0.05)"
                                    >
                                        <Flex align="center" gap={2} mb={2}>
                                            <Box w="8px" h="8px" borderRadius="full" bg="linear-gradient(135deg, #007AFF 0%, #34C759 100%)" />
                                            <Box fontSize="sm" fontWeight="600" color="#007AFF">Neura</Box>
                                        </Flex>
                                        <Box fontSize="sm" lineHeight="tall">
                                            I am your premium AI assistant for learning English. How can I assist you today?
                                        </Box>
                                        <Box fontSize="xs" mt={2} color={timeTextColor}>
                                            Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </Box>
                                    </Box>
                                    <Box fontSize="xs">Premium AI • End-to-end encrypted</Box>
                                </Flex>
                            ) : (
                                <Box>
                                    {chatHistory.map(([userMsg, aiMsg], index) => (
                                        <Box key={index} mb={4}>
                                            {/* User Message */}
                                            <Flex justify="flex-end" mb={2}>
                                                <Box
                                                    bg={bubbleBgUser}
                                                    p={3}
                                                    borderRadius="20px 6px 20px 20px"
                                                    color={textColorUser}
                                                    maxW="85%"
                                                    boxShadow="0px 4px 12px rgba(0, 122, 255, 0.2)"
                                                    position="relative"
                                                    _before={{
                                                        content: '""',
                                                        position: "absolute",
                                                        right: "-6px",
                                                        top: "0",
                                                        border: "10px solid transparent",
                                                        borderLeftColor: bubbleBgUser,
                                                        borderRight: "0",
                                                        borderTop: "0",
                                                        transform: "rotate(-20deg)",
                                                    }}
                                                >
                                                    <ReactMarkdown>{userMsg}</ReactMarkdown>
                                                </Box>
                                            </Flex>

                                            {/* AI Message */}
                                            {aiMsg && (
                                                <Flex justify="flex-start" mb={2}>
                                                    <Box
                                                        bg={bubbleBgAI}
                                                        p={3}
                                                        borderRadius="6px 20px 20px 20px"
                                                        color={textColorAI}
                                                        boxShadow="0px 4px 12px rgba(0, 0, 0, 0.05)"
                                                        position="relative"
                                                        _before={{
                                                            content: '""',
                                                            position: "absolute",
                                                            left: "-6px",
                                                            top: "0",
                                                            border: "10px solid transparent",
                                                            borderRightColor: bubbleBgAI,
                                                            borderLeft: "0",
                                                            borderTop: "0",
                                                            transform: "rotate(20deg)",
                                                        }}
                                                    >
                                                        <ReactMarkdown>{aiMsg}</ReactMarkdown>
                                                    </Box>
                                                </Flex>
                                            )}
                                        </Box>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </Box>
                            )}
                        </Box>

                        {/* Input Area */}
                        <Box
                            p={3}
                            bg={footerBg}
                            borderTop="1px solid"
                            borderColor={borderColorHeaderFooter}
                        >
                            <InputGroup>
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Message Neura..."
                                    borderRadius="full"
                                    border="1px solid"
                                    borderColor={borderColorInput}
                                    focusBorderColor="#007AFF"
                                    bg={inputBg}
                                    _placeholder={{ color: placeholderColor, fontSize: "sm" }}
                                    fontSize="sm"
                                    px={4}
                                    py={3}
                                />
                                <InputRightElement h="100%" pr={2}>
                                    <IconButton
                                        onClick={handleSendMessage}
                                        isLoading={isLoading}
                                        isDisabled={!message.trim()}
                                        borderRadius="full"
                                        icon={isLoading ? <Spinner size="sm" /> : <IoMdSend size={18} />}
                                        size="sm"
                                        bg={message.trim() ? "#007AFF" : "transparent"}
                                        color={message.trim() ? "white" : placeholderColor}
                                        _hover={{ bg: message.trim() ? "#0066CC" : "transparent" }}
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </Box>
                    </Box>
                </MotionBox>
            )}
        </>
    );
};

export default AIModal;