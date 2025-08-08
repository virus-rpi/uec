import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { emails } from "@/lib/email_utils";

function T(props: any) {
  return <Text {...props} style={[{ color: "#fff" }, props.style]} />;
}

export default function MailDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mail = emails.find((m) => m.id === id);

  if (!mail) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <T>Message not found.</T>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000" }} contentContainerStyle={{ padding: 16 }}>
      <T style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>{mail.subject}</T>
      <T style={{ color: "#bbb" }}>From: {mail.from}</T>
      <T style={{ color: "#bbb" }}>To: {mail.to}</T>
      <T style={{ color: "#666", marginBottom: 16 }}>{new Date(mail.date).toLocaleString()}</T>
      <T style={{ lineHeight: 22 }}>{mail.body}</T>
    </ScrollView>
  );
}
