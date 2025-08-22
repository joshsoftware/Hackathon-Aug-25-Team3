"use client";

import Wrapper from "@/components/Wrapper";
import React from "react";
import BackBtn from "@/components/BackBtn";
import { usePathname } from "next/navigation";
import { UserProfile } from "../../components/UserProfile";

const Header = () => {
  const pathname = usePathname();

  return (
    <div className="bg-background border-b w-full shadow-sm sticky top-0 z-50">
      <Wrapper>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            {pathname !== "/upload" && pathname !== "/dashboard" && <BackBtn />}
          </div>
          <UserProfile />
        </div>
      </Wrapper>
    </div>
  );
};

export default Header;
