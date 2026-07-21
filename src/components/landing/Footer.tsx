import Image from "next/image";
import Link from "next/link";
import { footerBlurb, footerColumns, socialLinks } from "@/data";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-10 bg-footer">
      <div className="mx-auto grid max-w-[914px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm font-medium leading-7 text-[#333]">
            {footerBlurb}
          </p>
          <div className="mt-5 flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:-translate-y-0.5 hover:opacity-80"
                aria-label={social.name}
              >
                <span className="relative block size-10 overflow-hidden">
                  <Image
                    src={social.icon}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="40px"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="text-base font-semibold text-black">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[#333] transition-colors duration-300 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
