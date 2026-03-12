import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProductImageUrl } from '../lib/productImages';
import { EU_SHOE_SIZES } from '../constants/sizes';
import { Product } from '../types';
import {
  ShoppingCart,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface HomeProps {
  onAddToCart: (product: Product, size: string) => void;
}

type HomeProductCache = {
  newArrivals: Product[];
  discounts: Product[];
  events: Product[];
};

let homeProductCache: HomeProductCache | null = null;

export default function Home({ onAddToCart }: HomeProps) {
  const [newArrivals, setNewArrivals] = useState<Product[]>(() => homeProductCache?.newArrivals || []);
  const [discounts, setDiscounts] = useState<Product[]>(() => homeProductCache?.discounts || []);
  const [events, setEvents] = useState<Product[]>(() => homeProductCache?.events || []);
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});
  const [loadingProducts, setLoadingProducts] = useState(!homeProductCache);

  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const discountsRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (homeProductCache) return;
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoadingProducts(true);

    const [
      { data: newArrivalsData },
      { data: discountsData },
      { data: eventsData },
    ] = await Promise.all([
      supabase.from('products').select('*').eq('category', 'new_arrival').limit(6),
      supabase.from('products').select('*').eq('category', 'discount').limit(6),
      supabase.from('products').select('*').eq('category', 'event').limit(6),
    ]);

    const nextNewArrivals = newArrivalsData || [];
    const nextDiscounts = discountsData || [];
    const nextEvents = eventsData || [];

    setNewArrivals(nextNewArrivals);
    setDiscounts(nextDiscounts);
    setEvents(nextEvents);
    homeProductCache = {
      newArrivals: nextNewArrivals,
      discounts: nextDiscounts,
      events: nextEvents,
    };
    setLoadingProducts(false);
  };

  const handleAddToCart = (product: Product) => {
    const size = selectedSize[product.id];
    if (!size) {
      alert('Please select a size');
      return;
    }

    onAddToCart(product, size);
    alert('Added to cart!');
  };

  const scrollRow = (
    ref: React.RefObject<HTMLDivElement>,
    direction: 'left' | 'right'
  ) => {
    if (!ref.current) return;

    const scrollAmount =
      window.innerWidth < 768 ? 260 : window.innerWidth < 1024 ? 420 : 760;

    ref.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const productImageUrl = getProductImageUrl(product.name, product.image_url);

    return (
      <div className="w-[63%] sm:w-[52%] md:w-[36%] lg:w-[26%] xl:w-[22%] bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group snap-start flex-shrink-0">
        <div className="relative h-[10.5rem] md:h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {productImageUrl ? (
            <img
              src={productImageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              No image
            </div>
          )}

          {product.discount_price && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              {Math.round(
                ((product.price - product.discount_price) / product.price) * 100
              )}
              % OFF
            </div>
          )}
        </div>

        <div className="p-2.5 md:p-4">
          <div className="text-sm font-semibold text-slate-500 mb-1">
            {product.brand}
          </div>

          <h3 className="text-[15px] md:text-lg font-bold text-slate-900 mb-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            {product.discount_price ? (
              <>
                <span className="text-[1.15rem] md:text-2xl font-bold text-slate-900">
                  ${product.discount_price}
                </span>
                <span className="text-base text-slate-400 line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-[1.15rem] md:text-2xl font-bold text-slate-900">
                ${product.price}
              </span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Size
            </label>
            <select
              value={selectedSize[product.id] || ''}
              onChange={(e) =>
                setSelectedSize({ ...selectedSize, [product.id]: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            >
              <option value="">Select size</option>
              {EU_SHOE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleAddToCart(product)}
            className="w-full bg-slate-900 text-white py-2 md:py-3 text-[13px] md:text-base rounded-lg font-semibold hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border dark:border-slate-500 transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  const ProductCarousel = ({
    title,
    subtitle,
    badgeText,
    icon,
    products,
    scrollRef,
    iconColor = 'text-slate-900',
  }: {
    title: string;
    subtitle: string;
    badgeText: string;
    icon: React.ReactNode;
    products: Product[];
    scrollRef: React.RefObject<HTMLDivElement>;
    iconColor?: string;
  }) => (
    <section className="mb-9 md:mb-14">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className={iconColor}>{icon}</div>
          <div>
            <h2 className="text-[1.15rem] md:text-3xl font-bold text-slate-900">{title}</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] md:text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {badgeText}
          </span>
          <button
            onClick={() => scrollRow(scrollRef, 'left')}
            className="hidden md:flex p-3 rounded-full bg-white shadow-md border border-slate-200 hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-slate-900" />
          </button>

          <button
            onClick={() => scrollRow(scrollRef, 'right')}
            className="hidden md:flex p-3 rounded-full bg-white shadow-md border border-slate-200 hover:bg-slate-100 transition"
          >
            <ChevronRight className="w-5 h-5 text-slate-900" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 no-scrollbar"
      >
        {loadingProducts
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`${title}-skeleton-${index}`}
                className="w-[63%] sm:w-[52%] md:w-[36%] lg:w-[26%] xl:w-[22%] bg-slate-200 dark:bg-slate-800 rounded-xl h-[19rem] md:h-[21rem] animate-pulse flex-shrink-0"
              />
            ))
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-9 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[1.75rem] md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            Step Into Style
          </h1>
          <p className="text-[15px] md:text-xl text-slate-300">
            Discover the latest collection from top brands
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-[10px] sm:px-6 lg:px-8 py-6 md:py-10">
        <ProductCarousel
          title="New Arrivals"
          subtitle="Fresh drops from Nike, Adidas, and New Balance"
          badgeText="Just landed"
          icon={<Tag className="w-7 h-7 md:w-8 md:h-8" />}
          products={newArrivals}
          scrollRef={newArrivalsRef}
          iconColor="text-slate-900"
        />

        <ProductCarousel
          title="Special Discounts"
          subtitle="Limited-time markdowns before stock runs out"
          badgeText="Save up to 40%"
          icon={<ShoppingCart className="w-7 h-7 md:w-8 md:h-8" />}
          products={discounts}
          scrollRef={discountsRef}
          iconColor="text-red-600"
        />

        <ProductCarousel
          title="Limited Events"
          subtitle="Exclusive collabs and special release picks"
          badgeText="Hot picks"
          icon={<Calendar className="w-7 h-7 md:w-8 md:h-8" />}
          products={events}
          scrollRef={eventsRef}
          iconColor="text-emerald-600"
        />
      </div>
    </div>
  );
}
