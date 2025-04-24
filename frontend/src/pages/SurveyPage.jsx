import React, { useState } from "react";
import {
    Box,
    Button,
    Flex,
    VStack,
    Heading,
    Stepper,
    Step,
    StepIndicator,
    StepStatus,
    StepTitle,
    StepSeparator,
    useSteps,
    useColorMode,
    useBreakpointValue,
    Text,
    Icon
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";
import { ChevronLeft } from 'lucide-react';

const MotionBox = motion(Box);

// iOS-style CSS overrides
const applyIOSTheme = () => {
    const iosTheme = {
        "--sjs-primary-backcolor": "#007AFF",
        "--sjs-primary-forecolor": "white",
        "--sjs-general-backcolor": "#FFFFFF",
        "--sjs-general-backcolor-dark": "#1C1C1E",
        "--sjs-general-forecolor": "#1C1C1E",
        "--sjs-general-forecolor-dark": "#FFFFFF",
        "--sjs-font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        "--sjs-questionpanel-backcolor": "rgba(255,255,255,0.8)",
        "--sjs-questionpanel-backcolor-dark": "rgba(44,44,46,0.8)",
        "--sjs-editor-backcolor": "rgba(242,242,247,0.8)",
        "--sjs-editor-backcolor-dark": "rgba(28,28,30,0.8)",
        "--sjs-border-default": "rgba(0,0,0,0.1)",
        "--sjs-border-default-dark": "rgba(255,255,255,0.1)",
        "--sjs-shadow-small": "0 1px 3px rgba(0,0,0,0.1)",
        "--sjs-shadow-medium": "0 4px 12px rgba(0,0,0,0.1)",
        "--sjs-shadow-large": "0 8px 24px rgba(0,0,0,0.1)",
        "--sjs-border-radius": "12px",
        "--sjs-font-size": "16px",
        "--sjs-font-weight": "400",
        "--sjs-questionpanel-padding": "20px",
        "--sjs-questionpanel-radius": "16px",
        "--sjs-question-title": "600"
    };

    Object.entries(iosTheme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });
};

// Survey structure
const surveyJSONs = [
    {
        title: "Personal Info",
        pages: [
            {
                questions: [
                    {
                        type: "radiogroup",
                        name: "ageGroup",
                        title: "What is your age group?",
                        isRequired: true,
                        choices: ["Under 18", "18-35", "36-60", "Above 60"],
                    },
                    {
                        type: "radiogroup",
                        name: "studentStatus",
                        title: "Are you a student?",
                        isRequired: true,
                        visibleIf: "{ageGroup} = 'Under 18'",
                        choices: ["Yes", "No"],
                    },
                ],
            },
        ],
    },
    {
        title: "Device Preferences",
        pages: [
            {
                questions: [
                    {
                        type: "radiogroup",
                        name: "deviceUsage",
                        title: "Which device do you use most?",
                        choices: ["iPhone", "Android", "Windows", "Mac"],
                    },
                    {
                        type: "radiogroup",
                        name: "iPhoneFeature",
                        title: "Favorite iPhone feature?",
                        visibleIf: "{deviceUsage} = 'iPhone'",
                        choices: ["Face ID", "iMessage", "AirDrop", "Ecosystem"],
                    },
                    {
                        type: "radiogroup",
                        name: "androidFeature",
                        title: "Favorite Android feature?",
                        visibleIf: "{deviceUsage} = 'Android'",
                        choices: ["Google Assistant", "Customization", "Expandable Storage"],
                    },
                ],
            },
        ],
    },
    {
        title: "Feedback",
        pages: [
            {
                questions: [
                    {
                        type: "radiogroup",
                        name: "recommend",
                        title: "Would you recommend your current device to others?",
                        choices: ["Yes", "No", "Maybe"],
                    },
                    {
                        type: "comment",
                        name: "suggestions",
                        title: "Any suggestions for improvement?",
                        visibleIf: "{recommend} anyof ['No', 'Maybe']",
                    },
                ],
            },
        ],
    },
];

