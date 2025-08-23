import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, removeAuthToken } from "@/lib/auth";
import {
  organizationApi,
  UserInfo,
} from "@/app/(presentation-generator)/services/api/organizations";

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        router.push("/login");
        return;
      }

      try {
        const userInfo = await organizationApi.getMe();
        setUser(userInfo);
        setError(null);
      } catch (error: any) {
        console.error("Failed to fetch user info:", error);
        if (error.status === 401) {
          removeAuthToken();
          router.push("/login");
        }
        setError(
          error instanceof Error ? error.message : "Failed to fetch user info"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const logout = () => {
    removeAuthToken();
    setUser(null);
    router.push("/login");
  };

  return { user, loading, error, logout };
}
