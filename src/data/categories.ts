import type { Category } from "@/types/landing";

/** Homepage category tiles → /offers with matching category filter. */
export const categories: Category[] = [
  {
    id: "beverage",
    name: "Beverage",
    image: "/images/landing/category-beverage.png",
    href: "/offers?category=Beverage",
  },
  {
    id: "pastry",
    name: "Pastry",
    image: "/images/landing/category-pastry.png",
    href: "/offers?category=Pastry",
  },
  {
    id: "pasta",
    name: "Pasta",
    image: "/images/landing/category-pasta.png",
    href: "/offers?category=Pasta",
  },
  {
    id: "dessert",
    name: "Dessert",
    image: "/images/landing/category-dessert.png",
    href: "/offers?category=Dessert",
  },
  {
    id: "pizza",
    name: "Pizza",
    image: "/images/landing/category-pizza.png",
    href: "/offers?category=Pizza",
  },
  {
    id: "chicken",
    name: "Chicken",
    image: "/images/landing/category-chicken.png",
    href: "/offers?category=Chicken",
  },
  {
    id: "burger",
    name: "Burger",
    image: "/images/landing/category-burger.jpg",
    href: "/offers?category=Burger",
  },
  {
    id: "pork",
    name: "Pork",
    image: "/images/landing/category-pork.jpg",
    href: "/offers?category=Pork",
  },
  {
    id: "other",
    name: "Other",
    image: "/images/landing/offer-donut.jpg",
    href: "/offers?category=Other",
  },
];
