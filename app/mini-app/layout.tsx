import { ClientProviders } from './client-providers';

export const dynamic = 'force-dynamic';

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}
