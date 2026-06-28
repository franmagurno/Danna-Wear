export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const BOXER_PRICE_TIERS = [
  { min: 12,  price: 5500 },
  { min: 36,  price: 4750 },
  { min: 60,  price: 4350 },
  { min: 100, price: 4050 },
  { min: 200, price: 3750 },
];

export function getBoxerPrice(totalUnits) {
  const tier = [...BOXER_PRICE_TIERS].reverse().find(t => totalUnits >= t.min);
  return tier?.price ?? BOXER_PRICE_TIERS[0].price;
}

export function getNextBoxerTier(totalUnits) {
  return BOXER_PRICE_TIERS.find(t => t.min > totalUnits) ?? null;
}

// Precios e imágenes por marca — el stock viene de Google Sheets
export const brandConfig = {
  'Calvin Klein': {
    id: 'ck',
    price: 4500,
    image: 'https://placehold.co/400x400/1a1a2e/ffffff?text=Calvin+Klein',
  },
  'Tommy Hilfiger': {
    id: 'tommy',
    price: 5200,
    image: 'https://placehold.co/400x400/002f6c/ffffff?text=Tommy+Hilfiger',
  },
  "Levi's": {
    id: 'levis',
    price: 4800,
    image: 'https://placehold.co/400x400/c0392b/ffffff?text=Levis',
  },
  'Lacoste': {
    id: 'lacoste',
    price: 6000,
    image: 'https://placehold.co/400x400/1e8449/ffffff?text=Lacoste',
  },
};
