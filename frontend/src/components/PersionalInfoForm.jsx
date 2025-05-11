import React from "react";
import { VStack, FormControl, FormLabel, Input, RadioGroup, Radio, Stack } from "@chakra-ui/react";

const questions = [
    {
        id: "name",
        label: "What's your name?",
        type: "text",
        placeholder: "Enter your full name",
    },
    {
        id: "ageGroup",
        label: "Which age group do you belong to?",
        type: "radio",
        options: [
            { value: "under18", label: "Under 18" },
            { value: "18to35", label: "18-35" },
            { value: "36to60", label: "36-60" },
            { value: "60plus", label: "60+" },
        ],
    },
];

const PersonalInfoForm = ({ formData, handleInputChange }) => {
    return (
        <VStack spacing={6} align="stretch">
            {questions.map((question) => (
                <FormControl
                    key={question.id}
                    borderBottom="1px"
                    borderColor="blackAlpha.800"
                    paddingBottom={4}
                >
                    <FormLabel fontSize="lg" fontWeight="semibold" mb={3}>
                        {question.label}
                    </FormLabel>
                    {question.type === "text" && (
                        <Input
                            placeholder={question.placeholder}
                            value={formData[question.id] || ""}
                            onChange={(e) => handleInputChange(question.id, e.target.value)}
                            size="lg"
                            variant="filled"
                        />
                    )}
                    {question.type === "radio" && (
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
                    )}
                </FormControl>
            ))}
        </VStack>
    );
};

export default PersonalInfoForm;