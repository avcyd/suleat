import type { Offer } from "@/types/landing";

export const offerFilters = [
  "All",
  "Beverage",
  "Pizza",
  "Pastry",
  "Burger",
  "Pasta",
  "Dessert",
  "Chicken",
  "Pork",
] as const;

export type OfferFilter = (typeof offerFilters)[number];

export const latestOffers: Offer[] = [
  {
    id: "cafe-latte",
    title: "Get 20% off for Cafe Latte",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim exercitati....",
    merchant: "Coffee Academics",
    address:
      "3F SM Megamall, Doña Julia Vargas Avenue, Ortigas Center, Mandaluyong City",
    image: "/images/landing/offer-latte.png",
    discountLabel: "-20%",
    expiresAt: "07/25/26",
    href: "/offers/cafe-latte",
    category: "Beverage",
  },
  {
    id: "donut-deal",
    title: "Buy 1 Get 1 on Classic Donuts",
    description:
      "Sweet cravings deserve better deals. Grab classic glazed and filled donuts with a limited-time BOGO promotion at participating branches near you.",
    merchant: "Dunkin'",
    address: "Ground Floor, Robinsons Galleria, Ortigas Avenue, Quezon City",
    image: "/images/landing/offer-donut.jpg",
    discountLabel: "BOGO",
    expiresAt: "08/12/26",
    href: "/offers/donut-deal",
    category: "Pastry",
  },
  {
    id: "burger-bundle",
    title: "Save 25% on Burger Bundles",
    description:
      "Stack your favorites with fries and a drink. Perfect for lunch runs, late-night cravings, and weekend hangouts with friends.",
    merchant: "Burger Joint",
    address: "2F Greenbelt 3, Ayala Center, Makati City",
    image: "/images/landing/offer-burger.jpg",
    discountLabel: "-25%",
    expiresAt: "09/01/26",
    href: "/offers/burger-bundle",
    category: "Burger",
  },
  {
    id: "ube-frappe",
    title: "15% off Ube Frappes",
    description:
      "Cool down with creamy ube frappes made for sunny afternoons. Limited-time savings at participating cafe partners.",
    merchant: "Starbucks",
    address: "UG Ayala Malls Manila Bay, Pasay City",
    image: "/images/landing/offer-latte.png",
    discountLabel: "-15%",
    expiresAt: "07/30/26",
    href: "/offers/ube-frappe",
    category: "Beverage",
  },
  {
    id: "pizza-slice",
    title: "Buy 2 Get 1 Free Pizza Slices",
    description:
      "Share a trio of classic slices with friends. Available daily from lunch until close while stocks last.",
    merchant: "Slice Society",
    address: "2F SM Aura Premier, Taguig City",
    image: "/images/landing/offer-burger.jpg",
    discountLabel: "B2G1",
    expiresAt: "08/05/26",
    href: "/offers/pizza-slice",
    category: "Pizza",
  },
  {
    id: "pasta-night",
    title: "30% off Pasta Night Sets",
    description:
      "Carbonara, aglio olio, and more — dinner sets made for date nights and group catches around the metro.",
    merchant: "Trattoria",
    address: "G/F Power Plant Mall, Rockwell, Makati City",
    image: "/images/landing/offer-donut.jpg",
    discountLabel: "-30%",
    expiresAt: "08/18/26",
    href: "/offers/pasta-night",
    category: "Pasta",
  },
];
