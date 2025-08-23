"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { removeAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UserProfile() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Try to get user email from localStorage (from auth token or user object)
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.email) setEmail(user.email);
      } else {
        // fallback: try to get from token if you store user info in token
        const tokenStr = localStorage.getItem("auth_token");
        if (tokenStr) {
          // If your token is a JWT, you can decode it here to get the email
          // For now, just show a placeholder
          setEmail("user@example.com");
        }
      }
    } catch {
      setEmail("user@example.com");
    }
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>{email || "user@example.com"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
