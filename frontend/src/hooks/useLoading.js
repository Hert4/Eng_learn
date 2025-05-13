import { useState, useCallback } from 'react';
import { Spinner, Progress, Box, Flex, keyframes } from '@chakra-ui/react';

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(0.95); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const useLoading= (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((newProgress) => {
    setProgress(newProgress);
  }, []);

  const Loader = () => {
    if (!isLoading) return null;

    return (
      <Box position="relative" w="full" mt={4}>
        <Progress
          value={progress}
          size="xs"
          colorScheme="blue"
          borderRadius="full"
          bg="gray.100"
          _dark={{ bg: "gray.700" }}
          isIndeterminate={!progress}
        />
        
        <Flex justify="center" mt={2} gap={1}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="6px"
              h="6px"
              borderRadius="full"
              bg="blue.500"
              animation={`${pulse} 1.5s ease-in-out infinite`}
              style={{ animationDelay: `${i * 0.2}s` }}
              _dark={{ bg: "blue.300" }}
            />
          ))}
        </Flex>
        
        <Box textAlign="center" mt={2}>
          <Spinner
            thickness="3px"
            speed="0.65s"
            color="blue.500"
            size="md"
            emptyColor="gray.200"
            _dark={{
              color: "blue.300",
              emptyColor: "gray.600"
            }}
            css={{
              animation: `${spin} 1s linear infinite`,
              animationTimingFunction: 'cubic-bezier(0.5, 0, 0.5, 1)'
            }}
          />
        </Box>
      </Box>
    );
  };

  const LoadingButton = ({ 
    onClick, 
    children, 
    disabledConditions = [],
    ...props 
  }) => {
    const isDisabled = isLoading || disabledConditions.some(condition => condition);

    const handleClick = async (e) => {
      if (isLoading) return;
      startLoading();
      try {
        await onClick(e);
      } finally {
        stopLoading();
      }
    };

    return (
      <>
        <Button
          rightIcon={
            isLoading ? (
              <Spinner 
                size="sm" 
                thickness="2px"
                speed="0.65s"
                color="white"
                emptyColor="blue.200"
              />
            ) : (
              <ChevronRight size={20} />
            )
          }
          onClick={handleClick}
          colorScheme="blue"
          isLoading={isLoading}
          loadingText={isLoading ? "Processing..." : "Submitting"}
          position="relative"
          overflow="hidden"
          _hover={{
            transform: isLoading ? 'none' : 'translateY(-1px)'
          }}
          _active={{
            transform: isLoading ? 'none' : 'translateY(1px)'
          }}
          transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
          isDisabled={isDisabled}
          {...props}
        >
          {children}
        </Button>
        <Loader />
      </>
    );
  };

  return {
    isLoading,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
    Loader,
    LoadingButton
  };
};