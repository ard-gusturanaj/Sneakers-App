import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { getProductImageUrl } from '../lib/productImages';
import { EU_SHOE_SIZES } from '../constants/sizes';
import { Search, ShoppingCart, Filter } from 'lucide-react';
import './Shop.css';

interface ShopProps {
  onAddToCart: (product: Product, size: string) => void;
}

export default function Shop({ onAddToCart }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedBrand, products]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProducts(data);
      setFilteredProducts(data);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedBrand !== 'all') {
      filtered = filtered.filter((product) => product.brand === selectedBrand);
    }

    setFilteredProducts(filtered);
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

  const brands = ['all', 'Nike', 'Adidas', 'New Balance'];
  return (
    <div className="shop-page">
      <div className="shop-wrapper">
        <div className="shop-header">
          <h1 className="shop-title">Shop All Shoes</h1>

          <div className="shop-filter-card">
            <div className="shop-search-row">
              <div className="shop-search-input-wrapper">
                <Search className="shop-search-icon" />
                <input
                  type="text"
                  placeholder="Search shoes by name, brand, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="shop-search-input"
                />
              </div>

              <div className="shop-filter">
                <Filter className="shop-filter-icon" />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="shop-filter-select"
                >
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand === 'all' ? 'All Brands' : brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <p className="shop-product-count">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="shop-grid">
          {filteredProducts.map((product) => {
            const productImageUrl = getProductImageUrl(product.name, product.image_url);

            return (
              <div key={product.id} className="shop-card group">
                <div className="shop-card-image">
                  {productImageUrl ? (
                    <img src={productImageUrl} alt={product.name} className="shop-card-img" />
                  ) : (
                    <div className="shop-card-placeholder">No image</div>
                  )}
                  {product.discount_price && (
                    <div className="shop-card-discount">
                      {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                    </div>
                  )}
                </div>

                <div className="shop-card-body">
                  <div className="shop-card-brand">{product.brand}</div>
                  <h3 className="shop-card-title">{product.name}</h3>

                  <div className="shop-card-price-row">
                    {product.discount_price ? (
                      <>
                        <span className="shop-card-price-primary">${product.discount_price}</span>
                        <span className="shop-card-price-secondary">${product.price}</span>
                      </>
                    ) : (
                      <span className="shop-card-price-primary">${product.price}</span>
                    )}
                  </div>

                  <div className="shop-size-select-wrapper">
                    <select
                      value={selectedSize[product.id] || ''}
                      onChange={(e) => setSelectedSize({ ...selectedSize, [product.id]: e.target.value })}
                    className="shop-size-select"
                  >
                    <option value="">Select size</option>
                      {EU_SHOE_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button onClick={() => handleAddToCart(product)} className="shop-add-button">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="shop-empty-state">
            <p className="shop-empty-message">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
