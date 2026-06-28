import { useState, useEffect } from 'react';
import { getBoxerPrice, getNextBoxerTier } from './data/products';
import { fetchStock, sendOrder, generateOrderCode } from './services/sheets';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import Cart from './components/Cart';
import OrderForm from './components/OrderForm';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [activeProduct, setActiveProduct] = useState(null);
  const [selections, setSelections] = useState({});
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    fetchStock()
      .then(setProducts)
      .catch(err => { console.error('❌ Error al cargar stock:', err); setFetchError(`No se pudo cargar el stock: ${err.message}`); })
      .finally(() => setLoading(false));
  }, []);

  function handleUpdateSelections(productId, matrix) {
    setSelections(prev => ({ ...prev, [productId]: matrix }));
  }

  const cartItems = Object.entries(selections)
    .map(([productId, matrix]) => ({ productId, matrix }))
    .filter(item => Object.values(item.matrix).some(v => v > 0));

  function unitsForProduct(productId) {
    const matrix = selections[productId];
    if (!matrix) return 0;
    return Object.values(matrix).reduce((s, v) => s + v, 0);
  }

  // Total de unidades boxer confirmadas en carrito
  const boxerUnitsInCart = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    if (product?.type !== 'boxer') return sum;
    return sum + Object.values(item.matrix).reduce((s, v) => s + v, 0);
  }, 0);

  const currentBoxerPrice = getBoxerPrice(boxerUnitsInCart);
  const nextBoxerTier = getNextBoxerTier(boxerUnitsInCart);

  const totalUnits = cartItems.reduce(
    (sum, item) => sum + Object.values(item.matrix).reduce((s, v) => s + v, 0),
    0
  );

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    const units = Object.values(item.matrix).reduce((s, v) => s + v, 0);
    const price = product?.type === 'boxer' ? currentBoxerPrice : (product?.price ?? 0);
    return sum + units * price;
  }, 0);

  // Unidades boxer en carrito excluyendo el producto activo (para cálculo en vivo en el modal)
  const otherBoxerUnits = activeProduct
    ? cartItems
        .filter(item => item.productId !== activeProduct.id)
        .reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          if (product?.type !== 'boxer') return sum;
          return sum + Object.values(item.matrix).reduce((s, v) => s + v, 0);
        }, 0)
    : 0;

  const WHATSAPP_NUMBER = '5491126033692';

  async function handleSubmitOrder(customerName) {
    const orderCode = generateOrderCode();
    const orderData = {
      code: orderCode,
      customer: customerName,
      date: new Date().toISOString(),
      boxerPricePerUnit: currentBoxerPrice,
      items: cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        const price = product?.type === 'boxer' ? currentBoxerPrice : product.price;
        return {
          brand: product.brand,
          price,
          type: product.type,
          quantities: item.matrix,
        };
      }),
      totalUnits,
      totalPrice,
    };

    await sendOrder(orderData);
    setLastOrder({ code: orderCode, customer: customerName });
    setSelections({});
    setShowOrderForm(false);

    const msg =
      `Hola! Acabo de generar el pedido de *${totalUnits} boxers* a nombre de *${customerName}*.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Danna Wear</h1>
            <p className="text-xs text-gray-400">Pedidos mayoristas · Boxers</p>
          </div>
          {totalUnits > 0 && (
            <div className="bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-full">
              {totalUnits} unidades
            </div>
          )}
        </div>
      </header>

      {lastOrder && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <p className="text-green-700 text-sm">
              ✓ Pedido de <strong>{lastOrder.customer}</strong> enviado —{' '}
              <span className="font-mono font-bold">{lastOrder.code}</span>
            </p>
            <button onClick={() => setLastOrder(null)} className="text-green-500 hover:text-green-700 text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p className="text-sm">Cargando stock...</p>
          </div>
        )}

        {fetchError && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Seleccioná las marcas y cantidades</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  unitsInCart={unitsForProduct(product.id)}
                  currentBoxerPrice={currentBoxerPrice}
                  onClick={setActiveProduct}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {activeProduct && (
        <ProductModal
          product={activeProduct}
          selections={selections[activeProduct.id] || {}}
          otherBoxerUnits={otherBoxerUnits}
          onClose={() => setActiveProduct(null)}
          onUpdateSelections={handleUpdateSelections}
        />
      )}

      <Cart
        items={cartItems}
        products={products}
        currentBoxerPrice={currentBoxerPrice}
        nextBoxerTier={nextBoxerTier}
        boxerUnitsInCart={boxerUnitsInCart}
        totalPrice={totalPrice}
        onCheckout={() => setShowOrderForm(true)}
      />

      {showOrderForm && (
        <OrderForm
          onSubmit={handleSubmitOrder}
          onClose={() => setShowOrderForm(false)}
          totalUnits={totalUnits}
          totalPrice={totalPrice}
        />
      )}
    </div>
  );
}
