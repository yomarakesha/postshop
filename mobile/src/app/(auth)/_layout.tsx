import React from 'react'
import { Stack } from 'expo-router'
import { useUnistyles } from 'react-native-unistyles'

const AuthLayout = () => {
  const { theme } = useUnistyles()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.gray2,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="verify" />
    </Stack>
  )
}

export default AuthLayout
