'use client';

import Filters from '@/components/filters';

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64">
      <Filters />
    </aside>
  );
}