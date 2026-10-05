# Сайт СПФ «Регион Строй» — окна и конструкции в Астане

React + TypeScript + Vite. Статика собирается в `dist`, заявки принимает Node-сервер
`server/index.mjs` (он же раздаёт сборку).

## Запуск

```bash
npm ci
npm run build
npm run start        # сервер на PORT (по умолчанию 3000)
```

## Демо-режим и переход в продакшен

Единственный переключатель — `DEMO_MODE` в `src/lib/site-config.ts`.

**Демо (сейчас `true`).** Форма проходит все шаги, но не обращается к сети вообще:
запрос к `/api/leads` не отправляется, заявка получает тестовый номер и нигде не
сохраняется, а после отправки показывается честное подтверждение «демо-режим».
Ничего не пишется и в `localStorage`. Сайт можно показывать как рабочий прототип.

**Продакшен (`false`).** Форма отправляет заявку в `/api/leads`, и экран успеха
показывает «передана менеджеру» только когда сервер подтвердил доставку. Перед
включением нужно:

1. развернуть Node-сервер (`Dockerfile` + `railway.toml`, healthcheck `/api/health`) —
   Vercel не запускает Node-процессы, поэтому там `/api/leads` отвечает 404;
2. задать канал доставки: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` либо
   `CRM_WEBHOOK_URL` (+ `CRM_API_TOKEN`);
3. задать постоянный диск: `LEADS_DIR=/data`, иначе заявки исчезнут при передеплое;
4. при необходимости — аналитику: `VITE_ANALYTICS_ENDPOINT`.

Описание переменных — в `.env.example`.

---

## Шаблон Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
