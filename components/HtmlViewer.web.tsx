import React from "react";
import { DimensionValue, View } from "react-native";

export function HtmlViewer({ html, height }: { html: string; height: DimensionValue }) {
  const isAuto = height === ("auto" as unknown as DimensionValue) || height === undefined || height === null;
  const containerStyle = {
    borderRadius: 8,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "#111",
    alignSelf: "stretch" as const,
    ...(isAuto ? { flex: 1 as const, minHeight: 0 } : { height }),
  };
  const [iframeSrc, setIframeSrc] = React.useState<string>("");
  React.useEffect(() => {
    const safeHtml = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
    const fullHtml = `<!doctype html><html lang=""><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/><style>body{color:#fff;background:#000;font-family: -apple-system, system-ui, sans-serif;padding:12px;} a{color:#7ab7ff} img{max-width:100%; height:auto}</style></head><body>${safeHtml}</body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setIframeSrc(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [html]);
  return (
    <View style={containerStyle}>
      <iframe
        src={iframeSrc}
        style={{ width: "100%", height: "100%", border: "none", background: "#000", borderRadius: 8 }}
        sandbox="allow-same-origin"
        title="Email HTML"
      />
    </View>
  );
}
