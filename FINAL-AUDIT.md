# Финальный аудит сайта СПФ Регион Строй

Дата: **3 октября 2026**

## Проверено

- первый экран на мобильном viewport 358 × 708 px;
- hero-фото и локальный WebP asset;
- логотип и favicon;
- mobile fixed CTA bar;
- мобильное меню и якорь калькулятора;
- калькулятор на узком экране;
- focus-visible состояния;
- disabled states полей и CTA;
- reduced-motion режим;
- SEO metadata и LocalBusiness JSON-LD;
- production build, lint и backend syntax.

## Внесенные улучшения

1. Добавлены четкие focus-visible outlines для ссылок, кнопок и полей.
2. Disabled-кнопки получили понятные opacity/cursor состояния.
3. Результат калькулятора размечен `aria-live="polite"`, чтобы изменения читались screen reader.
4. Калькулятор добавлен в мобильное меню.
5. Hero-фото локальное, WebP, около 158 КБ вместо внешнего файла с 403 и веса около 5,2 МБ.
6. Логотип доступен как SVG в header и favicon.
7. Entrance animation отключается через `prefers-reduced-motion`.
8. SEO JSON-LD валиден; график работы, цены, гарантия и сроки не выдумываются.

## Результат

- `npm run build` — успешно.
- `npm run lint` — 0 ошибок; остаются только стандартные Fast Refresh warnings в shadcn/ui.
- `node --check server/index.mjs` — успешно.
- Визуальная проверка In-App Browser — успешно.
- CLI Lighthouse 13.5.0 установлен, но числовой прогон невозможен на текущем устройстве без Chrome (`No Chrome installations found`).

Для получения числовых Lighthouse scores нужно запустить Lighthouse в CI или на компьютере с Chrome/Chromium.
