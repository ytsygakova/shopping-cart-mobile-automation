import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, ShoppingCart, Search, Heart, 
  Star, ChevronDown, X, Check, Loader 
} from 'lucide-react';

// Simulates async API call with random delay
const simulateAPI = (data, minDelay = 500, maxDelay = 2000) => {
  return new Promise(resolve => {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    setTimeout(() => resolve(data), delay);
  });
};

const TrickyShopApp = () => {
  // Login Screen State
  const [screen, setScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Product Screen State
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Mobile-specific state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [touchStart, setTouchStart] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(null);
  
  // Refs for tricky interactions
  // Swipe state per cart item
  const [swipeOffsets, setSwipeOffsets] = useState({});
  const swipeTouchStart = useRef(null);

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const productListRef = useRef(null);

  // Mock product data
  const mockProducts = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'Electronics', stock: 5, rating: 4.5 },
    { id: 2, name: 'Smart Watch', price: 249.99, category: 'Electronics', stock: 0, rating: 4.8 },
    { id: 3, name: 'Running Shoes', price: 79.99, category: 'Sports', stock: 12, rating: 4.2 },
    { id: 4, name: 'Yoga Mat', price: 29.99, category: 'Sports', stock: 8, rating: 4.6 },
    { id: 5, name: 'Coffee Maker', price: 89.99, category: 'Home', stock: 3, rating: 4.4 },
    { id: 6, name: 'Desk Lamp', price: 39.99, category: 'Home', stock: 15, rating: 4.1 },
  ];

  const categories = ['All', 'Electronics', 'Sports', 'Home'];

  // TRICKY CASE 1: Dynamic loading with variable timing
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await simulateAPI(mockProducts, 800, 2500);
      setProducts(data);
      setIsLoading(false);
    };

    if (screen === 'products' && products.length === 0) {
      loadProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // TRICKY CASE 2: Login with multiple validation states
  const handleLogin = async () => {
    setLoginError('');
    
    // Client-side validation
    if (!username.trim()) {
      setLoginError('Username is required');
      return;
    }
    
    if (password.length < 6) {
      setLoginError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    // Simulate async authentication with variable timing
    await simulateAPI(null, 1000, 2000);
    
    // Valid credentials: user@test.com / password123
    if (username === 'user@test.com' && password === 'password123') {
      setIsLoading(false);
      setScreen('products');
    } else {
      setIsLoading(false);
      setLoginError('Invalid credentials. Try user@test.com / password123');
    }
  };

  // TRICKY CASE 3: Pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const data = await simulateAPI(mockProducts, 1000, 1500);
    setProducts(data);
    setCart([]);
    setFavorites(new Set());
    setSearchQuery('');
    setSelectedCategory('All');
    setSwipeOffsets({});
    setIsRefreshing(false);
    showToastMessage('Products refreshed!');
  };

  // TRICKY CASE 4: Toast notifications that auto-dismiss
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // TRICKY CASE 5: Add to cart with animation state
  const addToCart = (product) => {
    if (product.stock === 0) {
      showToastMessage('Out of stock!');
      return;
    }
    setCart([...cart, product]);
    showToastMessage(`${product.name} added to cart!`);
  };

  // TRICKY CASE 6: Toggle favorites
  // BUG: favorites count in header shows stale count because
  // we're reading .size before the state actually updates
  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      showToastMessage(`Removed from favorites (${newFavorites.size} left)`);
    } else {
      newFavorites.add(productId);
      showToastMessage(`Added to favorites (${favorites.size} total)`); // BUG: reads old .size before update
    }
    setFavorites(newFavorites);
  };

  // TRICKY CASE 7: Dropdown that closes on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // TRICKY CASE 8: Pull-to-refresh gesture (mobile-specific)
  const handleTouchStart = (e) => {
    if (productListRef.current && productListRef.current.scrollTop === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (touchStart !== null) {
      const currentTouch = e.touches[0].clientY;
      const distance = currentTouch - touchStart;
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
        // Prevent page scroll/refresh when pulling
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80) {
      handleRefresh();
    }
    setTouchStart(null);
    setPullDistance(0);
  };

  // TRICKY CASE 9: Long press gesture for context menu
  const handleLongPressStart = (productId) => {
    const timer = setTimeout(() => {
      setShowContextMenu(productId);
      showToastMessage('Long press detected');
      // Vibrate if supported (mobile-specific)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // TRICKY CASE 10: Swipe gesture to delete from cart
  const handleSwipeStart = (e, itemIndex) => {
    swipeTouchStart.current = { x: e.touches[0].clientX, index: itemIndex };
  };

  const handleSwipeMove = (e) => {
    if (!swipeTouchStart.current) return;
    const dx = e.touches[0].clientX - swipeTouchStart.current.x;
    if (dx < 0) {
      // Only allow swipe left, cap at -150px
      setSwipeOffsets(prev => ({
        ...prev,
        [swipeTouchStart.current.index]: Math.max(dx, -150)
      }));
    }
  };

  const handleSwipeEnd = () => {
    if (!swipeTouchStart.current) return;
    const idx = swipeTouchStart.current.index;
    const offset = swipeOffsets[idx] || 0;

    if (offset < -100) {
      // Threshold reached — remove item
      const newCart = cart.filter((_, i) => i !== idx);
      setCart(newCart);
      setSwipeOffsets({});
      showToastMessage('Item removed');
    } else {
      // Snap back
      setSwipeOffsets(prev => ({ ...prev, [idx]: 0 }));
    }
    swipeTouchStart.current = null;
  };

  // TRICKY CASE 11: Pinch-to-zoom on product image
  const handleImageClick = (product) => {
    setSelectedProduct(product);
    setShowImageViewer(true);
    setImageScale(1);
  };

  const handlePinchZoom = (e) => {
    if (e.touches && e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      // Simulate zoom (simplified)
      setImageScale(prev => Math.min(Math.max(distance / 100, 0.5), 3));
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <ShoppingCart className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">DemoShop</h1>
            <p className="text-gray-500 mt-2">QA Assessment App</p>
          </div>

          <div className="space-y-4">
            {/* TRICKY: Input fields with data-testid for automation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                data-testid="login-username"
                aria-label="Username input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="user@test.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                data-testid="login-password"
                aria-label="Password input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Enter password"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {/* TRICKY: Checkbox interaction */}
            <div className="flex items-center">
              <input
                type="checkbox"
                data-testid="remember-me-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                disabled={isLoading}
              />
              <label className="ml-2 text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* TRICKY: Dynamic error message that appears/disappears */}
            {loginError && (
              <div 
                data-testid="login-error"
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-sm text-red-700">{loginError}</span>
              </div>
            )}

            {/* TRICKY: Button with loading state */}
            <button
              data-testid="login-button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Test credentials: user@test.com / password123
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate cart total with INTENTIONAL BUG
  const calculateCartTotal = () => {
    // BUG: Using string concatenation instead of addition when cart has 3+ items
    // This simulates a common bug candidates should catch during testing
    if (cart.length >= 3) {
      return cart.reduce((sum, item) => sum + item.price.toString(), '');
    }
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  const cartTotal = calculateCartTotal();

  // PRODUCTS SCREEN
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with cart badge */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">DemoShop</h1>
          <div className="relative flex items-center gap-4">
            {/* Favorites counter */}
            {favorites.size > 0 && (
              <div data-testid="favorites-count" className="text-sm text-gray-600 flex items-center gap-1">
                <Heart size={14} className="fill-red-500 text-red-500" />
                {favorites.size}
              </div>
            )}
            {/* Cart total display */}
            {cart.length > 0 && (
              <div data-testid="cart-total" className="text-sm font-semibold text-gray-700">
                Total: ${cartTotal}
              </div>
            )}
            <button 
              onClick={() => setShowBottomSheet(true)}
              className="relative"
            >
              <ShoppingCart data-testid="cart-icon" className="text-gray-700" size={24} />
              {cart.length > 0 && (
                <span 
                  data-testid="cart-badge"
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TRICKY: Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          data-testid="pull-refresh-indicator"
          className="flex justify-center py-2 bg-indigo-50"
          style={{ height: `${pullDistance}px` }}
        >
          <Loader 
            className={pullDistance > 80 ? 'animate-spin' : ''} 
            size={20} 
          />
        </div>
      )}

      {/* TRICKY: Toast notification that auto-dismisses */}
      {showToast && (
        <div 
          data-testid="toast-notification"
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300"
        >
          {toastMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
          {/* TRICKY: Search with real-time filtering */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              data-testid="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            {/* TRICKY: Clear button appears only when there's text */}
            {searchQuery && (
              <button
                data-testid="search-clear-button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* TRICKY: Custom dropdown that needs special handling */}
          <div className="relative" ref={dropdownRef}>
            <button
              data-testid="category-dropdown-trigger"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <span>Category: {selectedCategory}</span>
              <ChevronDown size={20} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showCategoryDropdown && (
              <div 
                data-testid="category-dropdown-menu"
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
              >
                {categories.map(cat => (
                  <button
                    key={cat}
                    data-testid={`category-option-${cat.toLowerCase()}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between"
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && (
                      <Check className="text-indigo-600" size={16} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TRICKY: Pull to refresh simulation */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredProducts.length} products found
          </p>
          <button
            data-testid="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:text-gray-400"
          >
            <Loader className={isRefreshing ? 'animate-spin' : ''} size={16} />
            Refresh
          </button>
        </div>

        {/* TRICKY: Loading state with skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            ref={productListRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{ touchAction: 'pan-down' }}
          >
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                data-testid={`product-card-${product.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 relative"
              >
                {/* TRICKY: Long-press context menu */}
                {showContextMenu === product.id && (
                  <div 
                    data-testid={`context-menu-${product.id}`}
                    className="absolute top-2 left-2 bg-white rounded-lg shadow-xl p-2 z-30 border border-gray-200"
                  >
                    <button 
                      onClick={() => {
                        toggleFavorite(product.id);
                        setShowContextMenu(null);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      Quick Favorite
                    </button>
                    <button 
                      onClick={() => {
                        addToCart(product);
                        setShowContextMenu(null);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      Quick Add
                    </button>
                    <button 
                      onClick={() => setShowContextMenu(null)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm text-red-600"
                    >
                      Close
                    </button>
                  </div>
                )}

                <div 
                  className="relative"
                  onMouseDown={() => handleLongPressStart(product.id)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(product.id)}
                  onTouchEnd={handleLongPressEnd}
                >
                  <div 
                    onClick={() => handleImageClick(product)}
                    className="bg-gradient-to-br from-indigo-100 to-purple-100 h-48 rounded-lg mb-4 flex items-center justify-center cursor-pointer hover:opacity-90"
                    data-testid={`product-image-${product.id}`}
                  >
                    <span className="text-4xl">📦</span>
                  </div>
                  
                  {/* TRICKY: Favorite button with toggle state */}
                  <button
                    data-testid={`favorite-button-${product.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart 
                      size={20} 
                      className={favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                    />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-indigo-600">
                    ${product.price}
                  </span>
                  <span 
                    data-testid={`stock-indicator-${product.id}`}
                    className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* TRICKY: Button disabled state based on stock */}
                <button
                  data-testid={`add-to-cart-${product.id}`}
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors cursor-not-allowed"
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* TRICKY: Bottom Sheet Modal (mobile pattern) - slides up from bottom */}
      {showBottomSheet && (
        <div 
          data-testid="bottom-sheet-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowBottomSheet(false)}
        >
          <div 
            data-testid="bottom-sheet"
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
                <button 
                  data-testid="close-bottom-sheet"
                  onClick={() => setShowBottomSheet(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Your cart is empty
                </div>
              ) : (
                                  <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div 
                      key={index}
                      data-testid={`cart-item-${index}`}
                      className="relative rounded-lg overflow-hidden"
                    >
                      {/* Red delete background — always present underneath */}
                      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-lg">
                        <div className="flex flex-col items-center text-white">
                          <X size={20} />
                          <span className="text-xs mt-1 font-semibold">Delete</span>
                        </div>
                      </div>

                      {/* Swipe hint pill on first item */}
                      {index === 0 && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-3 py-1 rounded-full z-10 whitespace-nowrap pointer-events-none animate-pulse">
                          ← Swipe left to delete
                        </div>
                      )}

                      {/* Main item row — translates on swipe */}
                      <div 
                        className="relative z-10 flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        style={{ 
                          transform: `translateX(${swipeOffsets[index] || 0}px)`,
                          transition: swipeTouchStart.current ? 'none' : 'transform 0.3s ease'
                        }}
                        onTouchStart={(e) => handleSwipeStart(e, index)}
                        onTouchMove={handleSwipeMove}
                        onTouchEnd={handleSwipeEnd}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">${item.price}</p>
                        </div>
                        <button
                          data-testid={`remove-cart-item-${index}`}
                          onClick={() => {
                            const newCart = cart.filter((_, i) => i !== index);
                            setCart(newCart);
                            showToastMessage('Item removed');
                          }}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center text-xl font-bold mb-4">
                      <span>Total:</span>
                      <span data-testid="bottom-sheet-total">${cartTotal}</span>
                    </div>
                    <button
                      data-testid="checkout-button"
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
                      onClick={() => showToastMessage('Checkout not implemented in demo')}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRICKY: Image Viewer Modal with pinch-to-zoom simulation */}
      {showImageViewer && selectedProduct && (
        <div 
          data-testid="image-viewer-overlay"
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setShowImageViewer(false)}
        >
          <div className="relative">
            <button
              data-testid="close-image-viewer"
              onClick={() => setShowImageViewer(false)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full z-10"
            >
              <X size={32} />
            </button>
            <div 
              data-testid="zoomable-image"
              className="bg-gradient-to-br from-indigo-100 to-purple-100 w-96 h-96 flex items-center justify-center rounded-lg cursor-pointer"
              style={{ transform: `scale(${imageScale})`, transition: 'transform 0.2s' }}
              onTouchMove={handlePinchZoom}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-9xl">📦</span>
            </div>
            <div className="text-center mt-4">
              <p className="text-white text-lg font-semibold">{selectedProduct.name}</p>
              <p className="text-gray-300">Pinch to zoom • Zoom: {imageScale.toFixed(1)}x</p>
              <div className="flex gap-2 justify-center mt-4">
                <button
                  data-testid="zoom-out-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageScale(Math.max(0.5, imageScale - 0.5));
                  }}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
                >
                  Zoom Out
                </button>
                <button
                  data-testid="zoom-in-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageScale(Math.min(3, imageScale + 0.5));
                  }}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
                >
                  Zoom In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TrickyShopApp;
