import React from 'react'
import { Stack } from 'expo-router'
import useScreenOptions from '@/hooks/useScreenOptions'

const CategoriesStack = () => {
  const screenOption = useScreenOptions()
  return (
    <Stack screenOptions={screenOption}>
      <Stack.Screen name="index" />
    </Stack>
  )
}

export default CategoriesStack
