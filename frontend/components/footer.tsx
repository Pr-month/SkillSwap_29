'use client';

import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/public/assets/logo.svg';

export function Footer() {
  const footerLinkGroups = [
    [
      { text: 'О проекте', href: '/about' },
      { text: 'Все навыки', href: '/skills' },
    ],
    [
      { text: 'Контакты', href: '/contacts' },
      { text: 'Блог', href: '/blog' },
    ],
    [
      { text: 'Политика конфиденциальности', href: '/privacy-policy' },
      { text: 'Пользовательское соглашение', href: '/terms-of-service' },
    ],
  ];

  return (
    <footer className="border-t bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <Link href="#" className="flex items-center gap-3">
            <Image src={Logo} alt="SkillSwap" />
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 w-full md:w-auto">
            {footerLinkGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="flex flex-col gap-3">
                {group.map((link) => (
                  <Link
                    key={link.text}
                    href={link.href}
                    className="text-sm text-foreground hover:underline transition-colors hover:text-foreground/80"
                  >
                    {link.text}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-8">SkillSwap — 2025</p>
      </div>
    </footer>
  );
}
