import React from 'react'
import { Box, Button, Input, VStack, Text, Center } from 'native-base'

export default function TestLogin({ navigation }: any) {
  return (
    <Box flex={1} bg="#F7F9FC" safeArea>
      <Center flex={1}>
        <VStack space={4} alignItems="center" w="90%">
          <Text fontSize="2xl" fontWeight="bold">PharmaTrack</Text>
          
          <Input 
            placeholder="Username or Email" 
            size="lg"
            bg="white"
          />
          
          <Input 
            placeholder="Password" 
            type="password"
            size="lg"
            bg="white"
          />
          
          <Button 
            size="lg" 
            w="100%" 
            bg="#00D4AA"
            onPress={() => navigation.navigate('Dashboard')}
          >
            Login
          </Button>
        </VStack>
      </Center>
    </Box>
  )
}