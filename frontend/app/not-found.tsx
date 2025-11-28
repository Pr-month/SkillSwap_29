import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Error404Image from '@/public/assets/error-404.png';

export const metadata: Metadata = {
  title: 'Страница не найдена',
};

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-[460px] w-full mb-10">
        <Image
          src={Error404Image}
          alt="Ошибка 404"
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="text-center max-w-[600px]">
        <h1 className="text-[#253017] font-['Jost:Medium',sans-serif] text-[24px] leading-[28px] tracking-[-0.264px] mb-4">
          Страница не найдена
        </h1>
        <p className="text-[#253017] font-['Roboto:Regular',sans-serif] text-[16px] leading-[24px] tracking-[0.32px] mb-8">
          К сожалению, эта страница недоступна. Вернитесь на главную страницу
          или попробуйте позже
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/"
            className="bg-white border border-[#abd27a] box-border content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] text-[#253017] font-['Roboto:Regular',sans-serif] text-[16px] tracking-[0.32px] hover:bg-[#f0f0f0] transition-colors"
          >
            Сообщить об ошибке
          </Link>
          <Link
            href="/"
            className="bg-[#abd27a] box-border content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] text-[#253017] font-['Roboto:Regular',sans-serif] text-[16px] tracking-[0.32px] hover:bg-[#508826] transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
