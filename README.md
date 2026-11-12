This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Авторизация и личный кабинет

Вход и регистрация открываются в модальном окне из шапки сайта. Маршруты
`/login` и `/register` перенаправляют на главную и открывают соответствующий
режим окна. В шапке после входа отображаются аватар с инициалами и имя
пользователя; выход доступен в личном кабинете `/account`.

Страница каждого курса открывается по адресу `/courses/<id>`. Демо-покупка
сохраняет доступ к выбранному курсу в `data/users.json` и показывает его в
личном кабинете; реальное списание денег не выполняется. Пользователи, сессии
и покупки хранятся в JSON, пароли и идентификаторы сессий сохраняются в виде
хешей.

JSON-файл подходит для локальной разработки и одного экземпляра приложения.
При запуске на нескольких серверах или бессерверной платформе файловое
хранилище не является надёжным постоянным хранилищем.

## Структура проекта

```text
data/
  users.json                 Пользователи, сессии и покупки
public/
  courses/                   Изображения курсов
  logo.png, iconpage.png     Логотип и иконка сайта
src/
  app/
    api/auth/                API регистрации, входа, профиля и выхода
    api/purchases/           API списка и добавления покупок
    account/page.jsx         Личный кабинет и список курсов пользователя
    courses/[id]/page.jsx    Страница выбранного курса
    login/, register/        Перенаправление к модальному окну авторизации
    globals.css              Глобальные стили и тема Tailwind
    layout.jsx               Общий каркас, шапка, подвал и метаданные
    page.jsx                 Главная страница со списком курсов
  components/
    auth/                    Форма-модалка входа и регистрации
    courses/                 Список курсов и кнопка покупки
    header/, footer/         Шапка и подвал сайта
  data/data.json             Каталог курсов, описания и категории
  lib/auth-store.js          Чтение и запись JSON-данных авторизации
```

`package.json` содержит зависимости и команды `dev`, `build`, `start`;
`next.config.mjs`, `jsconfig.json` и `postcss.config.mjs` настраивают Next.js,
алиасы импортов и PostCSS/Tailwind.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
