import React from "react";
import { VStack, FormControl, FormLabel, RadioGroup, Radio, Stack, Textarea } from "@chakra-ui/react";

const questions = [
    {
        id: "englishLevel",
        label: "How would you describe your English proficiency?",
        type: "radio",
        options: [
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
        ],
    },
    {
        id: "supportNeeded",
        label: "What kind of support do you need with English?",
        type: "textarea",
        placeholder: "e.g., grammar help, speaking practice...",
        showIf: (formData) => formData.englishLevel === "beginner",
    },
    {
        id: "certificationPrep",
        label: "Are you preparing for any certifications?",
        type: "radio",
        options: [
            { value: "ielts", label: "IELTS" },
            { value: "toefl", label: "TOEFL" },
            { value: "none", label: "None" },
        ],
        showIf: (formData) => formData.englishLevel === "advanced",
    },
    {
        id: "learningGoals",
        label: "What are your main goals for learning English?",
        type: "textarea",
        placeholder: "e.g., Travel, Work, Study abroad...",
    },
];

const LanguageBackgroundForm = ({ formData, handleInputChange }) => {
    return (
        <VStack spacing={6} align="stretch">
            {questions
                .filter((q) => !q.showIf || q.showIf(formData))
                .map((question) => (
                    <FormControl key={question.id}>
                        <FormLabel fontSize="lg" fontWeight="semibold" mb={3}>
                            {question.label}
                        </FormLabel>
                        {question.type === "radio" ? (
                            <RadioGroup
                                value={formData[question.id] || ""}
                                onChange={(value) => handleInputChange(question.id, value)}
                            >
                                <Stack direction="column" spacing={3}>
                                    {question.options.map((option) => (
                                        <Radio key={option.value} value={option.value} size="lg">
                                            {option.label}
                                        </Radio>
                                    ))}
                                </Stack>
                            </RadioGroup>
                        ) : (
                            <Textarea
                                placeholder={question.placeholder}
                                value={formData[question.id] || ""}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                size="lg"
                                variant="filled"
                                minH="120px"
                            />
                        )}
                    </FormControl>
                ))}
        </VStack>
    );
};

export default LanguageBackgroundForm;