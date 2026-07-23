export type NavLink = {
  label: string;
  href: string;
};

export type HeroSlide = {
  id: string;
  title: string;
  highlight?: string;
  merchant: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
};

export type Category = {
  id: string;
  name: string;
  image: string;
  href: string;
};

export type Offer = {
  id: string;
  businessId: string;
  title: string;
  description: string;
  merchant: string;
  companyName: string;
  address: string;
  image: string;
  discountLabel: string;
  expiresAt: string;
  startDate: string;
  endDate: string;
  href: string;
  /** Used for offers page category filters */
  category: string;
  menuItemName: string;
  /** Original menu item price */
  menuPrice: number;
  promotionType: "DISCOUNT" | "BUNDLE";
  discountPercent?: number;
  bundleType?: "FREE" | "PERCENTAGE_OFF";
  buyQuantity?: number;
  getQuantity?: number;
  bundleDiscountPercent?: number;
};

export type FooterColumn = {
  title: string;
  links: NavLink[];
};

export type SocialLink = {
  id: string;
  name: string;
  href: string;
  icon: string;
};
