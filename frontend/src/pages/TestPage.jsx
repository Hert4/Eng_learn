import { Box } from "@chakra-ui/react";
import VoiceAssistant from "../components/TranscriptRTC";
import Live2DComponent from "../components/live2dModel";

const TestPage = () => {
    return (
        <Box py={24} alignItems={'center'} justifyContent={'center'} display={'flex'}>
            <Live2DComponent />
            <VoiceAssistant />
        </Box>
    );
}

export default TestPage;