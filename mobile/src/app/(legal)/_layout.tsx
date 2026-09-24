import React, { useState } from "react";
import { Stack } from "expo-router";
import useScreenOptions from "@/hooks/useScreenOptions";

const LegalLayout = () => {
    const screenOptions = useScreenOptions();
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen name="terms-of-use" />
            <Stack.Screen name="privacy-policy" />
        </Stack>
    );
};

export default LegalLayout;