import { GlobalPassportDiploma } from '@/components/passport/GlobalPassportDiploma';
import Link from 'next/link';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function PublicPassportPage({ params }: Props) {
  const { userId } = await params;

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/passport/${userId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-lg">Pasaporte no encontrado</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  const data = await res.json();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-4 py-3 bg-white border-b shadow-sm flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ✈️ TravelPassport
        </Link>
        <p className="text-sm text-gray-400">
          Pasaporte de <span className="font-medium text-gray-700">{data.user.alias ?? data.user.name}</span>
        </p>
      </header>
      <GlobalPassportDiploma user={data.user} pois={data.pois} stats={data.stats} />
    </div>
  );
}
