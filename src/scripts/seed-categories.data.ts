type CategoryData = {
  name: string;
  children?: CategoryData[];
};

export const categoriesData: CategoryData[] = [
  {
    name: 'IT и программирование',
    children: [
      { name: 'Веб-разработка' },
      { name: 'Мобильная разработка' },
      { name: 'Тестирование и QA' },
      { name: 'Gamedev' },
    ],
  },
  {
    name: 'Дизайн',
    children: [
      { name: 'Веб-дизайн' },
      { name: 'Графический дизайн' },
      { name: 'UX/UI дизайн' },
    ],
  },
  {
    name: 'Маркетинг и реклама',
    children: [
      { name: 'SMM' },
      { name: 'Контекстная реклама' },
      { name: 'Копирайтинг' },
    ],
  },
  {
    name: 'Хобби',
    children: [
      { name: 'Фотография' },
      { name: 'Музыка' },
      { name: 'Рисование' },
    ],
  },
];
