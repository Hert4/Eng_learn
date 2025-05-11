import {
    Box,
    Center,
    Text,
    Stack,
    List,
    ListItem,
    ListIcon,
    Button,
    useColorModeValue,
    Flex,
    useColorMode,
    useMediaQuery,
} from '@chakra-ui/react'
import { CheckIcon, EditIcon } from '@chakra-ui/icons'
import { motion } from "framer-motion";
import { VN } from 'country-flag-icons/react/3x2'



const MotionBox = motion(Box)
const MotionButton = motion(Button)
const TestPage = () => {
    const { colorMode } = useColorMode();
    const [isSmalelrThan] = useMediaQuery("(max-width: 1200px)")

    return (
        <Box>
            <Flex
                pt={90}
                justify={'center'}
                direction={isSmalelrThan ? 'column-reverse' : 'row'}
                w={{ base: '100%', sm: '100%' }}
                gap={14}
                align={'center'}
                overflow={"hidden"}
            >
                <MotionBox
                    maxW={'330px'}
                    w={{ base: '100%', sm: '100%' }}
                    bg={useColorModeValue('white', 'gray.800')}
                    boxShadow={'2xl'}
                    rounded={'md'}
                    overflow={'hidden'}
                    backdropFilter="blur(20px)"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}>

                    <Stack
                        textAlign={'center'}
                        p={6}
                        color={useColorModeValue('gray.800', 'white')}
                        align={'center'}>
                        <Text
                            fontSize={'sm'}
                            fontWeight={500}
                            bg={useColorModeValue('blue.50', 'blue.900')}
                            p={2}
                            px={3}
                            color={'blue.500'}
                            rounded={'full'}>
                            VI
                        </Text>


                        <Stack direction={'row'} align={'center'} justify={'center'}>
                            <Text fontSize={'3xl'}>$</Text>
                            <Text fontSize={'4xl'} fontWeight={800} textAlign={'match-parent'}>
                                100000
                            </Text>
                            <Text color={'gray.500'}>/month</Text>
                        </Stack>
                    </Stack>

                    <Box bg={useColorModeValue('gray.50', 'gray.900')} px={6} py={10}>
                        <List spacing={3}>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                5.000 questions test
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                Learn and communicate with AI
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                You should buy if you don't know Vietnamese
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                Limited communicate with teacher
                            </ListItem>
                        </List>

                        <MotionButton
                            mt={10}
                            w={'full'}
                            bg={'#007AFF'}
                            color={'white'}
                            rounded={'xl'}
                            boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'}
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            _hover={{ bg: colorMode === 'light' ? '#0066CC' : '#0A78E6' }}

                        >
                            Pay for test
                        </MotionButton>
                    </Box>
                </MotionBox>
                <MotionBox
                    maxW={'330px'}
                    w={'full'}
                    bg={useColorModeValue('white', 'gray.800')}
                    boxShadow={'2xl'}
                    rounded={'md'}
                    overflow={'hidden'}
                    backdropFilter="blur(20px)"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}>
                    <Stack
                        textAlign={'center'}
                        p={6}
                        color={useColorModeValue('gray.800', 'white')}
                        align={'center'}>
                        <Text
                            fontSize={'sm'}
                            fontWeight={500}
                            bg={useColorModeValue('blue.50', 'blue.900')}
                            p={2}
                            px={3}
                            color={'blue.500'}
                            rounded={'full'}>
                            VI
                        </Text>
                        <Stack direction={'row'} align={'center'} justify={'center'}>
                            <Text fontSize={'3xl'}>$</Text>
                            <Text fontSize={'4xl'} fontWeight={800} textAlign={'match-parent'}>
                                100000
                            </Text>
                            <Text color={'gray.500'}>/month</Text>
                        </Stack>
                    </Stack>

                    <Box bg={useColorModeValue('gray.50', 'gray.900')} px={6} py={10}>
                        <List spacing={3}>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                5.000 questions test
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                Learn and communicate with AI
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                You should buy if you don't know Vietnamese
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                Limited communicate with teacher
                            </ListItem>
                        </List>

                        <MotionButton
                            mt={10}
                            w={'full'}
                            bg={'#007AFF'}
                            color={'white'}
                            rounded={'xl'}
                            boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'}
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            _hover={{ bg: colorMode === 'light' ? '#0066CC' : '#0A78E6' }}

                        >
                            Pay for test
                        </MotionButton>
                    </Box>
                </MotionBox>
                <MotionBox
                    maxW={'330px'}
                    w={'full'}
                    bg={useColorModeValue('white', 'gray.800')}
                    boxShadow={'2xl'}
                    rounded={'md'}
                    overflow={'hidden'}
                    backdropFilter="blur(20px)"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}>
                    <Stack
                        textAlign={'center'}
                        p={6}
                        color={useColorModeValue('gray.800', 'white')}
                        align={'center'}>
                        <Text
                            fontSize={'sm'}
                            fontWeight={500}
                            bg={useColorModeValue('blue.50', 'blue.900')}
                            p={2}
                            px={3}
                            color={'blue.500'}
                            rounded={'full'}>
                            VI
                        </Text>
                        <Stack direction={'row'} align={'center'} justify={'center'}>
                            <Text fontSize={'3xl'}>$</Text>
                            <Text fontSize={'4xl'} fontWeight={800} textAlign={'match-parent'}>
                                100000
                            </Text>
                            <Text color={'gray.500'}>/month</Text>
                        </Stack>
                    </Stack>

                    <Box bg={useColorModeValue('gray.50', 'gray.900')} px={6} py={10}>
                        <List spacing={3}>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                5.000 questions test
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                Learn and communicate with AI
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                You should buy if you don't know Vietnamese
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckIcon} color="green.400" />
                                Limited communicate with teacher
                            </ListItem>
                        </List>

                        <MotionButton
                            mt={10}
                            w={'full'}
                            bg={'#007AFF'}
                            color={'white'}
                            rounded={'xl'}
                            boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'}
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            _hover={{ bg: colorMode === 'light' ? '#0066CC' : '#0A78E6' }}

                        >
                            Pay for test
                        </MotionButton>
                    </Box>
                </MotionBox>

            </Flex>
        </Box>
    )


}

export default TestPage