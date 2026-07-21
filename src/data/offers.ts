import type { Offer } from "@/types/landing";

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
  },
];
