import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/types/governance";

export interface ScopedInstitutionInfo {
  code: string;
  name: string;
  state: string;
}

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  scopedInstitution: ScopedInstitutionInfo;
  isInstitutionAdmin: boolean;
  isStudent: boolean;
  isVerifier: boolean;
  isAicteAdmin: boolean;
  resetToAicteAdmin: () => void;
}

const DEFAULT_SCOPED_INSTITUTION: ScopedInstitutionInfo = {
  code: "1-332901124",
  name: "College of Engineering, Pune (COEP)",
  state: "Maharashtra",
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole>("AICTE Admin");
  const navigate = useNavigate();

  const setRole = (role: UserRole) => {
    setCurrentRoleState(role);

    // Contextual navigation per demonstration persona
    if (role === "AICTE Admin") {
      navigate("/dashboard");
    } else if (role === "Institution Admin") {
      navigate("/students?institution=COEP");
    } else if (role === "Student") {
      navigate("/student");
    } else if (role === "Authorized Verifier") {
      navigate("/verification");
    }
  };

  const resetToAicteAdmin = () => {
    setRole("AICTE Admin");
  };

  const value: RoleContextType = {
    currentRole,
    setRole,
    scopedInstitution: DEFAULT_SCOPED_INSTITUTION,
    isInstitutionAdmin: currentRole === "Institution Admin",
    isStudent: currentRole === "Student",
    isVerifier: currentRole === "Authorized Verifier",
    isAicteAdmin: currentRole === "AICTE Admin",
    resetToAicteAdmin,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
