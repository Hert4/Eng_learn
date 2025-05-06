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
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import Wave from 'react-wavify'
import useShowToast from '../hooks/showToast.js'
import { useState } from 'react'
import { FaUserShield, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaApple, FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { IconButton } from '@chakra-ui/react';
import authScreenAtom from '../atom/authAtom.js'
import { useSetRecoilState } from 'recoil'
import userAtom from '../atom/userAtom.js'
const MotionFlex = motion(Flex)

const LoginComp = () => {
    const showToast = useShowToast()
    const [showPassword, setShowPassword] = useState(false);
    const setAuthScreen = useSetRecoilState(authScreenAtom)
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    })

    const setUser = useSetRecoilState(userAtom)

    const handleLogin = async () => {
        try {
            const res = await fetch('api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputs)
            })
            const data = await res.json()
            if (data.error) {
                showToast("Error", data.error, "error")
                return
            }
            localStorage.setItem('user', JSON.stringify(data))
            setUser(data)
            console.log(data)
            showToast("Success", "Login successful", "success")
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }} position="relative">
            {/* Left: Login Form */}
            <Flex
                p={8}
                flex={1}
                align={'center'}
                justify={'center'}
                bg={useColorModeValue('gray.50', 'gray.900')}
                position="relative"
                zIndex={1}
            >
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
                            <Icon as={FaUserShield} color="blue.400" boxSize={6} />
                        </Flex>
                        <Heading fontSize={'2xl'} mb={1}>
                            Welcome back
                        </Heading>
                        <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm">
                            Sign in to continue to your account
                        </Text>
                    </Flex>

                    <Stack spacing={4}>
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
                                    transition="all 0.3s"
                                    placeholder="your@email.com"
                                    onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                                    value={inputs?.email || ""}
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
                                    type={showPassword ? "text" : "password"}
                                    borderRadius="xl"
                                    focusBorderColor="blue.400"
                                    transition="all 0.3s"
                                    placeholder="••••••••"
                                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                                    value={inputs?.password || ""}
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

                        <Flex justify="space-between" align="center">
                            <Checkbox
                                defaultChecked
                                colorScheme="blue"
                            >
                                Remember me
                            </Checkbox>
                            <Link
                                color="blue.400"
                                fontSize="sm"
                                _hover={{ textDecoration: 'underline' }}
                            >
                                Forgot password?
                            </Link>
                        </Flex>

                        <Button
                            colorScheme="blue"
                            borderRadius="full"
                            size="lg"
                            fontWeight="semibold"
                            _hover={{
                                transform: 'translateY(-2px)',
                                boxShadow: 'lg'
                            }}
                            transition="all 0.2s"
                            onClick={handleLogin}
                            mt={2}
                        >
                            Sign in
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
                                aria-label="Sign in with Google"
                                icon={<FcGoogle />}
                                variant="outline"
                                borderRadius="full"
                            />
                            <IconButton
                                aria-label="Sign in with Apple"
                                icon={<FaApple />}
                                variant="outline"
                                borderRadius="full"
                            />
                            <IconButton
                                aria-label="Sign in with Facebook"
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
                        Don&apos;t have an account?{' '}
                        <Link
                            color="blue.400"
                            fontWeight="medium"
                            _hover={{ textDecoration: 'underline' }}
                            onClick={() => { setAuthScreen("signup") }}

                        >
                            Sign up
                        </Link>
                    </Text>
                </MotionFlex>
            </Flex>
            {/* Right: Image */}
            {/* <Flex flex={1} display={{ base: 'none', md: 'flex' }} position="relative" overflow="hidden">
                <Image
                    alt="Login Image"
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    src="" // add webg here
                />

            </Flex> */}
        </Stack>


    )
}

export default LoginComp