export default function Cart({ items, products, currentBoxerPrice, nextBoxerTier, boxerUnitsInCart, totalPrice, onCheckout }) {
  const totalUnits = items.reduce(
    (sum, item) => sum + Object.values(item.matrix).reduce((s, v) => s + v, 0),
    0
  );

  if (totalUnits === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* Title */}
        <div className="px-4 py-3 bg-indigo-600 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Carrito de pedido</h3>
          <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {totalUnits} unidades
          </span>
        </div>

        {/* Tier info */}
        {boxerUnitsInCart > 0 && (
          <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
            <p className="text-xs text-indigo-700 font-medium">
              Boxers: ${currentBoxerPrice.toLocaleString('es-AR')}/u · {boxerUnitsInCart} unidades
            </p>
            {nextBoxerTier && (
              <p className="text-xs text-amber-600 mt-0.5">
                {nextBoxerTier.min - boxerUnitsInCart} más → ${nextBoxerTier.price.toLocaleString('es-AR')}/u
              </p>
            )}
            {!nextBoxerTier && (
              <p className="text-xs text-green-600 mt-0.5">¡Precio máximo alcanzado!</p>
            )}
          </div>
        )}

        {/* Line items */}
        <div className="px-4 py-3 space-y-2 max-h-40 overflow-auto">
          {items.map(item => {
            const product = products.find(p => p.id === item.productId);
            const units = Object.values(item.matrix).reduce((s, v) => s + v, 0);
            const price = product?.type === 'boxer' ? currentBoxerPrice : (product?.price ?? 0);
            if (units === 0) return null;
            return (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium truncate mr-2">{product?.brand}</span>
                <span className="text-gray-500 shrink-0">
                  {units} {product?.type === 'boxer' ? 'u.' : 'doc.'} ·{' '}
                  <span className="text-gray-700 font-semibold">${(units * price).toLocaleString('es-AR')}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Total + CTA */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</span>
            <span className="text-lg font-bold text-indigo-600">${totalPrice.toLocaleString('es-AR')}</span>
          </div>
          {boxerUnitsInCart > 0 && boxerUnitsInCart < 12 && (
            <p className="text-amber-600 text-xs font-medium mb-2 text-center">
              Mínimo 12 boxers por pedido ({12 - boxerUnitsInCart} más para continuar)
            </p>
          )}
          <button
            onClick={onCheckout}
            disabled={boxerUnitsInCart > 0 && boxerUnitsInCart < 12}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar pedido →
          </button>
        </div>
      </div>
    </div>
  );
}
