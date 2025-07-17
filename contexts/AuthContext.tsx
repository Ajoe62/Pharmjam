import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { PharmacyUser, PharmacyRole } from "../types/auth";
import {
  pharmacyAuthService,
  SignInCredentials,
  // SignUpData, // COMMENTED OUT: SignUp not implemented yet
} from "../services/PharmacyAuthService";

interface AuthContextType {
  user: User | null;
  pharmacyUser: PharmacyUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<{ error: any }>;
  // signUp: (signUpData: SignUpData) => Promise<{ error: any }>; // COMMENTED OUT
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canAccessControlledSubstances: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [pharmacyUser, setPharmacyUser] = useState<PharmacyUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      // Get pharmacy user if authenticated
      if (session?.user) {
        const currentPharmacyUser = await pharmacyAuthService.getCurrentUser();
        setPharmacyUser(currentPharmacyUser);
      }

      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state changed:", event);
      setSession(session);
      setUser(session?.user ?? null);

      // Get pharmacy user when auth state changes
      if (session?.user) {
        const currentPharmacyUser = await pharmacyAuthService.getCurrentUser();
        setPharmacyUser(currentPharmacyUser);
      } else {
        setPharmacyUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: SignInCredentials) => {
    console.log("🚀 Attempting sign in for username:", credentials.username);
    console.log("🔍 Credentials being sent:", { 
      username: credentials.username, 
      // Don't log the actual password, just confirm it exists
      hasPassword: !!credentials.password,
      passwordLength: credentials.password?.length || 0
    });

    try {
      const result = await pharmacyAuthService.signIn(credentials);

      if (!result.success) {
        console.error("❌ Sign in error:", result.error);
        console.error("❌ Full result:", result); // Log the full result
        console.error("❌ Result type:", typeof result.error);
        console.error("❌ Result keys:", Object.keys(result));
        return { error: { message: result.error } };
      } else {
        console.log("✅ Sign in successful");
        console.log("✅ Result:", result); // Log successful result too
        // The auth state change will handle updating the user state
        return { error: null };
      }
    } catch (error) {
      console.error("❌ Sign in threw an exception:", error);
      console.error("❌ Exception type:", typeof error);
      console.error("❌ Exception message:", error instanceof Error ? error.message : 'Unknown error');
      return { error: { message: "An unexpected error occurred during sign in" } };
    }
  };

  // COMMENTED OUT: SignUp functionality not implemented yet
  // const signUp = async (signUpData: SignUpData) => {
  //   console.log("🚀 Attempting sign up for username:", signUpData.username);
  //   
  //   const result = await pharmacyAuthService.signUp(signUpData);
  //   
  //   if (!result.success) {
  //     console.error("❌ Sign up error:", result.error);
  //     return { error: { message: result.error } };
  //   } else {
  //     console.log("✅ Sign up successful");
  //     return { error: null };
  //   }
  // };

  const signOut = async () => {
    console.log("🚪 Signing out user");
    await pharmacyAuthService.signOut();
    setPharmacyUser(null);
  };

  // Permission helper methods
  const hasPermission = (permission: string): boolean => {
    if (!pharmacyUser) return false;

    // Import permission check function
    const { hasPermission: checkPermission } = require("../types/auth");
    return checkPermission(pharmacyUser.role, permission);
  };

  const canAccessControlledSubstances = (): boolean => {
    if (!pharmacyUser) return false;

    const {
      canAccessControlledSubstances: checkAccess,
    } = require("../types/auth");
    return checkAccess(pharmacyUser.role);
  };

  const value = {
    user,
    pharmacyUser,
    session,
    loading,
    signIn,
    // signUp, // COMMENTED OUT: SignUp not implemented yet
    signOut,
    hasPermission,
    canAccessControlledSubstances,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};