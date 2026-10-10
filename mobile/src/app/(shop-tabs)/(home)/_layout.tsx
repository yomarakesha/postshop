import React from 'react'
import { Stack } from 'expo-router'
import useScreenOptions from '@/hooks/useScreenOptions'

const HomeStack = () => {
  const screenOptions = useScreenOptions()
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" />
    </Stack>
  )
}

export default HomeStack
