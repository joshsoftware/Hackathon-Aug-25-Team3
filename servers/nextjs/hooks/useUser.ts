import { useState, useEffect } from "react";

import { jwtDecode } from "jwt-decode";
import { getAuthToken } from "@/lib/auth";

interface UserInfo {
  email: string;
  name: string;
}

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const decoded = jwtDecode(token) as UserInfo;
        setUser(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  return user;
}
