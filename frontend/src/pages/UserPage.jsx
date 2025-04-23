import {
    Box, Container, Heading, Text, Avatar,
    VStack, HStack, Stack, Table, Thead,
    Tbody, Tr, Th, Td, Spinner, Badge,
    Divider, useBreakpointValue,
    Center,
    Icon,
    Button
} from "@chakra-ui/react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { WarningTwoIcon } from "@chakra-ui/icons";
import { useParams } from "react-router-dom";

const UserProfile = () => {
    const { user, loading } = useGetUserProfile();
    const username = useParams()
    // Responsive values
    const avatarSize = useBreakpointValue({ base: "xl", md: "2xl" });
    const tableVariant = useBreakpointValue({ base: "simple", md: "striped" });
    const direction = useBreakpointValue({ base: "column", md: "row" });
    const padding = useBreakpointValue({ base: 4, md: 6 });
    const fontSize = useBreakpointValue({ base: "sm", md: "md" });

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
                    {/* <Avatar size="2xl" name="Unknown User" /> */}
                    <Icon as={WarningTwoIcon} w={10} h={10} color="orange.400" />
                    <Heading size="lg">User Not Found</Heading>
                    <Text color="gray.500" fontSize="md">
                        We couldn’t find the user you’re looking for. They might have changed their profile or it may no longer exist.
                    </Text>
                </Center>
            </Container>
        );
    }




    // Sample exam history data
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
        // ... other exam data
    ];

    return (
        <Container maxW="container.lg" py={{ base: 4, md: 10 }} px={{ base: 2, md: 4 }}>
            <VStack spacing={8} align="stretch">
                {/* User Profile Section - Responsive Stack */}
                <Box
                    p={padding}
                    borderWidth="1px"
                    borderRadius="lg"
                    boxShadow="md"
                >
                    <Stack
                        direction={direction}
                        spacing={6}
                        align={{ base: "center", md: "flex-start" }}
                    >
                        <Avatar
                            size={avatarSize}
                            name={user.name}
                            src={user.profilePic}
                        />

                        <VStack
                            align={{ base: "center", md: "flex-start" }}
                            spacing={4}
                            textAlign={{ base: "center", md: "left" }}
                        >
                            <Heading as="h1" size={{ base: "lg", md: "xl" }}>
                                {user.name}
                                {user.verified && (
                                    <Badge ml={2} colorScheme="green">
                                        Verified
                                    </Badge>
                                )}
                            </Heading>

                            <Text fontSize={fontSize} color="gray.500">
                                @{user.username}
                            </Text>

                            {/* <Text fontSize={fontSize}>{user.bio || "No bio yet"}</Text> */}

                            <Stack
                                direction={{ base: "column", sm: "row" }}
                                spacing={{ base: 2, sm: 6 }}
                                divider={<Divider orientation="vertical" height="20px" />}
                                align="center"
                            >
                                <VStack align={{ base: "center", md: "flex-start" }} spacing={0}>
                                    <Text fontWeight="bold" fontSize={fontSize}>Email</Text>
                                    <Text fontSize={fontSize}>{user.email}</Text>
                                </VStack>

                                <VStack align={{ base: "center", md: "flex-start" }} spacing={0}>
                                    <Text fontWeight="bold" fontSize={fontSize}>Joined</Text>
                                    <Text fontSize={fontSize}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </Text>
                                </VStack>

                                {user.phone && (
                                    <VStack align={{ base: "center", md: "flex-start" }} spacing={0}>
                                        <Text fontWeight="bold" fontSize={fontSize}>Phone</Text>
                                        <Text fontSize={fontSize}>{user.phone}</Text>
                                    </VStack>
                                )}
                            </Stack>
                        </VStack>
                    </Stack>
                </Box>

                {/* Exam History Section */}
                <Box>
                    <Heading as="h2" size={{ base: "md", md: "lg" }} mb={4}>
                        Exam History
                    </Heading>

                    {examHistory.length === 0 ? (
                        <Text>No exam history yet</Text>
                    ) : (
                        <Box
                            overflowX="auto"
                            borderWidth="1px"
                            borderRadius="lg"
                            p={{ base: 2, md: 4 }}
                        >
                            <Table
                                variant={tableVariant}
                                size={fontSize}
                                whiteSpace="nowrap"
                            >
                                <Thead>
                                    <Tr>
                                        <Th>Exam Name</Th>
                                        <Th display={{ base: "none", sm: "table-cell" }}>Date</Th>
                                        <Th isNumeric>Score</Th>
                                        <Th isNumeric display={{ base: "none", md: "table-cell" }}>
                                            Correct
                                        </Th>
                                        <Th>Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {examHistory.map((exam) => (
                                        <Tr key={exam.id}>
                                            <Td>
                                                <Text isTruncated maxW={{ base: "150px", md: "none" }}>
                                                    {exam.examName}
                                                </Text>
                                            </Td>
                                            <Td display={{ base: "none", sm: "table-cell" }}>
                                                {exam.date}
                                            </Td>
                                            <Td isNumeric>
                                                {exam.score !== null ? exam.score : "N/A"}
                                            </Td>
                                            <Td isNumeric display={{ base: "none", md: "table-cell" }}>
                                                {exam.correctAnswers !== null
                                                    ? `${exam.correctAnswers}/${exam.totalQuestions}`
                                                    : "N/A"}
                                            </Td>
                                            <Td>
                                                <Badge
                                                    colorScheme={exam.status === "completed" ? "green" : "orange"}
                                                    fontSize={fontSize}
                                                >
                                                    {exam.status}
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </Box>
            </VStack>
        </Container>
    );
};

export default UserProfile;