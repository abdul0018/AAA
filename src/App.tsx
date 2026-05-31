import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import canvasConfetti from "canvas-confetti";
import { 
  Award, Check, Download, GraduationCap, Info, Layout, Mail, 
  MapPin, Phone, Plus, RefreshCw, Sparkles, Trash2, User, Sliders,
  Copy, CheckCircle, AlertCircle, Eye, X, Shield, Upload,
  ArrowLeft, ArrowRight, Briefcase, Calendar
} from "lucide-react";
import { ResumeData, LanguageCode, ResumeTheme, SpacingPreset, PaymentRequest } from "./types";

// Density Spacing presets
const densityPresets: Record<string, SpacingPreset> = {
  compact: {
    avatarSize: "w-24 h-24 sm:w-28 sm:h-28",
    paddingClass: "p-4 sm:p-5",
    paddingLeftCol: "p-4",
    paddingRightCol: "p-4",
    spacingClass: "space-y-3.5",
    itemSpacing: "space-y-2"
  },
  standard: {
    avatarSize: "w-32 h-32 sm:w-36 sm:h-36",
    paddingClass: "p-6 sm:p-8",
    paddingLeftCol: "p-5 sm:p-6",
    paddingRightCol: "p-6 sm:p-7",
    spacingClass: "space-y-6",
    itemSpacing: "space-y-4"
  },
  spacious: {
    avatarSize: "w-36 h-36 sm:w-44 sm:h-44",
    paddingClass: "p-8 sm:p-10",
    paddingLeftCol: "p-7 sm:p-8",
    paddingRightCol: "p-8 sm:p-10",
    spacingClass: "space-y-8",
    itemSpacing: "space-y-6"
  }
};

// Preset professional avatars
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", // Young Male Portrait
  "https://i.ibb.co/qY0jsCRj/ef52091f-6eb6-4606-9575-42229e60fa8b.png", // Premium Uzbek Frontend Dev Portrait (Temur Aliyev default image)
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200", // Male Technical Lead
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200"  // Young Professional Engineer
];

// Complete Multilingual Locale Dictionaries
const locales = {
  uz: {
    title: "Resyume AI",
    tagline: "Mukammal va professional rezyumeni bir zumda yarating",
    personal: "Shaxsiy Ma'lumotlar",
    fullName: "To'liq ism-sharif",
    jobTitle: "Soha / Lavozim",
    photo: "Profil rasmi",
    age: "Yosh / Tug'ilgan yil",
    educationLevel: "Ma'lumot darajasi",
    military: "Harbiy xizmat",
    driverLicense: "Haydovchilik guvohnomasi",
    monthlySalary: "Kutilayotgan maosh",
    telegram: "Telegram Username",
    email: "Email pochta",
    phone: "Telefon raqami",
    address: "Yashash manzili",
    summary: "O'zingiz haqingizda (Summary)",
    education: "Ta'lim ma'lumotlari",
    workExperience: "Ish tajribasi",
    skills: "Asosiy ko'nikmalar",
    computerSkills: "IT ko'nikmalar",
    certifications: "Sertifikatlar",
    languages: "Chet tillari",
    current: "Hozirgacha",
    add: "Qo'shish",
    delete: "O'chirish",
    presets: "Namunaviy kadr",
    reset: "Tozalash",
    download: "Chop etish / PDF",
    theme: "Mavzu andozasi",
    density: "Matn zichligi",
    compact: "Zich",
    standard: "O'rtacha",
    spacious: "Keng",
    degree: "Mutaxassislik darajasi",
    school: "O'quv maskani / Universitet",
    startYear: "Boshlangan yili",
    gradYear: "Tugallangan yili",
    position: "Lavozim",
    company: "Tashkilot nomi",
    startDate: "Boshlangan vaqti",
    endDate: "Tugagan vaqti",
    description: "Batafsil ma'lumot",
    languageName: "Til nomi",
    level: "Bilish darajasi",
    levelNative: "Ona tili",
    levelFluent: "Erkin suhbatlasha oladi",
    levelIntermediate: "O'rta daraja",
    levelBeginner: "Boshlang'ich",
    generatedBy: "Resyume AI orqali shakllantirildi",
    certification: "Sertifikat",
    skillsPlaceholder: "Ko'nikmani yozing va enter bosing",
    certPlaceholder: "Sertifikat yoki bilimni yozing",
    personalDetailsTitle: "Shaxsiy Ma'lumotlar",
    previewInstruction: "A4 formatdagi rezyume maketi. PDF tugmasi orqali yuklab oling.",
    aboutMe: "O'ZIM HAQIMDA",
    softSkills: "Yumshoq ko'nikmalar",
    projects: "Loyihalar",
    achievements: "Yutuqlar",
    contactInfo: "Aloqa ma'lumotlari",
    references: "Tavsiyanomalar",
    pdfBannerTitle: "A4 PDF • Vektor sifat • Jonli xarita",
    paymentTitle: "Resume PDF yuklab olish uchun 5,000 so'm to'lov qiling",
    paymentAmount: "To'lov summasi",
    paymentInstructions: "To'lov ko'rsatmalari",
    paymentStep1: "1. Uzcard kartasiga 5,000 so'm to'lov qiling:",
    paymentStep2: "2. To'lov tasdiqlangan chek yoki screenshot faylini yuklang:",
    paymentStep3: "3. Tasdiqlash uchun ismingiz va telefon raqamingizni kiriting:",
    cardCopied: "Karta raqami nusxalandi!",
    copyCard: "Karta raqamini nusxalash",
    uploadScreenshot: "To'lov chekini (screenshot) yuklash",
    dragDropText: "Screenshot faylini sudrab kelib tashlang yoki tanlash uchun bosing",
    submitPayment: "To'lovni tasdiqlash uchun yuborish",
    paymentPending: "To'lov tekshirilmoqda (odatda 5-15 daqiqa davom etadi). Iltimos kuting...",
    paymentRejected: "To'lov tasdiqlanmadi. Qaytadan urinib ko'ring yoki yangi chek yuklang.",
    paymentApproved: "To'lov muvaffaqiyatli tasdiqlandi! Rezyumeni bemalol yuklab olishingiz mumkin.",
    enterFullName: "Ism va familiyangiz",
    enterPhone: "Telefon raqamingiz",
    payToDownload: "Yuklab olish uchun to'lov",
    adminTitle: "Admin Panel",
    adminLoginTitle: "Admin Tizimiga Kirish",
    passwordLabel: "Parol (Parol: admin)",
    loginBtn: "Kirish",
    invalidPassword: "Muvaffaqiyatsiz kirish! Parol noto'g'ri.",
    allPayments: "Barcha to'lovlar",
    pendingStatus: "Kutilmoqda",
    approvedStatus: "Tasdiqlangan",
    rejectedStatus: "Rad etilgan",
    approveBtn: "Tasdiqlash",
    rejectBtn: "Rad etish",
    searchPlaceholder: "Foydalanuvchi ismi yoki telefoni bo'yicha qidirish...",
    noPayments: "Hozircha hech qanday to'lov so'rovi mavjud emas.",
    backToEditor: "Muharrirga qaytish"
  },
  ru: {
    title: "Резюме AI",
    tagline: "Создайте идеальное профессиональное резюме за пару кликов",
    personal: "Личные данные",
    fullName: "Полное имя",
    jobTitle: "Профессия / Должность",
    photo: "Фото профиля",
    age: "Возраст / Год рождения",
    educationLevel: "Уровень образования",
    military: "Военная служба",
    driverLicense: "Водительские права",
    monthlySalary: "Ожидаемая зарплата",
    telegram: "Telegram Username",
    email: "Электронная почта",
    phone: "Номер телефона",
    address: "Адрес проживания",
    summary: "О себе",
    education: "Образование",
    workExperience: "Опыт работы",
    skills: "Ключевые навыки",
    computerSkills: "IT-навыки",
    certifications: "Сертификаты",
    languages: "Владение языками",
    current: "По настоящее время",
    add: "Добавить",
    delete: "Удалить",
    presets: "Заполнить шаблон",
    reset: "Очистить всё",
    download: "Печать / PDF",
    theme: "Шаблон оформления",
    density: "Плотность текста",
    compact: "Компактный",
    standard: "Обычный",
    spacious: "Просторный",
    degree: "Степень / Специальность",
    school: "Учебное заведение",
    startYear: "Год начала",
    gradYear: "Год окончания",
    position: "Должность",
    company: "Организация / Компания",
    startDate: "Дата начала",
    endDate: "Дата окончания",
    description: "Обязанности и достижения",
    languageName: "Язык",
    level: "Уровень владения",
    levelNative: "Родной язык",
    levelFluent: "Свободно (C1/C2)",
    levelIntermediate: "Средний (B1/B2)",
    levelBeginner: "Базовый (A1/A2)",
    generatedBy: "Сгенерировано в Резюме AI",
    certification: "Сертификаты",
    skillsPlaceholder: "Введите навык и нажмите enter",
    certPlaceholder: "Название сертификата",
    personalDetailsTitle: "ЛИЧНЫЕ ДАННЫЕ",
    previewInstruction: "Макет А4 для печати. Скачайте в формате PDF одной кнопкой.",
    aboutMe: "О СЕБЕ",
    softSkills: "Гибкие навыки (Soft Skills)",
    projects: "Проекты",
    achievements: "Достижения",
    contactInfo: "Контактная информация",
    references: "Рекомендации",
    pdfBannerTitle: "A4 PDF • Векторное качество • Живая карта",
    paymentTitle: "Для скачивания резюме в формате PDF оплатите 5 000 сум",
    paymentAmount: "Сумма оплаты",
    paymentInstructions: "Инструкция по оплате",
    paymentStep1: "1. Переведите 5 000 сум на карту Uzcard:",
    paymentStep2: "2. Загрузите снимок экрана (скриншот) или чек транзакции:",
    paymentStep3: "3. Введите ваше имя и телефон для подтверждения:",
    cardCopied: "Номер карты скопирован!",
    copyCard: "Копировать номер карты",
    uploadScreenshot: "Загрузить скриншот / чек оплаты",
    dragDropText: "Перетащите скриншот сюда или кликните для выбора",
    submitPayment: "Отправить платеж на подтверждение",
    paymentPending: "Платеж проверяется (обычно это занимает 5-15 минут). Пожалуйста, подождите...",
    paymentRejected: "Платеж не подтвержден. Пожалуйста, попробуйте еще раз.",
    paymentApproved: "Платеж успешно подтвержден! Теперь вы можете скачать файл.",
    enterFullName: "Имя и фамилия",
    enterPhone: "Номер телефона",
    payToDownload: "Оплатить для скачивания",
    adminTitle: "Панель администратора",
    adminLoginTitle: "Вход для администратора",
    passwordLabel: "Пароль (Пароль: admin)",
    loginBtn: "Войти",
    invalidPassword: "Неверный пароль! Попробуйте еще раз.",
    allPayments: "Все платежи",
    pendingStatus: "Ожидает",
    approvedStatus: "Одобрено",
    rejectedStatus: "Отклонено",
    approveBtn: "Одобрить",
    rejectBtn: "Отклонить",
    searchPlaceholder: "Поиск по имени или телефону...",
    noPayments: "Запросов на оплату пока нет.",
    backToEditor: "Вернуться в редактор"
  },
  en: {
    title: "Resume AI",
    tagline: "Build a polished, highly professional resume in moments",
    personal: "Personal Particulars",
    fullName: "Full Name",
    jobTitle: "Profession / Target Job",
    photo: "Profile Picture",
    age: "Age / Birth Year",
    educationLevel: "Education Level",
    military: "Military Status",
    driverLicense: "Driver's License",
    monthlySalary: "Expected Salary",
    telegram: "Telegram Username",
    email: "Email Address",
    phone: "Phone Number",
    address: "Base Address",
    summary: "Professional Summary",
    education: "Education",
    workExperience: "Work Experience",
    skills: "Core Competencies",
    computerSkills: "IT Skills",
    certifications: "Certifications",
    languages: "Languages",
    current: "Present",
    add: "Add Entry",
    delete: "Delete",
    presets: "Load Template",
    reset: "Clear Profile",
    download: "Print / Save PDF",
    theme: "Layout Theme",
    density: "Content Spacing",
    compact: "Compact",
    standard: "Standard",
    spacious: "Spacious",
    degree: "Degree / Specialization",
    school: "Academic Institution",
    startYear: "Start Year",
    gradYear: "End Year",
    position: "Position / Title",
    company: "Employer / Company",
    startDate: "Start Date",
    endDate: "End Date",
    description: "Duties & Key Contributions",
    languageName: "Language",
    level: "Fluency Level",
    levelNative: "Native Speaker",
    levelFluent: "Conversational / Fluent",
    levelIntermediate: "Intermediate",
    levelBeginner: "Beginner",
    generatedBy: "Formatted via Resume AI",
    certification: "Certification",
    skillsPlaceholder: "Type skill and press enter",
    certPlaceholder: "E.g. AWS Solutions Architect",
    personalDetailsTitle: "PERSONAL DETAILS",
    previewInstruction: "A4 print layout. Click 'Print / Save PDF' to download your resume.",
    aboutMe: "ABOUT ME",
    softSkills: "Soft Skills",
    projects: "Projects",
    achievements: "Achievements",
    contactInfo: "Contact Information",
    references: "References",
    pdfBannerTitle: "A4 PDF • Vector quality • Live map",
    paymentTitle: "Pay 5,000 so'm to download your Resume PDF",
    paymentAmount: "Payment Amount",
    paymentInstructions: "Payment Instructions",
    paymentStep1: "1. Transfer 5,000 so'm to the following Uzcard number:",
    paymentStep2: "2. Upload the payment receipt / screenshot below:",
    paymentStep3: "3. Complete your contact details for verification:",
    cardCopied: "Card number copied to clipboard!",
    copyCard: "Copy Card Number",
    uploadScreenshot: "Upload Payment Screenshot",
    dragDropText: "Drag & drop screenshot here or click to browse",
    submitPayment: "Submit Payment for Verification",
    paymentPending: "Payment verification pending (usually takes 5-15 minutes). Please wait...",
    paymentRejected: "Payment verification failed. Please check the receipt and try again.",
    paymentApproved: "Payment approved successfully! You can download your PDF now.",
    enterFullName: "Your full name",
    enterPhone: "Your phone number",
    payToDownload: "Pay to Download",
    adminTitle: "Admin Panel",
    adminLoginTitle: "Admin Login Portal",
    passwordLabel: "Password (Key: admin)",
    loginBtn: "Login",
    invalidPassword: "Invalid password! Please try again.",
    allPayments: "All Payments",
    pendingStatus: "Pending",
    approvedStatus: "Approved",
    rejectedStatus: "Rejected",
    approveBtn: "Approve",
    rejectBtn: "Reject",
    searchPlaceholder: "Search by user name or phone number...",
    noPayments: "No payment transactions logged yet.",
    backToEditor: "Back to Editor"
  }
};

