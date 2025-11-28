import { SkillDetailClient } from './skill-detail-client';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ skillId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SkillDetailPage({ params }: PageProps) {
  // In Next.js 16, params is a Promise and must be awaited
  const { skillId } = await params;
  
  // Check if skillId is valid
  if (!skillId || skillId === 'undefined') {
    // Redirect to not found page
    notFound();
  }
  
  // Вся загрузка данных происходит на клиенте через RTK Query
  // params уже развернут благодаря Next.js
  return <SkillDetailClient skillId={skillId} />;
}

// Отключаем кеширование для динамических маршрутов при экспорте
export const dynamic = 'force-dynamic';

// Генерируем метаданные для SEO
export async function generateMetadata({ params }: { params: Promise<{ skillId: string }> }) {
  // In Next.js 16, params is a Promise and must be awaited
  const { skillId } = await params;
  
  // Check if skillId is valid
  if (!skillId || skillId === 'undefined') {
    return {
      title: 'Навык не найден | SkillSwap',
    };
  }
  
  return {
    title: `Навык ${skillId} | SkillSwap`,
  };
}