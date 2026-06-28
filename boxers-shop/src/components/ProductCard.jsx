export default function ProductCard({ product, unitsInCart, currentBoxerPrice, onClick }) {
  const displayPrice = product.type === 'boxer' ? currentBoxerPrice : product.price;
  const unit = product.type === 'boxer' ? 'unidad' : 'docena';

  return (
    <div
      onClick={() => onClick(product)}
      className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden group"
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.brand}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {unitsInCart > 0 && (
          <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {unitsInCart} {product.type === 'boxer' ? 'u.' : 'doc.'}
          </span>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-base font-bold text-gray-800">{product.brand}</h2>
        <p className="text-indigo-600 font-semibold mt-0.5">
          ${displayPrice.toLocaleString('es-AR')}
          <span className="text-gray-400 font-normal text-xs"> / {unit}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">{product.colors.join(' · ')}</p>
        <button className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold">
          {unitsInCart > 0 ? 'Editar selección' : 'Seleccionar'}
        </button>
      </div>
    </div>
  );
}
