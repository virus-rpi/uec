import { Link, useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { fetchGmailEmails } from "@/lib/gmail";
import {getAccounts, GmailAccount} from "@/lib/accounts";
import type { Email } from "@/lib/email_utils";

function T(props: any) {
  return <Text {...props} style={[{ color: "#fff" }, props.style]} />;
}

export default function InboxByAddress() {
  const { address } = useLocalSearchParams<{ address: string }>();
  const [emails, setEmails] = useState<Email[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gmailAccount, setGmailAccount] = useState<GmailAccount | undefined>(undefined);

  useEffect(() => {
    async function loadAccountsAndEmails() {
      setError(null);
      setGmailAccount(undefined);
      try {
        const accounts = await getAccounts();
        const gmail = accounts.find(acc => acc.type === "gmail") as GmailAccount | undefined;
        setGmailAccount(gmail);
        if (!gmail) {
          setError("No Gmail account connected.");
          setEmails([]);
          return;
        }
        const fetched = await fetchGmailEmails(gmail);
        setEmails(fetched.filter((e) => e.to === address));
      } catch (err: any) {
        if (err?.message?.includes("403")) {
          setError("Google API access denied (403). Please re-authenticate.");
        } else {
          setError("Failed to load emails.");
        }
        setEmails([]);
      }
    }
    loadAccountsAndEmails().then();
  }, [address]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 12 }}>
      <T style={{ color: "#aaa", marginBottom: 8 }}>To: {address}</T>
      {error ? (
        <T style={{ color: "#f55", marginBottom: 12 }}>{error}</T>
      ) : (
        <FlatList
          data={emails.sort((a, b) => b.date.localeCompare(a.date))}
          keyExtractor={(m) => m.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Link href={{ pathname: "/mail/[id]", params: { id: item.id } }} asChild>
              <Pressable
                style={({ pressed }) => ({
                  padding: 12,
                  backgroundColor: pressed ? "#0a0a0a" : "#050505",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#1a1a1a",
                })}
              >
                <T style={{ fontSize: 15, fontWeight: "600" }}>{item.subject}</T>
                <T style={{ color: "#bbb" }} numberOfLines={1}>{item.snippet}</T>
                <T style={{ color: "#666", marginTop: 6 }}>From: {item.from}</T>
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}
