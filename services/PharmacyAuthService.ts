// services/PharmacyAuthService.ts
// SIMPLIFIED Authentication service

import { supabase } from "../lib/supabase";
import { 
  PharmacyUser, 
  PharmacyRole, 
  validateUsername, 
  validatePassword 
} from "../types/auth";

export interface SignInCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: PharmacyUser;
  error?: string;
}

export class PharmacyAuthService {
  private static instance: PharmacyAuthService;

  public static getInstance(): PharmacyAuthService {
    if (!PharmacyAuthService.instance) {
      PharmacyAuthService.instance = new PharmacyAuthService();
    }
    return PharmacyAuthService.instance;
  }

  /**
   * SIMPLIFIED Sign in - just username and password
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    try {
      console.log("🔐 SIMPLE AUTH: Attempting login for:", credentials.username);

      // Use your auth.ts validation functions
      const usernameValidation = validateUsername(credentials.username);
      if (!usernameValidation.isValid) {
        return { success: false, error: usernameValidation.error };
      }

      const passwordValidation = validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: (passwordValidation as any).error || "Invalid password" };
      }

      // Get pharmacy user by username - FIXED: Use .maybeSingle() to handle 0 or 1 results
      const { data: pharmacyUser, error: userError } = await supabase
        .from("pharmacy_users")
        .select("*")
        .eq("username", credentials.username.toLowerCase())
        .eq("is_active", true)
        .maybeSingle(); // This handles 0 or 1 results without throwing error

      if (userError) {
        console.error("❌ Database error:", userError.message);
        return { success: false, error: "Database error occurred" };
      }

      if (!pharmacyUser) {
        console.error("❌ User not found:", credentials.username);
        return { success: false, error: "Invalid username or password" };
      }

      console.log("✅ User found:", pharmacyUser.username);

      // Create email for Supabase auth
      const authEmail = `${credentials.username}@pharmjam.app`;

      // Try Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: credentials.password,
      });

      if (authError) {
        console.error("❌ Authentication failed:", authError.message);
        return { success: false, error: "Invalid username or password" };
      }

      console.log("✅ Authentication successful for:", credentials.username);

      // Update last login (optional)
      await supabase
        .from("pharmacy_users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", pharmacyUser.id);

      return {
        success: true,
        user: pharmacyUser,
      };

    } catch (error) {
      console.error("❌ SIMPLE AUTH: Unexpected error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      console.log("🚪 SIMPLE AUTH: Signing out user");
      await supabase.auth.signOut();
      console.log("✅ Sign out successful");
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  }

  /**
   * Get current pharmacy user
   */
  async getCurrentUser(): Promise<PharmacyUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data: pharmacyUser } = await supabase
        .from("pharmacy_users")
        .select("*")
        .eq("auth_user_id", user.id)
        .eq("is_active", true)
        .maybeSingle(); // Use maybeSingle here too

      return pharmacyUser || null;
    } catch (error) {
      console.error("❌ Get current user error:", error);
      return null;
    }
  }

  /**
   * DEBUGGING: Check what users exist
   */
  async debugCheckUsers(): Promise<void> {
    try {
      const { data: users, error } = await supabase
        .from("pharmacy_users")
        .select("username, role, is_active, auth_user_id");

      if (error) {
        console.error("❌ Debug error:", error);
        return;
      }

      console.log("🔍 USERS IN DATABASE:");
      users?.forEach(user => {
        console.log(`  - ${user.username} (${user.role}) - Active: ${user.is_active} - Auth ID: ${user.auth_user_id ? 'Linked' : 'Not Linked'}`);
      });
    } catch (error) {
      console.error("❌ Debug check failed:", error);
    }
  }
}

// Export singleton instance
export const pharmacyAuthService = PharmacyAuthService.getInstance();