import { Email } from "./email_utils";
import { GmailAccount, MailAccount } from "./accounts";

function getHeader(headers: { name: string; value: string }[], key: string): string | undefined {
  const h = headers.find((x) => x.name.toLowerCase() === key.toLowerCase());
  return h?.value;
}

function decodeBody(data?: string): string | undefined {
  if (!data) return undefined;
  try {
    const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = typeof atob !== "undefined" ? atob(b64) : (typeof Buffer !== "undefined" ? Buffer.from(b64, "base64").toString("utf8") : undefined);
        if (decoded === undefined) return undefined;
    return decoded;
  } catch {
    return undefined;
  }
}

function extractTextFromPayload(payload: any): string | undefined {
  if (!payload) return undefined;
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBody(payload.body.data);
  }
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const txt = extractTextFromPayload(part);
      if (txt) return txt;
    }
  }
  return undefined;
}

export async function fetchGmailEmails(account: GmailAccount, maxResults: number = 20): Promise<Email[]> {
  const headers = { Authorization: `Bearer ${account.accessToken}` } as const;

  // 1) List message IDs
  const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
    headers,
  });
  if (!listRes.ok) {
    throw new Error(`Gmail list failed: HTTP ${listRes.status}`);
  }
  const listJson = await listRes.json();
  const ids: string[] = (listJson.messages || []).map((m: any) => m.id);
  if (ids.length === 0) return [];

  // 2) Fetch message details
  const emails: Email[] = [];
  for (const id of ids) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      { headers }
    );
    if (!msgRes.ok) {
      continue;
    }
    const msg = await msgRes.json();
    const hdrs: { name: string; value: string }[] = msg.payload?.headers || [];
    const from = getHeader(hdrs, "From") || "";
    const to = getHeader(hdrs, "To") || (account.email || "");
    const subject = getHeader(hdrs, "Subject") || "(no subject)";
    const dateHeader = getHeader(hdrs, "Date");
    const date = dateHeader ? new Date(dateHeader).toISOString() : new Date(msg.internalDate ? Number(msg.internalDate) : Date.now()).toISOString();
    const snippet: string = msg.snippet || "";
    const body = extractTextFromPayload(msg.payload) || snippet;

    emails.push({ id, to, from, subject, snippet, date, body });
  }

  return emails;
}

export async function fetchAllEmailsFromAccounts(accounts: MailAccount[]): Promise<Email[]> {
  const gmailAccounts = accounts.filter((a) => a.type === "gmail");
  const all: Email[] = [];
  for (const acc of gmailAccounts) {
    try {
      const items = await fetchGmailEmails(acc as GmailAccount);
      all.push(...items);
    } catch (e) {
      console.warn("Failed to fetch from account", acc.id, e);
    }
  }
  return all;
}
