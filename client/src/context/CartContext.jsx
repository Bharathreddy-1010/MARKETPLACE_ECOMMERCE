import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('texflow_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('texflow_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity, selectedColor) => {
    const qty = Number(quantity) || product.moq || 100;
    const color = selectedColor || (product.colors ? product.colors[0] : 'Standard');

    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && item.color === color
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            moq: product.moq,
            gsm: product.gsm,
            supplierName: product.supplierName,
            image: (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
            color,
            quantity: qty
          }
        ];
      }
    });
  };

  const updateQuantity = (productId, color, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, color);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId && item.color === color
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const removeFromCart = (productId, color) => {
    setCartItems(prev =>
      prev.filter(item => !(item.productId === productId && item.color === color))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
