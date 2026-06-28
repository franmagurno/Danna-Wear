import { useState } from 'react';

export default function OrderForm({ onSubmit, onClose, totalUnits, totalPrice }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError('Hubo un error al enviar el pedido. Intentá de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-indigo-600 px-6 py-5 text-white">
          <h2 className="text-lg font-bold">Confirmar pedido</h2>
          <p className="text-indigo-200 text-sm mt-0.5">Revisá el resumen antes de enviar</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Summary */}
          <div className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-indigo-700">${totalPrice.toLocaleString('es-AR')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Unidades</p>
              <p className="text-xl font-bold text-indigo-700">{totalUnits}</p>
            </div>
          </div>

          {/* Customer name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del cliente
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
