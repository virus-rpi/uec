import { FlatList, Pressable, Text, View, useWindowDimensions, ActivityIndicator, Platform } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { Email, groupByToAddress } from "@/lib/email_utils";
import { getAccounts } from "@/lib/accounts";
import { fetchAllEmailsFromAccounts } from "@/lib/gmail";
import { HtmlViewer } from "@/components/HtmlViewer";
import { FadeSlideIn } from "@/components/animations";
import TypewriterText from "@/components/TypewriterText";

function Heading(props: any) {
  return (
    <Text
      {...props}
      style={[
        { color: "#fff", fontFamily: "Bitcount, system-ui, sans-serif" },
        { letterSpacing: 0.5, textShadowColor: "rgba(255,255,255,0.15)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 1 },
        props.style,
      ]}
    />
  );
}

function T(props: any) {
  return (
    <Text
      {...props}
      style={[
        { color: "#fff" },
        { letterSpacing: 0.3, textShadowColor: "rgba(255,255,255,0.1)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 1 },
        props.style,
      ]}
    />
  );
}

function Wireframe() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", opacity: 0.3 }}>
      <View style={{ width: "90%", height: 40, backgroundColor: "#222", borderRadius: 8, marginBottom: 16 }} />
      <View style={{ width: "90%", height: 60, backgroundColor: "#222", borderRadius: 8, marginBottom: 8 }} />
      <View style={{ width: "90%", height: 60, backgroundColor: "#222", borderRadius: 8, marginBottom: 8 }} />
      <View style={{ width: "90%", height: 60, backgroundColor: "#222", borderRadius: 8, marginBottom: 8 }} />
      <View style={{ width: "90%", height: 60, backgroundColor: "#222", borderRadius: 8, marginBottom: 8 }} />
    </View>
  );
}

