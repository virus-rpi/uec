import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Platform} from "react-native";

export type Protocol = "imap" | "pop3";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean; // TLS
  username: string;
  password?: string; // optional if using OAuth2
};

export type ImapPopConfig = {
  protocol: Protocol;
  host: string;
  port: number;
  secure: boolean; // TLS
  username: string;
  password?: string; // optional if using OAuth2
};

export type GmailAccount = {
  id: string;
  type: "gmail";
  email?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms
};

export type ManualAccount = {
  id: string;
  type: "manual";
  displayName?: string;
  incoming: ImapPopConfig;
  outgoing: SmtpConfig;
};

export type MailAccount = GmailAccount | ManualAccount;

const KEY = "uec.accounts";

export async function getAccounts(): Promise<MailAccount[]> {
  const raw =
    Platform.OS === "web"
      ? await AsyncStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MailAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAccounts(list: MailAccount[]): Promise<void> {
  const data = JSON.stringify(list);
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(KEY, data);
  } else {
    await SecureStore.setItemAsync(KEY, data);
  }
}

export async function addAccount(acc: MailAccount): Promise<void> {
  const list = await getAccounts();
  list.push(acc);
  await saveAccounts(list);
}

export async function removeAccount(id: string): Promise<void> {
  const list = await getAccounts();
  const acc = list.find((a) => a.id === id);
  if (acc && acc.type === "gmail" && acc.accessToken) {
    await revokeGoogleToken(acc.accessToken);
  }
  const next = list.filter((a) => a.id !== id);
  await saveAccounts(next);
}

export async function updateAccount(id: string, patch: Partial<MailAccount>): Promise<void> {
  const list = await getAccounts();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return;
    list[idx] = {...list[idx], ...patch} as MailAccount;
  await saveAccounts(list);
}

export function makeId(prefix: string = "acct"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function verifyGmailAccessToken(token: string): Promise<{ ok: boolean; email?: string; error?: string }> {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { email?: string };
    return { ok: true, email: data.email };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export async function revokeGoogleToken(token: string): Promise<void> {
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: "POST",
      headers: { "Content-type": "application/x-www-form-urlencoded" },
    });
  } catch (e) {
    // Ignore errors
  }
}

export function platformInfo(): string {
  return `${Platform.OS} ${Platform.Version}`;
}
