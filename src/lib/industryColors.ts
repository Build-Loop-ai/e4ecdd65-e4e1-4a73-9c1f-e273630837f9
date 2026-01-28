/**
 * Super Intelligent Business Detection System
 * 60+ industry-specific color palettes with multilingual keyword matching
 */

export interface IndustryColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  name: string;
}

export interface IndustryMatch {
  industry: string;
  confidence: number;
  matchedTerm?: string;
}

// ============================================
// 60+ INDUSTRY COLOR PALETTES
// Organized by business category with psychology-based colors
// ============================================

export const industryColors: Record<string, IndustryColorPalette> = {
  // ==========================================
  // PERSONAL SERVICES (12 types)
  // ==========================================
  
  barber: {
    primary: '#1F2937',    // Charcoal - masculine, classic
    secondary: '#D4AF37',  // Gold - premium, traditional
    accent: '#B8860B',     // Dark gold
    name: 'Barbershop',
  },
  
  hair_salon: {
    primary: '#7C3AED',    // Purple - creative, feminine
    secondary: '#EC4899',  // Pink
    accent: '#F472B6',     // Light pink
    name: 'Hair Salon',
  },
  
  nail_studio: {
    primary: '#F472B6',    // Pink - glamorous
    secondary: '#A855F7',  // Violet
    accent: '#EC4899',     // Hot pink
    name: 'Nail Studio',
  },
  
  tattoo: {
    primary: '#0F172A',    // Near black - edgy, bold
    secondary: '#EF4444',  // Red
    accent: '#DC2626',     // Dark red
    name: 'Tattoo Shop',
  },
  
  spa: {
    primary: '#14B8A6',    // Teal - calming, natural
    secondary: '#22C55E',  // Green
    accent: '#10B981',     // Emerald
    name: 'Spa & Wellness',
  },
  
  massage: {
    primary: '#0D9488',    // Teal - relaxing
    secondary: '#6EE7B7',  // Mint
    accent: '#14B8A6',     // Lighter teal
    name: 'Massage',
  },
  
  photography: {
    primary: '#18181B',    // Zinc black - artistic
    secondary: '#F59E0B',  // Amber
    accent: '#FBBF24',     // Yellow
    name: 'Photography',
  },
  
  wedding: {
    primary: '#F9A8D4',    // Pink - romantic
    secondary: '#D4AF37',  // Gold - elegant
    accent: '#FDF2F8',     // Light pink
    name: 'Wedding Planner',
  },
  
  florist: {
    primary: '#22C55E',    // Green - natural
    secondary: '#EC4899',  // Pink
    accent: '#F472B6',     // Light pink
    name: 'Florist',
  },
  
  pet_groomer: {
    primary: '#3B82F6',    // Blue - friendly
    secondary: '#F97316',  // Orange - playful
    accent: '#FB923C',     // Light orange
    name: 'Pet Grooming',
  },
  
  dry_cleaner: {
    primary: '#0EA5E9',    // Sky blue - clean
    secondary: '#64748B',  // Slate
    accent: '#38BDF8',     // Light blue
    name: 'Dry Cleaning',
  },
  
  tailor: {
    primary: '#1E3A5F',    // Navy - craftsmanship
    secondary: '#D4AF37',  // Gold
    accent: '#F59E0B',     // Amber
    name: 'Tailor',
  },

  // ==========================================
  // FOOD & HOSPITALITY (10 types)
  // ==========================================
  
  restaurant: {
    primary: '#DC2626',    // Red - appetizing
    secondary: '#F97316',  // Orange
    accent: '#FBBF24',     // Amber
    name: 'Restaurant',
  },
  
  cafe: {
    primary: '#92400E',    // Brown - warm, cozy
    secondary: '#D97706',  // Amber
    accent: '#F59E0B',     // Yellow
    name: 'Cafe',
  },
  
  bakery: {
    primary: '#F59E0B',    // Amber - fresh, artisanal
    secondary: '#92400E',  // Brown
    accent: '#FBBF24',     // Yellow
    name: 'Bakery',
  },
  
  bar: {
    primary: '#7C3AED',    // Violet - nightlife
    secondary: '#EC4899',  // Pink
    accent: '#A855F7',     // Purple
    name: 'Bar & Nightclub',
  },
  
  fast_food: {
    primary: '#EF4444',    // Red - quick, energetic
    secondary: '#FBBF24',  // Yellow
    accent: '#F97316',     // Orange
    name: 'Fast Food',
  },
  
  fine_dining: {
    primary: '#1F2937',    // Charcoal - luxury
    secondary: '#D4AF37',  // Gold
    accent: '#B8860B',     // Dark gold
    name: 'Fine Dining',
  },
  
  food_truck: {
    primary: '#F97316',    // Orange - casual, fun
    secondary: '#22C55E',  // Green
    accent: '#FBBF24',     // Yellow
    name: 'Food Truck',
  },
  
  catering: {
    primary: '#6366F1',    // Indigo - professional
    secondary: '#F97316',  // Orange
    accent: '#818CF8',     // Light indigo
    name: 'Catering',
  },
  
  ice_cream: {
    primary: '#EC4899',    // Pink - playful, sweet
    secondary: '#06B6D4',  // Cyan
    accent: '#F472B6',     // Light pink
    name: 'Ice Cream',
  },
  
  butcher: {
    primary: '#991B1B',    // Dark red - traditional
    secondary: '#78716C',  // Stone
    accent: '#DC2626',     // Red
    name: 'Butcher',
  },

  // ==========================================
  // HEALTHCARE (8 types)
  // ==========================================
  
  dentist: {
    primary: '#0D9488',    // Teal - trust, clean
    secondary: '#3B82F6',  // Blue
    accent: '#14B8A6',     // Light teal
    name: 'Dentist',
  },
  
  optician: {
    primary: '#3B82F6',    // Blue - precision
    secondary: '#6366F1',  // Indigo
    accent: '#60A5FA',     // Light blue
    name: 'Optician',
  },
  
  pharmacy: {
    primary: '#22C55E',    // Green - health
    secondary: '#3B82F6',  // Blue
    accent: '#4ADE80',     // Light green
    name: 'Pharmacy',
  },
  
  physiotherapy: {
    primary: '#14B8A6',    // Teal - active recovery
    secondary: '#F97316',  // Orange
    accent: '#2DD4BF',     // Light teal
    name: 'Physiotherapy',
  },
  
  veterinary: {
    primary: '#22C55E',    // Green - caring, natural
    secondary: '#3B82F6',  // Blue
    accent: '#4ADE80',     // Light green
    name: 'Veterinary',
  },
  
  psychologist: {
    primary: '#7C3AED',    // Purple - calm, trust
    secondary: '#14B8A6',  // Teal
    accent: '#A78BFA',     // Light purple
    name: 'Psychologist',
  },
  
  chiropractor: {
    primary: '#0D9488',    // Teal - professional
    secondary: '#64748B',  // Slate
    accent: '#14B8A6',     // Light teal
    name: 'Chiropractor',
  },
  
  podiatrist: {
    primary: '#14B8A6',    // Teal - medical
    secondary: '#64748B',  // Slate
    accent: '#2DD4BF',     // Light teal
    name: 'Podiatrist',
  },

  // ==========================================
  // HOME SERVICES (12 types)
  // ==========================================
  
  plumber: {
    primary: '#3B82F6',    // Blue - trust, water
    secondary: '#64748B',  // Slate
    accent: '#60A5FA',     // Light blue
    name: 'Plumber',
  },
  
  electrician: {
    primary: '#F59E0B',    // Amber - safety, energy
    secondary: '#64748B',  // Slate
    accent: '#FBBF24',     // Yellow
    name: 'Electrician',
  },
  
  hvac: {
    primary: '#06B6D4',    // Cyan - comfort, air
    secondary: '#64748B',  // Slate
    accent: '#22D3EE',     // Light cyan
    name: 'HVAC',
  },
  
  roofer: {
    primary: '#78716C',    // Stone - sturdy
    secondary: '#D97706',  // Amber
    accent: '#A8A29E',     // Light stone
    name: 'Roofer',
  },
  
  landscaper: {
    primary: '#22C55E',    // Green - natural
    secondary: '#92400E',  // Brown
    accent: '#4ADE80',     // Light green
    name: 'Landscaper',
  },
  
  painter: {
    primary: '#6366F1',    // Indigo - creative
    secondary: '#EC4899',  // Pink
    accent: '#818CF8',     // Light indigo
    name: 'Painter',
  },
  
  locksmith: {
    primary: '#1F2937',    // Charcoal - security
    secondary: '#F59E0B',  // Amber
    accent: '#374151',     // Gray
    name: 'Locksmith',
  },
  
  cleaning: {
    primary: '#0EA5E9',    // Sky blue - fresh, clean
    secondary: '#22C55E',  // Green
    accent: '#38BDF8',     // Light blue
    name: 'Cleaning Service',
  },
  
  moving: {
    primary: '#F97316',    // Orange - reliable, active
    secondary: '#3B82F6',  // Blue
    accent: '#FB923C',     // Light orange
    name: 'Moving Company',
  },
  
  interior_designer: {
    primary: '#8B5CF6',    // Purple - luxury, creative
    secondary: '#D4AF37',  // Gold
    accent: '#A78BFA',     // Light purple
    name: 'Interior Designer',
  },
  
  window_cleaner: {
    primary: '#0EA5E9',    // Sky blue - spotless
    secondary: '#E0F2FE',  // Light blue
    accent: '#38BDF8',     // Light sky
    name: 'Window Cleaner',
  },
  
  pest_control: {
    primary: '#22C55E',    // Green - safe
    secondary: '#78716C',  // Stone
    accent: '#4ADE80',     // Light green
    name: 'Pest Control',
  },

  // ==========================================
  // PROFESSIONAL SERVICES (8 types)
  // ==========================================
  
  lawyer: {
    primary: '#1E3A5F',    // Navy - trust, authority
    secondary: '#64748B',  // Slate
    accent: '#334155',     // Dark slate
    name: 'Lawyer',
  },
  
  accountant: {
    primary: '#1E3A5F',    // Navy - precise
    secondary: '#059669',  // Emerald
    accent: '#334155',     // Dark slate
    name: 'Accountant',
  },
  
  insurance: {
    primary: '#3B82F6',    // Blue - security
    secondary: '#22C55E',  // Green
    accent: '#60A5FA',     // Light blue
    name: 'Insurance',
  },
  
  real_estate: {
    primary: '#1F2937',    // Charcoal - premium
    secondary: '#D4AF37',  // Gold
    accent: '#374151',     // Gray
    name: 'Real Estate',
  },
  
  notary: {
    primary: '#1E3A5F',    // Navy - official
    secondary: '#78716C',  // Stone
    accent: '#334155',     // Dark slate
    name: 'Notary',
  },
  
  architect: {
    primary: '#18181B',    // Zinc - design
    secondary: '#F59E0B',  // Amber
    accent: '#27272A',     // Dark zinc
    name: 'Architect',
  },
  
  consultant: {
    primary: '#6366F1',    // Indigo - expert
    secondary: '#64748B',  // Slate
    accent: '#818CF8',     // Light indigo
    name: 'Consultant',
  },
  
  hr_recruiting: {
    primary: '#8B5CF6',    // Purple - people-focused
    secondary: '#3B82F6',  // Blue
    accent: '#A78BFA',     // Light purple
    name: 'HR & Recruiting',
  },

  // ==========================================
  // AUTOMOTIVE (6 types)
  // ==========================================
  
  car_dealer: {
    primary: '#1F2937',    // Charcoal - premium
    secondary: '#DC2626',  // Red
    accent: '#374151',     // Gray
    name: 'Car Dealer',
  },
  
  mechanic: {
    primary: '#4B5563',    // Gray - reliable
    secondary: '#D97706',  // Amber
    accent: '#6B7280',     // Light gray
    name: 'Mechanic',
  },
  
  car_wash: {
    primary: '#0EA5E9',    // Sky blue - clean
    secondary: '#3B82F6',  // Blue
    accent: '#38BDF8',     // Light sky
    name: 'Car Wash',
  },
  
  tire_shop: {
    primary: '#1F2937',    // Charcoal - durable
    secondary: '#F97316',  // Orange
    accent: '#374151',     // Gray
    name: 'Tire Shop',
  },
  
  auto_detailing: {
    primary: '#18181B',    // Zinc black - premium
    secondary: '#D4AF37',  // Gold
    accent: '#27272A',     // Dark zinc
    name: 'Auto Detailing',
  },
  
  motorcycle: {
    primary: '#0F172A',    // Near black - bold
    secondary: '#EF4444',  // Red
    accent: '#1E293B',     // Dark slate
    name: 'Motorcycle Shop',
  },

  // ==========================================
  // RETAIL & SPECIALTY (8 types)
  // ==========================================
  
  fashion: {
    primary: '#18181B',    // Zinc - stylish
    secondary: '#EC4899',  // Pink
    accent: '#27272A',     // Dark zinc
    name: 'Fashion Boutique',
  },
  
  jewelry: {
    primary: '#D4AF37',    // Gold - luxury
    secondary: '#18181B',  // Black
    accent: '#B8860B',     // Dark gold
    name: 'Jewelry Store',
  },
  
  electronics: {
    primary: '#3B82F6',    // Blue - tech
    secondary: '#06B6D4',  // Cyan
    accent: '#60A5FA',     // Light blue
    name: 'Electronics',
  },
  
  furniture: {
    primary: '#78716C',    // Stone - quality
    secondary: '#D97706',  // Amber
    accent: '#A8A29E',     // Light stone
    name: 'Furniture Store',
  },
  
  pet_store: {
    primary: '#22C55E',    // Green - friendly
    secondary: '#F97316',  // Orange
    accent: '#4ADE80',     // Light green
    name: 'Pet Store',
  },
  
  toy_store: {
    primary: '#FBBF24',    // Yellow - fun
    secondary: '#EF4444',  // Red
    accent: '#FCD34D',     // Light yellow
    name: 'Toy Store',
  },
  
  bookstore: {
    primary: '#92400E',    // Brown - knowledge
    secondary: '#22C55E',  // Green
    accent: '#B45309',     // Light brown
    name: 'Bookstore',
  },
  
  music_store: {
    primary: '#7C3AED',    // Purple - creative
    secondary: '#EC4899',  // Pink
    accent: '#A78BFA',     // Light purple
    name: 'Music Store',
  },

  // ==========================================
  // TECHNOLOGY (4 types)
  // ==========================================
  
  technology: {
    primary: '#3B82F6',    // Blue - trust, innovation
    secondary: '#06B6D4',  // Cyan
    accent: '#8B5CF6',     // Purple
    name: 'Technology',
  },
  
  ai_consultancy: {
    primary: '#6366F1',    // Indigo - cutting-edge
    secondary: '#8B5CF6',  // Purple
    accent: '#06B6D4',     // Cyan
    name: 'AI Consultancy',
  },
  
  saas: {
    primary: '#6366F1',    // Indigo - modern
    secondary: '#3B82F6',  // Blue
    accent: '#818CF8',     // Light indigo
    name: 'SaaS',
  },
  
  it_services: {
    primary: '#3B82F6',    // Blue - professional
    secondary: '#64748B',  // Slate
    accent: '#60A5FA',     // Light blue
    name: 'IT Services',
  },

  // ==========================================
  // FITNESS & SPORTS (4 types)
  // ==========================================
  
  fitness: {
    primary: '#DC2626',    // Red - energy
    secondary: '#F97316',  // Orange
    accent: '#EF4444',     // Light red
    name: 'Fitness',
  },
  
  gym: {
    primary: '#1F2937',    // Charcoal - strong
    secondary: '#EF4444',  // Red
    accent: '#374151',     // Gray
    name: 'Gym',
  },
  
  yoga: {
    primary: '#14B8A6',    // Teal - calm
    secondary: '#F472B6',  // Pink
    accent: '#2DD4BF',     // Light teal
    name: 'Yoga Studio',
  },
  
  sports_club: {
    primary: '#22C55E',    // Green - active
    secondary: '#3B82F6',  // Blue
    accent: '#4ADE80',     // Light green
    name: 'Sports Club',
  },

  // ==========================================
  // EDUCATION (4 types)
  // ==========================================
  
  education: {
    primary: '#2563EB',    // Blue - trust
    secondary: '#16A34A',  // Green
    accent: '#F59E0B',     // Amber
    name: 'Education',
  },
  
  tutoring: {
    primary: '#6366F1',    // Indigo - knowledge
    secondary: '#F59E0B',  // Amber
    accent: '#818CF8',     // Light indigo
    name: 'Tutoring',
  },
  
  driving_school: {
    primary: '#22C55E',    // Green - safety
    secondary: '#3B82F6',  // Blue
    accent: '#4ADE80',     // Light green
    name: 'Driving School',
  },
  
  music_lessons: {
    primary: '#7C3AED',    // Purple - creative
    secondary: '#F59E0B',  // Amber
    accent: '#A78BFA',     // Light purple
    name: 'Music Lessons',
  },

  // ==========================================
  // LEGACY / GENERAL CATEGORIES
  // ==========================================
  
  beauty_wellness: {
    primary: '#7C3AED',    // Purple - more unisex
    secondary: '#EC4899',  // Pink
    accent: '#D946EF',     // Fuchsia
    name: 'Beauty & Wellness',
  },
  
  wellness: {
    primary: '#14B8A6',    // Teal
    secondary: '#22C55E',  // Green
    accent: '#06B6D4',     // Cyan
    name: 'Wellness',
  },
  
  food_hospitality: {
    primary: '#F97316',    // Orange
    secondary: '#EF4444',  // Red
    accent: '#FBBF24',     // Amber
    name: 'Food & Hospitality',
  },
  
  professional_services: {
    primary: '#1E40AF',    // Deep blue
    secondary: '#3B82F6',  // Blue
    accent: '#6366F1',     // Indigo
    name: 'Professional Services',
  },
  
  healthcare: {
    primary: '#14B8A6',    // Teal
    secondary: '#22C55E',  // Green
    accent: '#06B6D4',     // Cyan
    name: 'Healthcare',
  },
  
  medical: {
    primary: '#0D9488',    // Teal
    secondary: '#10B981',  // Emerald
    accent: '#3B82F6',     // Blue
    name: 'Medical',
  },
  
  construction: {
    primary: '#D97706',    // Amber
    secondary: '#78716C',  // Stone
    accent: '#F59E0B',     // Yellow
    name: 'Construction',
  },
  
  industrial: {
    primary: '#4B5563',    // Gray
    secondary: '#D97706',  // Amber
    accent: '#F59E0B',     // Yellow
    name: 'Industrial',
  },
  
  creative: {
    primary: '#8B5CF6',    // Purple
    secondary: '#EC4899',  // Pink
    accent: '#F43F5E',     // Rose
    name: 'Creative Agency',
  },
  
  agency: {
    primary: '#7C3AED',    // Violet
    secondary: '#DB2777',  // Pink
    accent: '#F59E0B',     // Amber
    name: 'Agency',
  },
  
  retail: {
    primary: '#6366F1',    // Indigo
    secondary: '#F43F5E',  // Rose
    accent: '#FBBF24',     // Amber
    name: 'Retail',
  },
  
  ecommerce: {
    primary: '#059669',    // Emerald
    secondary: '#0891B2',  // Cyan
    accent: '#F59E0B',     // Amber
    name: 'E-commerce',
  },
  
  finance: {
    primary: '#1E3A5F',    // Navy
    secondary: '#059669',  // Emerald
    accent: '#0EA5E9',     // Sky
    name: 'Finance',
  },
  
  nonprofit: {
    primary: '#0891B2',    // Cyan
    secondary: '#10B981',  // Emerald
    accent: '#F59E0B',     // Amber
    name: 'Non-profit',
  },
};

