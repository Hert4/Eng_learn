import {
    Button,
    Checkbox,
    Flex,
    Text,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Image,
    useColorModeValue,
    Link,
    Icon,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Box,
    IconButton
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import Wave from 'react-wavify'
import useShowToast from '../hooks/showToast.js'
import { useState } from 'react'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaApple, FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { useSetRecoilState } from 'recoil'
import authScreenAtom from '../atom/authAtom.js'
import userAtom from '../atom/userAtom.js'

const MotionFlex = motion(Flex)

const SignupComp = () => {
    const showToast = useShowToast()
    const [showPassword, setShowPassword] = useState(false)
    const setAuthScreen = useSetRecoilState(authScreenAtom)
    const setUser = useSetRecoilState(userAtom)

    const [inputs, setInputs] = useState({
        username: "",
        email: "",
        password: ""
    })

    const handleSignup = async () => {
        try {
            // console.log("inputs", inputs) // here we have get inputs from the form
            const res = await fetch(`api/users/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputs)
            })

            const data = await res.json()
            // console.log(data)
            if (data.error) {
                showToast("Sign up", data.error, "error")
                return
            }

            showToast("Sign up", "Account created successfully", "success")

            localStorage.setItem("user", JSON.stringify(data))
            setUser(data)
        } catch (error) {
            showToast("Sign up", "Account created failed", "error")
            console.log(error)

        }
    }



    return (
        <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }} position="relative">
            {/* Left side of the page whihc is Signup Form */}
            <Flex
                p={8}
                flex={1}
                align={'center'}
                justify={'center'}
                bg={useColorModeValue('gray.50', 'gray.900')}
                position="relative"
                zIndex={1}
            >

                <MotionFlex
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    w={'full'}
                    maxW={'md'}
                    bg={useColorModeValue('white', 'gray.800')}
                    boxShadow={'2xl'}
                    borderRadius={'2xl'}
                    p={8}
                    direction="column"
                >
                    <Flex direction="column" align="center" mb={6}>
                        <Flex
                            w={16}
                            h={16}
                            bg={useColorModeValue('blue.50', 'blue.900')}
                            borderRadius="full"
                            align="center"
                            justify="center"
                            mb={4}
                        >
                            <Icon as={FaUser} color="blue.400" boxSize={6} />
                        </Flex>
                        <Heading fontSize={'2xl'} mb={1}>
                            Create an account 🎉
                        </Heading>
                        <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm">
                            Sign up to get started
                        </Text>
                    </Flex>

                    <Stack spacing={4}>
                        <FormControl id="name" isRequired>
                            <FormLabel>Username</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaUser} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    type="text"
                                    borderRadius="xl"
                                    focusBorderColor="blue.400"
                                    placeholder="Your username"
                                    onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                                    value={inputs.username}
                                />
                            </InputGroup>
                        </FormControl>

                        <FormControl id="email" isRequired>
                            <FormLabel>Email</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaEnvelope} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    type="email"
                                    borderRadius="xl"
                                    focusBorderColor="blue.400"
                                    placeholder="your@email.com"
                                    onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                                    value={inputs.email}
                                />
                            </InputGroup>
                        </FormControl>

                        <FormControl id="password" isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaLock} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    borderRadius="xl"
                                    focusBorderColor="blue.400"
                                    placeholder="password"
                                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                                    value={inputs.password}
                                />
                                <InputRightElement>
                                    <Icon
                                        as={showPassword ? FaEye : FaEyeSlash}
                                        color="gray.400"
                                        cursor="pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>

                        {/* <Checkbox colorScheme="blue" defaultChecked>
                            I agree to the Terms & Conditions
                        </Checkbox> */}

                        <Button
                            colorScheme="blue"
                            borderRadius="full"
                            size="lg"
                            fontWeight="semibold"
                            _hover={{
                                transform: 'translateY(-2px)',
                                boxShadow: 'lg'
                            }}
                            onClick={handleSignup}
                            mt={2}
                        >
                            Sign up
                        </Button>

                        <Flex align="center" my={4}>
                            <Box flex={1} borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} />
                            <Text px={2} color={useColorModeValue('gray.500', 'gray.400')} fontSize="sm">
                                OR
                            </Text>
                            <Box flex={1} borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} />
                        </Flex>

                        <Flex justify="center" gap={4}>
                            <IconButton
                                aria-label="Sign up with Google"
                                icon={<FcGoogle />}
                                variant="outline"
                                borderRadius="full"
                            />
                            <IconButton
                                aria-label="Sign up with Apple"
                                icon={<FaApple />}
                                variant="outline"
                                borderRadius="full"
                            />
                            <IconButton
                                aria-label="Sign up with Facebook"
                                icon={<FaFacebookF color="#1877F2" />}
                                variant="outline"
                                borderRadius="full"
                            />
                        </Flex>
                    </Stack>

                    <Text
                        mt={6}
                        textAlign="center"
                        fontSize="sm"
                        color={useColorModeValue('gray.600', 'gray.400')}
                    >
                        Already have an account?{' '}
                        <Link
                            color="blue.400"
                            fontWeight="medium"
                            _hover={{ textDecoration: 'underline' }}
                            onClick={() => { setAuthScreen("login") }}
                        >
                            Sign in
                        </Link>
                    </Text>
                </MotionFlex>
                <Wave
                    fill="#3182ce"
                    paused={false}
                    options={{
                        height: 20,
                        amplitude: 30,
                        speed: 0.15,
                        points: 4
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        zIndex: 0,
                        opacity: 0.2,
                        pointerEvents: 'none',
                    }}
                />
            </Flex>

            {/* Right side of the page */}
            {/* <Flex flex={1} display={{ base: 'none', md: 'flex' }} position="relative" overflow="hidden">
                <Image
                    alt="Signup Image"
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    src="" // Add a background image if you'd like
                />
            </Flex> */}
        </Stack>
    )
}


export default SignupComp