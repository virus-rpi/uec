import { View, Text } from "react-native";

function T(props: any) {
  return <Text {...props} style={[{ color: "#fff" }, props.style]} />;
}

export default function NodeEditorPlaceholder() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <T style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Node-based Editor (Coming Soon)</T>
      <T style={{ color: "#bbb", textAlign: "center" }}>
        Here you'll configure rules mapping addresses to actual inboxes and to virtual inboxes.
        This will allow flexible routing using a visual node graph.
      </T>
    </View>
  );
}