// Default fallback for unknown industries
export const defaultColors: IndustryColorPalette = {
  primary: '#6366F1',    // Indigo - universally professional
  secondary: '#64748B',  // Slate
  accent: '#0EA5E9',     // Sky
  name: 'Default',
};

// ============================================
// MULTILINGUAL KEYWORD ALIAS SYSTEM
// 200+ terms in EN/NL/DE/FR/ES
// ============================================

export const BUSINESS_ALIASES: Record<string, string[]> = {
  // PERSONAL SERVICES
  barber: [
    'barber', 'barbershop', 'barber shop', 'barbier',
    'kapper', 'herenkapper', 'herenkappers', 'barbershop', 'kapperszaak',
    'friseur', 'herrenfriseur', 'barbier',
    'coiffeur', 'barbier',
    'barberia', 'peluquero', 'barbero',
  ],
  
  hair_salon: [
    'salon', 'hair salon', 'hairdresser', 'hairstylist', 'stylist',
    'kapsalon', 'dameskapper', 'haarsalon', 'kapsalons',
    'friseursalon', 'frisör', 'friseurin',
    'coiffure', 'salon de coiffure',
    'peluqueria', 'estilista',
  ],
  
  nail_studio: [
    'nail', 'nails', 'nail salon', 'nail studio', 'manicure', 'pedicure',
    'nagel', 'nagelsalon', 'nagelstudio', 'nagels',
    'nagelstudio', 'maniküre',
    'manucure', 'onglerie',
    'manicura', 'uñas',
  ],
  
  tattoo: [
    'tattoo', 'tattoos', 'tattoo shop', 'tattoo studio', 'tattoo parlor', 'ink',
    'tatoeage', 'tattooshop', 'tatoeëerder',
    'tätowierer', 'tattoo-studio', 'tätowierung',
    'tatouage', 'tatoueur',
    'tatuaje', 'tatuador',
  ],
  
  spa: [
    'spa', 'wellness', 'sauna', 'day spa', 'health spa',
    'wellness centrum', 'wellnesscentrum', 'spa', 'sauna',
    'wellnesszentrum', 'therme',
    'centre de bien-être', 'spa',
    'balneario', 'spa',
  ],
  
  massage: [
    'massage', 'masseur', 'masseuse', 'massage therapy', 'therapeutic massage',
    'massage', 'masseur', 'massagesalon',
    'massage', 'masseur', 'massagepraxis',
    'massage', 'masseur',
    'masaje', 'masajista',
  ],
  
  photography: [
    'photography', 'photographer', 'photo studio', 'portrait',
    'fotografie', 'fotograaf', 'fotostudio',
    'fotografie', 'fotograf', 'fotostudio',
    'photographie', 'photographe',
    'fotografía', 'fotógrafo',
  ],
  
  wedding: [
    'wedding', 'wedding planner', 'bridal', 'event planner',
    'bruiloft', 'trouwen', 'wedding planner', 'huwelijk',
    'hochzeit', 'hochzeitsplaner', 'braut',
    'mariage', 'wedding planner',
    'boda', 'organizador de bodas',
  ],
  
  florist: [
    'florist', 'flowers', 'flower shop', 'floral',
    'bloemen', 'bloemist', 'bloemenwinkel', 'bloemenzaak',
    'blumen', 'florist', 'blumenladen',
    'fleuriste', 'fleurs',
    'florista', 'flores',
  ],
  
  pet_groomer: [
    'pet grooming', 'dog grooming', 'groomer', 'pet salon',
    'trimsalon', 'hondentrimmer', 'dierensalon',
    'hundesalon', 'tierpflege',
    'toilettage', 'toiletteur',
    'peluquería canina', 'grooming',
  ],
  
  dry_cleaner: [
    'dry cleaning', 'dry cleaner', 'laundry', 'cleaners',
    'stomerij', 'wasserij', 'stomerijen',
    'reinigung', 'wäscherei',
    'pressing', 'nettoyage à sec',
    'tintorería', 'lavandería',
  ],
  
  tailor: [
    'tailor', 'alterations', 'seamstress', 'bespoke',
    'kleermaker', 'maatkleding', 'naaiatelier',
    'schneider', 'schneiderei', 'maßschneider',
    'tailleur', 'couturier',
    'sastre', 'sastrería',
  ],

  // FOOD & HOSPITALITY
  restaurant: [
    'restaurant', 'dining', 'eatery', 'bistro', 'brasserie', 'trattoria',
    'restaurant', 'eetcafé', 'eetgelegenheid', 'horeca',
    'restaurant', 'gaststätte', 'gasthof', 'wirtshaus',
    'restaurant', 'brasserie',
    'restaurante', 'comedor',
  ],
  
  cafe: [
    'cafe', 'coffee', 'coffee shop', 'coffeehouse', 'espresso',
    'café', 'koffie', 'koffiehuis', 'koffiezaak', 'koffiebar',
    'café', 'kaffee', 'kaffeehaus',
    'café', 'coffee shop',
    'cafetería', 'café',
  ],
  
  bakery: [
    'bakery', 'baker', 'pastry', 'bread', 'patisserie',
    'bakkerij', 'bakker', 'brood', 'banketbakker', 'patisserie',
    'bäckerei', 'bäcker', 'konditorei',
    'boulangerie', 'pâtisserie',
    'panadería', 'pastelería',
  ],
  
  bar: [
    'bar', 'pub', 'nightclub', 'club', 'lounge', 'cocktail',
    'bar', 'kroeg', 'café', 'nachtclub', 'discotheek',
    'bar', 'kneipe', 'nachtclub', 'diskothek',
    'bar', 'pub', 'boîte de nuit',
    'bar', 'pub', 'discoteca',
  ],
  
  fast_food: [
    'fast food', 'quick service', 'takeaway', 'takeout', 'burgers', 'pizza',
    'snackbar', 'fastfood', 'afhaal', 'snacks',
    'schnellimbiss', 'imbiss',
    'fast food', 'restauration rapide',
    'comida rápida', 'fast food',
  ],
  
  fine_dining: [
    'fine dining', 'gourmet', 'upscale', 'haute cuisine', 'michelin',
    'sterrenrestaurant', 'gastronomisch', 'fine dining',
    'gourmetrestaurant', 'sternerestaurant',
    'gastronomique', 'haute cuisine',
    'alta cocina', 'gourmet',
  ],
  
  food_truck: [
    'food truck', 'street food', 'mobile food',
    'foodtruck', 'streetfood',
    'foodtruck', 'imbisswagen',
    'food truck', 'cuisine de rue',
    'food truck', 'comida callejera',
  ],
  
  catering: [
    'catering', 'caterer', 'event catering',
    'catering', 'cateraar', 'traiteur',
    'catering', 'partyservice',
    'traiteur', 'catering',
    'catering', 'servicio de banquetes',
  ],
  
  ice_cream: [
    'ice cream', 'gelato', 'frozen yogurt', 'sorbet',
    'ijs', 'ijssalon', 'ijswinkel', 'gelato',
    'eiscafé', 'eisdiele', 'eis',
    'glace', 'glacier',
    'helado', 'heladería',
  ],
  
  butcher: [
    'butcher', 'meat', 'butcher shop',
    'slager', 'slagerij', 'vlees',
    'metzger', 'metzgerei', 'fleischer',
    'boucher', 'boucherie',
    'carnicero', 'carnicería',
  ],

  // HEALTHCARE
  dentist: [
    'dentist', 'dental', 'dentistry', 'orthodontist', 'teeth', 'oral',
    'tandarts', 'tandzorg', 'tandheelkunde', 'orthodontist', 'tanden',
    'zahnarzt', 'zahnmedizin', 'kieferorthopäde',
    'dentiste', 'dentaire',
    'dentista', 'dental',
  ],
  
  optician: [
    'optician', 'optometrist', 'eyewear', 'glasses', 'eye care',
    'opticien', 'optiek', 'bril', 'brillen', 'oogzorg',
    'optiker', 'augenoptiker', 'brillen',
    'opticien', 'lunettes',
    'óptico', 'gafas',
  ],
  
  pharmacy: [
    'pharmacy', 'pharmacist', 'drugstore', 'chemist',
    'apotheek', 'apotheker', 'drogist',
    'apotheke', 'apotheker',
    'pharmacie', 'pharmacien',
    'farmacia', 'farmacéutico',
  ],
  
  physiotherapy: [
    'physiotherapy', 'physio', 'physical therapy', 'pt',
    'fysiotherapie', 'fysio', 'fysiotherapeut',
    'physiotherapie', 'krankengymnastik',
    'physiothérapie', 'kinésithérapie',
    'fisioterapia', 'fisio',
  ],
  
  veterinary: [
    'veterinary', 'vet', 'veterinarian', 'animal hospital', 'pet clinic',
    'dierenarts', 'dierenkliniek', 'dierenziekenhuis',
    'tierarzt', 'tierklinik', 'tierarztpraxis',
    'vétérinaire', 'clinique vétérinaire',
    'veterinario', 'clínica veterinaria',
  ],
  
  psychologist: [
    'psychologist', 'therapist', 'counselor', 'mental health', 'psychology',
    'psycholoog', 'therapeut', 'psychologie', 'ggz',
    'psychologe', 'therapeut', 'psychologie',
    'psychologue', 'thérapeute',
    'psicólogo', 'terapeuta',
  ],
  
  chiropractor: [
    'chiropractor', 'chiropractic',
    'chiropractor', 'chiropractie',
    'chiropraktiker', 'chiropraktik',
    'chiropracteur', 'chiropratique',
    'quiropráctico', 'quiropráctica',
  ],

  // HOME SERVICES
  plumber: [
    'plumber', 'plumbing', 'pipes', 'drains',
    'loodgieter', 'loodgieters', 'sanitair', 'riool', 'waterleiding',
    'klempner', 'installateur', 'sanitär',
    'plombier', 'plomberie',
    'fontanero', 'fontanería',
  ],
  
  electrician: [
    'electrician', 'electrical', 'wiring', 'electric',
    'elektricien', 'elektrisch', 'elektra', 'installateur',
    'elektriker', 'elektro', 'elektroinstallation',
    'électricien', 'électrique',
    'electricista', 'eléctrico',
  ],
  
  hvac: [
    'hvac', 'heating', 'cooling', 'air conditioning', 'ventilation', 'ac',
    'airco', 'klimaat', 'verwarming', 'koeling', 'ventilatie',
    'heizung', 'klimaanlage', 'lüftung',
    'chauffage', 'climatisation',
    'aire acondicionado', 'calefacción',
  ],
  
  roofer: [
    'roofer', 'roofing', 'roof',
    'dakdekker', 'dakwerk', 'dak',
    'dachdecker', 'dach',
    'couvreur', 'toiture',
    'techador', 'tejado',
  ],
  
  landscaper: [
    'landscaper', 'landscaping', 'lawn', 'garden', 'gardening',
    'hovenier', 'tuinman', 'tuinonderhoud', 'hoveniersbedrijf', 'tuin',
    'gärtner', 'landschaftsbau', 'garten',
    'paysagiste', 'jardinier',
    'jardinero', 'paisajista',
  ],
  
  painter: [
    'painter', 'painting', 'decorator',
    'schilder', 'schildersbedrijf', 'schilderwerk',
    'maler', 'malerbetrieb',
    'peintre', 'peinture',
    'pintor', 'pintura',
  ],
  
  locksmith: [
    'locksmith', 'locks', 'keys', 'security',
    'slotenmaker', 'sloten', 'sleutels',
    'schlüsseldienst', 'schlosser',
    'serrurier', 'serrurerie',
    'cerrajero', 'cerrajería',
  ],
  
  cleaning: [
    'cleaning', 'cleaner', 'cleaning service', 'maid', 'janitorial',
    'schoonmaak', 'schoonmaakbedrijf', 'schoonmaker', 'glazenwasser',
    'reinigung', 'reinigungsfirma', 'putzfrau',
    'nettoyage', 'entreprise de nettoyage',
    'limpieza', 'empresa de limpieza',
  ],
  
  moving: [
    'moving', 'movers', 'relocation', 'removals',
    'verhuizen', 'verhuisbedrijf', 'verhuizer', 'verhuizers',
    'umzug', 'umzugsfirma', 'umzugsunternehmen',
    'déménagement', 'déménageur',
    'mudanza', 'empresa de mudanzas',
  ],
  
  interior_designer: [
    'interior design', 'interior designer', 'interior',
    'interieur', 'interieurontwerp', 'interieurontwerper',
    'innenarchitekt', 'inneneinrichtung',
    'décorateur', 'design intérieur',
    'diseño de interiores', 'interiorista',
  ],
  
  pest_control: [
    'pest control', 'exterminator', 'pest',
    'ongediertebestrijding', 'plaagdierbestrijding',
    'schädlingsbekämpfung', 'kammerjäger',
    'lutte antiparasitaire', 'dératisation',
    'control de plagas', 'fumigación',
  ],

  // PROFESSIONAL SERVICES
  lawyer: [
    'lawyer', 'attorney', 'law firm', 'legal', 'solicitor', 'barrister',
    'advocaat', 'advocaten', 'advocatenkantoor', 'juridisch', 'recht',
    'rechtsanwalt', 'anwalt', 'kanzlei', 'jurist',
    'avocat', 'cabinet d\'avocats', 'juridique',
    'abogado', 'bufete', 'legal',
  ],
  
  accountant: [
    'accountant', 'accounting', 'bookkeeper', 'cpa', 'tax',
    'boekhouder', 'accountant', 'boekhoudkantoor', 'administratiekantoor',
    'buchhalter', 'steuerberater', 'buchhaltung',
    'comptable', 'expert-comptable',
    'contador', 'contable',
  ],
  
  insurance: [
    'insurance', 'insurer', 'insurance agent',
    'verzekering', 'verzekeraar', 'assurantie',
    'versicherung', 'versicherungsmakler',
    'assurance', 'assureur',
    'seguros', 'aseguradora',
  ],
  
  real_estate: [
    'real estate', 'realtor', 'property', 'estate agent',
    'makelaar', 'makelaardij', 'vastgoed', 'onroerend goed',
    'immobilien', 'makler', 'immobilienmakler',
    'immobilier', 'agent immobilier',
    'inmobiliaria', 'bienes raíces',
  ],
  
  notary: [
    'notary', 'notary public',
    'notaris', 'notariskantoor',
    'notar', 'notariat',
    'notaire',
    'notario', 'notaría',
  ],
  
  architect: [
    'architect', 'architecture', 'architectural',
    'architect', 'architectuur', 'architectenbureau',
    'architekt', 'architektur', 'architekturbüro',
    'architecte', 'architecture',
    'arquitecto', 'arquitectura',
  ],
  
  consultant: [
    'consultant', 'consulting', 'advisory',
    'adviseur', 'consultant', 'adviesbureau',
    'berater', 'beratung', 'unternehmensberatung',
    'consultant', 'conseil',
    'consultor', 'consultoría',
  ],

  // AUTOMOTIVE
  car_dealer: [
    'car dealer', 'auto dealer', 'dealership', 'car sales',
    'autodealer', 'autohandel', 'autobedrijf', 'autoverkoop',
    'autohaus', 'autohändler', 'autohandel',
    'concessionnaire', 'vente auto',
    'concesionario', 'venta de coches',
  ],
  
  mechanic: [
    'mechanic', 'garage', 'auto repair', 'car repair', 'auto shop',
    'garage', 'autowerkplaats', 'monteur', 'autoreparatie',
    'werkstatt', 'autowerkstatt', 'kfz', 'mechaniker',
    'garage', 'mécanicien', 'réparation auto',
    'taller', 'mecánico',
  ],
  
  car_wash: [
    'car wash', 'auto wash', 'wash',
    'wasstraat', 'carwash', 'autowasstraat',
    'waschanlage', 'autowaschanlage',
    'lavage auto', 'station de lavage',
    'lavadero', 'lavado de coches',
  ],
  
  tire_shop: [
    'tire', 'tires', 'tire shop', 'tyre',
    'banden', 'bandencentrale', 'bandenshop',
    'reifen', 'reifenhandel',
    'pneus', 'pneumatiques',
    'neumáticos', 'llantas',
  ],
  
  auto_detailing: [
    'detailing', 'auto detailing', 'car detailing',
    'autopoetsen', 'detailing', 'polijsten',
    'autopflege', 'fahrzeugaufbereitung',
    'detailing', 'lustrage',
    'detallado', 'detailing',
  ],
  
  motorcycle: [
    'motorcycle', 'motorbike', 'bike shop',
    'motor', 'motorfiets', 'motorzaak',
    'motorrad', 'motorradgeschäft',
    'moto', 'motocyclette',
    'motocicleta', 'moto',
  ],

  // RETAIL
  fashion: [
    'fashion', 'clothing', 'apparel', 'boutique', 'clothes',
    'mode', 'kleding', 'boetiek', 'kledingwinkel',
    'mode', 'bekleidung', 'boutique',
    'mode', 'vêtements', 'boutique',
    'moda', 'ropa', 'boutique',
  ],
  
  jewelry: [
    'jewelry', 'jewellery', 'jeweler', 'gems',
    'juwelier', 'sieraden', 'juwelen',
    'juwelier', 'schmuck', 'goldschmied',
    'bijouterie', 'joaillerie',
    'joyería', 'joyas',
  ],
  
  electronics: [
    'electronics', 'tech store', 'gadgets', 'computers',
    'elektronica', 'computer', 'gadgets',
    'elektronik', 'technik', 'computer',
    'électronique', 'informatique',
    'electrónica', 'tecnología',
  ],
  
  furniture: [
    'furniture', 'furnishings', 'home decor',
    'meubels', 'meubelzaak', 'woninginrichting',
    'möbel', 'einrichtung', 'möbelhaus',
    'meubles', 'ameublement',
    'muebles', 'mobiliario',
  ],
  
  pet_store: [
    'pet store', 'pet shop', 'pets',
    'dierenwinkel', 'dierenzaak', 'huisdieren',
    'tierhandlung', 'zoohandlung',
    'animalerie',
    'tienda de mascotas',
  ],

  // TECHNOLOGY
  technology: [
    'technology', 'tech', 'software', 'it', 'digital',
    'technologie', 'tech', 'software', 'ict', 'digitaal',
    'technologie', 'software', 'it',
    'technologie', 'logiciel', 'numérique',
    'tecnología', 'software', 'digital',
  ],
  
  saas: [
    'saas', 'software as a service', 'cloud', 'platform',
    'saas', 'cloud', 'platform',
    'saas', 'cloud-dienst',
    'saas', 'logiciel en nuage',
    'saas', 'software como servicio',
  ],

  // FITNESS
  fitness: [
    'fitness', 'gym', 'workout', 'exercise',
    'fitness', 'sportschool', 'gym', 'fitnesscentrum',
    'fitness', 'fitnessstudio', 'sportstudio',
    'fitness', 'salle de sport', 'gym',
    'fitness', 'gimnasio',
  ],
  
  yoga: [
    'yoga', 'yoga studio', 'pilates',
    'yoga', 'yogastudio', 'pilates',
    'yoga', 'yogastudio',
    'yoga', 'studio de yoga',
    'yoga', 'estudio de yoga',
  ],

  // EDUCATION
  education: [
    'education', 'school', 'academy', 'learning', 'training',
    'onderwijs', 'school', 'academie', 'opleiding', 'training',
    'bildung', 'schule', 'akademie', 'ausbildung',
    'éducation', 'école', 'formation',
    'educación', 'escuela', 'formación',
  ],
  
  driving_school: [
    'driving school', 'driver education', 'driving lessons',
    'rijschool', 'rijles', 'autorijschool',
    'fahrschule', 'führerschein',
    'auto-école', 'permis de conduire',
    'autoescuela', 'escuela de conducir',
  ],
};

