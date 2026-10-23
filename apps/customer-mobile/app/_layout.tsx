import { Stack } from 'expo-router';

// Intercept global fetch so Ngrok free tunnel never serves an HTML browser warning page
if (typeof global !== 'undefined' && global.fetch) {
  const originalFetch = global.fetch;
  global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const customInit: RequestInit = init || {};
    const customHeaders = new Headers(customInit.headers || {});
    if (!customHeaders.has('ngrok-skip-browser-warning')) {
      customHeaders.set('ngrok-skip-browser-warning', 'true');
    }
    customInit.headers = customHeaders;
    return originalFetch(input, customInit);
  };
}

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
