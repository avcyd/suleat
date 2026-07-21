import type { FooterColumn, NavLink, SocialLink } from "@/types/landing";

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Offers", href: "/offers" },
];

export const footerColumns: FooterColumn[] = [
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Features", href: "/features" },
      { label: "News", href: "/news" },
      { label: "Menu", href: "/menu" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why Suleat?", href: "/why-suleat" },
      { label: "Partner With Us", href: "/partners" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Account", href: "/account" },
      { label: "Support", href: "/support" },
      { label: "Feedback", href: "/feedback" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  {
    id: "instagram",
    name: "Instagram",
    href: "https://instagram.com",
    icon: "/images/landing/icon-instagram.png",
  },
  {
    id: "facebook",
    name: "Facebook",
    href: "https://facebook.com",
    icon: "/images/landing/icon-facebook.png",
  },
  {
    id: "discord",
    name: "Discord",
    href: "https://discord.com",
    icon: "/images/landing/icon-discord.png",
  },
];

export const footerBlurb =
  "Your local food deal discovery platform. Our job is to link customers with dining discounts while helping businesses grow.";
