import Sidebar from '@/components/sidebar';
import { SkillsCatalog } from '@/components/skills-catalog';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="flex-1 w-full">
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <Sidebar />
          <main className="relative py-6 lg:gap-10 bg-background">
            <section className="mb-8">
              <SkillsCatalog limit={3} title="Популярные" showTitle={true} />
            </section>
            <section className="mb-8">
              <SkillsCatalog limit={3} title="Новые" showTitle={true} />
            </section>
            <section>
              <SkillsCatalog limit={9} title="Рекомендуем" showTitle={true} />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
