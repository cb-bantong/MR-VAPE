interface Product {
  _id: string;
  company: string;
  productName: string;
  flavor: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface ProductCardProps {
  group: Product[];
  onClick: () => void;
}

export default function ProductCard({ group, onClick }: ProductCardProps) {
  const primaryProduct = group.find((p) => p.imageUrl) || group[0];
  const flavorCount = group.length;

  return (
    <div
      onClick={onClick}
      className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer group select-none h-full border border-slate-900"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-slate-950/40 rounded-xl border border-slate-900/60 overflow-hidden flex items-center justify-center mb-4 group-hover:border-cyan-500/20 transition-colors duration-300">
        {primaryProduct.imageUrl ? (
          <img
            src={primaryProduct.imageUrl}
            alt={primaryProduct.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <svg className="w-12 h-12 text-slate-700 group-hover:text-cyan-500/40 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}

        {/* Dynamic Badge for multiple flavors */}
        {flavorCount > 1 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-cyan-950/80 border border-cyan-500/20 text-[10px] uppercase font-bold tracking-wider text-cyan-400 rounded-lg">
            {flavorCount} Flavors
          </div>
        )}
      </div>

      {/* Card Info Section */}
      <div className="w-full flex flex-col items-start space-y-1.5 mt-auto">
        <h3 className="font-extrabold text-sm text-slate-200 group-hover:text-white transition-colors duration-300 line-clamp-1">
          {primaryProduct.productName}
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          {primaryProduct.company}
        </p>
        <div className="w-full flex items-center justify-between pt-1">
          <span className="font-black text-cyan-400 text-sm">
            ₱{primaryProduct.price.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition-all duration-300 flex items-center space-x-0.5">
            <span>View Details</span>
            <svg className="w-3 h-3 translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open("https://www.facebook.com/profile.php?id=61580296598261", "_blank");
          }}
          className="w-full mt-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 active:bg-blue-600/30 border border-blue-500/20 hover:border-blue-500/30 text-blue-450 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1"
        >
          <span>Order via Facebook</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
