'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-24 px-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">О SkillSwap</h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Платформа для обмена навыками и знаниями
        </p>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            Наша миссия
          </h2>
          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            SkillSwap создан для того, чтобы объединять людей, которые хотят
            учиться и делиться своими знаниями. Мы верим, что каждый человек
            обладает уникальными навыками, которыми может поделиться с другими.
          </p>

          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            Как это работает
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <h3 className="text-xl font-medium text-indigo-600 mb-4">
                1. Создайте профиль
              </h3>
              <p className="text-gray-600">
                Расскажите о своих навыках и чему вы хотели бы научиться
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <h3 className="text-xl font-medium text-indigo-600 mb-4">
                2. Найдите наставника
              </h3>
              <p className="text-gray-600">
                Найдите человека с нужными навыками и свяжитесь с ним
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <h3 className="text-xl font-medium text-indigo-600 mb-4">
                3. Обменивайтесь знаниями
              </h3>
              <p className="text-gray-600">
                Договаривайтесь о формате и времени занятий
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            Наша команда
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="text-center bg-gray-50 p-8 rounded-lg">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-4xl text-gray-400 mb-6">
                👥
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Команда SkillSwap
              </h3>
              <p className="text-gray-600">
                Разработчики, дизайнеры и энтузиасты, которые верят в силу
                обмена знаниями
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Присоединяйтесь к нашему сообществу
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Начните обмениваться знаниями уже сегодня
          </p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-md transition-colors duration-200"
          >
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}
