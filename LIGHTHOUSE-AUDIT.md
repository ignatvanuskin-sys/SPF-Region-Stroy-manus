# Финальный Lighthouse, SEO и мобильный UX-аудит

Дата: **3 октября 2026**

## Статус Lighthouse

Lighthouse CLI 13.5.0 установлен и запущен против `http://localhost:5173/#top`, но автоматический прогон не получил результат: на текущем устройстве нет установленного Chrome (`No Chrome installations found`). Поэтому числовые Lighthouse scores не выдумываются.

Эквивалентная визуальная проверка выполнена через In-App Browser на viewport **358 × 708 px** для hero и калькулятора. Сайт загрузился, локальный hero найден как доступное изображение, калькулятор и навигационные якоря обнаружены.

## Performance baseline

- JS production asset: около **304 KB** до gzip / около **93 KB gzip**.
- CSS production asset: около **35.5 KB** до gzip / около **7.4 KB gzip**.
- Hero WebP: около **158 KB**.
- Изображение перенесено с внешнего CDN на локальный asset после 403.
- Hero имеет `loading="eager"`, `fetchPriority="high"`, `decoding="async"`, width и height.

## SEO, добавлено

- Расширенный title и meta description.
- `robots` с `max-image-preview:large`.
- `author`, `geo.region`, `geo.placename`.
- Open Graph title/description/locale/type.
- Twitter summary card metadata.
- JSON-LD `LocalBusiness` с подтвержденными телефоном, email, адресом, зоной обслуживания и ссылками 2GIS/Instagram.
- Не добавлялся выдуманный график работы, цена, гарантия или срок.

## Mobile UX check

| Область | Результат |
|---|---|
| Hero на 358 px | PASS: заголовок, CTA, trust-строка и fixed bar читаемы |
| Кнопки | PASS: основной CTA и bottom actions имеют крупную touch-зону |
| Калькулятор | PASS: поля идут вертикально/гридом, карточка не ломает viewport |
| Длинные select labels | PASS: браузерный select используется вместо переполненного кастомного меню |
| Bottom bar | PASS: две кнопки остаются видимыми и не перекрывают верхний контент |
| Image rendering | PASS: локальный WebP доступен, broken-image icon не появляется |
| Horizontal overflow | PASS по визуальному viewport-проверкам; `main` использует `overflow-x-hidden` |
| Form feedback | PASS: progress, disabled states и CRM status присутствуют |
| Contrast | PASS для основных CTA и текста на зеленом фоне |

## Следующий production-шаг

Запустить Lighthouse в CI или на машине с Chrome/Chromium и получить числовые оценки Performance, Accessibility, Best Practices и SEO. Перед публикацией также добавить public absolute `og:image` после появления production-домена.
