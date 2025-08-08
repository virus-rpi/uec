import React from "react";
import { DimensionValue, View } from "react-native";

export function HtmlViewer({ html, height }: { html: string; height: DimensionValue }) {
  const safeHtml = React.useMemo(() => html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ""), [html]);
  const isAuto = height === ("auto" as unknown as DimensionValue) || height === undefined || height === null;
  const containerStyle = {
    borderRadius: 8,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "#111",
    alignSelf: "stretch" as const,
    ...(isAuto ? { flex: 1 as const, minHeight: 0 } : { height }),
  };
  return (
    <View style={containerStyle}>
      <div
        style={{
          color: "#fff",
          background: "#000",
          fontFamily: "-apple-system, system-ui, sans-serif",
          padding: 12,
          height: "100%",
          boxSizing: "border-box",
        }}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      <style>{`a { color: #7ab7ff } img { max-width: 100%; height: auto }`}</style>
    </View>
  );
}
