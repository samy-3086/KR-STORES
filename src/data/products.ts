import { Product } from '../types';

export const products: Product[] = [
  // Vegetables
  {
    id: '1',
    name: 'Fresh Tomatoes',
    category: 'vegetables',
    price: 40,
    originalPrice: 50,
    image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Fresh, juicy tomatoes perfect for cooking and salads. Rich in vitamins and antioxidants.',
    stock: 50,
    featured: true,
    unit: 'kg',
    discount: 20
  },
  {
    id: '2',
    name: 'Organic Spinach',
    category: 'vegetables',
    price: 30,
    image: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Fresh organic spinach leaves, packed with iron and nutrients.',
    stock: 25,
    featured: false,
    unit: 'bunch'
  },
  {
    id: '3',
    name: 'Bell Peppers',
    category: 'vegetables',
    price: 80,
    image: 'https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Colorful bell peppers, great for stir-fries and salads.',
    stock: 30,
    featured: false,
    unit: 'kg'
  },
  {
    id: '4',
    name: 'Fresh Carrots',
    category: 'vegetables',
    price: 35,
    image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Crunchy fresh carrots, perfect for cooking and snacking.',
    stock: 40,
    featured: true,
    unit: 'kg'
  },

  // Fruits
  {
    id: '5',
    name: 'Fresh Bananas',
    category: 'fruits',
    price: 60,
    image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Sweet, ripe bananas rich in potassium and natural sugars.',
    stock: 100,
    featured: true,
    unit: 'dozen'
  },
  {
    id: '6',
    name: 'Red Apples',
    category: 'fruits',
    price: 120,
    originalPrice: 140,
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Crisp and sweet red apples, perfect for snacking.',
    stock: 60,
    featured: false,
    unit: 'kg',
    discount: 14
  },
  {
    id: '7',
    name: 'Fresh Oranges',
    category: 'fruits',
    price: 80,
    image: 'https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Juicy oranges packed with vitamin C and natural sweetness.',
    stock: 45,
    featured: true,
    unit: 'kg'
  },
  {
    id: '8',
    name: 'Fresh Grapes',
    category: 'fruits',
    price: 100,
    image: 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Sweet and seedless grapes, perfect for snacking.',
    stock: 35,
    featured: false,
    unit: 'kg'
  },

  // Spices
  {
    id: '9',
    name: 'Turmeric Powder',
    category: 'spices',
    price: 150,
    image: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Pure turmeric powder with anti-inflammatory properties.',
    stock: 20,
    featured: false,
    unit: '500g'
  },
  {
    id: '10',
    name: 'Red Chili Powder',
    category: 'spices',
    price: 120,
    image: 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Spicy red chili powder for authentic Indian cooking.',
    stock: 25,
    featured: true,
    unit: '500g'
  },
  {
    id: '11',
    name: 'Cumin Seeds',
    category: 'spices',
    price: 200,
    image: 'https://images.pexels.com/photos/4198016/pexels-photo-4198016.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Aromatic cumin seeds for tempering and flavoring.',
    stock: 15,
    featured: false,
    unit: '250g'
  },
  {
    id: '12',
    name: 'Garam Masala',
    category: 'spices',
    price: 180,
    originalPrice: 200,
    image: 'https://images.pexels.com/photos/4198018/pexels-photo-4198018.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Authentic garam masala blend for rich, aromatic dishes.',
    stock: 18,
    featured: true,
    unit: '100g',
    discount: 10
  },

  // Groceries
  {
    id: '13',
    name: 'Basmati Rice',
    category: 'groceries',
    price: 180,
    image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Premium quality basmati rice with long grains and aromatic flavor.',
    stock: 50,
    featured: true,
    unit: '1kg'
  },
  {
    id: '14',
    name: 'Whole Wheat Flour',
    category: 'groceries',
    price: 45,
    image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Fresh whole wheat flour for healthy rotis and bread.',
    stock: 40,
    featured: false,
    unit: '1kg'
  },
  {
    id: '15',
    name: 'Toor Dal',
    category: 'groceries',
    price: 120,
    image: 'https://images.pexels.com/photos/4110252/pexels-photo-4110252.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'High-quality toor dal, rich in protein and nutrients.',
    stock: 30,
    featured: true,
    unit: '1kg'
  },
  {
    id: '16',
    name: 'Cooking Oil',
    category: 'groceries',
    price: 140,
    originalPrice: 160,
    image: 'https://images.pexels.com/photos/4110253/pexels-photo-4110253.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Pure sunflower cooking oil for healthy cooking.',
    stock: 25,
    featured: false,
    unit: '1L',
    discount: 12
  }
];

export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = () => {
  return products.filter(product => product.featured);
};

export const searchProducts = (query: string) => {
  return products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase())
  );
};