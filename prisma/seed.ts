import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TAGS = [
  { key: 'hiking',     label: 'Ruta a pie',       emoji: '🥾', color: '#92400e' },
  { key: 'kids',       label: 'Apto para niños',  emoji: '👶', color: '#be185d' },
  { key: 'pets',       label: 'Apto mascotas',    emoji: '🐾', color: '#7c3aed' },
  { key: 'water',      label: 'Hay agua',          emoji: '💧', color: '#0369a1' },
  { key: 'ruins',      label: 'Ruinas históricas', emoji: '🏛️', color: '#78350f' },
  { key: 'cave',       label: 'Cuevas',            emoji: '🕳️', color: '#374151' },
  { key: 'beach',      label: 'Playa',             emoji: '🏖️', color: '#0891b2' },
  { key: 'mountain',   label: 'Montaña',           emoji: '🏔️', color: '#1d4ed8' },
  { key: 'city',       label: 'Ciudad',            emoji: '🏙️', color: '#4f46e5' },
  { key: 'food',       label: 'Gastronomía',       emoji: '🍽️', color: '#dc2626' },
  { key: 'nature',     label: 'Naturaleza',        emoji: '🌿', color: '#16a34a' },
  { key: 'viewpoint',  label: 'Mirador',           emoji: '👁️', color: '#7c3aed' },
  { key: 'camping',    label: 'Camping',           emoji: '⛺', color: '#15803d' },
  { key: 'museum',     label: 'Museo / Arte',      emoji: '🎨', color: '#d97706' },
  { key: 'wildlife',   label: 'Fauna salvaje',     emoji: '🦁', color: '#b45309' },
  { key: 'snow',       label: 'Nieve / Esquí',     emoji: '❄️', color: '#0284c7' },
  { key: 'boat',       label: 'Náutica',           emoji: '⛵', color: '#0369a1' },
  { key: 'cycling',    label: 'Ruta en bici',      emoji: '🚴', color: '#059669' },
  { key: 'photo',      label: 'Fotogénico',        emoji: '📷', color: '#6b21a8' },
  { key: 'religious',  label: 'Lugar religioso',   emoji: '⛪', color: '#92400e' },
  { key: 'market',     label: 'Mercado',           emoji: '🛍️', color: '#b91c1c' },
  { key: 'nightlife',  label: 'Vida nocturna',     emoji: '🌙', color: '#312e81' },
  { key: 'accessible', label: 'Accesible',         emoji: '♿', color: '#0284c7' },
  { key: 'free',       label: 'Entrada gratuita',  emoji: '🆓', color: '#166534' },
  { key: 'hidden_gem', label: 'Joya oculta',       emoji: '💎', color: '#7e22ce' },
];

async function main() {
  console.log('Seeding tags...');
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { key: tag.key },
      update: tag,
      create: tag,
    });
  }
  console.log(`✅ Seeded ${TAGS.length} tags`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
