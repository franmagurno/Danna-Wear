import { brandConfig, SIZES } from '../data/products';

const STOCK_URL = 'https://script.google.com/macros/s/AKfycbz2Qepiu56TzFB4V0R3VVEEQTyTPtIXpauCAI5BmwcQcMaEkGkrH30SP-nsL8OL54CdBA/exec';
const ORDERS_URL = 'https://script.google.com/macros/s/AKfycbziTg4GI8kV_T22m9bjoaTtnPxvvLeCX76zH3Ba-8cOCTZmy8r3f3cavjhyxnK8DIw2sg/exec';

// Lee las filas de Sheets y las convierte en el array de productos que usa la app
export async function fetchStock() {
  if (!STOCK_URL) {
    console.warn('STOCK_URL no configurada — usando datos de ejemplo.');
    return buildProducts(MOCK_ROWS);
  }

  const response = await fetch(STOCK_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const rows = await response.json();
  return buildProducts(rows);
}

const BOXER_SIZES = new Set(SIZES);

function buildProducts(rows) {
  const map = {};

  // Primera pasada: agrupar filas por marca
  rows.forEach(({ codigo, nombre, color, talle, precio, stock }) => {
    if (!nombre) return;

    if (!map[nombre]) {
      const config = brandConfig[nombre] || {};
      map[nombre] = {
        id: codigo ?? config.id ?? nombre.toLowerCase().replace(/\s+/g, '-'),
        brand: nombre,
        price: config.price ?? 0,
        image: config.image ?? `https://placehold.co/400x400?text=${encodeURIComponent(nombre)}`,
        colors: [],
        _rows: [],
      };
    }

    const p = map[nombre];
    if (color && !p.colors.includes(color)) p.colors.push(color);
    p._rows.push({ color, talle, precio: Number(precio) || 0, stock: Number(stock) || 0 });
  });

  // Segunda pasada: detectar tipo y construir stock
  return Object.values(map).map(({ _rows, ...product }) => {
    const isBoxer = _rows.some(r => BOXER_SIZES.has(r.talle));
    const precioFromSheet = _rows.find(r => r.precio > 0)?.precio ?? 0;
    const stock = {};

    _rows.forEach(({ color, talle, stock: qty }) => {
      const key = isBoxer ? `${color}-${talle}` : color;
      stock[key] = qty;
    });

    return { ...product, price: precioFromSheet || product.price, type: isBoxer ? 'boxer' : 'docena', stock };
  });
}

export async function sendOrder(orderData) {
  const { code, customer, date, totalPrice, items } = orderData;

  const fechaPedido = new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const rows = [];
  for (const item of items) {
    for (const [key, qty] of Object.entries(item.quantities)) {
      if (!qty || qty <= 0) continue;

      let color, talle;
      if (item.type === 'boxer') {
        const sep = key.lastIndexOf('-');
        color = key.slice(0, sep);
        talle = key.slice(sep + 1);
      } else {
        color = key;
        talle = '-';
      }

      rows.push({
        nPedido: code,
        fechaPedido,
        cliente: customer,
        producto: item.brand,
        color,
        talle,
        cantidad: qty,
        montoTotal: totalPrice,
        estado: 'pendiente de pago',
      });
    }
  }

  const response = await fetch(ORDERS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'saveOrder', rows }),
  });

  if (!response.ok) throw new Error(`Error al enviar el pedido: ${response.status}`);
  return response.json();
}

export function generateOrderCode() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PED-${dd}${mm}${yy}-${rand}`;
}

// Datos de ejemplo usados cuando no hay WEBHOOK_URL configurada
const MOCK_ROWS = [
  { nombre: 'Calvin Klein', color: 'Negro', talle: 'S', stock: 10 },
  { nombre: 'Calvin Klein', color: 'Negro', talle: 'M', stock: 15 },
  { nombre: 'Calvin Klein', color: 'Negro', talle: 'L', stock: 8 },
  { nombre: 'Calvin Klein', color: 'Negro', talle: 'XL', stock: 5 },
  { nombre: 'Calvin Klein', color: 'Negro', talle: 'XXL', stock: 0 },
  { nombre: 'Calvin Klein', color: 'Blanco', talle: 'S', stock: 12 },
  { nombre: 'Calvin Klein', color: 'Blanco', talle: 'M', stock: 20 },
  { nombre: 'Calvin Klein', color: 'Blanco', talle: 'L', stock: 0 },
  { nombre: 'Calvin Klein', color: 'Blanco', talle: 'XL', stock: 7 },
  { nombre: 'Calvin Klein', color: 'Blanco', talle: 'XXL', stock: 2 },
  { nombre: 'Calvin Klein', color: 'Gris', talle: 'S', stock: 6 },
  { nombre: 'Calvin Klein', color: 'Gris', talle: 'M', stock: 9 },
  { nombre: 'Calvin Klein', color: 'Gris', talle: 'L', stock: 11 },
  { nombre: 'Calvin Klein', color: 'Gris', talle: 'XL', stock: 4 },
  { nombre: 'Calvin Klein', color: 'Gris', talle: 'XXL', stock: 0 },
  { nombre: 'Tommy Hilfiger', color: 'Blanco', talle: 'S', stock: 8 },
  { nombre: 'Tommy Hilfiger', color: 'Blanco', talle: 'M', stock: 12 },
  { nombre: 'Tommy Hilfiger', color: 'Blanco', talle: 'L', stock: 0 },
  { nombre: 'Tommy Hilfiger', color: 'Blanco', talle: 'XL', stock: 5 },
  { nombre: 'Tommy Hilfiger', color: 'Rojo', talle: 'S', stock: 5 },
  { nombre: 'Tommy Hilfiger', color: 'Rojo', talle: 'M', stock: 7 },
  { nombre: 'Tommy Hilfiger', color: 'Rojo', talle: 'L', stock: 3 },
  { nombre: 'Tommy Hilfiger', color: 'Rojo', talle: 'XL', stock: 0 },
  { nombre: "Levi's", color: 'Negro', talle: 'S', stock: 15 },
  { nombre: "Levi's", color: 'Negro', talle: 'M', stock: 20 },
  { nombre: "Levi's", color: 'Negro', talle: 'L', stock: 18 },
  { nombre: "Levi's", color: 'Negro', talle: 'XL', stock: 0 },
  { nombre: "Levi's", color: 'Gris', talle: 'S', stock: 8 },
  { nombre: "Levi's", color: 'Gris', talle: 'M', stock: 0 },
  { nombre: "Levi's", color: 'Gris', talle: 'L', stock: 4 },
  { nombre: 'Lacoste', color: 'Blanco', talle: 'S', stock: 5 },
  { nombre: 'Lacoste', color: 'Blanco', talle: 'M', stock: 8 },
  { nombre: 'Lacoste', color: 'Blanco', talle: 'L', stock: 0 },
  { nombre: 'Lacoste', color: 'Negro', talle: 'S', stock: 10 },
  { nombre: 'Lacoste', color: 'Negro', talle: 'M', stock: 15 },
  { nombre: 'Lacoste', color: 'Negro', talle: 'L', stock: 12 },
  { nombre: 'Lacoste', color: 'Verde', talle: 'M', stock: 4 },
  { nombre: 'Lacoste', color: 'Verde', talle: 'L', stock: 2 },
  { nombre: 'Lacoste', color: 'Verde', talle: 'XL', stock: 0 },
];
