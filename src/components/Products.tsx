import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Header from "./Header";
import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  company: string;
  productName: string;
  flavor: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  storageId?: string;
}

export default function Products() {
  const products = useQuery(api.products.getProducts);
  const [selectedGroup, setSelectedGroup] = useState<Product[] | null>(null);
  const [activeFlavorIndex, setActiveFlavorIndex] = useState(0);

  // Group products by company + productName (case-insensitive key grouping)
  const groupedProducts = products
    ? Object.values(
        products.reduce((acc: Record<string, Product[]>, product) => {
          const key = `${product.company.toLowerCase()}_${product.productName.toLowerCase()}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(product);
          return acc;
        }, {}),
      )
    : [];

  const handleCardClick = (group: Product[]) => {
    setSelectedGroup(group);
    const firstImageIdx = group.findIndex((p) => p.imageUrl);
    setActiveFlavorIndex(firstImageIdx !== -1 ? firstImageIdx : 0);
  };

  const handleModalClose = () => {
    setSelectedGroup(null);
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-16 z-10 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Our Premium <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.25)]">
              Product Collection
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            Browse through our premium vape devices and selection of flavors.
            Select any card to explore.
          </p>
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 bg-blue-950/20 border border-blue-500/15 rounded-xl text-xs font-semibold text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>
              To place an order, please send a message to our{" "}
              <a
                href="https://www.facebook.com/profile.php?id=61580296598261"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline font-bold transition"
              >
                Facebook Page
              </a>
              !
            </span>
          </div>
        </div>

        {/* Loading State */}
        {products === undefined ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <svg
              className="animate-spin h-8 w-8 text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm text-slate-500 font-medium">
              Fetching catalog...
            </span>
          </div>
        ) : groupedProducts.length === 0 ? (
          <div className="text-center py-24 text-slate-500 border border-dashed border-slate-900 rounded-3xl bg-slate-900/10">
            No products are currently available in the directory.
          </div>
        ) : (
          /* Products Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {groupedProducts.map((group, idx) => (
              <ProductCard
                key={idx}
                group={group}
                onClick={() => handleCardClick(group)}
              />
            ))}
          </div>
        )}
      </main>

      {/* DETAIL MODAL / LIGHTBOX */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 md:items-center animate-fade-in">
          <div className="relative my-auto w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in md:my-0">
            {/* Modal Header */}
            <div className="px-4 py-3.5 sm:px-6 sm:py-4.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/20">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Product Details
              </span>
              <button
                onClick={handleModalClose}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            {(() => {
              const displayImage =
                selectedGroup[activeFlavorIndex]?.imageUrl ||
                selectedGroup[0]?.imageUrl;
              const displayDescription =
                selectedGroup[activeFlavorIndex]?.description ||
                selectedGroup[0]?.description ||
                "No description provided for this flavor.";
              return (
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">
                  {/* Left Column: Image corresponding to active flavor */}
                  <div className="w-full max-h-[300px] sm:max-h-none aspect-square bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={
                          selectedGroup[activeFlavorIndex]?.productName ||
                          selectedGroup[0]?.productName
                        }
                        className="w-full h-full object-cover animate-fade-in"
                        key={activeFlavorIndex} // Key forces remount/fade-in animation when image changes
                      />
                    ) : (
                      <svg
                        className="w-16 h-16 text-slate-800"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Right Column: Detailed Product Info */}
                  <div className="flex flex-col space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                        {selectedGroup[0].company}
                      </span>
                      <h3 className="text-2xl font-black text-white tracking-tight">
                        {selectedGroup[0].productName}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Flavor:{" "}
                        <span className="text-cyan-400 font-bold">
                          {selectedGroup[activeFlavorIndex]?.flavor}
                        </span>
                      </p>
                      <div className="flex items-center justify-between pt-1.5">
                        <span className="text-xl font-extrabold text-cyan-400">
                          ₱
                          {(
                            selectedGroup[activeFlavorIndex]?.price ??
                            selectedGroup[0].price
                          ).toFixed(2)}
                        </span>
                        {selectedGroup[activeFlavorIndex]?.stock > 0 ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-950/20 text-red-400 border border-red-500/10 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            <span>Out of Stock</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Flavors Grid (Triggering hover state shifts) */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                        Available Flavors
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedGroup.map((product, idx) => (
                          <button
                            key={product._id}
                            onMouseEnter={() => setActiveFlavorIndex(idx)}
                            onClick={() => setActiveFlavorIndex(idx)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition select-none cursor-default ${
                              activeFlavorIndex === idx
                                ? "bg-cyan-600/10 border-cyan-500/40 text-cyan-400"
                                : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                            } ${product.stock === 0 ? "opacity-60 line-through decoration-red-500/30" : ""}`}
                          >
                            {product.flavor}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 italic block pt-0.5">
                        * Tap or hover over flavors to see description and image
                        shifts.
                      </span>
                    </div>

                    {/* Description of active flavor */}
                    <div className="space-y-2 border-t border-slate-800/80 pt-4 flex-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                        Flavor Profile & Description
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
                        {displayDescription}
                      </p>
                    </div>

                    {/* Order via Facebook Button */}
                    <a
                      href="https://www.facebook.com/profile.php?id=61580296598261"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 active:bg-blue-600/30 border border-blue-500/20 hover:border-blue-500/30 text-blue-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <span>Order via Facebook</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-600 mt-auto z-10">
        <p>© 2026 MRVAPE Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
