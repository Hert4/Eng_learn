import {
    Box, Container, Text, Avatar,
    VStack, HStack, Stack, Divider,
    useBreakpointValue, Center, Icon,
    Button, useColorMode, AlertDialog,
    AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent,
    AlertDialogOverlay, useDisclosure,
    Input, FormControl, FormLabel,
    Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Table,
    Thead, Tbody, Tr, Th, Td, Badge,
    Spinner
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom"
import useGetUserProfile from "../hooks/useGetUserProfile";
import { WarningTwoIcon, EditIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, Lock, Award } from 'lucide-react';
import useShowToast from "../hooks/showToast";
import userAtom from "../atom/userAtom";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const UserProfile = () => {
    const { user, loading } = useGetUserProfile();
    const [currentUser, setCurrentUser] = useRecoilState(userAtom)
    const showToast = useShowToast()
    const { colorMode } = useColorMode();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
    const navigate = useNavigate(); // Khởi tạo useNavigate

    // Form states
    const [formData, setFormData] = useState({
        username: currentUser.username || '',
        email: currentUser.email || '',
        // phone: user?.phone || '',
        // profilePic: user?.profilePic || '' /waut cloud
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // Responsive values
    const avatarSize = useBreakpointValue({ base: "xl", md: "2xl" });
    const padding = useBreakpointValue({ base: 4, md: 6 });
    const fontSize = useBreakpointValue({ base: "sm", md: "md" });
    const tableVariant = useBreakpointValue({ base: "simple", md: "striped" });

    // Exam history data (replace with your actual data)
    const examHistory = [
        {
            id: 1,
            examName: "TOEIC Practice Test 1",
            date: "2023-10-15",
            score: 850,
            totalQuestions: 200,
            correctAnswers: 170,
            status: "completed"
        },
        {
            id: 2,
            examName: "TOEIC Full Test",
            date: "2023-11-20",
            score: 920,
            totalQuestions: 200,
            correctAnswers: 184,
            status: "completed"
        },
        // Thêm dữ liệu khác nếu cần
    ];

    // iOS color palette
    const iosColors = {
        light: {
            primary: '#007AFF',
            secondary: '#34C759',
            background: 'rgba(242, 242, 247, 0.8)',
            text: '#1C1C1E',
            navbar: 'rgba(249, 249, 249, 0.8)',
            button: '#007AFF',
            buttonText: 'white',
        },
        dark: {
            primary: '#0A84FF',
            secondary: '#30D158',
            background: 'rgba(28, 28, 30, 0.8)',
            text: '#FFFFFF',
            navbar: 'rgba(36, 36, 38, 0.8)',
            button: '#0A84FF',
            buttonText: 'white',
        }
    };

    const currentColors = iosColors[colorMode];

    if (loading) {
        return (
            <Container maxW="container.lg" py={10} centerContent>
                <Spinner size="xl" />
            </Container>
        );
    }

    if (!user) {
        return (
            <Container maxW="container.sm" py={20}>
                <Center flexDirection="column" textAlign="center" gap={4}>
                    <Icon as={WarningTwoIcon} w={10} h={10} color="orange.400" />
                    <Text fontSize="xl" fontWeight="600" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
                        User Not Found
                    </Text>
                    <Text color="gray.500" fontSize="md">
                        We couldn't find the user you're looking for.
                    </Text>
                </Center>
            </Container>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileUpdate = async () => {
        setIsUpdating(true);
        try {
            // Gọi API cập nhật thông tin
            // await updateProfileAPI(formData);
            const res = await fetch(`/api/users/update/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        username: formData.username,
                        email: formData.email
                    }
                )
            })
            // showToast("Success", `Click upadeted api/users/update/${user._id}`, "success")
            const data = await res.json()
            if (data.error) {
                showToast('Error', data.error, 'error')
                return
            }
            showToast('Success', 'Update profile successfully!', 'success')
            setCurrentUser(data)
            localStorage.setItem('user', JSON.stringify(data))
            setIsUpdating(false);
            onEditClose();
            navigate(`/${data.username}`);
        } catch (error) {
            setIsUpdating(false);
            showToast('Error', error, 'error')

        } finally {
            setIsUpdating(false);

        }
    };

    const handlePasswordUpdate = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast("Erorr", "Your new password does not match", "error")
            return;
        }
        setIsUpdating(true);
        try {

            // Gọi API đổi mật khẩu
            // await updatePasswordAPI({
            //     currentPassword: passwordData.currentPassword,
            //     newPassword: passwordData.newPassword
            // });
            const res = await fetch(`/api/users/update/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        currentPassword: passwordData.currentPassword,
                        newPassword: passwordData.newPassword
                    }
                )
            })
            // showToast("Success", `Click upadeted api/users/update/${user._id}`, "success")
            const data = await res.json()
            if (data.error) {
                showToast('Error', data.error, 'error')
                return
            }
            setIsUpdating(false);
            showToast('Success', 'Update password successfully!', 'success')
            onPasswordClose();
        } catch (error) {
            setIsUpdating(false);
            showToast('Error', error, 'error')
        } finally {
            setIsUpdating(false)
        }
    };

    return (
        <Container
            maxW="container.lg"
            py={{ base: 16, md: 24 }}
            px={{ base: 2, md: 4 }}
        >
            <VStack spacing={6} align="stretch" w={'full'}>
                {/* User Profile Section */}
                <MotionBox
                    p={padding}
                    borderWidth="1px"
                    borderRadius="2xl"
                    bg={colorMode === 'light' ? 'rgba(249, 249, 249, 0.8)' : 'rgba(36, 36, 38, 0.8)'}
                    backdropFilter="blur(20px)"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        spacing={6}
                        align={'center'}
                    >
                        <Avatar
                            size={avatarSize}
                            name={user.name}
                            src={user.profilePic}
                            borderWidth="2px"
                            borderColor={currentColors.primary}
                        />

                        <VStack
                            align={{ base: "center", md: "flex-start" }}
                            spacing={4}
                            textAlign={{ base: "center", md: "left" }}
                            flex={1}
                        >
                            <HStack>
                                <Text
                                    fontSize="xl"
                                    fontWeight="600"
                                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                >
                                    {user.name}
                                </Text>
                                {user.verified && (
                                    <Box
                                        bg={currentColors.secondary}
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                    >
                                        <Text
                                            fontSize="xs"
                                            color="white"
                                            fontWeight="500"
                                        >
                                            Verified
                                        </Text>
                                    </Box>
                                )}
                            </HStack>

                            <Text
                                fontSize={fontSize}
                                color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                            >
                                @{user.username}
                            </Text>

                            <VStack align={{ base: "center", md: "flex-start" }} spacing={3} w="full">
                                <HStack spacing={3}>
                                    <Mail size={18} color={currentColors.text} />
                                    <Text fontSize={fontSize}>{user.email}</Text>
                                </HStack>

                                <HStack spacing={3}>
                                    <Calendar size={18} color={currentColors.text} />
                                    <Text fontSize={fontSize}>
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </Text>
                                </HStack>

                                {user.phone && (
                                    <HStack spacing={3}>
                                        <Phone size={18} color={currentColors.text} />
                                        <Text fontSize={fontSize}>{user.phone}</Text>
                                    </HStack>
                                )}
                            </VStack>
                            {currentUser.username === user.username && (

                                <HStack spacing={3} pt={2}>
                                    <MotionButton
                                        onClick={onEditOpen}
                                        size="sm"
                                        px={4}
                                        py={2}
                                        rounded="lg"
                                        bg={currentColors.primary}
                                        color="white"
                                        fontWeight="500"
                                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                        _hover={{ bg: colorMode === 'light' ? '#0066CC' : '#0A78E6' }}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        leftIcon={<EditIcon boxSize={3} />}
                                    >
                                        Edit Profile
                                    </MotionButton>

                                    <MotionButton
                                        onClick={onPasswordOpen}
                                        size="sm"
                                        px={4}
                                        py={2}
                                        rounded="lg"
                                        bg="transparent"
                                        borderWidth="1px"
                                        borderColor={currentColors.primary}
                                        color={currentColors.primary}
                                        fontWeight="500"
                                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                        _hover={{ bg: colorMode === 'light' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(10, 132, 255, 0.1)' }}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        leftIcon={<Lock size={16} />}
                                    >
                                        Change Password
                                    </MotionButton>

                                </HStack>
                            )}

                        </VStack>
                    </Stack>
                </MotionBox>

                {/* Exam History Section */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <HStack justify="space-between" align="center" mb={4}>
                        <Text
                            fontSize="lg"
                            fontWeight="600"
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                        >
                            Exam History
                        </Text>
                    </HStack>

                    {examHistory.length === 0 ? (
                        <Box
                            p={6}
                            borderRadius="xl"
                            bg={colorMode === 'light' ? 'rgba(229, 229, 234, 0.5)' : 'rgba(44, 44, 46, 0.5)'}
                            textAlign="center"
                        >
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                                No exam history yet
                            </Text>
                        </Box>
                    ) : (
                        <Box
                            overflowX="auto"
                            borderWidth="1px"
                            borderRadius="xl"
                            bg={colorMode === 'light' ? 'rgba(249, 249, 249, 0.8)' : 'rgba(36, 36, 38, 0.8)'}
                            backdropFilter="blur(20px)"
                        >
                            <Table variant={tableVariant}>
                                <Thead>
                                    <Tr>
                                        <Th>Exam</Th>
                                        <Th>Date</Th>
                                        <Th isNumeric>Score</Th>
                                        <Th>Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {examHistory.map((exam) => (
                                        <Tr key={exam.id}>
                                            <Td>
                                                <Text fontWeight="500">{exam.examName}</Text>
                                            </Td>
                                            <Td>
                                                <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                                                    {exam.date}
                                                </Text>
                                            </Td>
                                            <Td isNumeric>
                                                <Text fontWeight="600" color={currentColors.primary}>
                                                    {exam.score}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Box
                                                    bg={exam.status === "completed" ?
                                                        (colorMode === 'light' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(48, 209, 88, 0.1)') :
                                                        (colorMode === 'light' ? 'rgba(255, 149, 0, 0.1)' : 'rgba(255, 159, 10, 0.1)')}
                                                    px={3}
                                                    py={1}
                                                    borderRadius="full"
                                                    display="inline-block"
                                                >
                                                    <Text
                                                        color={exam.status === "completed" ?
                                                            (colorMode === 'light' ? '#34C759' : '#30D158') :
                                                            (colorMode === 'light' ? '#FF9500' : '#FF9F0A')}
                                                        fontSize="sm"
                                                        fontWeight="500"
                                                    >
                                                        {exam.status}
                                                    </Text>
                                                </Box>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </MotionBox>

                {/* Edit Profile Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose}>
                    <ModalOverlay />
                    <ModalContent
                        bg={colorMode === 'light' ? 'rgba(249, 249, 249, 0.95)' : 'rgba(36, 36, 38, 0.95)'}
                        backdropFilter="blur(20px)"
                        borderRadius="2xl"
                        borderWidth="1px"
                        borderColor={colorMode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
                    >
                        <ModalHeader
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                            fontWeight="600"
                        >
                            Edit Profile
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                                        Username
                                    </FormLabel>
                                    <Input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        borderRadius="lg"
                                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                                        Email
                                    </FormLabel>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        borderRadius="lg"
                                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                    />
                                </FormControl>

                                {/* <FormControl>
                                    <FormLabel fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                                        Phone Number
                                    </FormLabel>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        borderRadius="lg"
                                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                    />
                                </FormControl> */}

                                {/* <FormControl>
                                    <FormLabel fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                                        Profile Picture URL
                                    </FormLabel>
                                    <Input
                                        name="profilePic"
                                        value={formData.profilePic}
                                        onChange={handleInputChange}
                                        borderRadius="lg"
                                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                    />
                                </FormControl> */}
                                {/* add image process here waiting for cloud */}
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <HStack spacing={3}>
                                <Button
                                    onClick={onEditClose}
                                    variant="ghost"
                                    borderRadius="lg"
                                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleProfileUpdate}

                                    bg={currentColors.primary}
                                    color="white"
                                    borderRadius="lg"
                                    isLoading={isUpdating}
                                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                    _hover={{ bg: colorMode === 'light' ? '#0066CC' : '#0A78E6' }}
                                >
                                    Save Changes
                                </Button>
                            </HStack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Change Password Modal */}
                <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
                    <ModalOverlay />
                    <ModalContent
                        bg={colorMode === 'light' ? 'rgba(249, 249, 249, 0.95)' : 'rgba(36, 36, 38, 0.95)'}
                        backdropFilter="blur(20px)"
                        borderRadius="2xl"
                        borderWidth="1px"
                        borderColor={colorMode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
                    >
                        <ModalHeader
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                            fontWeight="600"
                        >
                            Change Password
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                                        Current Password
                                    </FormLabel>
                                    <Input
                                        name="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        borderRadius="lg"
                                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                                        New Password
                                    </FormLabel>
                                    <Input
                                        name="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        borderRadius="lg"
                                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                                        Confirm New Password
                                    </FormLabel>
                                    <Input
                                        name="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        borderRadius="lg"
                                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                    />
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <HStack spacing={3}>
                                <Button
                                    onClick={onPasswordClose}
                                    variant="ghost"
                                    borderRadius="lg"
                                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePasswordUpdate}
                                    bg={currentColors.primary}
                                    color="white"
                                    borderRadius="lg"
                                    isLoading={isUpdating}
                                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                                    _hover={{ bg: colorMode === 'light' ? '#0066CC' : '#0A78E6' }}
                                >
                                    Update Password
                                </Button>
                            </HStack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </VStack>
        </Container >
    );
};

export default UserProfile;