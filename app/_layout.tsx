import { Stack } from "expo-router";
import { useUser, UserProvider } from "./UserContext";

function LayoutContent() {
  const { userId } = useUser();
  console.log(userId)

  return (
    <Stack screenOptions={{ headerShown: false }}>

      {/* Conditionally define which screens to show */}
      {userId ? (
        <>
          {/* Authenticated routes */}
          <Stack.Screen name="Home/index" />
          <Stack.Screen name="scanner/index" />
          <Stack.Screen name="payment/index" />
        </>
      ) : (
        <>
          {/* Public routes */}
          <Stack.Screen name="login/index" />
          <Stack.Screen name="login/signup" />
          <Stack.Screen name="login/signin" />
        </>
      )}
    </Stack>
  );
}

export default function Layout() {
  return (
    <UserProvider>
      <LayoutContent />
    </UserProvider>
  );
}
