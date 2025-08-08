import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View, ActivityIndicator, Platform } from "react-native";
import { Email } from "@/lib/email_utils";
import { getAccounts, GmailAccount } from "@/lib/accounts";
import { fetchGmailEmailById } from "@/lib/gmail";
import { useEffect, useState } from "react";
import { HtmlViewer } from "@/components/HtmlViewer";

function T(props: any) {
  return <Text {...props} style={[{ color: "#fff" }, props.style]} />;
}

export default function MailDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mail, setMail] = useState<Email | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      setError(null);
      setLoading(true);
      try {
        const accounts = await getAccounts();
        const gmail = accounts.find((a) => a.type === "gmail") as GmailAccount | undefined;
        if (!gmail) throw new Error("No Gmail account connected");
        const email = await fetchGmailEmailById(gmail, id);
        if (mounted) setMail(email ?? null);
      } catch (e: any) {
        if (mounted) setError(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ marginTop: 12, color: "#aaa", fontFamily: Platform.OS === "web" ? "Bitcount, system-ui, sans-serif" : undefined, fontSize: 18 }}>
          Loading message…
        </Text>
      </View>
    );
  }

  if (error || !mail) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <T>{error || "Message not found."}</T>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000" }} contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
      <T style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>{mail.subject}</T>
      <T style={{ color: "#bbb" }}>From: {mail.from}</T>
      <T style={{ color: "#bbb" }}>To: {mail.to}</T>
      <T style={{ color: "#666", marginBottom: 16 }}>{new Date(mail.date).toLocaleString()}</T>
      {mail.bodyHtml ? (
        <HtmlViewer html={mail.bodyHtml} height={`auto`} />
      ) : (
        <T style={{ lineHeight: 22 }}>{mail.bodyText || mail.body}</T>
      )}
    </ScrollView>
  );
}
