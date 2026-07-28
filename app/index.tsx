import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { setAuthSession } from "../lib/storage";
import { supabase, SUPABASE_CONFIGURED } from "../lib/supabase";

const LIGHT_THEME = {
  background: "#f5f7fb",
  text: "#111827",
  secondaryText: "#4b5563",
  bannerText: "#7c4a00",
  error: "#c00",
};

export default function Index() {
  const router = useRouter();
  const theme = LIGHT_THEME;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    setError("");

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      setError("Please fix validation errors before signing in.");
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim();

      if (SUPABASE_CONFIGURED && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        } as any);

        if (error) {
          setError(error.message || "Sign-in failed");
        } else {
          const signedInName =
            (data as any)?.user?.user_metadata?.name ||
            (data as any)?.session?.user?.user_metadata?.name ||
            "";
          await setAuthSession({ email: normalizedEmail, name: signedInName });
          setEmail("");
          setPassword("");
          setEmailTouched(false);
          setPasswordTouched(false);
          router.replace("/dashboard" as any);
        }
      } else {
        Alert.alert(
          "Supabase not configured",
          "Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env before signing in.",
        );
      }
    } catch (err: any) {
      setError(err?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (e: string) => {
    if (!e) return false;
    return /\S+@\S+\.\S+/.test(e);
  };

  const validatePassword = (p: string) => {
    if (!p) return false;
    return p.length >= 6;
  };

  const formValid = validateEmail(email) && validatePassword(password);
  const emailError = emailTouched && !validateEmail(email);

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: theme.background, paddingTop: 80 },
          ]}
        >
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderWidth: Platform.OS === "android" ? 0 : 1,
                borderColor:
                  Platform.OS === "android"
                    ? "transparent"
                    : "rgba(255, 255, 255, 0.25)",
              },
            ]}
          >
            <View style={styles.heroWrap}>
              <Text style={[styles.title, { color: theme.text }]}>
                Welcome back
              </Text>
              <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                Sign in to continue
              </Text>
            </View>

            {!SUPABASE_CONFIGURED ? (
              <View style={styles.banner}>
                <Text style={[styles.bannerText, { color: theme.bannerText }]}>
                  Supabase is not configured. Add `EXPO_PUBLIC_SUPABASE_URL` and
                  `EXPO_PUBLIC_SUPABASE_ANON_KEY` to .env and restart the app.
                </Text>
              </View>
            ) : null}

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderColor: "rgba(15, 23, 42, 0.1)",
                  color: "#111827",
                },
              ]}
              placeholderTextColor="#6b7280"
              placeholder="Email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError("");
              }}
              onBlur={() => setEmailTouched(true)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <Text style={styles.fieldError}>
                {email ? "Enter a valid email address" : "Email is required"}
              </Text>
            ) : null}

            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    marginRight: 8,
                    marginBottom: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderColor: "rgba(15, 23, 42, 0.1)",
                    color: "#111827",
                  },
                ]}
                placeholderTextColor="#6b7280"
                placeholder="Password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (error) setError("");
                }}
                onBlur={() => setPasswordTouched(true)}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
                style={({ pressed }) => [
                  { padding: 6, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color={theme.text}
                />
              </Pressable>
            </View>

            {error ? (
              <Text style={[styles.error, { color: theme.error }]}>
                {error}
              </Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (loading || !formValid || !SUPABASE_CONFIGURED) &&
                  styles.primaryButtonDisabled,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleLogin}
              disabled={loading || !formValid || !SUPABASE_CONFIGURED}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: theme.text }]}>
              Don&apos;t have an account yet?{" "}
            </Text>
            <Pressable onPress={() => router.push("/sign-up")}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    position: "relative",
  },
  heroWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  formCard: {
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    backdropFilter: "blur(12px)",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButton: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#2563eb",
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  error: {
    color: "#c00",
    marginBottom: 8,
    textAlign: "center",
  },
  fieldError: {
    color: "#c00",
    fontSize: 12,
    marginBottom: 8,
  },
  secondaryButton: {
    marginTop: 8,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 8,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  banner: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba",
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  bannerText: {
    fontSize: 12,
  },
});