/**
 * Smart business detection using multilingual keywords
 */
export function detectBusinessType(text: string): IndustryMatch {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  
  // Check each industry's aliases
  for (const [industry, aliases] of Object.entries(BUSINESS_ALIASES)) {
    for (const alias of aliases) {
      // Match whole words or at word boundaries
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalized) || normalized.includes(alias.toLowerCase())) {
        return {
          industry,
          confidence: 0.95,
          matchedTerm: alias,
        };
      }
    }
  }
  
  return {
    industry: 'other',
    confidence: 0.3,
  };
}

/**
 * Get color palette for a given industry
 */
export function getIndustryColors(industry?: string | null): IndustryColorPalette {
  if (!industry) return defaultColors;
  
  // Normalize the industry string
  const normalized = industry.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Direct match in palettes
  if (industryColors[normalized]) {
    return industryColors[normalized];
  }
  
  // Try to detect from the industry name using aliases
  const detected = detectBusinessType(industry);
  if (detected.confidence > 0.5 && industryColors[detected.industry]) {
    return industryColors[detected.industry];
  }
  
  // Partial match - check if industry contains any known key
  for (const key of Object.keys(industryColors)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return industryColors[key];
    }
  }
  
  return defaultColors;
}

/**
 * Get pattern type recommendation based on industry
 */
