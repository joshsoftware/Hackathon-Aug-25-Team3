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
import { useUser } from "@/hooks/useUser";

export function UserProfile() {
  const router = useRouter();
  const { user } = useUser();

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
          // className="relative h-9 w-9 rounded-full flex items-center justify-center"
        >
          {user ? (
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user.full_name}</span>
            </div>
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        {user && (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{user.full_name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {user.role || 'User'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
