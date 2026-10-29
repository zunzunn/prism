import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/types/governance";

export interface ScopedInstitutionInfo {
  code: string;
  name: string;
  state: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  institution?: string;
  department?: string;
  lastLogin?: string;
}

export const DEMO_PROFILES: Record<UserRole, AuthUser> = {
  "AICTE Admin": {
    id: "usr_aicte_001",
    name: "Dr. Anil Sahasrabudhe",
    email: "admin@aicte.gov.in",
    role: "AICTE Admin",
    avatarInitials: "AS",
    institution: "AICTE Central Command, New Delhi",
    department: "National Academic Regulatory Division",
    lastLogin: "Active Session",
  },
  "Institution Admin": {
    id: "usr_inst_coep",
    name: "Prof. Rajesh Verma",
    email: "registrar@coep.ac.in",
    role: "Institution Admin",
    avatarInitials: "RV",
    institution: "College of Engineering, Pune (COEP)",
    department: "Office of the Registrar",
    lastLogin: "Active Session",
  },
  "Authorized Verifier": {
    id: "usr_verif_009",
    name: "Meera Krishnan",
    email: "verifications@tcs.com",
    role: "Authorized Verifier",
    avatarInitials: "MK",
    institution: "Tata Consultancy Services Ltd.",
    department: "Credential Verification Desk",
    lastLogin: "Active Session",
  },
  "Student": {
    id: "usr_stu_8892",
    name: "Aarav Sharma",
    email: "aarav.sharma@students.aicte.gov.in",
    role: "Student",
    avatarInitials: "AS",
    institution: "College of Engineering, Pune (COEP)",
    department: "B.Tech Computer Engineering (2024-28)",
    lastLogin: "Active Session",
  },
};

const DEFAULT_SCOPED_INSTITUTION: ScopedInstitutionInfo = {
  code: "1-332901124",
  name: "College of Engineering, Pune (COEP)",
  state: "Maharashtra",
};

export interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: AuthUser;
  isAuthenticated: boolean;
  login: (email: string, password?: string, designatedRole?: UserRole) => Promise<boolean>;
  logout: () => void;
  scopedInstitution: ScopedInstitutionInfo;
  isInstitutionAdmin: boolean;
  isStudent: boolean;
  isVerifier: boolean;
  isAicteAdmin: boolean;
  resetToAicteAdmin: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const RoleProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const storedRole = localStorage.getItem("creden_auth_role") as UserRole | null;
      if (storedRole && DEMO_PROFILES[storedRole]) {
        return storedRole;
      }
    } catch {
      // ignore
    }
    return "AICTE Admin";
  });

  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const storedUser = localStorage.getItem("creden_auth_user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch {
      // ignore
    }
    return DEMO_PROFILES[currentRole] || DEMO_PROFILES["AICTE Admin"];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem("creden_authenticated") !== "false";
    } catch {
      return true;
    }
  });

  const navigate = useNavigate();

  const setRole = (role: UserRole) => {
    setCurrentRoleState(role);
    const profile = DEMO_PROFILES[role];
    setCurrentUser(profile);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("creden_auth_role", role);
      localStorage.setItem("creden_auth_user", JSON.stringify(profile));
      localStorage.setItem("creden_authenticated", "true");
    } catch {
      // ignore
    }

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

  const login = async (
    email: string,
    _password?: string,
    designatedRole?: UserRole
  ): Promise<boolean> => {
    // Brief realistic verification delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let matchedRole: UserRole = designatedRole || "AICTE Admin";
    if (!designatedRole) {
      const lower = email.toLowerCase();
      if (lower.includes("coep") || lower.includes("registrar") || lower.includes("inst")) {
        matchedRole = "Institution Admin";
      } else if (lower.includes("verify") || lower.includes("tcs") || lower.includes("hr")) {
        matchedRole = "Authorized Verifier";
      } else if (lower.includes("student") || lower.includes("aarav") || lower.includes("apaar")) {
        matchedRole = "Student";
      }
    }

    const baseProfile = DEMO_PROFILES[matchedRole];
    const user: AuthUser = {
      ...baseProfile,
      email: email || baseProfile.email,
      lastLogin: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " IST",
    };

    setCurrentRoleState(matchedRole);
    setCurrentUser(user);
    setIsAuthenticated(true);

    try {
      localStorage.setItem("creden_auth_user", JSON.stringify(user));
      localStorage.setItem("creden_auth_role", matchedRole);
      localStorage.setItem("creden_authenticated", "true");
    } catch {
      // ignore
    }

    if (matchedRole === "AICTE Admin") {
      navigate("/dashboard");
    } else if (matchedRole === "Institution Admin") {
      navigate("/students?institution=COEP");
    } else if (matchedRole === "Student") {
      navigate("/student");
    } else if (matchedRole === "Authorized Verifier") {
      navigate("/verification");
    }

    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("creden_auth_user");
      localStorage.removeItem("creden_auth_role");
      localStorage.setItem("creden_authenticated", "false");
    } catch {
      // ignore
    }
    navigate("/logout");
  };

  const resetToAicteAdmin = () => {
    setRole("AICTE Admin");
  };

  const value: RoleContextType = {
    currentRole,
    setRole,
    currentUser,
    isAuthenticated,
    login,
    logout,
    scopedInstitution: DEFAULT_SCOPED_INSTITUTION,
    isInstitutionAdmin: currentRole === "Institution Admin",
    isStudent: currentRole === "Student",
    isVerifier: currentRole === "Authorized Verifier",
    isAicteAdmin: currentRole === "AICTE Admin",
    resetToAicteAdmin,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const existingContext = useContext(RoleContext);
  if (existingContext) {
    // Avoid double-wrapping state if ancestor already provides RoleContext
    return <>{children}</>;
  }
  return <RoleProviderInner>{children}</RoleProviderInner>;
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