const SurveyPage = () => {
    const { colorMode } = useColorMode();
    const [step, setStep] = useState(0);
    const [surveyData, setSurveyData] = useState([]);
    const isMobile = useBreakpointValue({ base: true, md: false });

    // Apply iOS theme on mount and when color mode changes
    React.useEffect(() => {
        applyIOSTheme();
    }, [colorMode]);

    const steps = surveyJSONs.map((s, i) => ({
        title: s.title,
        description: `Step ${i + 1}`,
    }));

    const { activeStep, setActiveStep } = useSteps({
        index: step,
        count: steps.length,
    });

    const handleComplete = (data) => {
        const newSurveyData = [...surveyData];
        newSurveyData[step] = data.data;
        setSurveyData(newSurveyData);

        if (step < surveyJSONs.length - 1) {
            setStep(step + 1);
            setActiveStep(step + 1);
        } else {
            console.log("Survey completed:", newSurveyData);
            // Here you would typically submit the data to your backend
        }
    };

    // iOS color palette
    const iosColors = {
        light: {
            primary: '#007AFF',
            background: 'rgba(242, 242, 247, 1)',
            card: 'rgba(255, 255, 255, 0.8)',
            text: '#1C1C1E',
            border: 'rgba(0, 0, 0, 0.1)'
        },
        dark: {
            primary: '#0A84FF',
            background: 'rgba(28, 28, 30, 1)',
            card: 'rgba(44, 44, 46, 0.8)',
            text: '#FFFFFF',
            border: 'rgba(255, 255, 255, 0.1)'
        }
    };

    const currentColors = iosColors[colorMode];

    return (
        <Flex
            minH="100vh"
            bg={currentColors.background}
            align="center"
            justify="center"
            p={4}
        >
            <VStack
                spacing={6}
                w="full"
                maxW="500px"
            >
                {/* Header */}
                <Box textAlign="center" w="full">
                    <Heading
                        fontSize="xl"
                        fontWeight="600"
                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                        color={currentColors.text}
                    >
                        Device Preference Survey
                    </Heading>
                    <Text
                        color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                        fontSize="sm"
                        mt={1}
                    >
                        Help us understand your preferences
                    </Text>
                </Box>

                {/* iOS-style Stepper */}
                <Box w="full" px={isMobile ? 2 : 0}>
                    <Stepper
                        size="sm"
                        index={activeStep}
                        gap="0"
                        colorScheme="blue"
                    >
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator
                                    border="none"
                                    bg="transparent"
                                >
                                    <StepStatus
                                        complete={
                                            <Box
                                                bg={currentColors.primary}
                                                w="6px"
                                                h="6px"
                                                borderRadius="full"
                                            />
                                        }
                                        incomplete={
                                            <Box
                                                bg={colorMode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
                                                w="6px"
                                                h="6px"
                                                borderRadius="full"
                                            />
                                        }
                                        active={
                                            <Box
                                                bg={currentColors.primary}
                                                w="6px"
                                                h="6px"
                                                borderRadius="full"
                                            />
                                        }
                                    />
                                </StepIndicator>
                                {!isMobile && (
                                    <Box flexShrink={0}>
                                        <StepTitle
                                            fontSize="sm"
                                            fontWeight="500"
                                            color={index <= activeStep ? currentColors.text : (colorMode === 'light' ? 'gray.500' : 'gray.500')}
                                        >
                                            {step.title}
                                        </StepTitle>
                                    </Box>
                                )}
                                {index < steps.length - 1 && (
                                    <StepSeparator
                                        bg={colorMode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
                                        h="1px"
                                        mx={2}
                                    />
                                )}
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* Survey Content */}
                <AnimatePresence mode="wait">
                    <MotionBox
                        key={step}
                        w="full"
                        bg={currentColors.card}
                        borderRadius="2xl"
                        backdropFilter="blur(20px)"
                        borderWidth="1px"
                        borderColor={currentColors.border}
                        boxShadow={colorMode === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.2)'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                        }}
                    >
                        <Survey
                            json={surveyJSONs[step]}
                            showCompletedPage={false}
                            onComplete={handleComplete}
                        />
                    </MotionBox>
                </AnimatePresence>

                {/* Navigation */}
                {step > 0 && (
                    <Button
                        onClick={() => {
                            setStep(step - 1);
                            setActiveStep(step - 1);
                        }}
                        variant="ghost"
                        color={currentColors.primary}
                        fontWeight="500"
                        leftIcon={<Icon as={ChevronLeft} boxSize={5} />}
                        _hover={{ bg: colorMode === 'light' ? 'rgba(0,122,255,0.1)' : 'rgba(10,132,255,0.1)' }}
                    >
                        Previous
                    </Button>
                )}
            </VStack>
        </Flex>
    );
};

export default SurveyPage;