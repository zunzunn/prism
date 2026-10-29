import React from "react";
import { Outlet } from "react-router-dom";
import { RoleProvider } from "@/context/RoleContext";

export const RootLayout: React.FC = () => {
  return (
    <RoleProvider>
      <Outlet />
    </RoleProvider>
  );
};

export default RootLayout;