// Curated multilingual default profile datasets
const presetsByLang: Record<LanguageCode, ResumeData> = {
  uz: {
    personalDetails: {
      fullName: "Temur Aliyev",
      jobTitle: "Senior Frontend Developer (Software Engineer)",
      photo: AVATAR_PRESETS[1],
      age: "26 yosh / 2000",
      educationLevel: "Oliy (Bakalavr - Computer Science)",
      military: "Safarbarlik chaqiruvi zahirasi",
      driverLicense: "B toifasi",
      monthlySalary: "$2,500 / Kelishuv asosida",
      telegram: "@aliyev_frontend",
      email: "temur.aliyev@devtech.uz",
      phone: "+998 90 123 45 67",
      address: "Toshkent shahri, Mirobod tumani",
      summary: "Zamonaviy, tezkor va yuqori darajada optimallashgan veb-ilovalarni yaratish bo‘yicha 5+ yillik tajribaga ega bo‘lgan Senior Frontend muhandisi. React, Next.js, TypeScript va zamonaviy UI/UX yechimlar yo‘nalishida chuqur bilim va ko‘nikmalarga ega. Ilovalar ishlash unumdorligini 40% ga yaxshilash, mukammal dizayn tizimlarini joriy qilish va jamoada yetakchilik qilish hisobiga biznes samaradorligiga sezilarli hissa qo‘shgan."
    },
    workExperience: [
      {
        id: "w-1",
        position: "Senior Frontend Engineer",
        company: "Payme (Tashkent Office)",
        startDate: "2022",
        endDate: "Hozirgi kunda",
        current: true,
        description: "- React va Next.js ekotizimida noldan boshlab yangi mikrofrontend arxitekturali to‘lov ilovasini ishlab chiqish.\n- Veb-sahifalarning dastlabki yuklanish tezligini (LCP) 2.5 soniyadan kamroq vaqtga tushirish hisobiga konversiyani 15% ga oshirish.\n- Junior va Middle dasturchilar uchun mentorlik qilish va kod sifatini yaxshilash bo'yicha Code Review jarayonlarini joriy etish."
      },
      {
        id: "w-2",
        position: "Software Engineer (Frontend)",
        company: "Uzum Technologies",
        startDate: "2020",
        endDate: "2022",
        current: false,
        description: "- Katta foydalanuvchilar oqimiga ega bo‘lgan elektron tijorat platformasi (e-commerce) interfeysini va boshqaruv panellarini noldan yaratish.\n- Redux Toolkit va React Query vositasida holat va ma'lumotlar keshlanishini optimallashtirish, server yuklamasini kamaytirish."
      }
    ],
    education: [
      {
        id: "e-1",
        degree: "Kompyuter muhandisligi (Bakalavr)",
        school: "Toshkent shahridagi Amity Universiteti",
        fieldOfStudy: "Dasturiy Injenering (Software Engineering)",
        startYear: "2016",
        gradYear: "2020",
        description: "Ilg'or veb-texnologiyalar va sun'iy intellekt integratsiyasi yo'nalishidagi eng yaxshi bitiruv ishi mukofoti."
      }
    ],
    skills: [
      "Muammolarni yechish",
      "Jamoada ishlash",
      "Kommunikativlik",
      "Moslashuvchanlik",
      "Mas'uliyatlilik",
      "Vaqtni to'g'ri rejalashtirish",
      "Kritik fikrlash"
    ],
    computerSkills: [
      "React", "Next.js", "TypeScript", "JavaScript", 
      "Tailwind CSS", "Redux Toolkit", "React Query", 
      "REST API & GraphQL", "Web Performance Optimization", "Git & GitHub", "Figma Design & UI/UX"
    ],
    certifications: [
      "Meta Front-End Developer Professional Certificate",
      "Legacy Front-End Web Development Cert",
      "AWS Certified Cloud Practitioner"
    ],
    languages: [
      { id: "l-1", language: "O'zbek tili", level: "native" },
      { id: "l-2", language: "Ingliz tili (IELTS 7.5)", level: "fluent" },
      { id: "l-3", language: "Rus tili", level: "intermediate" }
    ]
  },
  en: {
    personalDetails: {
      fullName: "Temur Aliyev",
      jobTitle: "Senior Frontend Developer (Software Engineer)",
      photo: AVATAR_PRESETS[1],
      age: "26 years old / 2000",
      educationLevel: "Higher (Bachelor of Computer Science)",
      military: "Mobilized Reserve",
      driverLicense: "Category B",
      monthlySalary: "$2,500 / Negotiable",
      telegram: "@aliyev_frontend",
      email: "temur.aliyev@devtech.uz",
      phone: "+998 90 123 45 67",
      address: "Toshkent, Mirobod Rayon",
      summary: "Senior Frontend Engineer with 5+ years of experience in building modern, fast, and highly optimized web applications. Proficient in React, Next.js, TypeScript, and modern UI/UX solutions. Contribute significantly to business growth by improving web performance by 40%, implementing robust design systems, and providing technical leadership."
    },
    workExperience: [
      {
        id: "w-1",
        position: "Senior Frontend Engineer",
        company: "Payme (Tashkent Office)",
        startDate: "2022",
        endDate: "Present",
        current: true,
        description: "- Developing a greenfield payment application using modern micro-frontend architecture in the React and Next.js ecosystem.\n- Enhancing initial load speed (LCP) to less than 2.5s, resulting in a 15% increase in user conversion rates.\n- Mentoring junior and mid-level developers while establishing rigorous code review practices to elevate team quality."
      },
      {
        id: "w-2",
        position: "Software Engineer (Frontend)",
        company: "Uzum Technologies",
        startDate: "2020",
        endDate: "2022",
        current: false,
        description: "- Built user interfaces and administration dashboards from scratch for a high-traffic e-commerce platform.\n- Optimized data caching and state management using Redux Toolkit and React Query, successfully reducing server loads."
      }
    ],
    education: [
      {
        id: "e-1",
        degree: "Computer Science and Engineering (Bachelor)",
        school: "Amity University in Tashkent",
        fieldOfStudy: "Software Engineering",
        startYear: "2016",
        gradYear: "2020",
        description: "Awarded Best Graduation Project on advanced web technologies and artificial intelligence integration."
      }
    ],
    skills: [
      "Problem Solving",
      "Teamwork",
      "Communication",
      "Adaptability",
      "Responsibility",
      "Time Management",
      "Critical Thinking"
    ],
    computerSkills: [
      "React", "Next.js", "TypeScript", "JavaScript", 
      "Tailwind CSS", "Redux Toolkit", "React Query", 
      "REST API & GraphQL", "Web Performance Optimization", "Git & GitHub", "Figma Design & UI/UX"
    ],
    certifications: [
      "Meta Front-End Developer Professional Certificate",
      "Legacy Front-End Web Development Cert",
      "AWS Certified Cloud Practitioner"
    ],
    languages: [
      { id: "l-1", language: "Uzbek", level: "native" },
      { id: "l-2", language: "English (IELTS 7.5)", level: "fluent" },
      { id: "l-3", language: "Russian", level: "intermediate" }
    ]
  },
  ru: {
    personalDetails: {
      fullName: "Темур Алиев",
      jobTitle: "Ведущий фронтенд-разработчик (Senior Frontend Developer)",
      photo: AVATAR_PRESETS[1],
      age: "26 лет / 2000",
      educationLevel: "Высшее (Бакалавр - Компьютерные науки)",
      military: "Мобилизационный призывной резерв",
      driverLicense: "Категория B",
      monthlySalary: "$2,500 / По договоренности",
      telegram: "@aliyev_frontend",
      email: "temur.aliyev@devtech.uz",
      phone: "+998 90 123 45 67",
      address: "Ташкент, Мирабадский район",
      summary: "Ведущий фронтенд-разработчик с более чем 5-летним опытом создания современных, быстрых и масштабируемых веб-приложений. Глубокие знания React, Next.js, TypeScript и современных стандартов UI/UX. Внес значительный вклад в развитие бизнеса за счет улучшения производительности сайтов на 40%, успешного проектирования дизайн-систем и технического лидерства в командах."
    },
    workExperience: [
      {
        id: "w-1",
        position: "Senior Frontend Engineer",
        company: "Payme (Tashkent Office)",
        startDate: "2022",
        endDate: "По настоящее время",
        current: true,
        description: "- Разработка нового платежного решения с нуля с использованием микрофронтенд-архитектуры в экосистеме React/Next.js.\n- Оптимизация скорости начальной загрузки (LCP) менее чем за 2.5 секунды, что повысило конверсию на 15%.\n- Наставничество джуниор- и мидл-разработчиков, внедрение строгих практик проверки кода (Code Review)."
      },
      {
        id: "w-2",
        position: "Software Engineer (Frontend)",
        company: "Uzum Technologies",
        startDate: "2020",
        endDate: "2022",
        current: false,
        description: "- Проектирование веб-интерфейсов и панелей управления с нуля для высоконагруженной платформы электронной коммерции.\n- Оптимизация кэширования данных и состояния приложения с помощью Redux Toolkit и React Query, снизившая нагрузку на серверы."
      }
    ],
    education: [
      {
        id: "e-1",
        degree: "Компьютерная инженерия (Бакалавр)",
        school: "Университет Амити в Ташкенте",
        fieldOfStudy: "Программная инженерия (Software Engineering)",
        startYear: "2016",
        gradYear: "2020",
        description: "Награда за лучший выпускной проект в сфере современных веб-технологий и интеграции искусственного интеллекта."
      }
    ],
    skills: [
      "Решение проблем",
      "Командная работа",
      "Коммуникабельность",
      "Гибкость (Adaptability)",
      "Ответственность",
      "Тайм-менеджмент",
      "Критическое мнение"
    ],
    computerSkills: [
      "React", "Next.js", "TypeScript", "JavaScript", 
      "Tailwind CSS", "Redux Toolkit", "React Query", 
      "REST API & GraphQL", "Web Performance Optimization", "Git & GitHub", "Figma Design & UI/UX"
    ],
    certifications: [
      "Meta Front-End Developer Professional Certificate",
      "Legacy Front-End Web Development Cert",
      "AWS Certified Cloud Practitioner"
    ],
    languages: [
      { id: "l-1", language: "Узбекский язык", level: "native" },
      { id: "l-2", language: "Английский (IELTS 7.5)", level: "fluent" },
      { id: "l-3", language: "Русский язык", level: "intermediate" }
    ]
  }
};

// Initial empty template for resume data structure
const initialDefaultData: ResumeData = {
  personalDetails: {
    fullName: "",
    jobTitle: "",
    photo: "",
    age: "",
    educationLevel: "",
    military: "",
    driverLicense: "",
    monthlySalary: "",
    telegram: "",
    email: "",
    phone: "",
    address: "",
    summary: ""
  },
  workExperience: [],
  education: [],
  skills: [],
  computerSkills: [],
  certifications: [],
  languages: []
};

