import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { clearAuthSession, getAuthSession } from "../../lib/storage";

const LIGHT_THEME = {
  background: "#f5f7fb",
  text: "#111827",
  secondaryText: "#4b5563",
};

export default function DashboardScreen() {
  const router = useRouter();
  const theme = LIGHT_THEME;
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      const session = await getAuthSession();

      if (!session?.authenticated) {
        router.replace("/");
        return;
      }

      setName(session.name || "");
      setEmail(session.email || "");
      setReady(true);
    };

    loadSession();
  }, [router]);

  const handleSignOut = async () => {
    await clearAuthSession();
    router.replace("/");
  };

  if (!ready) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {name ? `Welcome ${name}` : "Welcome"}
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {email ? `Signed in as ${email}` : "You are signed in."}
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.signOutButton,
          pressed && styles.signOutButtonPressed,
        ]}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  signOutButton: {
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#1d4ed8",
  },
  signOutButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  signOutButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
});