export function getPatternTypeForIndustry(industry?: string | null): string {
  if (!industry) return 'mesh';
  
  const normalized = industry.toLowerCase();
  
  // Use detected business type for pattern selection
  const detected = detectBusinessType(normalized);
  
  const patternMap: Record<string, string> = {
    // Tech
    technology: 'tech-circuit',
    saas: 'tech-circuit',
    ai_consultancy: 'tech-circuit',
    it_services: 'tech-circuit',
    electronics: 'tech-circuit',
    
    // Beauty & Personal
    hair_salon: 'beauty-waves',
    nail_studio: 'beauty-waves',
    spa: 'beauty-waves',
    massage: 'beauty-waves',
    beauty_wellness: 'beauty-waves',
    
    // Masculine services
    barber: 'angular',
    tattoo: 'angular',
    gym: 'angular',
    fitness: 'angular',
    mechanic: 'angular',
    
    // Food
    restaurant: 'food-organic',
    cafe: 'food-organic',
    bakery: 'food-organic',
    food_hospitality: 'food-organic',
    ice_cream: 'food-organic',
    
    // Professional
    lawyer: 'legal-grid',
    accountant: 'legal-grid',
    notary: 'legal-grid',
    insurance: 'legal-grid',
    finance: 'legal-grid',
    
    // Creative
    photography: 'creative-blocks',
    creative: 'creative-blocks',
    agency: 'creative-blocks',
    architect: 'creative-blocks',
    interior_designer: 'creative-blocks',
    
    // Construction
    construction: 'angular',
    roofer: 'angular',
    plumber: 'angular',
    electrician: 'angular',
    
    // Healthcare
    dentist: 'dots',
    healthcare: 'dots',
    physiotherapy: 'dots',
    veterinary: 'dots',
    pharmacy: 'dots',
    
    // Retail
    retail: 'dots',
    fashion: 'dots',
    jewelry: 'dots',
    furniture: 'dots',
  };
  
  // Check detected industry
  if (detected.confidence > 0.5 && patternMap[detected.industry]) {
    return patternMap[detected.industry];
  }
  
  // Fallback to keyword matching
  for (const [industry, pattern] of Object.entries(patternMap)) {
    if (normalized.includes(industry)) {
      return pattern;
    }
  }
  
  return 'mesh';
}
