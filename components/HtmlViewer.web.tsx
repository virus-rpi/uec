import React from "react";
import {DimensionValue, View} from "react-native";

export function HtmlViewer({ html, height }: { html: string; height: DimensionValue }) {
  const safeHtml = React.useMemo(() => html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ""), [html]);
  return (
    <View style={{ height, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#111" }}>
      <div
        style={{
          color: "#fff",
          background: "#000",
          fontFamily: "-apple-system, system-ui, sans-serif",
          padding: 12,
        }}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      <style>{`a { color: #7ab7ff } img { max-width: 100%; height: auto }`}</style>
    </View>
  );
}
