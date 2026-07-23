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
  "Other",
] as const;

export type OfferFilter = (typeof offerFilters)[number];

function mockOffer(
  partial: Omit<
    Offer,
    | "businessId"
    | "companyName"
    | "startDate"
    | "endDate"
    | "menuItemName"
    | "menuPrice"
    | "promotionType"
  > &
    Partial<Offer>,
): Offer {
  return {
    businessId: `biz-${partial.id}`,
    companyName: partial.merchant,
    startDate: "2026-07-01",
    endDate: "2026-08-31",
    menuItemName: "Featured item",
    menuPrice: 150,
    promotionType: "DISCOUNT",
    ...partial,
  };
}

export const latestOffers: Offer[] = [
  mockOffer({
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
    discountPercent: 20,
  }),
  mockOffer({
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
    promotionType: "BUNDLE",
    bundleType: "FREE",
    buyQuantity: 1,
    getQuantity: 1,
  }),
  mockOffer({
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
    discountPercent: 25,
  }),
  mockOffer({
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
    discountPercent: 15,
  }),
  mockOffer({
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
    promotionType: "BUNDLE",
    bundleType: "FREE",
    buyQuantity: 2,
    getQuantity: 1,
  }),
  mockOffer({
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
    discountPercent: 30,
  }),
];
