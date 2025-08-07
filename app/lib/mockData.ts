export type Email = {
  id: string;
  to: string; // address the email was sent to (user's alias)
  from: string;
  subject: string;
  snippet: string;
  date: string; // ISO
  body: string;
};

export const emails: Email[] = [
  {
    id: "1",
    to: "news@mydomain.tld",
    from: "newsletter@example.com",
    subject: "Your weekly digest",
    snippet: "Top stories of the week...",
    date: new Date().toISOString(),
    body: "Here are your curated weekly stories...",
  },
  {
    id: "2",
    to: "shop@mydomain.tld",
    from: "orders@shop.com",
    subject: "Order #1234 shipped",
    snippet: "Your order is on its way...",
    date: new Date(Date.now() - 3600_000).toISOString(),
    body: "We have shipped your order #1234. Track it here...",
  },
  {
    id: "3",
    to: "news@mydomain.tld",
    from: "newsletter@example.com",
    subject: "Breaking: Product updates",
    snippet: "We just launched new features...",
    date: new Date(Date.now() - 7200_000).toISOString(),
    body: "Today we're excited to share...",
  },
  {
    id: "4",
    to: "alerts@mydomain.tld",
    from: "no-reply@service.io",
    subject: "Security alert",
    snippet: "New sign-in detected...",
    date: new Date(Date.now() - 86_400_000).toISOString(),
    body: "We detected a sign-in from a new device...",
  },
];

export function groupByToAddress(list: Email[]): Record<string, Email[]> {
  return list.reduce((acc, e) => {
    (acc[e.to] ||= []).push(e);
    return acc;
  }, {} as Record<string, Email[]>);
}
