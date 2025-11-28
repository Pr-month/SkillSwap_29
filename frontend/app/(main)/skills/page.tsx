'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { SkillsCatalog } from '@/components/skills-catalog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSearch, setCategory } from '@/store/app';

export default function SkillsCatalogPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.app.filters);
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearch = () => {
    dispatch(setSearch(searchInput));
  };

  const handleCategoryChange = (categoryId: string | null) => {
    dispatch(setCategory(categoryId));
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="flex-1 w-full">
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <Sidebar />
          <main className="relative py-6 lg:gap-10 bg-background">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-4 text-foreground">Каталог навыков</h1>
              
              {/* Search and filter controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск навыков..."
                    className="pl-10"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>Найти</Button>
              </div>
              
              {/* Category filters could be added here */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button 
                  variant={filters.category === null ? "default" : "outline"} 
                  onClick={() => handleCategoryChange(null)}
                >
                  Все категории
                </Button>
                <Button 
                  variant={filters.category === "1" ? "default" : "outline"} 
                  onClick={() => handleCategoryChange("1")}
                >
                  Программирование
                </Button>
                <Button 
                  variant={filters.category === "2" ? "default" : "outline"} 
                  onClick={() => handleCategoryChange("2")}
                >
                  Дизайн
                </Button>
                <Button 
                  variant={filters.category === "3" ? "default" : "outline"} 
                  onClick={() => handleCategoryChange("3")}
                >
                  Маркетинг
                </Button>
              </div>
            </div>
            
            {/* Skills catalog with different limits for testing */}
            <div className="space-y-12">
              <SkillsCatalog limit={6} title="Популярные навыки" />
              <SkillsCatalog limit={9} title="Новые навыки" />
              <SkillsCatalog limit={12} title="Рекомендуемые навыки" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}