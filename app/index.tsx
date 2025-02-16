import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "./UserContext";

export default function IndexPage() {
  const router = useRouter();
  const { userId } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ensure redirection only after mounting
    if (isMounted) {
      if (userId) {
        console.log(userId);
        router.replace("./Home");
      } else {
        router.replace("./Startup");
      }
    }
  }, [userId, isMounted]);

  // Set mounted state after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return null; // No UI, just acts as a redirect page
}
