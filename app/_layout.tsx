import { Stack, Link } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, Pressable, Text } from "react-native";

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    if (Platform.OS === "web") {
      const id = "gf-bitcount";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Bitcount:wght@400;700&display=swap";
        document.head.appendChild(link);
      }
    }
  }, []);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerTitleStyle: { color: "#fff", fontSize: 32, fontFamily: Platform.OS === "web" ? "Bitcount, system-ui, sans-serif" as any : undefined },
          headerRight: () => (
            <Link href="/editor" asChild>
              <Pressable style={{ paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#333", borderRadius: 6, margin: 10 }}>
                <Text style={{ color: "#fff" }}>Node Editor</Text>
              </Pressable>
            </Link>
          ),
          contentStyle: { backgroundColor: "#000" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Ultimate E-Mail Client" }} />
        <Stack.Screen name="inbox/[address]" options={{ title: "Inbox" }} />
        <Stack.Screen name="mail/[id]" options={{ title: "Message" }} />
        <Stack.Screen name="editor/index" options={{ title: "Node Editor (Preview)", headerRight: () => null }} />
      </Stack>
    </>
  );
}
