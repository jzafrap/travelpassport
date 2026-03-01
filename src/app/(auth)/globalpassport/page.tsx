'use client';
import { useEffect, useState } from 'react';
import { GlobalPassportDiploma } from '@/components/passport/GlobalPassportDiploma';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function GlobalPassportPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/passport/${session.user.id}`)
        .then(r => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then(setData)
        .catch(() => setError(true));
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-4 py-3 bg-white border-b shadow-sm flex items-center gap-4">
        <Link href="/passport" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← My Passport
        </Link>
        <h1 className="font-bold text-lg text-indigo-600">🎫 GlobalPassport</h1>
      </header>

      {error && (
        <div className="p-8 text-center text-gray-500">
          Error cargando el pasaporte. Inténtalo de nuevo.
        </div>
      )}

      {!data && !error && (
        <div className="p-8 text-center text-gray-400 animate-pulse">
          Generando pasaporte...
        </div>
      )}

      {data && (
        <GlobalPassportDiploma
          user={data.user}
          pois={data.pois}
          stats={data.stats}
        />
      )}
    </div>
  );
}
