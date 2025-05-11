import React from "react";
import { VStack, Heading, Text, Button, Box } from "@chakra-ui/react";
import { Check } from "lucide-react";

const CompletionScreen = ({ resetSurvey }) => {
    return (
        <VStack spacing={8} textAlign="center" py={8}>
            <Box as={Check} size={80} color="#38A169" strokeWidth={2} mx="auto" />
            <Heading size="lg">Test Submitted Successfully!</Heading>
            <Text fontSize="lg" color="gray.500">
                Thank you for completing the OPIC exercise test. Your results will be reviewed shortly.
            </Text>
            <Button colorScheme="blue" size="lg" mt={6} onClick={resetSurvey}>
                Start New Test
            </Button>
        </VStack>
    );
};

export default CompletionScreen;