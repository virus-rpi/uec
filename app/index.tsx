import { FlatList, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useMemo, useState } from "react";
import { emails, groupByToAddress } from "./lib/mockData";

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

export default function Index() {
  const groups = useMemo(() => groupByToAddress(emails), []);
  const addresses = useMemo(() => Object.keys(groups).sort(), [groups]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(addresses[0] ?? null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    selectedAddress && groups[selectedAddress]?.slice().sort((a, b) => b.date.localeCompare(a.date))[0]?.id
      ? groups[selectedAddress].slice().sort((a, b) => b.date.localeCompare(a.date))[0].id
      : null
  );

  const { width } = useWindowDimensions();
  const isNarrow = width < 900;

  const messages = useMemo(() => (selectedAddress ? groups[selectedAddress].slice().sort((a, b) => b.date.localeCompare(a.date)) : []), [groups, selectedAddress]);
  const selectedMessage = useMemo(() => messages.find((m) => m.id === selectedMessageId) ?? null, [messages, selectedMessageId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000", margin: 10 }}>
      <View style={{ flex: 1, flexDirection: isNarrow ? "column" : "row" }}>
        <View style={{ width: isNarrow ? "100%" : "22%", borderRightWidth: isNarrow ? 0 : 1, borderRightColor: "#111", padding: 8 }}>
          <Heading style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Virtual Inboxes</Heading>
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
        </View>

        <View style={{ width: isNarrow ? "100%" : "28%", borderRightWidth: isNarrow ? 0 : 1, borderRightColor: "#111", padding: 8 }}>
          <Heading style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Messages</Heading>
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
        </View>

        <View style={{ flex: 1, padding: 12 }}>
          <Heading style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Message</Heading>
          {selectedMessage ? (
            <View>
              <Heading style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>{selectedMessage.subject}</Heading>
              <T style={{ color: "#bbb" }}>From: {selectedMessage.from}</T>
              <T style={{ color: "#bbb" }}>To: {selectedMessage.to}</T>
              <T style={{ color: "#666", marginBottom: 12 }}>{new Date(selectedMessage.date).toLocaleString()}</T>
              <T style={{ lineHeight: 22 }}>{selectedMessage.body}</T>
            </View>
          ) : (
            <T style={{ color: "#888" }}>Select a message from the middle column.</T>
          )}
        </View>
      </View>
    </View>
  );
}
