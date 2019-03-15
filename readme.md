## Сервер

Сервер запускается командой `npm start`.

## Клиент

Исходные коды клиентской части в директории `client`.

## Аутентификация

Аутентификация пользователя перекладывается на существующий бэкенд. Для аутентификации пользователя должен быть передан токен JWT. Токен должен содержать массив `data` с полями `userId` и `partnerId`.

## Конфигурация

Конфигурация определяется в директории `config`, по умолчанию используется файл `default.json` для продакшна подгружается файл `production.json`.

## Логи

Логи пишутся в директорию `logs`. Общий лог попадает в файл `chat-server-combined.log`. Лог-файл `chat-server-error.log` содержит только ошибки и исключения.

## Демо

Демонстрационные файл `demo.html`. (Переписка с самим собой).