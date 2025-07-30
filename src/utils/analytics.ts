// Google Analytics 4 Integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title: string) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title,
    page_location: url,
  });
};

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// E-commerce tracking
export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'INR',
    items: items.map(item => ({
      item_id: item.product.id,
      item_name: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      price: item.product.price,
    })),
  });
};

// Track add to cart
export const trackAddToCart = (item: any) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'add_to_cart', {
    currency: 'INR',
    value: item.product.price * item.quantity,
    items: [{
      item_id: item.product.id,
      item_name: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      price: item.product.price,
    }],
  });
};

// Track remove from cart
export const trackRemoveFromCart = (item: any) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'remove_from_cart', {
    currency: 'INR',
    value: item.product.price * item.quantity,
    items: [{
      item_id: item.product.id,
      item_name: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      price: item.product.price,
    }],
  });
};

// Track search
export const trackSearch = (searchTerm: string) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'search', {
    search_term: searchTerm,
  });
};

// Track user registration
export const trackSignUp = (method: string) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'sign_up', {
    method: method,
  });
};

// Track user login
export const trackLogin = (method: string) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', 'login', {
    method: method,
  });
};