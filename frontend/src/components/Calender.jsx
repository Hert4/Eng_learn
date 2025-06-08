import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, useColorMode } from '@chakra-ui/react';



const lightThem = createTheme({
    colorSchemes: {
        dark: true,
    },
});

const darkTheme = createTheme()


export default function CalendarComp() {
    const { colorMode } = useColorMode()
    return (
        <Box >
            <ThemeProvider theme={colorMode === 'light' ? darkTheme : lightThem}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar readOnly />
                </LocalizationProvider>
            </ThemeProvider >
        </Box>

    );
}
