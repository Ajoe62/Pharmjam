// contexts/UserContext.tsx - Internal user management context
// This works alongside AuthContext to provide role-based access control

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, UserSession, StaffActivity } from "../types";
import {
  sampleUsers,
  authenticateUser,
  getUserById,
  userHasPermission,
  getUserByUsername,
} from "../data/sampleUsers";

interface UserContextType {
  // Current user state
  currentUser: User | null;
  currentSession: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Authentication methods
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Permission checks
  hasPermission: (permissionId: string) => boolean;
  canAccess: (requiredRole: UserRole | UserRole[]) => boolean;

  // User management (for admins)
  allUsers: User[];
  getUserDetails: (userId: string) => User | undefined;

  // Activity tracking
  logActivity: (action: string, description: string, metadata?: any) => void;
  userActivities: StaffActivity[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State management
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(
    null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userActivities, setUserActivities] = useState<StaffActivity[]>([]);

  // Initialize - check for existing session
  useEffect(() => {
    console.log("👥 UserContext: Initializing...");

    // In a real app, you'd check for stored session/token
    // For demo, we'll auto-login as admin for easier testing of all features
    const demoUser = getUserByUsername("admin");
    if (demoUser) {
      setCurrentUser(demoUser);
      setIsAuthenticated(true);
      setCurrentSession({
        id: `session_${Date.now()}`,
        user_id: demoUser.id,
        session_token: `token_${Date.now()}`,
        login_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_active: true,
      });

      logActivity(
        "user_login",
        `${demoUser.firstName} ${demoUser.lastName} logged in`,
        {
          loginMethod: "demo_auto_login",
          userRole: demoUser.role,
        }
      );
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    console.log("🔐 UserContext: Attempting login for", username);
    setIsLoading(true);

    try {
      const user = authenticateUser(username, password);

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);

        const session: UserSession = {
          id: `session_${Date.now()}`,
          user_id: user.id,
          session_token: `token_${Date.now()}`,
          login_time: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_active: true,
        };

        setCurrentSession(session);

        logActivity(
          "user_login",
          `${user.firstName} ${user.lastName} logged in successfully`,
          {
            loginMethod: "username_password",
            userRole: user.role,
          }
        );

        console.log("✅ Login successful for", user.firstName, user.lastName);
        return true;
      } else {
        logActivity(
          "failed_login",
          `Failed login attempt for username: ${username}`,
          {
            loginMethod: "username_password",
            reason: "invalid_credentials",
          }
        );

        console.log("❌ Login failed for", username);
        return false;
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log("👋 UserContext: Logging out user", currentUser?.firstName);

    if (currentUser) {
      logActivity(
        "user_logout",
        `${currentUser.firstName} ${currentUser.lastName} logged out`,
        {
          sessionDuration: currentSession
            ? Date.now() - new Date(currentSession.login_time).getTime()
            : 0,
        }
      );
    }

    setCurrentUser(null);
    setCurrentSession(null);
    setIsAuthenticated(false);
  };

  // Permission check
  const hasPermission = (permissionId: string): boolean => {
    if (!currentUser) return false;
    return userHasPermission(currentUser, permissionId);
  };

  // Role access check
  const canAccess = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;

    const requiredRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    return requiredRoles.includes(currentUser.role);
  };

  // Get user details (for admin functions)
  const getUserDetails = (userId: string): User | undefined => {
    return getUserById(userId);
  };

  // Log user activity
  const logActivity = (action: string, description: string, metadata?: any) => {
    const activity: StaffActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: currentUser?.id || "system",
      activity_type: "other",
      description,
      timestamp: new Date().toISOString(),
    };

    setUserActivities((prev) => [activity, ...prev.slice(0, 99)]); // Keep last 100 activities
    console.log("📝 Activity logged:", action, description);
  };

  const value: UserContextType = {
    // Current user state
    currentUser,
    currentSession,
    isAuthenticated,
    isLoading,

    // Authentication methods
    login,
    logout,

    // Permission checks
    hasPermission,
    canAccess,

    // User management
    allUsers: sampleUsers,
    getUserDetails,

    // Activity tracking
    logActivity,
    userActivities,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