export default function App() {
  const [lang, setLang] = useState<LanguageCode>("uz");
  const [theme, setTheme] = useState<ResumeTheme>("modern");
  const [density, setDensity] = useState<string>("standard");
  const [zoom, setZoom] = useState<number>(100);
  const [showStyling, setShowStyling] = useState<boolean>(false);
  
  const [photoFit, setPhotoFit] = useState<"cover" | "contain">(() => {
    return (localStorage.getItem("resume_photo_fit") as "cover" | "contain") || "contain";
  });
  const [resumeData, setResumeData] = useState<ResumeData>(initialDefaultData);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [mobileMode, setMobileMode] = useState<"edit" | "preview">("edit");

  const STEP_ORDER = ["personal", "experience", "education", "skills", "languages"];
  const currentIndex = STEP_ORDER.indexOf(activeTab);
  const prevTab = currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : null;
  const nextTab = currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : null;

  // Responsive Scale-To-Fit state and refs for mobile Telegram App
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [canvasHeight, setCanvasHeight] = useState<number>(1123);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect && entry.contentRect.width > 50) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mobileMode]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect && entry.contentRect.height > 50) {
          setCanvasHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [theme, density, resumeData, mobileMode]); // Re-observe/update metrics when styling changes

  // State elements for inputs addition
  const [newSkill, setNewSkill] = useState("");
  const [newITSkill, setNewITSkill] = useState("");
  const [newCert, setNewCert] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(true);
  const [activeFields, setActiveFields] = useState<string[]>(["military", "driverLicense", "monthlySalary"]);

  // Unique client-side user identification with LocalStorage caching
  const [userId] = useState<string>(() => {
    let id = localStorage.getItem("resume_user_id");
    if (!id) {
      id = "usr_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("resume_user_id", id);
    }
    return id;
  });

  // Telegram WebApp full-screen expansion & general viewport management
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        
        // Let Telegram handle smooth closing/back actions and prevent accidental drops
        if (tg.enableClosingConfirmation) {
          tg.enableClosingConfirmation();
        }
        
        // Color headers dynamically to matching theme standard values
        if (tg.setHeaderColor) {
          tg.setHeaderColor("#1e293b"); // Nice sleek header matching dark themes
        }
        
        if (tg.setBackgroundColor) {
          tg.setBackgroundColor("#f8fafc");
        }
      }
    } catch (e) {
      console.error("Telegram App configuration failed", e);
    }
  }, []);

  // Load and manage all payment logs in LocalStorage (shared context simulation)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    const saved = localStorage.getItem("resume_payment_requests");
    return saved ? JSON.parse(saved) : [];
  });


  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Customer billing inputs
  const [paymentFormFullName, setPaymentFormFullName] = useState("");
  const [paymentFormPhone, setPaymentFormPhone] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState("");
  const [screenshotError, setScreenshotError] = useState("");
  const [cardCopyState, setCardCopyState] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Synchronizers and setters
  const updatePaymentRequests = (requests: PaymentRequest[]) => {
    localStorage.setItem("resume_payment_requests", JSON.stringify(requests));
    setPaymentRequests(requests);
  };



  // Sync current user's payment status from the server
  useEffect(() => {
    if (!userId) return;

    const syncStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setPaymentRequests(prev => {
            const list = prev.filter(r => r.userId !== userId);
            const newList = [data, ...list];
            localStorage.setItem("resume_payment_requests", JSON.stringify(newList));
            return newList;
          });
        }
      } catch (err) {
        console.error("Error syncing status from backend:", err);
      }
    };

    syncStatus();

    // Set up polling every 5 seconds to check if pending request gets processed
    const interval = setInterval(() => {
      const isPending = paymentRequests.some(r => r.userId === userId && r.status === "pending");
      if (isPending) {
        syncStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, paymentRequests.some(r => r.userId === userId && r.status === "pending")]);



  const handleCopyCard = () => {
    navigator.clipboard.writeText("5614682118445099");
    setCardCopyState(true);
    setTimeout(() => setCardCopyState(false), 2000);
  };

  const handleScreenshotFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setScreenshotError(
        lang === "uz" ? "Faqat rasm fayllarini yuklashingiz mumkin!" :
        lang === "ru" ? "Можно загружать только изображения!" :
        "Only image files are allowed!"
      );
      return;
    }
    setScreenshotError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPaymentScreenshot(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFormFullName.trim()) {
      setScreenshotError(lang === "uz" ? "Iltimos, ismingizni kiriting!" : lang === "ru" ? "Пожалуйста, введите ваше имя!" : "Please enter your name!");
      return;
    }
    if (!paymentFormPhone.trim()) {
      setScreenshotError(lang === "uz" ? "Iltimos, telefon raqamingizni kiriting!" : lang === "ru" ? "Пожалуйста, введите номер телефона!" : "Please enter your phone number!");
      return;
    }
    if (!paymentScreenshot) {
      setScreenshotError(lang === "uz" ? "Iltimos, to'lovingizni chekini (screenshot) yuklang!" : lang === "ru" ? "Пожалуйста, загрузите скриншот чека!" : "Please upload your payment screenshot!");
      return;
    }

    const newRequest: PaymentRequest = {
      id: "req_" + Math.random().toString(36).substring(2, 11),
      userId,
      fullName: paymentFormFullName.trim(),
      phoneNumber: paymentFormPhone.trim(),
      screenshot: paymentScreenshot,
      status: "pending",
      timestamp: new Date().toLocaleString()
    };

    // Update UI immediately for best UX
    const updated = [newRequest, ...paymentRequests.filter(r => r.userId !== userId)];
    updatePaymentRequests(updated);
    setScreenshotError("");

    // Persist to Express backend in the background
    fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRequest)
    })
    .then(async (res) => {
      if (res.ok) {
        const result = await res.json();
        const serverUpdated = [result.payment, ...paymentRequests.filter(r => r.userId !== userId)];
        updatePaymentRequests(serverUpdated);
      } else {
        console.error("Failed to persist payment on backend:", await res.text());
      }
    })
    .catch((err) => {
      console.error("Error posting payment to backend:", err);
    });
  };



  const t = locales[lang];
  const d = densityPresets[density];

  const techSkillsList = lang === "uz" ? [
    "JavaScript / TypeScript", "React / Next.js", "Python / Django", "HTML5 & CSS3 / Tailwind",
    "DevOps (Docker, CI/CD)", "REST API / Node.js", "SQL & NoSQL Datastore", "Git & Team Collaboration", "Figma Design & UI/UX"
  ] : lang === "ru" ? [
    "JavaScript / TypeScript", "React / Next.js", "Python / Django", "HTML5 & CSS3 / Tailwind",
    "DevOps (Docker, CI/CD)", "REST API / Node.js", "Базы данных SQL", "Git & Team Collaboration", "Дизайн в Figma / UI/UX"
  ] : [
    "JavaScript / TypeScript", "React / Next.js", "Python / Django", "HTML5 & CSS3 / Tailwind",
    "DevOps (Docker, CI/CD)", "REST API / Node.js", "SQL & Databases", "Git & Team Collaboration", "Figma Design & UI/UX"
  ];

  const softSkillsList = lang === "uz" ? [
    "Jamoada ishlash", "Muammolarni hal qilish", "Kommunikativlik", "Moslashuvchanlik",
    "Mas'uliyatlilik", "Vaqtni to'g'ri rejalashtirish", "Kritik fikrlash", "Leadership"
  ] : lang === "ru" ? [
    "Командная работа", "Решение проблем", "Коммуникабельность", "Гибкость (Adaptability)",
    "Ответственность", "Тайм-менеджмент", "Критическое мышление", "Лидерство / Leadership"
  ] : [
    "Teamwork", "Problem Solving", "Communication", "Adaptability",
    "Responsibility", "Time Management", "Critical Thinking", "Leadership"
  ];

  // Helper functions for localized items
  const getLocalizedLanguageLevel = (lvl: string, lCode: LanguageCode) => {
    const loc = locales[lCode];
    if (lvl === "native") return loc.levelNative;
    if (lvl === "fluent") return loc.levelFluent;
    if (lvl === "intermediate") return loc.levelIntermediate;
    return loc.levelBeginner;
  };

  const getNormalizedLanguageLevel = (lvl: string): string => {
    return lvl;
  };

  // Pre-configured image handle
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setResumeData(prev => ({
            ...prev,
            personalDetails: {
              ...prev.personalDetails,
              photo: uploadEvent.target!.result as string
            }
          }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const selectAvatarPreset = (url: string) => {
    setResumeData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, photo: url }
    }));
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
  };

  // Reset/Preset commands
  const handleLoadPreset = () => {
    setResumeData(presetsByLang[lang]);
    setActiveFields(["military", "driverLicense", "monthlySalary"]);
    canvasConfetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleClearAll = () => {
    setResumeData({
      personalDetails: {
        fullName: "", jobTitle: "", photo: "", age: "", educationLevel: "",
        military: "", driverLicense: "", monthlySalary: "", telegram: "",
        email: "", phone: "", address: "", summary: ""
      },
      workExperience: [],
      education: [],
      skills: [],
      computerSkills: [],
      certifications: [],
      languages: []
    });
    setActiveFields([]);
  };

  const handlePrint = async () => {
    // SECURITY GUARD: check if the current user has been approved
    const userRequest = paymentRequests.find(r => r.userId === userId);
    const isApproved = userRequest && userRequest.status === "approved";

    if (!isApproved) {
      setShowPaymentModal(true);
      return;
    }

    setShowFloatingNav(false);

    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    
    // Give React some time to apply the state updates (removing outer borders, rounded corners, shadows)
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const element = document.getElementById("resume-preview-canvas");
      if (!element) {
        throw new Error("Resume preview canvas element not found");
      }

      // Dynamically import jspdf and html-to-image
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      // Temporarily set styling to force standard A4 layout dimensions and remove UI boundaries
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      const originalMinHeight = element.style.minHeight;
      const originalBorder = element.style.border;
      const originalBoxShadow = element.style.boxShadow;
      const originalBorderRadius = element.style.borderRadius;

      // Fix width to standard A4 desktop width (794px is equivalent to A4 width at 96 DPI)
      element.style.width = "794px";
      element.style.maxWidth = "794px";
      element.style.minHeight = "1123px";
      element.style.border = "none";
      element.style.boxShadow = "none";
      element.style.borderRadius = "0px";

      const imgData = await toPng(element, {
        pixelRatio: 2.5, // Ultra-sharp high resolution vector representation
        backgroundColor: "#ffffff",
        style: {
          border: "none",
          boxShadow: "none",
          borderRadius: "0px",
          width: "794px",
          maxWidth: "794px",
        },
      });

      // Restore original container styling
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.minHeight = originalMinHeight;
      element.style.border = originalBorder;
      element.style.boxShadow = originalBoxShadow;
      element.style.borderRadius = originalBorderRadius;

      // Create a perfectly proportioned standard A4 PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Fit the high-fidelity render precisely onto the A4 page layout borders
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      const rawName = resumeData.personalDetails.fullName?.trim();
      const finalFileName = `${rawName ? rawName.replace(/[^a-zA-Z0-9]/g, "_") : "rezyume"}_ai.pdf`;
      pdf.save(finalFileName);

      // Trigger sweet celebration confetti!
      canvasConfetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.6 }
      });

      // Consume the approved request so they can only download once per payment
      updatePaymentRequests(paymentRequests.filter(r => r.userId !== userId));
    } catch (err) {
      console.error("PDF generation failed, falling back to printer driver:", err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      setShowFloatingNav(true);
    }
  };

  // Add sub-lists helpers
  const appendSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const appendComputerSkill = () => {
    if (newITSkill.trim() && !resumeData.computerSkills.includes(newITSkill.trim())) {
      setResumeData(prev => ({ ...prev, computerSkills: [...prev.computerSkills, newITSkill.trim()] }));
      setNewITSkill("");
    }
  };

  const appendCert = () => {
    if (newCert.trim() && !resumeData.certifications.includes(newCert.trim())) {
      setResumeData(prev => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }));
      setNewCert("");
    }
  };

  const appendWork = () => {
    const id = "w-" + Date.now();
    const newJob = {
      id,
      position: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    };
    setResumeData(prev => ({ ...prev, workExperience: [...prev.workExperience, newJob] }));
  };

  const appendEdu = () => {
    const id = "e-" + Date.now();
    const newAcademic = {
      id,
      degree: "",
      school: "",
      fieldOfStudy: "",
      startYear: "",
      gradYear: "",
      description: ""
    };
    setResumeData(prev => ({ ...prev, education: [...prev.education, newAcademic] }));
  };

  const appendLanguage = () => {
    const id = "l-" + Date.now();
    const newLang = { id, language: "", level: "intermediate" };
    setResumeData(prev => ({ ...prev, languages: [...prev.languages, newLang] }));
  };

  // Update specific array items
  const editWork = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const editEdu = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const editLanguage = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Delete helpers
  const removeSkill = (sk: string) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter(i => i !== sk) }));
  };

  const removeComputerSkill = (sk: string) => {
    setResumeData(prev => ({ ...prev, computerSkills: prev.computerSkills.filter(i => i !== sk) }));
  };

  const removeCert = (c: string) => {
    setResumeData(prev => ({ ...prev, certifications: prev.certifications.filter(i => i !== c) }));
  };

  const removeWork = (id: string) => {
    setResumeData(prev => ({ ...prev, workExperience: prev.workExperience.filter(i => i.id !== id) }));
  };

  const removeEdu = (id: string) => {
    setResumeData(prev => ({ ...prev, education: prev.education.filter(i => i.id !== id) }));
  };

  const removeLanguage = (id: string) => {
    setResumeData(prev => ({ ...prev, languages: prev.languages.filter(i => i.id !== id) }));
  };

  // Calculate responsive scale factor for the A4 live resume preview
  const paddingAmount = containerWidth < 400 ? 12 : containerWidth < 640 ? 24 : 48;
  const availableSpace = containerWidth - paddingAmount;
  const responsiveScale = Math.min(zoom / 100, Math.max(0.35, availableSpace / 794));
  return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-start relative font-sans overflow-x-hidden">
      
      {/* Top Professional Header Bar (No Printing) */}
      <header id="designer-controller-header" className="no-print bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-3.5 py-2.5 sm:px-6 flex flex-row justify-between items-center h-14 sm:h-16 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-sky-600 text-white p-1.5 sm:p-2 rounded-xl shadow-xs">
            <Layout className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>{t.title}</span>
              <span className="hidden sm:inline-block bg-sky-50 text-sky-700 text-[9px] px-1.5 py-0.5 rounded font-bold">V2.0</span>
            </h1>
            <p className="hidden sm:block text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lang === "uz" ? "Tezkor Rezyume Yaratuvchi" : lang === "ru" ? "Онлайн конструктор резюме" : "AI CV Builder"}</p>
          </div>
        </div>

        {/* Global Toolbar Controls - Compact single-row list */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switch */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {(["uz", "ru", "en"] as LanguageCode[]).map((lCode) => (
              <button 
                key={lCode}
                id={`lang-select-${lCode}`}
                onClick={() => handleLanguageChange(lCode)}
                className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black rounded-md transition-all uppercase cursor-pointer ${lang === lCode ? "bg-white text-sky-600 shadow-3xs" : "text-slate-500 hover:text-slate-900"}`}
              >
                {lCode}
              </button>
            ))}
          </div>

          {/* Quick presets & clear buttons - visible on larger screens, hidden on mobile header since they are neatly in the wizard flow */}
          <button 
            id="btn-load-preset"
            onClick={handleLoadPreset} 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-sky-700 bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-all rounded-lg cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.presets}</span>
          </button>

          {/* User Specific Payment Status Indicator */}
          {(() => {
            const userReq = paymentRequests.find(r => r.userId === userId);
            if (!userReq) return null;
            const statusStyle = 
              userReq.status === "approved" ? "bg-green-50 text-green-700 border-green-150" :
              userReq.status === "rejected" ? "bg-red-50 text-red-700 border-red-150" :
              "bg-amber-50 text-amber-700 border-amber-150 animate-pulse";
            const label = 
              userReq.status === "approved" ? t.approvedStatus :
              userReq.status === "rejected" ? t.rejectedStatus :
              t.pendingStatus;
            
            return (
              <span id="payment-status-badge" className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-black tracking-wide border rounded-lg flex items-center gap-1 sm:gap-1.5 ${statusStyle}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span className="max-w-[55px] sm:max-w-none truncate">{label}</span>
              </span>
            );
          })()}



          {/* Save & Print to PDF - Desktop Version always visible */}
          <button 
            id="btn-print-resume"
            onClick={handlePrint}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 text-[10px] sm:text-xs font-black text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all rounded-lg shadow-sm cursor-pointer border-0 active:scale-98"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
            ) : (
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
            <span className="hidden xs:inline">{isGeneratingPdf ? (lang === "uz" ? "Yuklanmoqda..." : lang === "ru" ? "Загрузка..." : "Generating...") : t.download}</span>
          </button>
        </div>
      </header>

      {/* Main Work Area Container (Optimized for full viewport width on Desktop / Telegram Desktop) */}
      <div id="resume-builder-app-container" className="flex-1 w-full max-w-7xl lg:max-w-none lg:w-[98%] xl:w-[96%] 2xl:w-[95%] mx-auto p-1.5 xs:p-3 sm:p-5 lg:p-6 lg:px-8 xl:px-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 xl:gap-8 lg:items-start no-print">
        
        {/* LEFT COLUMN: INTERACTIVE FORM WORKSPACE */}
        <section 
          id="resume-editor-sidebar" 
          className={`lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 xl:p-7 space-y-5 lg:space-y-6 ${
            mobileMode === "edit" ? "block" : "hidden lg:block"
          }`}
        >
          {/* Section 0: Collapsible Styling Block */}
          <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl space-y-4">
            <button
              type="button"
              onClick={() => setShowStyling(!showStyling)}
              className="w-full flex justify-between items-center text-xs font-black uppercase tracking-wide text-slate-700 bg-transparent border-0 cursor-pointer focus:outline-none select-none"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600 animate-spin-once" />
                <span>Format & Dizayn</span>
              </span>
              <span className="text-[10px] text-slate-500 font-extrabold px-2 py-0.5 bg-slate-100 rounded-md">
                {showStyling ? (lang === "uz" ? "Yopish" : lang === "ru" ? "Скрыть" : "Hide") : (lang === "uz" ? "Ochish" : lang === "ru" ? "Показать" : "Expand")}
              </span>
            </button>
            
            {showStyling && (
              <div className="pt-2.5 border-t border-slate-150 space-y-4 animate-fadeIn">
                {/* Theme template selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t.theme}</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["modern", "minimal", "professional", "premium"] as ResumeTheme[]).map((thKey) => (
                      <button
                        key={thKey}
                        id={`theme-btn-${thKey}`}
                        onClick={() => setTheme(thKey)}
                        className={`px-1.5 py-1.5 text-[10px] font-black rounded-lg capitalize border cursor-pointer transition-all ${theme === thKey ? "bg-sky-600 border-sky-600 text-white shadow-xs" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        {thKey}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Density slider */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block flex justify-between">
                    <span>{t.density}</span>
                    <span className="font-black text-sky-600 capitalize">{density === "compact" ? t.compact : density === "standard" ? t.standard : t.spacious}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["compact", "standard", "spacious"]).map((dst) => (
                      <button
                        key={dst}
                        id={`spacing-btn-${dst}`}
                        onClick={() => setDensity(dst)}
                        className={`px-2 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${density === dst ? "bg-slate-900 border-slate-950 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                      >
                        {dst === "compact" ? t.compact : dst === "standard" ? t.standard : t.spacious}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scale Preview control */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 font-bold uppercase tracking-widest">
                    <span>Ekran Masshtabi</span>
                    <span className="text-sky-600 font-black">{zoom}%</span>
                  </div>
                  <input 
                    id="preview-zoom-slider"
                    type="range" 
                    min="40" 
                    max="115" 
                    step="5"
                    value={zoom} 
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Tabs System in Editor */}
          <div className="flex border-b border-slate-250 overflow-x-auto pb-1 gap-1">
            {["personal", "experience", "education", "skills", "languages"].map((tab) => (
              <button
                key={tab}
                id={`tab-head-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all border shrink-0 ${activeTab === tab ? "bg-slate-900 border-slate-950 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
              >
                {tab === "personal" ? t.personal : tab === "experience" ? t.workExperience : tab === "education" ? t.education : tab === "skills" ? t.skills : t.languages}
              </button>
            ))}
          </div>

          {/* Form Content body dynamically selected */}
          <div id="form-tab-panel" className="space-y-4 animate-fadeIn">
            
            {/* A. PERSONAL DETAILS TAB */}
            {activeTab === "personal" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.fullName}</label>
                    <input 
                      id="input-fullName"
                      type="text" 
                      value={resumeData.personalDetails.fullName}
                      onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, fullName: e.target.value } })}
                      placeholder={lang === "uz" ? "Masalan: Temur Aliyev" : lang === "ru" ? "Например: Темур Алиев" : "E.g. Temur Aliyev"}
                      className="w-full border border-slate-250 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500 font-sans font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.jobTitle}</label>
                    <input 
                      id="input-jobTitle"
                      type="text" 
                      value={resumeData.personalDetails.jobTitle}
                      onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, jobTitle: e.target.value } })}
                      placeholder={lang === "uz" ? "Masalan: Senior Frontend Developer" : lang === "ru" ? "Например: Старший фронтенд разработчик" : "E.g. Senior Frontend Developer"}
                      className="w-full border border-slate-250 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500 font-sans"
                    />
                  </div>
                </div>

                {/* Profile Photo Uploader & Presets */}
                <div className="bg-slate-55 shadow-2xs border border-slate-200 p-3 rounded-xl space-y-2">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">{t.photo}</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {resumeData.personalDetails.photo ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-slate-300">
                        <img src={resumeData.personalDetails.photo} className="w-full h-full object-cover rounded-xl" alt="Avatar upload" />
                        <button 
                          onClick={() => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, photo: "" } })}
                          className="absolute inset-0 bg-black/60 text-white text-[9px] font-black opacity-0 hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                        >
                          {t.delete.toUpperCase()}
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <input 
                          id="input-photo-upload"
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <label 
                          htmlFor="input-photo-upload"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100 rounded-md text-[10px] sm:text-xs font-bold leading-normal transition-all cursor-pointer shadow-3xs hover:scale-101 active:scale-98"
                        >
                          Rasm yuklash
                        </label>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-semibold truncate max-w-[180px]">
                          {resumeData.personalDetails.photo ? "Rasm yuklangan" : "Rasm yuklanmagan"}
                        </span>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[10px] text-slate-405 font-bold">Namunalar:</span>
                        <div className="flex gap-1">
                          {AVATAR_PRESETS.map((url, index) => (
                            <button 
                              key={url}
                              id={`avatar-preset-${index}`}
                              type="button"
                              onClick={() => selectAvatarPreset(url)}
                              className="w-6 h-6 rounded-full overflow-hidden border border-slate-300 hover:scale-110 active:scale-95 transition-all"
                            >
                              <img src={url} className="w-full h-full object-cover" alt="Preset" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {resumeData.personalDetails.photo && (
                        <div className="pt-1.5 border-t border-slate-100 flex flex-col gap-1 select-none">
                          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                            {lang === "uz" ? "Rasm moslanishi (Scaling)" : lang === "ru" ? "Масштаб фото" : "Photo Scaling Mode"}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              id="photo-fit-contain-btn"
                              onClick={() => {
                                localStorage.setItem("resume_photo_fit", "contain");
                                setPhotoFit("contain");
                              }}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${photoFit === "contain" ? "bg-sky-600 border-sky-600 text-white shadow-2xs" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                            >
                              {lang === "uz" ? "To'liq (Contain) - Yuz kesilmaydi" : lang === "ru" ? "Вписать (Contain)" : "Fit Whole (Contain)"}
                            </button>
                            <button
                              type="button"
                              id="photo-fit-cover-btn"
                              onClick={() => {
                                localStorage.setItem("resume_photo_fit", "cover");
                                setPhotoFit("cover");
                              }}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${photoFit === "cover" ? "bg-sky-600 border-sky-600 text-white shadow-2xs" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                            >
                              {lang === "uz" ? "To'ldirish (Cover)" : lang === "ru" ? "Заполнить (Cover)" : "Crop Fill (Cover)"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.age}</label>
                    <input 
                      id="input-age"
                      type="text" 
                      value={resumeData.personalDetails.age}
                      onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, age: e.target.value } })}
                      placeholder={lang === "uz" ? "Masalan: 26 yosh / 2000" : lang === "ru" ? "Например: 26 лет / 2000" : "E.g. 26 years old / 2000"}
                      className="w-full border border-slate-250 rounded-lg p-2 mt-1 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.educationLevel}</label>
                    <input 
                      id="input-educationLevel"
                      type="text" 
                      value={resumeData.personalDetails.educationLevel}
                      onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, educationLevel: e.target.value } })}
                      placeholder={lang === "uz" ? "Masalan: Oliy (Bakalavr)" : lang === "ru" ? "Например: Высшее (Бакалавр)" : "E.g. Higher (Bachelor)"}
                      className="w-full border border-slate-250 rounded-lg p-2 mt-1 text-xs"
                    />
                  </div>
                  {activeFields.includes("military") && (
                    <div className="relative group animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.military}</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFields(activeFields.filter(f => f !== "military"));
                            setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, military: "" } });
                          }}
                          className="text-slate-400 hover:text-red-500 text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t.delete}
                        </button>
                      </div>
                      <input 
                        id="input-military"
                        type="text" 
                        value={resumeData.personalDetails.military}
                        onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, military: e.target.value } })}
                        placeholder={lang === "uz" ? "Masalan: Safarbarlik zahirasi" : lang === "ru" ? "Например: Военнообязанный" : "E.g. Mobilized Reserve"}
                        className="w-full border border-slate-250 rounded-lg p-2 mt-1 text-xs"
                      />
                    </div>
                  )}
                  {activeFields.includes("driverLicense") && (
                    <div className="relative group animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.driverLicense}</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFields(activeFields.filter(f => f !== "driverLicense"));
                            setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, driverLicense: "" } });
                          }}
                          className="text-slate-400 hover:text-red-500 text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t.delete}
                        </button>
                      </div>
                      <input 
                        id="input-driverLicense"
                        type="text" 
                        value={resumeData.personalDetails.driverLicense}
                        onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, driverLicense: e.target.value } })}
                        placeholder={lang === "uz" ? "Masalan: B toifasi" : lang === "ru" ? "Например: Категория B" : "E.g. Category B"}
                        className="w-full border border-slate-250 rounded-lg p-2 mt-1 text-xs"
                      />
                    </div>
                  )}
                  {activeFields.includes("monthlySalary") && (
                    <div className="relative group animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.monthlySalary}</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFields(activeFields.filter(f => f !== "monthlySalary"));
                            setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, monthlySalary: "" } });
                          }}
                          className="text-slate-400 hover:text-red-500 text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t.delete}
                        </button>
                      </div>
                      <input 
                        id="input-monthlySalary"
                        type="text" 
                        value={resumeData.personalDetails.monthlySalary}
                        onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, monthlySalary: e.target.value } })}
                        placeholder={lang === "uz" ? "Masalan: $2,500 / Kelishuv asosida" : lang === "ru" ? "Например: $2,500 / По договоренности" : "E.g. $2,500 / Negotiable"}
                        className="w-full border border-slate-250 rounded-lg p-2 mt-1 text-xs"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.telegram}</label>
                    <input 
                      id="input-telegram"
                      type="text" 
                      value={resumeData.personalDetails.telegram}
                      placeholder="@username"
                      onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, telegram: e.target.value } })}
                      className="w-full border border-slate-250 rounded-lg p-2 mt-1 text-xs"
                    />
                  </div>
                </div>

                {/* Optional Columns adder panel */}
                {(!activeFields.includes("military") || !activeFields.includes("driverLicense") || !activeFields.includes("monthlySalary")) && (
                  <div className="bg-sky-50/50 border border-sky-100 p-3 rounded-xl space-y-2">
                    <span className="text-[10px] font-black text-sky-800 uppercase tracking-widest block">
                      {lang === "uz" ? "Qo'shimcha maydon qo'shish" : lang === "ru" ? "Добавить дополнительное поле" : "Add Optional Column"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {!activeFields.includes("military") && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFields([...activeFields, "military"]);
                            setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, military: lang === "uz" ? "Safarbarlik zahirasi" : lang === "ru" ? "Военнообязанный" : "Completed" } });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {t.military}
                        </button>
                      )}
                      {!activeFields.includes("driverLicense") && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFields([...activeFields, "driverLicense"]);
                            setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, driverLicense: "B toifasi" } });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {t.driverLicense}
                        </button>
                      )}
                      {!activeFields.includes("monthlySalary") && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFields([...activeFields, "monthlySalary"]);
                            setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, monthlySalary: "$2,500 / Kelishuv asosida" } });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {t.monthlySalary}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.phone}</label>
                    <input 
                      id="input-phone"
                      type="text" 
                      value={resumeData.personalDetails.phone}
                      onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, phone: e.target.value } })}
                      placeholder="+998 90 123 45 67"
                      className="w-full border border-slate-250 rounded-lg p-2 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.email}</label>
                    <input 
                      id="input-email"
                      type="email" 
                      value={resumeData.personalDetails.email}
                      onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, email: e.target.value } })}
                      placeholder="temur.aliyev@devtech.uz"
                      className="w-full border border-slate-250 rounded-lg p-2 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.address}</label>
                    <input 
                      id="input-address"
                      type="text" 
                      value={resumeData.personalDetails.address}
                      onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, address: e.target.value } })}
                      placeholder={lang === "uz" ? "Masalan: Toshkent sh., Mirobod tumani" : lang === "ru" ? "Например: г. Ташкент, Мирабадский район" : "E.g. Tashkent, Mirobod region"}
                      className="w-full border border-slate-250 rounded-lg p-2 mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.summary}</label>
                  <textarea 
                    id="input-summary"
                    rows={4}
                    value={resumeData.personalDetails.summary}
                    onChange={(e) => setResumeData({ ...resumeData, personalDetails: { ...resumeData.personalDetails, summary: e.target.value } })}
                    placeholder={lang === "uz" ? "Soha bo'yicha tajribangiz, yutuqlaringiz va maqsadlaringiz haqida qisqacha ma'lumot..." : lang === "ru" ? "Краткий обзор ваших профессиональных навыков, опыта и основных достижений..." : "A concise summary of your professional background, milestones, and career goals..."}
                    className="w-full border border-slate-250 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500 font-sans"
                  />
                </div>
              </div>
            )}

            {/* B. WORK EXPERIENCE TAB */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <span>{t.workExperience}</span>
                  </h4>
                  <button 
                    id="btn-add-work"
                    onClick={appendWork}
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-sky-600 hover:bg-sky-500 transition-all text-white px-2.5 py-1 rounded-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.add}
                  </button>
                </div>

                {resumeData.workExperience.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No entries added</p>
                ) : (
                  <div className="space-y-4">
                    {resumeData.workExperience.map((job) => (
                      <div key={job.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-3 relative">
                        <button 
                          onClick={() => removeWork(job.id)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t.position}</label>
                            <input 
                              id={`input-job-position-${job.id}`}
                              type="text"
                              value={job.position}
                              onChange={(e) => editWork(job.id, "position", e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t.company}</label>
                            <input 
                              id={`input-job-company-${job.id}`}
                              type="text"
                              value={job.company}
                              onChange={(e) => editWork(job.id, "company", e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t.startDate}</label>
                            <input 
                              id={`input-job-start-${job.id}`}
                              type="text"
                              value={job.startDate}
                              placeholder="2019"
                              onChange={(e) => editWork(job.id, "startDate", e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t.endDate}</label>
                            <input 
                              id={`input-job-end-${job.id}`}
                              type="text"
                              value={job.current ? t.current : job.endDate}
                              disabled={job.current}
                              onChange={(e) => editWork(job.id, "endDate", e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input 
                            id={`input-job-current-${job.id}`}
                            type="checkbox"
                            checked={job.current}
                            onChange={(e) => editWork(job.id, "current", e.target.checked)}
                            className="w-3.5 h-3.5 accent-sky-600 rounded"
                          />
                          <label className="text-[11px] font-semibold text-slate-600">{t.current}</label>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t.description}</label>
                          <textarea 
                            id={`input-job-desc-${job.id}`}
                            rows={3}
                            value={job.description}
                            onChange={(e) => editWork(job.id, "description", e.target.value)}
                            className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* C. EDUCATION HISTORY TAB */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-550" />
                    <span>{t.education}</span>
                  </h4>
                  <button 
                    id="btn-add-edu"
                    onClick={appendEdu}
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-sky-600 hover:bg-sky-500 transition-all text-white px-2.5 py-1 rounded-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.add}
                  </button>
                </div>

                {resumeData.education.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No entries added</p>
                ) : (
                  <div className="space-y-4">
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-3 relative">
                        <button 
                          onClick={() => removeEdu(edu.id)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 tracking-wide">{t.degree}</label>
                            <input 
                              id={`input-edu-degree-${edu.id}`}
                              type="text"
                              value={edu.degree}
                              onChange={(e) => editEdu(edu.id, "degree", e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 tracking-wide">{t.school}</label>
                            <input 
                              id={`input-edu-school-${edu.id}`}
                              type="text"
                              value={edu.school}
                              onChange={(e) => editEdu(edu.id, "school", e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 tracking-wide">Soha (Field of study)</label>
                            <input 
                              id={`input-edu-field-${edu.id}`}
                              type="text"
                              value={edu.fieldOfStudy}
                              onChange={(e) => editEdu(edu.id, "fieldOfStudy", e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 tracking-wide">{t.gradYear}</label>
                            <input 
                              id={`input-edu-gradYear-${edu.id}`}
                              type="text"
                              value={edu.gradYear}
                              placeholder="2021"
                              onChange={(e) => editEdu(edu.id, "gradYear", e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 tracking-wide">{t.description}</label>
                          <textarea 
                            id={`input-edu-desc-${edu.id}`}
                            rows={2.5}
                            value={edu.description}
                            onChange={(e) => editEdu(edu.id, "description", e.target.value)}
                            className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-xs mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* D. SKILLS & CERTIFICATIONS TAB */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                
                {/* Skills add section */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.skills}</label>
                  <div className="flex gap-2">
                    <input 
                      id="input-add-skill"
                      type="text" 
                      placeholder={t.skillsPlaceholder}
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && appendSkill()}
                      className="flex-1 border border-slate-250 rounded-lg p-2 text-xs"
                    />
                    <button 
                      id="btn-add-skill-confirm"
                      onClick={appendSkill}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                    >
                      {t.add}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resumeData.skills.map((sk) => (
                      <span key={sk} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-lg border border-slate-200">
                        {sk}
                        <button onClick={() => removeSkill(sk)} className="text-slate-400 hover:text-red-500 transition-all">×</button>
                      </span>
                    ))}
                  </div>

                  {/* Categorized Common Skills presets */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 mt-2 shadow-3xs">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {lang === "uz" ? "Tavsiya etiladigan yumshoq ko'nikmalar" : lang === "ru" ? "Рекомендуемые гибкие навыки" : "Recommended Soft Skills"}
                    </h5>
                    
                    {/* Soft Skills category only */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {softSkillsList.map((skill) => {
                          const exists = resumeData.skills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                if (!exists) {
                                  setResumeData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                                } else {
                                  setResumeData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
                                }
                              }}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer select-none border ${
                                exists 
                                ? "bg-slate-900 border-slate-950 text-white shadow-2xs" 
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 animate-fadeIn"
                              }`}
                            >
                              {exists ? `✓ ${skill}` : `+ ${skill}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* IT ko'nikmalar section */}
                <div className="border-t border-slate-150 pt-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.computerSkills}</label>
                  <div className="flex gap-2">
                    <input 
                      id="input-add-it-skill"
                      type="text" 
                      placeholder={lang === "uz" ? "IT-ko'nikmani kiriting" : lang === "ru" ? "Введите IT-навык" : "Type IT skill and press enter"}
                      value={newITSkill}
                      onChange={(e) => setNewITSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && appendComputerSkill()}
                      className="flex-1 border border-slate-250 rounded-lg p-2 text-xs"
                    />
                    <button 
                      id="btn-add-it-skill-confirm"
                      onClick={appendComputerSkill}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                    >
                      {t.add}
                    </button>
                  </div>

                  {/* Recommended Technical & IT Competency Presets */}
                  <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3.5 space-y-3 mt-1 shadow-3xs">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                      {lang === "uz" ? "Tavsiya etiladigan texnik ko'nikmalar va IT-kompetensiyalar" : lang === "ru" ? "Рекомендуемые технические навыки" : "Recommended Technical Skills"}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {techSkillsList.map((skill) => {
                        const exists = resumeData.computerSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => {
                              if (!exists) {
                                setResumeData(prev => ({ ...prev, computerSkills: [...prev.computerSkills, skill] }));
                              } else {
                                setResumeData(prev => ({ ...prev, computerSkills: prev.computerSkills.filter(s => s !== skill) }));
                              }
                            }}
                            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer select-none border ${
                              exists 
                              ? "bg-slate-900 border-slate-950 text-white shadow-2xs" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 animate-fadeIn"
                            }`}
                          >
                            {exists ? `✓ ${skill}` : `+ ${skill}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resumeData.computerSkills.map((sk) => (
                      <span key={sk} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-[10px] font-bold text-sky-850 rounded-lg border border-sky-100 animate-fadeIn">
                        {sk}
                        <button onClick={() => removeComputerSkill(sk)} className="text-sky-400 hover:text-red-500 transition-all ml-1 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications section */}
                <div className="border-t border-slate-150 pt-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.certifications}</label>
                  <div className="flex gap-2">
                    <input 
                      id="input-add-cert"
                      type="text" 
                      placeholder={t.certPlaceholder}
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && appendCert()}
                      className="flex-1 border border-slate-250 rounded-lg p-2 text-xs"
                    />
                    <button 
                      id="btn-add-cert-confirm"
                      onClick={appendCert}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                    >
                      {t.add}
                    </button>
                  </div>
                  
                  {/* Quick suggestion tags for IELTS 7 and CEFR B2 */}
                  <div className="flex flex-wrap gap-1.5 items-center pt-1 pb-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === "uz" ? "Tavsiyalar" : lang === "ru" ? "Рекомендации" : "Suggestions"}:</span>
                    <button
                      id="btn-suggest-ielts"
                      type="button"
                      onClick={() => {
                        if (!resumeData.certifications.includes("IELTS 7")) {
                          setResumeData(prev => ({ ...prev, certifications: [...prev.certifications, "IELTS 7"] }));
                        } else {
                          setResumeData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== "IELTS 7") }));
                        }
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer border ${
                        resumeData.certifications.includes("IELTS 7")
                        ? "bg-slate-900 border-slate-950 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-150"
                      }`}
                    >
                      {resumeData.certifications.includes("IELTS 7") ? "✓ IELTS 7" : "+ IELTS 7"}
                    </button>
                    <button
                      id="btn-suggest-cefr"
                      type="button"
                      onClick={() => {
                        if (!resumeData.certifications.includes("CEFR B2")) {
                          setResumeData(prev => ({ ...prev, certifications: [...prev.certifications, "CEFR B2"] }));
                        } else {
                          setResumeData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== "CEFR B2") }));
                        }
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer border ${
                        resumeData.certifications.includes("CEFR B2")
                        ? "bg-slate-900 border-slate-950 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-150"
                      }`}
                    >
                      {resumeData.certifications.includes("CEFR B2") ? "✓ CEFR B2" : "+ CEFR B2"}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {resumeData.certifications.map((cert) => (
                      <span key={cert} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-[10px] font-bold text-amber-800 rounded-lg border border-amber-100 animate-fadeIn">
                        <Award className="w-3 h-3 text-amber-600" />
                        {cert}
                        <button onClick={() => removeCert(cert)} className="text-amber-400 hover:text-red-500 transition-all ml-1 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* E. LANGUAGES TAB */}
            {activeTab === "languages" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t.languages}</h4>
                  <button 
                    id="btn-add-lang"
                    onClick={appendLanguage}
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-sky-600 hover:bg-sky-500 transition-all text-white px-2.5 py-1 rounded-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.add}
                  </button>
                </div>

                {resumeData.languages.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No entries added</p>
                ) : (
                  <div className="space-y-3">
                    {resumeData.languages.map((l) => (
                      <div key={l.id} className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-lg p-2 relative">
                        <input 
                          id={`input-lang-name-${l.id}`}
                          type="text" 
                          value={l.language}
                          placeholder={t.languageName}
                          onChange={(e) => editLanguage(l.id, "language", e.target.value)}
                          className="flex-1 bg-white border border-slate-250 p-1 rounded text-xs mt-1"
                        />
                        <select 
                          id={`select-lang-level-${l.id}`}
                          value={l.level}
                          onChange={(e) => editLanguage(l.id, "level", e.target.value)}
                          className="border border-slate-250 bg-white p-1 rounded text-xs mt-1 tracking-tight"
                        >
                          <option value="native">{t.levelNative}</option>
                          <option value="fluent">{t.levelFluent}</option>
                          <option value="intermediate">{t.levelIntermediate}</option>
                          <option value="beginner">{t.levelBeginner}</option>
                        </select>
                        <button 
                          onClick={() => removeLanguage(l.id)}
                          className="text-slate-400 hover:text-red-500 transition-all ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Advanced touch-friendly Step Navigation Wizard Flow */}
            <div className="border-t border-slate-150 pt-5 mt-5 space-y-3.5 no-print col-span-1">
              <div className="flex items-center justify-between">
                {/* Previous tab button */}
                {prevTab ? (
                  <button
                    type="button"
                    id="btn-wizard-prev"
                    onClick={() => setActiveTab(prevTab)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all rounded-xl cursor-pointer active:scale-98 border-0"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>{lang === "uz" ? "Orqaga" : lang === "ru" ? "Назад" : "Back"}</span>
                  </button>
                ) : (
                  <div />
                )}

                {/* Progress gauge text */}
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                  {lang === "uz" ? `BOSQICH ${currentIndex + 1} / 5` : lang === "ru" ? `ШАГ ${currentIndex + 1} / 5` : `STEP ${currentIndex + 1} / 5`}
                </span>

                {/* Next tab button */}
                {nextTab ? (
                  <button
                    type="button"
                    id="btn-wizard-next"
                    onClick={() => setActiveTab(nextTab)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-sky-600 hover:bg-sky-700 transition-all rounded-xl shadow-sm cursor-pointer active:scale-98 border-0"
                  >
                    <span>{lang === "uz" ? "Keyingisi" : lang === "ru" ? "Далее" : "Next"}</span>
                    <ArrowRight className="w-4 h-4 text-sky-200" />
                  </button>
                ) : (
                  <button
                    type="button"
                    id="btn-wizard-clear"
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black text-red-650 bg-red-50 hover:bg-red-100 transition-all rounded-xl cursor-pointer border-0"
                  >
                    <span>{lang === "uz" ? "Tozalash" : lang === "ru" ? "Очистить" : "Reset"}</span>
                  </button>
                )}
              </div>

              {/* Micro visual bars indicating current progress */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {STEP_ORDER.map((stepKey, idx) => (
                  <button 
                    key={stepKey}
                    type="button"
                    onClick={() => setActiveTab(stepKey)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer border-0 ${
                      idx <= currentIndex ? "bg-sky-600 shadow-3xs" : "bg-slate-200"
                    }`}
                    title={`Go to step: ${stepKey}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: HIGH-FIDELITY LIVE A4 CANVAS */}
        <section 
          className={`lg:col-span-7 flex flex-col justify-start ${
            mobileMode === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          
          {/* Quick Informative Banner (No Printing) */}
          <div className="bg-slate-900 border border-slate-800 text-slate-300 p-3.5 rounded-2xl shadow-sm text-xs space-y-1.5 mb-4 select-none relative overflow-hidden">
            <div className="absolute right-[-10px] top-[-10px] opacity-[0.035] select-none pointer-events-none">
              <Download className="w-24 h-24 text-white" />
            </div>
            <div className="flex items-center gap-2 text-white font-extrabold">
              <Info className="w-4 h-4 text-sky-400" />
              <span>{t.pdfBannerTitle}</span>
            </div>
            <p className="leading-relaxed text-slate-405 font-medium">{t.previewInstruction}</p>
          </div>

          {/* Interactive Scalable Frame Sheet */}
          <div 
            ref={containerRef} 
            className="w-full flex justify-center bg-slate-200/55 border border-slate-250 rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10 overflow-hidden relative shadow-inner transition-all duration-300"
            style={{ 
              height: isGeneratingPdf ? "auto" : `${(canvasHeight * responsiveScale) + (containerWidth < 640 ? 32 : 64)}px` 
            }}
          >
            <div 
              id="resume-print-wrapper" 
              className="origin-top flex justify-center" 
              style={{ 
                transform: `scale(${responsiveScale})`, 
                transformOrigin: "top center", 
                width: "794px",
                height: isGeneratingPdf ? "auto" : `${canvasHeight}px`
              }}
            >
              
              {/* THE LIVING CANVAS COMPONENT */}
              <div ref={canvasRef} id="resume-preview-canvas" className="bg-white select-text shrink-0" style={{ width: "794px", minWidth: "794px" }}>
                
                {/* 1. THE SWISS TECH & OBSIDIAN LAYOUT (theme === "modern") */}
                {theme === "modern" && (
                  <div className={`flex flex-col min-h-[650px] bg-white font-sans text-slate-800 animate-fadeIn w-full ${isGeneratingPdf ? "border-0 rounded-none shadow-none" : "border border-slate-200 rounded-2xl overflow-hidden shadow-xs"}`}>
                    
                    {/* Modern High-Contrast Header */}
                    <div className="bg-[#0f172a] p-8 text-white relative">
                      <div className="flex flex-row justify-between items-center gap-6 text-left">
                        <div className="space-y-2 flex-1 w-full">
                          <h3 id="preview-modern-name" className="text-3xl font-black uppercase tracking-wider text-white">
                            {resumeData.personalDetails.fullName || (lang === "uz" ? "To'liq ismingiz" : lang === "ru" ? "Полное имя" : "Full Name")}
                          </h3>
                          <p className="text-base font-black uppercase tracking-widest text-[#38bdf8]">
                            {resumeData.personalDetails.jobTitle || (lang === "uz" ? "Soha / Lavozim" : lang === "ru" ? "Должность" : "Job Title")}
                          </p>
                          <div className="flex flex-wrap justify-start gap-x-4 gap-y-1.5 text-[11px] text-slate-300 font-medium pt-1.5">
                            {resumeData.personalDetails.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#38bdf8] shrink-0" /> {resumeData.personalDetails.phone}</span>}
                            {resumeData.personalDetails.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#38bdf8] shrink-0" /> {resumeData.personalDetails.email}</span>}
                            {resumeData.personalDetails.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#38bdf8] shrink-0" /> {resumeData.personalDetails.address}</span>}
                          </div>
                        </div>

                        {/* Double Border Circular Photo */}
                        {resumeData.personalDetails.photo && (
                          <div className="shrink-0">
                            <div className={`${d.avatarSize} rounded-2xl border-2 border-slate-700/80 p-1.5 bg-[#1e293b] overflow-hidden flex items-center justify-center shadow-lg transition-all hover:scale-102`}>
                              <div className="w-full h-full rounded-xl border border-sky-400 overflow-hidden relative bg-[#0f172a]">
                                <img 
                                  src={resumeData.personalDetails.photo} 
                                  alt="Avatar" 
                                  className={`w-full h-full rounded-xl ${photoFit === "contain" ? "object-contain bg-white p-1" : "object-cover"}`}
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Columns Grid (Guaranteed Height Matchup) */}
                    <div className="flex flex-row items-stretch flex-1 animate-fadeIn w-full">
                      
                      {/* Left Sidebar block */}
                      <div className={`w-1/3 bg-[#f8fafc] ${d.paddingLeftCol} border-r border-[#f1f5f9] ${d.spacingClass} flex flex-col justify-start shrink-0`}>
                        
                        {/* Shaxsiy Ma'lumotlar metadata panel */}
                        {(resumeData.personalDetails.age || resumeData.personalDetails.military || resumeData.personalDetails.driverLicense || resumeData.personalDetails.monthlySalary || resumeData.personalDetails.educationLevel || resumeData.personalDetails.telegram) && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0f172a] border-b-2 border-[#38bdf8] pb-1.5">
                              {t.personalDetailsTitle}
                            </h4>
                            <div className="space-y-2 text-[11px] text-slate-700 font-bold font-sans">
                              {resumeData.personalDetails.age && (
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                  <span className="text-slate-550 font-medium">{t.age}:</span>
                                  <span className="text-slate-900">{resumeData.personalDetails.age}</span>
                                </div>
                              )}
                              {resumeData.personalDetails.educationLevel && (
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                  <span className="text-slate-550 font-medium">{t.educationLevel}:</span>
                                  <span className="text-slate-900 text-right">{resumeData.personalDetails.educationLevel}</span>
                                </div>
                              )}
                              {resumeData.personalDetails.military && (
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                  <span className="text-slate-550 font-medium">{t.military}:</span>
                                  <span className="text-slate-900 text-right">{resumeData.personalDetails.military}</span>
                                </div>
                              )}
                              {resumeData.personalDetails.driverLicense && (
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                  <span className="text-slate-550 font-medium">{t.driverLicense}:</span>
                                  <span className="text-slate-900">{resumeData.personalDetails.driverLicense}</span>
                                </div>
                              )}
                              {resumeData.personalDetails.monthlySalary && (
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                  <span className="text-slate-550 font-medium">{t.monthlySalary}:</span>
                                  <span className="text-slate-900 font-black">{resumeData.personalDetails.monthlySalary}</span>
                                </div>
                              )}
                              {resumeData.personalDetails.telegram && (
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                  <span className="text-slate-550 font-medium">Telegram:</span>
                                  <span className="text-[#0369a1]">{resumeData.personalDetails.telegram}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Skills Block */}
                        {resumeData.skills.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0f172a] border-b-2 border-[#38bdf8] pb-1.5">
                              {t.skills}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {resumeData.skills.map((skill) => (
                                <span key={skill} className="text-[10px] font-extrabold bg-white text-slate-800 border border-slate-205 shadow-2xs rounded-md px-2 py-0.5 hover:border-slate-350 transition-all">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Computer Skills and Professional Certs */}
                        {resumeData.computerSkills.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0f172a] border-b-2 border-[#38bdf8] pb-1.5">
                              {t.computerSkills}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {resumeData.computerSkills.map((cSkill) => (
                                <span key={cSkill} className="text-[10px] font-extrabold bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd] shadow-3xs rounded-md px-2 py-0.5">
                                  {cSkill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications Block */}
                        {resumeData.certifications && resumeData.certifications.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0f172a] border-b-2 border-[#38bdf8] pb-1.5">
                              {t.certifications}
                            </h4>
                            <div className="flex flex-col gap-1.5 pt-1">
                              {resumeData.certifications.map((cert) => (
                                <div key={cert} className="flex items-start gap-1.5 text-[10px] font-bold text-slate-700 bg-amber-50/50 border border-amber-100 rounded-md p-1.5 animate-fadeIn">
                                  <Award className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  <span>{cert}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Languages with Level progress bars */}
                        {resumeData.languages.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0f172a] border-b-2 border-[#38bdf8] pb-1.5">
                              {t.languages}
                            </h4>
                            <div className="space-y-2.5">
                              {resumeData.languages.map((l) => (
                                <div key={l.id} className="text-[10px] space-y-1 font-sans">
                                  <div className="flex justify-between font-bold">
                                    <span className="text-slate-800">{l.language}</span>
                                    <span className="text-[#0284c7] text-[9px] uppercase tracking-wider">{getLocalizedLanguageLevel(l.level, lang)}</span>
                                  </div>
                                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-sky-500 rounded-full transition-all duration-300" 
                                      style={{ width: getNormalizedLanguageLevel(l.level) === "native" || getNormalizedLanguageLevel(l.level) === "fluent" ? "95%" : getNormalizedLanguageLevel(l.level) === "intermediate" ? "70%" : "40%" }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Main Panel */}
                      <div className={`flex-1 ${d.paddingRightCol} ${d.spacingClass} bg-white flex flex-col justify-start`}>
                        
                        {/* Summary Section */}
                        {resumeData.personalDetails.summary && (
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {t.aboutMe}
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line text-justify pl-3 border-l-2 border-sky-500">
                              {resumeData.personalDetails.summary}
                            </p>
                          </div>
                        )}

                        {/* Experience block */}
                        {resumeData.workExperience.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#0f172a] flex items-center gap-2">
                              <span className="w-2 h-3.5 bg-sky-505 rounded-xs"></span>
                              {t.workExperience}
                            </h4>
                            <div className={`relative border-l-2 border-slate-150 ml-2 pl-4 ${d.itemSpacing}`}>
                              {resumeData.workExperience.map((job) => (
                                <div key={job.id} className="relative space-y-1 text-xs">
                                  {/* timeline dot */}
                                  <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-white shadow-xs"></div>
                                  <div className="flex flex-row justify-between items-baseline gap-1">
                                    <span className="font-extrabold text-[#0f172a] text-sm">
                                      {job.position} <span className="text-slate-500 font-medium">— {job.company}</span>
                                    </span>
                                    <span className="text-slate-400 text-[10px] font-bold tracking-wider shrink-0 uppercase">
                                      {job.startDate} — {job.current ? t.current : job.endDate}
                                    </span>
                                  </div>
                                  {job.description && (
                                    <p className="text-slate-650 leading-relaxed text-[11px] whitespace-pre-line text-justify pl-1">
                                      {job.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education block */}
                        {resumeData.education.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#0f172a] flex items-center gap-2">
                              <span className="w-2 h-3.5 bg-sky-505 rounded-xs"></span>
                              {t.education}
                            </h4>
                            <div className={`relative border-l-2 border-slate-150 ml-2 pl-4 ${d.itemSpacing}`}>
                              {resumeData.education.map((edu) => (
                                <div key={edu.id} className="relative space-y-1 text-xs">
                                  {/* timeline dot */}
                                  <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-white shadow-xs"></div>
                                  <div className="flex flex-row justify-between items-baseline gap-1">
                                    <span className="font-extrabold text-[#0f172a]">{edu.degree}</span>
                                    <span className="text-slate-400 text-[10px] font-bold shrink-0">{edu.gradYear}</span>
                                  </div>
                                  <p className="text-slate-600 font-medium">{edu.school} {edu.fieldOfStudy ? `| ${edu.fieldOfStudy}` : ""}</p>
                                  {edu.description && (
                                    <p className="text-slate-550 text-[11px] pl-1 leading-normal italic">{edu.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. THE MINIMALIST INK LAYOUT (theme === "minimal") */}
                {theme === "minimal" && (
                  <div className={`${d.paddingClass} ${d.spacingClass} bg-white font-serif text-stone-900 animate-fadeIn w-full ${isGeneratingPdf ? "border-0 rounded-none shadow-none" : "border border-stone-200 rounded-2xl"}`}>
                    
                    {/* Centered Classical Editorial Header */}
                    <div className="text-center space-y-4 pb-5 border-b-2 border-stone-900 animate-fadeIn">
                      <div className="flex flex-col items-center gap-4">
                        {resumeData.personalDetails.photo && (
                          <div className={`${d.avatarSize} rounded-full border-2 border-stone-900 p-1 bg-white overflow-hidden flex items-center justify-center shadow-md transition-all hover:scale-102`}>
                            <img 
                              src={resumeData.personalDetails.photo} 
                              className={`w-full h-full rounded-full ${photoFit === "contain" ? "object-contain bg-white p-1" : "object-cover"}`} 
                              alt="Minimalist avatar" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <h3 className="text-3xl font-black uppercase tracking-[0.18em] text-stone-950">
                          {resumeData.personalDetails.fullName || (lang === "uz" ? "Ism Familiya" : lang === "ru" ? "Имя Фамилия" : "Full Name")}
                        </h3>
                      </div>
                      <p className="text-xs font-sans font-black uppercase tracking-[0.28em] text-stone-500">
                        {resumeData.personalDetails.jobTitle || (lang === "uz" ? "Mutaxassis lavozimi" : lang === "ru" ? "Должность" : "Job Title")}
                      </p>
                      
                      {/* Compact horizontal list contact row */}
                      <div className="flex flex-wrap items-center justify-center gap-x-2 text-[10px] font-sans font-semibold text-stone-600">
                        {resumeData.personalDetails.phone && <span>{resumeData.personalDetails.phone}</span>}
                        {resumeData.personalDetails.email && (
                          <>
                            <span className="text-stone-300">•</span>
                            <span>{resumeData.personalDetails.email}</span>
                          </>
                        )}
                        {resumeData.personalDetails.address && (
                          <>
                            <span className="text-stone-300">•</span>
                            <span>{resumeData.personalDetails.address}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {resumeData.personalDetails.summary && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-stone-950 text-center">{t.summary.toUpperCase()}</h4>
                        <p className="text-[12px] text-stone-800 leading-relaxed font-normal whitespace-pre-line text-justify max-w-2xl mx-auto pl-1 pr-1 font-serif">
                          {resumeData.personalDetails.summary}
                        </p>
                      </div>
                    )}

                    {/* Left & Right columns in center line partition */}
                    <div className={`${d.spacingClass} max-w-3xl mx-auto`}>
                      
                      {/* Experience Block */}
                      {resumeData.workExperience.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-stone-950 text-center border-b border-stone-200 pb-1.5">{t.workExperience.toUpperCase()}</h4>
                          <div className={d.itemSpacing}>
                            {resumeData.workExperience.map((job) => (
                              <div key={job.id} className="space-y-1 text-xs">
                                <div className="flex flex-row justify-between items-baseline gap-1">
                                  <span className="font-extrabold text-stone-950 text-sm font-sans">
                                    {job.position} <span className="font-serif font-medium text-stone-700 italic">— {job.company}</span>
                                  </span>
                                  <span className="font-sans text-stone-500 text-[10px] font-bold tracking-wider shrink-0 uppercase">
                                    {job.startDate} — {job.current ? t.current : job.endDate}
                                  </span>
                                </div>
                                {job.description && (
                                  <p className="text-stone-700 font-serif leading-relaxed text-[11px] whitespace-pre-line pl-2.5 border-l border-stone-250 text-justify">
                                    {job.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education Block */}
                      {resumeData.education.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-stone-950 text-center border-b border-stone-200 pb-1.5">{t.education.toUpperCase()}</h4>
                          <div className={d.itemSpacing}>
                            {resumeData.education.map((edu) => (
                              <div key={edu.id} className="space-y-1 text-xs">
                                <div className="flex flex-row justify-between items-baseline gap-1">
                                  <span className="font-extrabold text-stone-950 font-sans">
                                    {edu.degree} <span className="font-serif font-medium text-stone-700 italic">— {edu.school}</span>
                                  </span>
                                  <span className="font-sans text-stone-500 text-[10px] font-bold tracking-wider shrink-0 uppercase">
                                    {edu.gradYear}
                                  </span>
                                </div>
                                {edu.description && (
                                  <p className="text-stone-600 pl-2.5 border-l border-stone-250 font-serif text-[11px]">{edu.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Particulars list */}
                      {(resumeData.personalDetails.age || resumeData.personalDetails.military || resumeData.personalDetails.driverLicense || resumeData.personalDetails.monthlySalary || resumeData.personalDetails.educationLevel || resumeData.personalDetails.telegram) && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-stone-950 text-center border-b border-stone-200 pb-1.5">{t.personalDetailsTitle.toUpperCase()}</h4>
                          <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-[11px] font-sans font-bold text-stone-700">
                            {resumeData.personalDetails.age && (
                              <div className="flex justify-between border-b border-stone-150 pb-1">
                                <span className="text-stone-500 font-medium">{t.age}:</span>
                                <span className="text-stone-950">{resumeData.personalDetails.age}</span>
                              </div>
                            )}
                            {resumeData.personalDetails.educationLevel && (
                              <div className="flex justify-between border-b border-stone-150 pb-1">
                                <span className="text-stone-500 font-medium">{t.educationLevel}:</span>
                                <span className="text-stone-950">{resumeData.personalDetails.educationLevel}</span>
                              </div>
                            )}
                            {resumeData.personalDetails.military && (
                              <div className="flex justify-between border-b border-stone-150 pb-1">
                                <span className="text-stone-500 font-medium">{t.military}:</span>
                                <span className="text-stone-950">{resumeData.personalDetails.military}</span>
                              </div>
                            )}
                            {resumeData.personalDetails.driverLicense && (
                              <div className="flex justify-between border-b border-stone-150 pb-1">
                                <span className="text-stone-500 font-medium">{t.driverLicense}:</span>
                                <span className="text-stone-950">{resumeData.personalDetails.driverLicense}</span>
                              </div>
                            )}
                            {resumeData.personalDetails.monthlySalary && (
                              <div className="flex justify-between border-b border-stone-150 pb-1">
                                <span className="text-stone-500 font-medium">{t.monthlySalary}:</span>
                                <span className="text-stone-900 font-black">{resumeData.personalDetails.monthlySalary}</span>
                              </div>
                            )}
                            {resumeData.personalDetails.telegram && (
                              <div className="flex justify-between border-b border-stone-150 pb-1">
                                <span className="text-stone-500 font-medium">Telegram:</span>
                                <span className="text-stone-900">{resumeData.personalDetails.telegram}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills & Certs under compact font */}
                      {resumeData.skills.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-stone-950 text-center border-b border-stone-200 pb-1.5">{t.skills.toUpperCase()}</h4>
                          <div className="flex flex-wrap justify-center gap-1.5 pt-1 select-none font-sans">
                            {resumeData.skills.map((skill) => (
                              <span key={skill} className="text-[10px] font-bold bg-[#faf9f6] text-stone-900 border border-stone-250 rounded-md px-2 py-0.5 select-none hover:border-stone-400 transition-all">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Computer Skills and Certifications for minimal layout */}
                      {resumeData.computerSkills.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-stone-950 text-center border-b border-stone-200 pb-1.5">{t.computerSkills.toUpperCase()}</h4>
                          <div className="flex flex-wrap justify-center gap-1.5 pt-1 select-none font-sans">
                            {resumeData.computerSkills.map((cSkill) => (
                              <span key={cSkill} className="text-[10px] font-bold bg-[#fcfcfc] text-slate-800 border border-stone-200 rounded-md px-2 py-0.5 select-none hover:border-stone-400 transition-all">
                                {cSkill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications for minimal layout */}
                      {resumeData.certifications && resumeData.certifications.length > 0 && (
                        <div className="space-y-3 animate-fadeIn">
                          <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-stone-950 text-center border-b border-stone-200 pb-1.5">{t.certifications.toUpperCase()}</h4>
                          <div className="flex flex-wrap justify-center gap-1.5 pt-1 select-none font-sans">
                            {resumeData.certifications.map((cert) => (
                              <span key={cert} className="text-[10px] font-bold bg-[#fdfaf2] text-amber-900 border border-amber-150 rounded-md px-2 py-0.5 select-none hover:border-amber-300 transition-all">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {resumeData.languages.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.25em] text-stone-950 text-center border-b border-stone-200 pb-1.5">{t.languages.toUpperCase()}</h4>
                          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-1 font-sans text-xs text-stone-850 select-none">
                            {resumeData.languages.map((l) => (
                              <span key={l.id} className="font-bold border-r last:border-r-0 border-stone-200 pr-4 shrink-0">
                                {l.language} <span className="font-medium text-stone-500 italic text-[10.5px]">({getLocalizedLanguageLevel(l.level, lang)})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. THE TRADITIONAL PROFESSIONAL EXECUTIVE LAYOUT (theme === "professional") */}
                {theme === "professional" && (
                  <div className={`flex flex-col min-h-[650px] bg-white font-sans text-slate-800 animate-fadeIn w-full ${isGeneratingPdf ? "border-t-[8px] border-[#1e3a8a] border-x-0 border-b-0 rounded-none shadow-none" : "border-t-[8px] border-[#1e3a8a] border-x border-b border-slate-200 rounded-2xl overflow-hidden shadow-xs"}`}>
                    
                    {/* Compact elegant Header Row */}
                    <div className="p-8 border-b border-slate-100 flex flex-row justify-between items-center gap-6 bg-slate-50/50 text-left transition-all">
                      <div className="space-y-2 flex-1 w-full">
                        <h3 className="text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
                          {resumeData.personalDetails.fullName || (lang === "uz" ? "Ism Familiya" : lang === "ru" ? "Имя Фамилия" : "Full Name")}
                        </h3>
                        <div className="h-0.5 bg-[#1e3a8a] w-12 mx-0"></div>
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest leading-none">
                          {resumeData.personalDetails.jobTitle || (lang === "uz" ? "Mutaxassis lavozimi" : lang === "ru" ? "Должность" : "Job Title")}
                        </p>
                        <div className="flex flex-wrap justify-start gap-x-4 gap-y-1.5 text-[11px] text-slate-500 pt-1">
                          {resumeData.personalDetails.phone && <span className="font-semibold">Tel: {resumeData.personalDetails.phone}</span>}
                          {resumeData.personalDetails.email && <span className="font-semibold">Email: {resumeData.personalDetails.email}</span>}
                          {resumeData.personalDetails.address && <span className="font-semibold">{resumeData.personalDetails.address}</span>}
                        </div>
                      </div>
                      
                      {/* Round border traditional photo - dynamically scaled */}
                      {resumeData.personalDetails.photo && (
                        <div className="shrink-0 animate-fadeIn">
                          <div className={`${d.avatarSize} rounded-full border-2 border-[#1e3a8a]/20 p-1 flex items-center justify-center bg-white shadow-md hover:scale-102 transition-all`}>
                            <img 
                              src={resumeData.personalDetails.photo} 
                              alt="Professional" 
                              className={`w-full h-full rounded-full ${photoFit === "contain" ? "object-contain bg-white p-1" : "object-cover"}`}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dual Sidebar-Body template layout */}
                    <div className="flex flex-row flex-1 items-stretch w-full">
                      
                      {/* Left sidebar container */}
                      <div className="w-1/3 bg-slate-50 p-5 border-r border-slate-150 space-y-5">
                        
                        {/* Shaxsiy detail block */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1e3a8a] border-b border-slate-200 pb-1">{t.personal.toUpperCase()}</h4>
                          <div className="space-y-1.5 text-xs text-slate-650 font-medium">
                            {resumeData.personalDetails.age && <p><span className="text-slate-450 font-normal">{t.age}:</span> {resumeData.personalDetails.age}</p>}
                            {resumeData.personalDetails.educationLevel && <p><span className="text-slate-450 font-normal">{t.educationLevel}:</span> {resumeData.personalDetails.educationLevel}</p>}
                            {resumeData.personalDetails.military && <p><span className="text-slate-450 font-normal">{t.military}:</span> {resumeData.personalDetails.military}</p>}
                            {resumeData.personalDetails.driverLicense && <p><span className="text-slate-450 font-normal">{t.driverLicense}:</span> {resumeData.personalDetails.driverLicense}</p>}
                            {resumeData.personalDetails.monthlySalary && <p><span className="text-slate-450 font-black">{t.monthlySalary}:</span> {resumeData.personalDetails.monthlySalary}</p>}
                          </div>
                        </div>

                        {/* Traditional Skills Badge List */}
                        {resumeData.skills.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1e3a8a] border-b border-slate-200 pb-1">{t.skills.toUpperCase()}</h4>
                            <div className="flex flex-wrap gap-1">
                              {resumeData.skills.map(sk => (
                                <span key={sk} className="text-[10px] bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-bold shadow-3xs">{sk}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certs and IT Competence */}
                        {resumeData.computerSkills.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1e3a8a] border-b border-slate-200 pb-1">{t.computerSkills.toUpperCase()}</h4>
                            <div className="space-y-1.5">
                              {resumeData.computerSkills.map(cSkill => (
                                <div key={cSkill} className="text-[10px] font-bold text-slate-750 flex items-start gap-1">
                                  <Check className="w-3.5 h-3.5 text-[#1e3a8a] shrink-0 mt-0.5" />
                                  <span>{cSkill}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications Block */}
                        {resumeData.certifications && resumeData.certifications.length > 0 && (
                          <div className="space-y-2 animate-fadeIn">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1e3a8a] border-b border-slate-200 pb-1">{t.certifications.toUpperCase()}</h4>
                            <div className="space-y-1.5">
                              {resumeData.certifications.map(cert => (
                                <div key={cert} className="text-[10px] font-bold text-slate-750 flex items-start gap-1">
                                  <Award className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  <span>{cert}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Languages list */}
                        {resumeData.languages.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1e3a8a] border-b border-slate-200 pb-1">{t.languages.toUpperCase()}</h4>
                            <div className="space-y-1 bg-white p-2 rounded border border-slate-200 shadow-3xs">
                              {resumeData.languages.map(l => (
                                <div key={l.id} className="text-[10.5px] flex justify-between font-bold border-b last:border-b-0 border-slate-100 py-1 text-slate-800">
                                  <span>{l.language}</span>
                                  <span className="text-slate-450 text-[9.5px] italic font-normal">({getLocalizedLanguageLevel(l.level, lang)})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right core text column */}
                      <div className={`flex-1 ${d.paddingRightCol} ${d.spacingClass} bg-white flex flex-col justify-start`}>
                        
                        {/* Summary profile */}
                        {resumeData.personalDetails.summary && (
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#1e3a8a]">{t.summary.toUpperCase()}</h4>
                            <div className="h-0.5 bg-[#1e3a8a] w-12 mb-2"></div>
                            <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                              {resumeData.personalDetails.summary}
                            </p>
                          </div>
                        )}

                        {/* Experience */}
                        {resumeData.workExperience.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#1e3a8a]">{t.workExperience.toUpperCase()}</h4>
                            <div className="h-0.5 bg-[#1e3a8a] w-12 mb-3"></div>
                            <div className={`space-y-4 ${d.itemSpacing}`}>
                              {resumeData.workExperience.map(job => (
                                <div key={job.id} className="space-y-1 text-xs">
                                  <div className="flex justify-between items-baseline">
                                    <span className="font-extrabold text-slate-900 text-[13px]">{job.position}</span>
                                    <span className="text-slate-500 text-[10px] font-semibold">{job.startDate} — {job.current ? t.current : job.endDate}</span>
                                  </div>
                                  <p className="text-slate-700 font-bold italic text-[11px]">{job.company}</p>
                                  {job.description && (
                                    <p className="text-slate-650 text-[11px] leading-relaxed whitespace-pre-line text-justify pl-2 border-l border-slate-200">
                                      {job.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {resumeData.education.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#1e3a8a]">{t.education.toUpperCase()}</h4>
                            <div className="h-0.5 bg-[#1e3a8a] w-12 mb-3"></div>
                            <div className={d.itemSpacing}>
                              {resumeData.education.map(edu => (
                                <div key={edu.id} className="space-y-0.5 text-xs">
                                  <div className="flex justify-between items-baseline font-bold">
                                    <span className="text-slate-850">{edu.degree}</span>
                                    <span className="text-slate-400 text-[10px]">{edu.gradYear}</span>
                                  </div>
                                  <p className="text-slate-600 text-[11px] font-medium">{edu.school} {edu.fieldOfStudy ? `(${edu.fieldOfStudy})` : ""}</p>
                                  {edu.description && <p className="text-slate-500 text-[10.5px] italic pl-2 border-l border-slate-150">{edu.description}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. THE LUXURIOUS GEOMETRIC PREMIUM LAYOUT (theme === "premium") */}
                {theme === "premium" && (
                  <div className={`flex flex-col min-h-[700px] text-slate-850 bg-[#f8fafc] animate-fadeIn w-full ${isGeneratingPdf ? "border-0 rounded-none shadow-none" : "border border-slate-200 rounded-2xl overflow-hidden shadow-xs"}`}>
                    
                    {/* Dark Premium Banner Block */}
                    <div className="bg-[#1e293b] p-8 text-white relative overflow-hidden shrink-0">
                      <div className="absolute right-[-100px] top-[-50px] w-52 h-52 bg-slate-800 rounded-full opacity-[0.25] pointer-events-none"></div>
                      <div className="flex flex-row justify-between items-center gap-4 relative z-10">
                        <div className="space-y-1.5 flex-1">
                          <h3 className="text-2xl font-black uppercase tracking-wider text-white">
                            {resumeData.personalDetails.fullName || (lang === "uz" ? "Ism Familiya" : lang === "ru" ? "Имя Фамилия" : "Full Name")}
                          </h3>
                          <div className="h-0.5 bg-amber-500 w-16 mb-2"></div>
                          <p className="text-sm font-bold uppercase tracking-widest text-slate-300">
                            {resumeData.personalDetails.jobTitle || (lang === "uz" ? "Mutaxassis lavozimi" : lang === "ru" ? "Должность" : "Job Title")}
                          </p>
                        </div>
                        <div className="text-[11px] text-slate-300 space-y-1 font-sans text-right max-w-xs">
                          {resumeData.personalDetails.email && <p className="flex items-center justify-end gap-1.5">{resumeData.personalDetails.email} <Mail className="w-3 h-3 text-amber-400" /></p>}
                          {resumeData.personalDetails.phone && <p className="flex items-center justify-end gap-1.5">{resumeData.personalDetails.phone} <Phone className="w-3 h-3 text-amber-400" /></p>}
                          {resumeData.personalDetails.address && <p className="flex items-center justify-end gap-1.5">{resumeData.personalDetails.address} <MapPin className="w-3 h-3 text-amber-400" /></p>}
                        </div>
                      </div>
                    </div>

                    {/* Dual Column Layout Body */}
                    <div className="flex flex-row items-stretch flex-1 w-full">
                      
                      {/* Left Sidebar and Photo */}
                      <div className={`w-1/3 bg-[#1e293b] text-slate-100 ${d.paddingLeftCol} ${d.spacingClass} flex flex-col justify-start shrink-0 border-r border-[#1e293b]`}>
                        
                        {/* Premium custom oval/rectangular picture */}
                        {resumeData.personalDetails.photo && (
                          <div className="flex flex-col items-center pb-4">
                            <div className={`${d.avatarSize} border-2 border-slate-500 overflow-hidden shadow-2xl relative bg-slate-800 shrink-0 rounded-2xl hover:scale-102 transition-all duration-300`}>
                              <img 
                                src={resumeData.personalDetails.photo} 
                                alt="Profile Avatar" 
                                className={`w-full h-full rounded-2xl ${photoFit === "contain" ? "object-contain bg-white p-1" : "object-cover"}`}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        )}

                        {/* Personal Highlights List in Side Panel */}
                        <div className="space-y-3 border-t border-slate-700/60 pt-4 text-[11px] font-sans">
                          {resumeData.personalDetails.age && (
                            <div className="flex flex-col leading-snug">
                              <span className="font-extrabold uppercase tracking-widest text-[#94a3b8] text-[9px]">{t.age}</span>
                              <span className="text-slate-100 font-bold">{resumeData.personalDetails.age}</span>
                            </div>
                          )}
                          {resumeData.personalDetails.educationLevel && (
                            <div className="flex flex-col leading-snug">
                              <span className="font-extrabold uppercase tracking-widest text-[#94a3b8] text-[9px]">{t.educationLevel}</span>
                              <span className="text-slate-100 font-bold">{resumeData.personalDetails.educationLevel}</span>
                            </div>
                          )}
                          {resumeData.personalDetails.military && (
                            <div className="flex flex-col leading-snug">
                              <span className="font-extrabold uppercase tracking-widest text-[#94a3b8] text-[9px]">{t.military}</span>
                              <span className="text-slate-100 font-bold">{resumeData.personalDetails.military}</span>
                            </div>
                          )}
                          {resumeData.personalDetails.driverLicense && (
                            <div className="flex flex-col leading-snug">
                              <span className="font-extrabold uppercase tracking-widest text-[#94a3b8] text-[9px]">{t.driverLicense}</span>
                              <span className="text-slate-100 font-bold">{resumeData.personalDetails.driverLicense}</span>
                            </div>
                          )}
                          {resumeData.personalDetails.monthlySalary && (
                            <div className="flex flex-col leading-snug">
                              <span className="font-extrabold uppercase tracking-widest text-[#94a3b8] text-[9px]">{t.monthlySalary}</span>
                              <span className="text-amber-400 font-black text-xs">{resumeData.personalDetails.monthlySalary}</span>
                            </div>
                          )}
                          {resumeData.personalDetails.telegram && (
                            <div className="flex flex-col leading-snug">
                              <span className="font-extrabold uppercase tracking-widest text-[#94a3b8] text-[9px]">Telegram</span>
                              <span className="text-sky-350 font-bold">{resumeData.personalDetails.telegram}</span>
                            </div>
                          )}
                        </div>

                        {/* Education lists in Gold Header styles */}
                        {resumeData.education.length > 0 && (
                          <div className="space-y-3 border-t border-slate-700/60 pt-4">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-450 pb-0.5 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                              {t.education}
                            </h4>
                            <div className="space-y-3 font-sans">
                              {resumeData.education.map((edu) => (
                                <div key={edu.id} className="space-y-0.5">
                                  <p className="text-[11px] font-extrabold text-white leading-snug">{edu.degree}</p>
                                  <p className="text-[10px] font-bold text-slate-300">{edu.school}</p>
                                  <p className="text-[10px] text-slate-400 font-medium italic">
                                    {edu.gradYear}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills in Side items list */}
                        {resumeData.skills.length > 0 && (
                          <div className="space-y-3 border-t border-slate-700/60 pt-4">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-405 pb-0.5">{t.skills}</h4>
                            <div className="flex flex-wrap gap-1">
                              {resumeData.skills.map((skill) => (
                                <span key={skill} className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 font-bold rounded-md tracking-wider border border-slate-700">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Main Column content */}
                      <div className={`flex-1 ${d.paddingRightCol} ${d.spacingClass} bg-white relative`}>
                        
                        {/* Pattern watermark */}
                        <div className="absolute inset-0 opacity-[0.012] pointer-events-none select-none z-0">
                          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="2"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                          </svg>
                        </div>

                        <div className="relative z-10 space-y-6">
                          
                          {/* Summary Profile block */}
                          {resumeData.personalDetails.summary && (
                            <div className="space-y-1.5 flex flex-col justify-start">
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1e293b] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-3 bg-amber-500 rounded-xs"></span>
                                {t.aboutMe}
                              </h4>
                              <p className="text-xs text-slate-650 leading-relaxed font-normal whitespace-pre-line text-justify">
                                {resumeData.personalDetails.summary}
                              </p>
                            </div>
                          )}

                          {/* Work Experience */}
                          {resumeData.workExperience.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1e293b] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-3 bg-amber-500 rounded-sm"></span>
                                {t.workExperience}
                              </h4>
                              <div className={d.itemSpacing}>
                                {resumeData.workExperience.map((job) => (
                                  <div key={job.id} className="space-y-1 text-xs">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-1">
                                      <span className="font-extrabold text-[#111827] text-[13px] font-sans">
                                        {job.position} <span className="font-medium text-slate-500 italic">— {job.company}</span>
                                      </span>
                                      <span className="italic text-slate-400 text-[10px] font-bold shrink-0">
                                        {job.startDate} — {job.current ? t.current : job.endDate}
                                      </span>
                                    </div>
                                    {job.description && (
                                      <p className="text-slate-600 leading-relaxed text-[11px] whitespace-pre-line pl-3 border-l-2 border-slate-200 text-justify">
                                        {job.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tech certifications and computer skills info list in gold container */}
                          {resumeData.computerSkills.length > 0 && (
                            <div className="space-y-1.5">
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1e293b] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-3 bg-amber-500 rounded-sm"></span>
                                {t.computerSkills}
                              </h4>
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                {resumeData.computerSkills.map((cSkill) => (
                                  <div key={cSkill} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-150 text-[10.5px] font-bold text-slate-700">
                                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                                    <span>{cSkill}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Certifications Block in gold container */}
                          {resumeData.certifications && resumeData.certifications.length > 0 && (
                            <div className="space-y-1.5 animate-fadeIn">
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1e293b] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-3 bg-amber-500 rounded-sm"></span>
                                {t.certifications}
                              </h4>
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                {resumeData.certifications.map((cert) => (
                                  <div key={cert} className="flex items-center gap-2 p-2 bg-amber-50/30 rounded-lg border border-amber-100 text-[10.5px] font-bold text-slate-700">
                                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>{cert}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Languages display list */}
                          {resumeData.languages.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1e293b] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-3 bg-amber-500 rounded-sm"></span>
                                {t.languages}
                              </h4>
                              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-800">
                                {resumeData.languages.map((l) => (
                                  <span key={l.id} className="bg-amber-50/50 border border-amber-100 text-amber-900 px-2.5 py-1 rounded-md text-[10px]">
                                    {l.language}: <span className="font-extrabold text-amber-600">{getLocalizedLanguageLevel(l.level, lang)}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider">
                            <span>{t.generatedBy}</span>
                            <span>★★★★★</span>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      </section>

      </div>

      {/* Decorative footer label (No Printing) */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400 font-bold tracking-wider no-print">
        {t.generatedBy} • © 2026 Resyume AI Engine.
      </footer>

      {/* ========================================== */}
      {/* OVERLAY MODALS FOR UTILITIES AND PAYMENT  */}
      {/* ========================================== */}

      {/* 1. Payment Modal Dialog */}
      {showPaymentModal && (
        <div id="payment-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn select-none no-print">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-150 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-600 animate-pulse" />
                {t.payToDownload}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setScreenshotError("");
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 font-sans">
              
              {/* Payment Check Evaluation States */}
              {(() => {
                const userReq = paymentRequests.find(r => r.userId === userId);
                
                if (userReq?.status === "approved") {
                  return (
                    <div className="bg-green-50 border border-green-200 p-5 rounded-xl text-center space-y-4">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-extrabold text-green-950">{t.paymentApproved}</h4>
                      <p className="text-xs text-green-700 font-medium font-sans">
                        {lang === "uz" ? "Sizning to'lovingiz to'liq tasdiqlangan. Istalgan vaqtda yuklab olishingiz mumkin." : lang === "ru" ? "Ваша оплата полностью подтверждена." : "Your payment is fully verified. You can generate downloads any time."}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPaymentModal(false);
                          setTimeout(() => {
                            handlePrint();
                          }, 50);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        {t.download}
                      </button>
                    </div>
                  );
                }

                if (userReq?.status === "pending") {
                  return (
                    <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl text-center space-y-4">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <AlertCircle className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-extrabold text-amber-950 leading-tight">{t.paymentPending}</h4>
                      <div className="h-px bg-amber-200 my-1"></div>
                      <div className="text-xs text-amber-700 space-y-1 font-sans">
                        <p>{lang === "uz" ? "Ism-sharif: " : "Имя: "} <strong className="text-slate-850 font-extrabold">{userReq.fullName}</strong></p>
                        <p>{lang === "uz" ? "Telefon: " : "Телефон: "} <strong className="text-slate-850 font-extrabold">{userReq.phoneNumber}</strong></p>
                      </div>
                      {userReq.screenshot && (
                        <div 
                          className="relative group max-w-[140px] mx-auto border border-amber-250 rounded-lg overflow-hidden shadow-xs cursor-pointer"
                          onClick={() => setZoomImage(userReq.screenshot)}
                        >
                          <img src={userReq.screenshot} className="w-full h-auto object-cover max-h-24 hover:scale-105 transition-all" alt="receipt mini" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-[9px] font-bold">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(lang === "uz" ? "To'lov so'rovini bekor qilib boshqatdan ariza topshirmoqchimisiz?" : "Cancel request and retry?")) {
                              updatePaymentRequests(paymentRequests.filter(r => r.userId !== userId));
                            }
                          }}
                          className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          {lang === "uz" ? "Bekor qilish va qaytadan yuklash" : "Отменить и загрузить снова"}
                        </button>
                      </div>
                    </div>
                  );
                }

                // Default payment instructions input & screen upload
                return (
                  <div className="space-y-4 font-sans">
                    {userReq?.status === "rejected" && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center space-y-1">
                        <div className="w-10 h-10 bg-red-100 text-red-650 rounded-full flex items-center justify-center mx-auto">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-black text-red-900">{t.paymentRejected}</h4>
                        <div className="text-[10px] text-red-650 font-extrabold uppercase tracking-widest">{lang === "uz" ? "To'lov tasdiqlanmadi" : "Платеж отклонен"}</div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-sky-600" />
                          {t.paymentInstructions}
                        </h4>
                        <p className="text-sm font-extrabold text-slate-900 border-b border-dashed border-slate-200 pb-2 flex justify-between items-center">
                          <span>{t.paymentAmount}:</span>
                          <span className="text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-120">5,000 so'm</span>
                        </p>
                        
                        <div className="space-y-2 pt-1">
                          <p className="text-xs font-semibold text-slate-600 leading-tight">{t.paymentStep1}</p>
                          <div className="bg-slate-900 text-white rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="font-mono text-center sm:text-left">
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">UZCARD KARTA</p>
                              <p className="text-sm font-black tracking-widest py-1.5">5614 6821 1844 5099</p>
                              <p className="text-xs text-sky-400 font-extrabold leading-none">Abdulbosit Sunnatov</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyCard}
                              className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${cardCopyState ? "bg-green-600 text-white" : "bg-white hover:bg-slate-100 text-slate-900 shadow-xs"}`}
                            >
                              {cardCopyState ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{lang === "uz" ? "Nusxalandi!" : "Скопировано!"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{t.copyCard}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Manual Screen Confirmation Form */}
                      <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        
                        {/* Drag and Drop Screenshot upload container */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.paymentStep2}</label>
                          <div 
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add("border-sky-500", "bg-sky-50/10");
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove("border-sky-500", "bg-sky-50/10");
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove("border-sky-500", "bg-sky-50/10");
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleScreenshotFile(e.dataTransfer.files[0]);
                              }
                            }}
                            onClick={() => document.getElementById("billing-file-picker")?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${paymentScreenshot ? "border-green-400 bg-green-50/5" : "border-slate-300 hover:border-sky-500"}`}
                          >
                            <input 
                              id="billing-file-picker"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleScreenshotFile(e.target.files[0]);
                                }
                              }}
                            />
                            {paymentScreenshot ? (
                              <div className="space-y-1.5 flex flex-col items-center">
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                                <p className="text-xs font-bold text-green-700">{lang === "uz" ? "Rasm yuklandi" : "Изображение загружено"}</p>
                                <span className="text-[10px] text-sky-600 underline font-semibold leading-none">{lang === "uz" ? "O'zgartirish uchun qayta bosing" : "Кликните для выбора другого"}</span>
                              </div>
                            ) : (
                              <div className="space-y-1.5 font-sans flex flex-col items-center">
                                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                                <p className="text-xs font-bold text-slate-655">{t.dragDropText}</p>
                                <p className="text-[10px] text-slate-400 font-medium">(PNG, JPG, JPEG)</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Text form inputs */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t.paymentStep3}</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-500">{t.enterFullName} *</span>
                              <input
                                type="text"
                                required
                                value={paymentFormFullName}
                                onChange={(e) => setPaymentFormFullName(e.target.value)}
                                placeholder={t.fullName}
                                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 focus:border-sky-500 focus:outline-none rounded-lg p-2 bg-slate-50/30"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-500">{t.enterPhone} *</span>
                              <input
                                type="text"
                                required
                                value={paymentFormPhone}
                                onChange={(e) => setPaymentFormPhone(e.target.value)}
                                placeholder={t.phone}
                                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 focus:border-sky-500 focus:outline-none rounded-lg p-2 bg-slate-50/30"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Local inputs error messages block */}
                        {screenshotError && (
                          <div className="text-xs font-bold text-red-655 bg-red-50 p-2 rounded-lg border border-red-150 text-center animate-pulse leading-snug">
                            {screenshotError}
                          </div>
                        )}

                        {/* Confirm button */}
                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.submitPayment}</span>
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 3. Image Zoom / Lightbox Modal Overlay */}
      {zoomImage && (
        <div id="screenshot-zoomer" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-55 p-4 cursor-zoom-out no-print" onClick={() => setZoomImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] overflow-auto rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} className="w-full h-auto object-contain max-h-[80vh] bg-white border border-slate-200" alt="expanded receipt overlay" />
            <button 
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all cursor-pointer border-0 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Beautiful Floating Toggle Button for Mobile Navigation (no-print) */}
      {showFloatingNav && !showPaymentModal && !isGeneratingPdf && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden pointer-events-none no-print">
          <div className="flex bg-white/95 whitespace-nowrap backdrop-blur-md p-1 rounded-full shadow-xl border border-slate-200/80 pointer-events-auto items-center relative">
            <button
              id="mobile-nav-edit-btn"
              type="button"
              onClick={() => setMobileMode("edit")}
              className={`relative z-10 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black tracking-wide transition-all duration-300 cursor-pointer ${
                mobileMode === "edit" ? "text-white" : "text-slate-605 hover:text-slate-900"
              }`}
            >
              <span>✏️</span>
              <span>Tahrirlash</span>
              {mobileMode === "edit" && (
                <motion.div
                  layoutId="activeMobileMode"
                  className="absolute inset-0 bg-sky-600 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              id="mobile-nav-preview-btn"
              type="button"
              onClick={() => setMobileMode("preview")}
              className={`relative z-10 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black tracking-wide transition-all duration-300 cursor-pointer ${
                mobileMode === "preview" ? "text-white" : "text-slate-605 hover:text-slate-900"
              }`}
            >
              <span>👁️</span>
              <span>Ko‘rish</span>
              {mobileMode === "preview" && (
                <motion.div
                  layoutId="activeMobileMode"
                  className="absolute inset-0 bg-sky-600 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