export default function Index() {
  const [items, setItems] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const accs = await getAccounts();
        const emails = await fetchAllEmailsFromAccounts(accs);
        setItems(emails);
      } catch (e: any) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const groups = useMemo(() => groupByToAddress(items), [items]);
  const addresses = useMemo(() => Object.keys(groups).sort(), [groups]);

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAddress || !addresses.includes(selectedAddress)) {
      setSelectedAddress(addresses[0] ?? null);
    }
  }, [addresses, selectedAddress]);

  useEffect(() => {
    if (selectedAddress) {
      const firstId = groups[selectedAddress]?.slice().sort((a, b) => b.date.localeCompare(a.date))[0]?.id ?? null;
      setSelectedMessageId(firstId);
    } else {
      setSelectedMessageId(null);
    }
  }, [selectedAddress, groups]);

  const { width } = useWindowDimensions();
  const isNarrow = width < 900;

  const messages = useMemo(() => (selectedAddress ? groups[selectedAddress].slice().sort((a, b) => b.date.localeCompare(a.date)) : []), [groups, selectedAddress]);
  const selectedMessage = useMemo(() => messages.find((m) => m.id === selectedMessageId) ?? null, [messages, selectedMessageId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000", margin: 10 }}>
      {loading && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Wireframe />
          <ActivityIndicator size="large" color="#fff" style={{ position: "absolute", top: "50%", left: "50%", marginLeft: -20, marginTop: -20 }} />
          <TypewriterText
            text="Loading emails…"
            startDelayMs={50}
            speedMsPerChar={12}
            pauseAtEndMs={0}
            style={{ marginTop: 12, color: "#aaa", fontFamily: Platform.OS === "web" ? "Bitcount, system-ui, sans-serif" : undefined, fontSize: 18 }}
          />
        </View>
      )}
      {!!error && (
        <View style={{ padding: 8, backgroundColor: "#200", borderRadius: 8, borderWidth: 1, borderColor: "#400", marginBottom: 8 }}>
          <T style={{ color: "#faa" }}>Error: {error}</T>
        </View>
      )}
      {!loading && !error && items.length === 0 && (
        <View style={{ padding: 8, backgroundColor: "#0a0a0a", borderRadius: 8, borderWidth: 1, borderColor: "#222", marginBottom: 8 }}>
          <T>No emails to show yet. Connect your account via the Accounts button in the header.</T>
        </View>
      )}
      {!loading && (
        <View style={{ flex: 1, flexDirection: isNarrow ? "column" : "row" }}>
          <FadeSlideIn delay={80} style={{ width: isNarrow ? "100%" : "22%", borderRightWidth: isNarrow ? 0 : 1, borderRightColor: "#111", padding: 8 }}>
            <Heading style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
              <TypewriterText text="Virtual Inboxes" startDelayMs={200} pauseAtEndMs={0} />
            </Heading>
            <FlatList
              data={addresses}
              keyExtractor={(addr) => addr}
              ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
              renderItem={({ item: address }) => {
                const list = groups[address];
                const latest = list.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
                const selected = address === selectedAddress;
                return (
                  <Pressable
                    onPress={() => {
                      setSelectedAddress(address);
                      const firstId = list.slice().sort((a, b) => b.date.localeCompare(a.date))[0]?.id ?? null;
                      setSelectedMessageId(firstId);
                    }}
                    style={({ pressed }) => ({
                      padding: 10,
                      backgroundColor: selected ? "#0f0f0f" : pressed ? "#0a0a0a" : "#050505",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: selected ? "#2a2a2a" : "#1a1a1a",
                    })}
                  >
                    <T style={{ fontSize: 15, fontWeight: "600", marginBottom: 2 }}>{address}</T>
                    <T style={{ color: "#bbb" }} numberOfLines={1}>
                      {latest.subject} — {latest.snippet}
                    </T>
                    <T style={{ color: "#666", marginTop: 4 }}>{list.length} message(s)</T>
                  </Pressable>
                );
              }}
            />
          </FadeSlideIn>

          <FadeSlideIn delay={180} style={{ width: isNarrow ? "100%" : "28%", borderRightWidth: isNarrow ? 0 : 1, borderRightColor: "#111", padding: 8 }}>
            <Heading style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
              <TypewriterText text="Messages" startDelayMs={600} pauseAtEndMs={0} />
            </Heading>
            {selectedAddress ? (
              <FlatList
                data={messages}
                keyExtractor={(m) => m.id}
                ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
                renderItem={({ item }) => {
                  const selected = item.id === selectedMessageId;
                  return (
                    <Pressable
                      onPress={() => setSelectedMessageId(item.id)}
                      style={({ pressed }) => ({
                        padding: 10,
                        backgroundColor: selected ? "#101010" : pressed ? "#0a0a0a" : "#050505",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: selected ? "#2a2a2a" : "#1a1a1a",
                      })}
                    >
                      <T style={{ fontSize: 15, fontWeight: "600" }}>{item.subject}</T>
                      <T style={{ color: "#bbb" }} numberOfLines={1}>{item.snippet}</T>
                      <T style={{ color: "#666", marginTop: 4 }}>From: {item.from}</T>
                    </Pressable>
                  );
                }}
              />
            ) : (
              <T style={{ color: "#888" }}>Select a virtual inbox on the left.</T>
            )}
          </FadeSlideIn>

          <FadeSlideIn delay={260} style={{ flex: 1, padding: 12, maxHeight: '100%', overflow: Platform.OS === 'web' ? 'scroll' : undefined }}>
            <Heading style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
              <TypewriterText text="Message" startDelayMs={1000} pauseAtEndMs={900} />
            </Heading>
            {selectedMessage ? (
              <View style={{ flex: 1, maxHeight: "100%", overflowY: "scroll"}}>
                <Heading style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>{selectedMessage.subject}</Heading>
                <T style={{ color: "#bbb" }}>From: {selectedMessage.from}</T>
                <T style={{ color: "#bbb" }}>To: {selectedMessage.to}</T>
                <T style={{ color: "#666", marginBottom: 12 }}>{new Date(selectedMessage.date).toLocaleString()}</T>
                <View style={{ flex: 1, minHeight: 0 }}>
                  {selectedMessage.bodyHtml ? (
                    <HtmlViewer html={selectedMessage.bodyHtml} />
                  ) : (
                    <T style={{ lineHeight: 22 }}>{selectedMessage.bodyText || selectedMessage.body}</T>
                  )}
                </View>
              </View>
            ) : (
              <T style={{ color: "#888" }}>Select a message from the middle column.</T>
            )}
          </FadeSlideIn>
        </View>
      )}
    </View>
  );
}
