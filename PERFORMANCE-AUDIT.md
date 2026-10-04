# Аудит мобильной конверсии и скорости

Дата: **3 октября 2026**

## Сводка

Текущий build проходит production-сборку. JavaScript bundle после Vite minify — около **282 KB** до gzip и около **88 KB gzip**; CSS — около **31 KB** до gzip и около **6,7 KB gzip**. Для прототипа это приемлемо, но мобильную скорость сильнее всего ограничивает внешний hero-image и отсутствие реального image CDN/оптимизированного локального asset pipeline.

## Mobile conversion audit

| Паттерн | Статус | Рекомендация |
|---|---|---|
| Понимание за 5 секунд | PASS | Hero сразу объясняет продукт и город |
| Один primary CTA | PASS | «Запросить расчёт» ведет в flow, а не в пустую форму |
| Click-to-call / WhatsApp | PASS | Доступны в fixed mobile bar |
| Sticky CTA | PASS | Нижняя панель не перекрывает контент за счет `pb-20` |
| Прогресс формы | PASS | 4 шага, понятный индикатор шага |
| Снижение трения | PASS | Фото optional, тип объекта выбирается кнопкой |
| Квалификация лида | PASS | Интерес, адрес, дата/слот, имя, телефон, комментарий |
| Feedback после действия | PASS | CRM status не подменяется фальшивым success |
| Ошибки ввода | PASS | Обязательные поля и disabled next/submit |
| Доверие | PASS | 4,9/46 оценок, 43 отзыва, 26 фото разделены |
| Дополнительные возражения | PASS | Добавлены FAQ и «Как проходит запрос» |
| Глубина сайта | IMPROVED | Добавлены подбор по задаче, trust block, FAQ, process |
| Фото/кейсы | PARTIAL | Нужна ручная выборка реальных фото 2GIS/Instagram |
| Согласие на ПДн | TODO | Добавить перед production CRM-submit |

## Speed audit

### Уже хорошо

- Vite production build tree-shakes зависимости.
- Нет тяжелого UI-фреймворка или аналитического SDK.
- Lucide icons импортируются как React components.
- CSS небольшой и содержит только нужную дизайн-систему.
- Секции ниже hero не требуют дополнительных изображений.

### Основные риски

1. Hero image загружается с внешнего CDN без явных width/height и без локальной оптимизации.
2. Все компоненты находятся в одном entry chunk; для текущего прототипа нормально, но order flow можно lazy-load-ить.
3. В проекте остаются стартовые Vite assets и `App.css`, которые не используются и должны быть удалены перед релизом.
4. Для production нужен `srcset`, AVIF/WebP, `loading="eager"`, `fetchpriority="high"` только для hero и lazy-loading для галереи.
5. Перед подключением CRM нужна серверная обработка фото с ограничением размера, MIME-проверкой и безопасным storage.

### Приоритетные исправления

- Перенести hero-image в локальный оптимизированный asset или CDN с responsive variants.
- Добавить `width`, `height`, `decoding="async"`, `fetchPriority="high"` для hero.
- Lazy-load order flow chunk через `React.lazy` после стабилизации продукта.
- Добавить Lighthouse/mobile performance budget: LCP < 2.5 s, INP < 200 ms, CLS < 0.1 на реальном 4G.
- Проверить 375/390/414/768/1024/1440 px и отсутствие горизонтального overflow.
- Подключать CRM только через backend endpoint; не отправлять token в браузер.
