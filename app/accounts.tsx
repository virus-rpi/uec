import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View, Modal, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { addAccount, getAccounts, makeId, MailAccount, ManualAccount, verifyGmailAccessToken, removeAccount } from "@/lib/accounts";

WebBrowser.maybeCompleteAuthSession();

function Heading(props: any) {
  return (
    <Text
      {...props}
      style={[
        { color: "#fff", fontWeight: "700" },
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
        props.style,
      ]}
    />
  );
}

function LabeledInput({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry }: any) {
  return (
    <View style={{ marginBottom: 10 }}>
      <T style={{ marginBottom: 4, color: "#bbb" }}>{label}</T>
      <TextInput
        style={{ backgroundColor: "#0a0a0a", color: "#fff", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#222" }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [showManual, setShowManual] = useState(false);

  const [protocol, setProtocol] = useState<"imap" | "pop3">("imap");
  const [inHost, setInHost] = useState("");
  const [inPort, setInPort] = useState("993");
  const [inSecure, setInSecure] = useState(true);
  const [inUser, setInUser] = useState("");
  const [inPass, setInPass] = useState("");

  const [outHost, setOutHost] = useState("");
  const [outPort, setOutPort] = useState("465");
  const [outSecure, setOutSecure] = useState(true);
  const [outUser, setOutUser] = useState("");
  const [outPass, setOutPass] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: undefined,
    androidClientId: undefined,
    webClientId: "588712609661-jbisev2plae031njtjrqv86hu7mboher.apps.googleusercontent.com",
    scopes: ["openid", "email", "profile", "https://mail.google.com/"],
    redirectUri: AuthSession.makeRedirectUri({ scheme: "uec" }),
    responseType: AuthSession.ResponseType.Token,
    usePKCE: true,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  useEffect(() => {
    getAccounts().then(setAccounts);
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      const expiresIn = response.authentication?.expiresIn;
      if (accessToken) {
        (async () => {
          const verify = await verifyGmailAccessToken(accessToken);
          const id = makeId("gmail");
          await addAccount({ id, type: "gmail", accessToken, expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined, email: verify.email });
          const list = await getAccounts();
          setAccounts(list);
          Alert.alert("Gmail account added", verify.email ? `Signed in as ${verify.email}` : "Token stored.");
        })();
      } else {
        Alert.alert("Gmail sign-in failed", "No access token returned.");
      }
    }
  }, [response]);

  const addManual = async () => {
    const id = makeId("manual");
    const manual: ManualAccount = {
      id,
      type: "manual",
      displayName: `${protocol.toUpperCase()} ${inUser}`,
      incoming: {
        protocol,
        host: inHost.trim(),
        port: parseInt(inPort, 10) || (protocol === "imap" ? 993 : 995),
        secure: inSecure,
        username: inUser.trim(),
        password: inPass,
      },
      outgoing: {
        host: outHost.trim() || inHost.trim(),
        port: parseInt(outPort, 10) || 465,
        secure: outSecure,
        username: (outUser || inUser).trim(),
        password: outPass || inPass,
      },
    };
    await addAccount(manual);
    const list = await getAccounts();
    setAccounts(list);
    setShowManual(false);
    Alert.alert("Account saved", "Manual server settings stored securely. Note: Connectivity will require a backend or RN socket-capable library.");
  };

  const handleRemove = async () => {
    if (pendingRemoveId) {
      await removeAccount(pendingRemoveId);
      const list = await getAccounts();
      setAccounts(list);
      setPendingRemoveId(null);
      setModalVisible(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000", padding: 12 }} contentContainerStyle={{ paddingBottom: 60 }}>
      <Heading style={{ fontSize: 22, marginBottom: 12 }}>Accounts</Heading>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
        <Pressable
          disabled={!request}
          onPress={() => promptAsync()}
          style={({ pressed }) => ({
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#333",
            borderRadius: 8,
            backgroundColor: pressed ? "#0a0a0a" : "#050505",
          })}
        >
          <T>Sign in with Google</T>
        </Pressable>

        <Pressable
          onPress={() => setShowManual((s) => !s)}
          style={({ pressed }) => ({
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#333",
            borderRadius: 8,
            backgroundColor: pressed ? "#0a0a0a" : "#050505",
            marginLeft: 8,
          })}
        >
          <T>{showManual ? "Hide manual setup" : "Add manual IMAP/POP/SMTP"}</T>
        </Pressable>
      </View>

      {showManual && (
        <View style={{ borderWidth: 1, borderColor: "#222", borderRadius: 10, padding: 12, marginBottom: 20, backgroundColor: "#070707" }}>
          <Heading style={{ fontSize: 18, marginBottom: 10 }}>Manual configuration</Heading>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            {(["imap", "pop3"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setProtocol(p)}
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: protocol === p ? "#666" : "#333",
                  borderRadius: 6,
                  backgroundColor: pressed ? "#0a0a0a" : protocol === p ? "#101010" : "#050505",
                })}
              >
                <T>{p.toUpperCase()}</T>
              </Pressable>
            ))}
          </View>

          <Heading style={{ fontSize: 16, marginBottom: 6 }}>Incoming ({protocol.toUpperCase()})</Heading>
          <LabeledInput label="Host" value={inHost} onChangeText={setInHost} placeholder={`${protocol}.example.com`} />
          <LabeledInput label="Port" value={inPort} onChangeText={setInPort} placeholder={protocol === "imap" ? "993" : "995"} keyboardType="number-pad" />
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <Pressable onPress={() => setInSecure(true)} style={{ padding: 8, borderWidth: 1, borderColor: inSecure ? "#666" : "#333", borderRadius: 6 }}>
              <T>TLS</T>
            </Pressable>
            <Pressable onPress={() => setInSecure(false)} style={{ padding: 8, borderWidth: 1, borderColor: !inSecure ? "#666" : "#333", borderRadius: 6 }}>
              <T>Plain</T>
            </Pressable>
          </View>
          <LabeledInput label="Username" value={inUser} onChangeText={setInUser} placeholder="user@example.com" />
          <LabeledInput label="Password" value={inPass} onChangeText={setInPass} placeholder="password" secureTextEntry />

          <Heading style={{ fontSize: 16, marginBottom: 6, marginTop: 10 }}>Outgoing (SMTP)</Heading>
          <LabeledInput label="Host" value={outHost} onChangeText={setOutHost} placeholder="smtp.example.com" />
          <LabeledInput label="Port" value={outPort} onChangeText={setOutPort} placeholder="465" keyboardType="number-pad" />
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <Pressable onPress={() => setOutSecure(true)} style={{ padding: 8, borderWidth: 1, borderColor: outSecure ? "#666" : "#333", borderRadius: 6 }}>
              <T>TLS</T>
            </Pressable>
            <Pressable onPress={() => setOutSecure(false)} style={{ padding: 8, borderWidth: 1, borderColor: !outSecure ? "#666" : "#333", borderRadius: 6 }}>
              <T>Plain</T>
            </Pressable>
          </View>
          <LabeledInput label="Username" value={outUser} onChangeText={setOutUser} placeholder="user@example.com" />
          <LabeledInput label="Password" value={outPass} onChangeText={setOutPass} placeholder="password" secureTextEntry />

          <Pressable onPress={addManual} style={({ pressed }) => ({ padding: 12, borderWidth: 1, borderColor: "#333", borderRadius: 8, backgroundColor: pressed ? "#0a0a0a" : "#050505", marginTop: 6 })}>
            <T>Save account</T>
          </Pressable>

          <T style={{ color: "#aaa", marginTop: 10 }}>
            Note: React Native apps cannot directly open IMAP/POP/SMTP sockets without additional native modules or a backend. This app stores settings securely now; actual mail sync will require adding a backend or socket-capable libraries.
          </T>
        </View>
      )}

      <Heading style={{ fontSize: 18, marginBottom: 8 }}>Configured accounts</Heading>
      {accounts.length === 0 ? (
        <T style={{ color: "#aaa" }}>No accounts yet.</T>
      ) : (
        <>
          <FlatList
            data={accounts}
            keyExtractor={(a) => a.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={{ flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, borderColor: "#222", borderRadius: 8, backgroundColor: "#070707" }}>
                <View style={{ flex: 1 }}>
                  <T style={{ fontWeight: "700" }}>{item.type === "gmail" ? `Gmail${item.email ? `: ${item.email}` : ""}` : item.type === "manual" ? item.displayName || "Manual account" : "Account"}</T>
                  {item.type === "gmail" && (
                    <T style={{ color: "#bbb", marginTop: 4 }}>Access token stored. Expires at: {item.expiresAt ? new Date(item.expiresAt).toLocaleString() : "unknown"}</T>
                  )}
                  {item.type === "manual" && (
                    <T style={{ color: "#bbb", marginTop: 4 }}>{item.incoming.protocol.toUpperCase()} {item.incoming.username}@{item.incoming.host} / SMTP {item.outgoing.host}</T>
                  )}
                </View>
                <Pressable
                  onPress={() => {
                    setPendingRemoveId(item.id);
                    setModalVisible(true);
                  }}
                  style={({ pressed }) => ({
                    marginLeft: 10,
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "transparent",
                    borderRadius: 0,
                    borderWidth: 0,
                    padding: 0,
                  })}
                  accessibilityLabel="Remove account"
                >
                  <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20, textAlign: "center", fontFamily: Platform.OS === "web" ? "Bitcount, system-ui, sans-serif" : undefined }}>×</Text>
                </Pressable>
              </View>
            )}
          />
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" }}>
              <View style={{ backgroundColor: "#111", padding: 24, borderRadius: 12, minWidth: 260, alignItems: "center" }}>
                <T style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Remove account?</T>
                <T style={{ color: "#bbb", marginBottom: 18 }}>Are you sure you want to remove this account? This cannot be undone.</T>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <Pressable
                    onPress={() => {
                      setModalVisible(false);
                      setPendingRemoveId(null);
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: pressed ? "#222" : "#333",
                      marginRight: 8,
                    })}
                  >
                    <T>Cancel</T>
                  </Pressable>
                  <Pressable
                    onPress={handleRemove}
                    style={({ pressed }) => ({
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: pressed ? "#a00" : "#d00",
                    })}
                  >
                    <T style={{ color: "#fff" }}>Remove</T>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
