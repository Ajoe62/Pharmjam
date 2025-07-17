import * as React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";

const { width, height } = Dimensions.get("window");

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  console.log("🔐 LoginScreen: Component rendered");

  const { signIn, pharmacyUser, loading } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleLogin = async () => {
    console.log("🚀 Login attempt started");

    if (!username.trim()) {
      Alert.alert("Error", "Please enter your username");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setIsSigningIn(true);

    try {
      const { error } = await signIn({
        username: username.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
      } else {
        console.log("✅ Login successful, navigating...");
        navigation.navigate("Dashboard");
      }
    } catch (error) {
      console.error("❌ Unexpected login error:", error);
      Alert.alert(
        "Login Failed",
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Top Background Image */}
        <ImageBackground
          source={require("../../../assets/images/pills-background.png")}
          style={styles.topBackground}
          blurRadius={3}
        >
          <View style={styles.overlay} />
        </ImageBackground>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.appTitle}>PharmTrack</Text>
          <Text style={styles.subtitle}>Pharmacy Management System</Text>

          <View style={styles.formContainer}>
            {/* Username Input */}
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
            />

            {/* Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              textContentType="password"
            />

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.loginButton]}
              onPress={handleLogin}
              disabled={isSigningIn}
            >
              <Text style={[styles.actionButtonText, styles.loginButtonText]}>
                {isSigningIn ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            {/* Info Text */}
            <Text style={styles.infoText}>
              Use your assigned username and password to access the system
            </Text>
          </View>
        </View>

        {/* Bottom Background Image */}
        <ImageBackground
          source={require("../../../assets/images/pills-background.png")}
          style={styles.bottomBackground}
          blurRadius={3}
        >
          <View style={styles.overlay} />
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50, // Add extra bottom padding for keyboard
  },
  topBackground: {
    height: height * 0.15, // Further reduced to give more space
    width: "100%",
    minHeight: 80, // Reduced minimum height
  },
  bottomBackground: {
    height: height * 0.1, // Reduced to give more space
    width: "100%",
    minHeight: 60, // Reduced minimum height
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 30, // Increased padding
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    minHeight: height * 0.6, // Increased minimum height for content
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
    marginBottom: 40,
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
    paddingBottom: 30,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    marginBottom: 16,
    color: "#333333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButton: {
    backgroundColor: "#00D4AA",
    marginTop: 10,
    shadowColor: "#00D4AA",
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  loginButtonText: {
    color: "#FFFFFF",
  },
  infoText: {
    textAlign: "center",
    color: "#666666",
    fontSize: 14,
    marginTop: 20,
    lineHeight: 20,
  },
});
