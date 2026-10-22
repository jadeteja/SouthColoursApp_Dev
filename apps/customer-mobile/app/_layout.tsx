import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order-confirmation" />
      <Stack.Screen name="order-tracking" />
      <Stack.Screen name="product/[id]" />
    </Stack>
  );
}
