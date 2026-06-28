import { useState, useEffect } from 'react';
import { SIZES, getBoxerPrice, getNextBoxerTier } from '../data/products';

export default function ProductModal({ product, selections, otherBoxerUnits, onClose, onUpdateSelections }) {
  const [matrix, setMatrix] = useState({});
  const isBoxer = product.type === 'boxer';

  useEffect(() => {
    setMatrix(selections || {});
  }, [product]);

  function handleBoxerChange(color, size, value) {
    const available = product.stock[`${color}-${size}`] ?? 0;
    const val = Math.min(available, Math.max(0, parseInt(value) || 0));
    setMatrix(prev => ({ ...prev, [`${color}-${size}`]: val }));
  }

  function handleDocenaChange(color, value) {
    const available = product.stock[color] ?? 0;
    const val = Math.min(available, Math.max(0, parseInt(value) || 0));
    setMatrix(prev => ({ ...prev, [color]: val }));
  }

  function handleConfirm() {
    onUpdateSelections(product.id, matrix);
    onClose();
  }

  function handleClear() {
    setMatrix({});
  }

  const subtotalUnits = Object.values(matrix).reduce((s, v) => s + v, 0);

  // Para boxers: precio en vivo según total (otros en carrito + los que se están cargando ahora)
  const effectivePrice = isBoxer
    ? getBoxerPrice(otherBoxerUnits + subtotalUnits)
    : product.price;

  const nextTier = isBoxer ? getNextBoxerTier(otherBoxerUnits + subtotalUnits) : null;
  const subtotalPrice = subtotalUnits * effectivePrice;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-100 shrink-0">
          <img src={product.image} alt={product.brand} className="w-20 h-20 object-cover rounded-xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{product.brand}</h2>
            <p className="text-indigo-600 font-semibold">
              ${effectivePrice.toLocaleString('es-AR')}
              <span className="text-gray-400 font-normal text-sm">
                {isBoxer ? ' / unidad' : ' / docena'}
              </span>
            </p>
            {isBoxer && nextTier && (
              <p className="text-xs text-amber-600 mt-0.5">
                {nextTier.min - (otherBoxerUnits + subtotalUnits)} unidades más → ${nextTier.price.toLocaleString('es-AR')}/u
              </p>
            )}
            {isBoxer && !nextTier && subtotalUnits > 0 && (
              <p className="text-xs text-green-600 mt-0.5">¡Precio máximo alcanzado!</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center shrink-0"
          >
            &times;
          </button>
        </div>

        {/* Matrix */}
        <div className="overflow-auto flex-1 p-5">
          {isBoxer ? (
            <BoxerMatrix product={product} matrix={matrix} onChange={handleBoxerChange} />
          ) : (
            <DocenaMatrix product={product} matrix={matrix} onChange={handleDocenaChange} />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-5 py-4 flex items-center justify-between gap-4 bg-gray-50 rounded-b-2xl">
          <div>
            {subtotalUnits > 0 ? (
              <>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-800">{subtotalUnits}</span>
                  {isBoxer ? ' unidades' : ' docenas'}
                </p>
                <p className="text-indigo-600 font-semibold text-sm">
                  ${subtotalPrice.toLocaleString('es-AR')}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Sin cantidades cargadas</p>
            )}
          </div>
          <div className="flex gap-2">
            {subtotalUnits > 0 && (
              <button onClick={handleClear} className="px-3 py-2 text-sm text-red-500 hover:text-red-700 font-medium">
                Limpiar
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded-xl bg-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoxerMatrix({ product, matrix, onChange }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="text-left pb-3 pr-4 text-gray-500 font-medium">Color</th>
          {SIZES.map(size => (
            <th key={size} className="text-center pb-3 px-2 text-gray-700 font-semibold w-16">{size}</th>
          ))}
          <th className="text-right pb-3 pl-2 text-gray-400 font-medium">Total</th>
        </tr>
      </thead>
      <tbody>
        {product.colors.map((color, i) => {
          const rowTotal = SIZES.reduce((s, size) => s + (matrix[`${color}-${size}`] || 0), 0);
          return (
            <tr key={color} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
              <td className="py-2 pr-4 font-medium text-gray-700 whitespace-nowrap pl-2 rounded-l-lg">{color}</td>
              {SIZES.map(size => {
                const key = `${color}-${size}`;
                const available = product.stock[key] ?? 0;
                const qty = matrix[key] || 0;
                return (
                  <td key={size} className="py-2 px-2 text-center">
                    {available === 0 ? (
                      <span className="text-gray-300 text-xs">—</span>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <input
                          type="number"
                          min="0"
                          max={available}
                          value={qty || ''}
                          onChange={e => onChange(color, size, e.target.value)}
                          placeholder="0"
                          className={`w-14 text-center border rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white ${
                            qty > 0 ? 'border-indigo-300 font-semibold' : 'border-gray-200'
                          }`}
                        />
                        <span className="text-gray-300 text-xs leading-none">{available}</span>
                      </div>
                    )}
                  </td>
                );
              })}
              <td className="py-2 pl-2 text-right text-gray-500 font-medium pr-2 rounded-r-lg">
                {rowTotal > 0 ? rowTotal : '—'}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={SIZES.length + 2} className="pt-3 text-xs text-gray-300">
            Los números debajo de cada casilla indican el stock disponible.
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function DocenaMatrix({ product, matrix, onChange }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="text-left pb-3 pr-4 text-gray-500 font-medium">Color</th>
          <th className="text-center pb-3 px-2 text-gray-700 font-semibold">Docenas</th>
          <th className="text-right pb-3 pl-2 text-gray-400 font-medium">Disponible</th>
        </tr>
      </thead>
      <tbody>
        {product.colors.map((color, i) => {
          const available = product.stock[color] ?? 0;
          const qty = matrix[color] || 0;
          return (
            <tr key={color} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
              <td className="py-3 pr-4 font-medium text-gray-700 whitespace-nowrap pl-2 rounded-l-lg">{color}</td>
              <td className="py-3 px-2 text-center">
                {available === 0 ? (
                  <span className="text-gray-300 text-sm">Sin stock</span>
                ) : (
                  <input
                    type="number"
                    min="0"
                    max={available}
                    value={qty || ''}
                    onChange={e => onChange(color, e.target.value)}
                    placeholder="0"
                    className={`w-20 text-center border rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white ${
                      qty > 0 ? 'border-indigo-300 font-semibold' : 'border-gray-200'
                    }`}
                  />
                )}
              </td>
              <td className="py-3 pl-2 text-right text-gray-400 text-sm pr-2 rounded-r-lg">
                {available > 0 ? `${available} doc.` : '—'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
