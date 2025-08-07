import { Link, useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { emails } from "../lib/mockData";

function T(props: any) {
  return <Text {...props} style={[{ color: "#fff" }, props.style]} />;
}

export default function InboxByAddress() {
  const { address } = useLocalSearchParams<{ address: string }>();
  const list = emails.filter((e) => e.to === address);

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 12 }}>
      <T style={{ color: "#aaa", marginBottom: 8 }}>To: {address}</T>
      <FlatList
        data={list.sort((a, b) => b.date.localeCompare(a.date))}
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
    </View>
  );
}
