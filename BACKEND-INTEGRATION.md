# Backend-интеграция CRM + WhatsApp

## Запуск

```bash
node server/index.mjs
```

API слушает `http://localhost:8787` и принимает `POST /api/leads`.

## Payload

```json
{
  "name": "Имя клиента",
  "phone": "+7 700 000 00 00",
  "interest": "Окна",
  "address": "Астана, улица, дом",
  "preferredDate": "2026-10-10",
  "preferredTime": "До обеда",
  "comment": "Нужна замена окон",
  "photoName": "balcony.jpg"
}
```

## Что делает endpoint

API валидирует обязательные поля, сохраняет лид в `server/data/leads.ndjson`, добавляет `leadId`, источник и время напоминания менеджеру через 15 минут. Если указан `CRM_WEBHOOK_URL`, отправляет тот же лид в CRM webhook. Если CRM не настроена, ответ явно сообщает об этом — данные не считаются переданными в CRM.

Ответ также содержит `whatsappUrl` — ссылку click-to-chat с готовым текстом. Это не отправка сообщения без действия пользователя.

## WhatsApp Business API

Для автоматической отправки без ручного открытия WhatsApp нужен официальный WhatsApp Business / Cloud API, верифицированный номер, recipient phone ID, access token и approved message template. Эти секреты нельзя хранить во frontend или в репозитории. Текущая реализация намеренно использует безопасный click-to-chat fallback.

## Напоминания менеджеру

В payload создается `reminderDueAt` и возвращается `status: handoff-ready`. Для настоящего напоминания нужен application-native scheduler, CRM automation или Trigger/queue на сервере. `setTimeout` не используется как production-гарантия, потому что процесс может быть перезапущен.

## Проверка

```bash
curl http://localhost:8787/api/health
curl -X POST http://localhost:8787/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","phone":"+77000000000","interest":"Окна","address":"Астана, тестовый адрес"}'
```
