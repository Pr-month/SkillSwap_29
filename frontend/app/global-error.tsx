'use client';

import Link from 'next/link';
import Image from 'next/image';
import Error500Image from '@/public/assets/error-500.png';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className="flex flex-col items-center justify-center py-20 px-4">
          <div className="max-w-[460px] w-full mb-10">
            <Image
              src={Error500Image}
              alt="Ошибка 500"
              className="w-full h-auto"
              priority
            />
          </div>
          <div className="text-center max-w-[600px]">
            <h1 className="text-[#253017] font-['Jost:Medium',sans-serif] text-[24px] leading-[28px] tracking-[-0.264px] mb-4">
              Ошибка сервера
            </h1>
            <p className="text-[#253017] font-['Roboto:Regular',sans-serif] text-[16px] leading-[24px] tracking-[0.32px] mb-8">
              К сожалению, произошла ошибка сервера. Попробуйте обновить
              страницу или вернуться позже
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                className="bg-white border border-[#abd27a] box-border content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] text-[#253017] font-['Roboto:Regular',sans-serif] text-[16px] tracking-[0.32px] hover:bg-[#f0f0f0] transition-colors"
                onClick={() => reset()}
              >
                Попробовать снова
              </button>
              <Link
                href="/"
                className="bg-[#abd27a] box-border content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] text-[#253017] font-['Roboto:Regular',sans-serif] text-[16px] tracking-[0.32px] hover:bg-[#508826] transition-colors"
              >
                На главную
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
