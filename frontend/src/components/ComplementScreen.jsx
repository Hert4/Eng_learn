import React, { useState } from "react";
import { VStack, Heading, Text, Button, Box, SimpleGrid } from "@chakra-ui/react";

const ColoredText = ({ binary, text }) => {
    const colorMap = ['red', 'green']; // Map '0' to red and '1' to green
    return (
        <Heading size="lg" fontWeight={500}>
            {text.split('').map((char, index) => (
                <span style={{ color: colorMap[binary[index]] }}>
                    {char}
                </span>
            ))}
        </Heading>
    )
}

const CompletionScreen = ({ resetSurvey, formData, audioData, accuracyResult }) => {

    return (
        <VStack
            textAlign="center"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            overflow={'hidden'}
        >
            {/* <Text>{accuracyResult.is_letter_correct_all_words}</Text>
            <Text>{accuracyResult.real_transcripts}</Text> */}
            {accuracyResult ? <>
                <ColoredText
                    binary={accuracyResult.is_letter_correct_all_words}
                    text={accuracyResult.real_transcripts}
                />
                <Text fontSize="lg" color="gray.500" as={'i'}>
                    /{accuracyResult.real_transcripts_ipa}/
                </Text>
                {/* <Text fontSize={'lg'} fontWeight={'500'} >{accuracyResult.real_transcript}</Text> */}
                <Text as={'i'}>/{accuracyResult.ipa_transcript}/</Text>
                {/* <Text>{accuracyResult.is_letter_correct_all_words}</Text> */}

                <Box>
                    <Heading size="2xl" mb={2}>{accuracyResult.pronunciation_accuracy}</Heading>
                </Box></> : <>
                <Text>Nothing to see here</Text>
            </>}


            <Button colorScheme="blue" size="lg" mt={6} onClick={resetSurvey}>
                Start New Test
            </Button>
        </VStack>
    );
};
export default CompletionScreen;

