import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useState } from "react"; // required for help section state management
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import GeneralSettings from "./GeneralSettings";
import RecommendationSettings from "./RecommendationSettings";
// connected accounts removed from menu
import PrivacySettings from "./PrivacySettings";
import "./Settings.css";

const Settings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="settings-page inspira-settings-page">
        <Navbar />
        <div className="home-layout">
          <Sidebar />
          <div className="settings-main-container inspira-settings-main" style={{ flex: 1 }}>
            <div className="inspira-settings-panel" style={{ margin: 32 }}>
              <h1>Налаштування</h1>
              <p>Будь ласка, увійдіть, щоб переглянути налаштування.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const settingsMenuItems = [
    { id: "profile", label: "Редагування профілю", path: "/settings", icon: "profile" },
    { id: "account", label: "Керування обліковими записами", path: "/settings/account", icon: "account" },
    { id: "visibility", label: "Видимість профілю", path: "/settings/visibility", icon: "visibility" },
    { id: "recommendations", label: "Налаштуйте рекомендації", path: "/settings/recommendations", icon: "recommendations" },
    { id: "notifications", label: "Сповіщення", path: "/settings/notifications", icon: "notifications" },
    // removed "brand" and "connect" sections per request
    { id: "security", label: "Безпека", path: "/settings/security", icon: "security" },
    { id: "privacy", label: "Конфіденційність і дані", path: "/settings/privacy", icon: "privacy" },
    { id: "help", label: "Get help", path: "/settings/help", icon: "help" },
  ];

  const getIcon = (iconName) => {
    const icons = {
      profile: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      account: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      visibility: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      ),
      recommendations: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      notifications: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      ),
      brand: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        </svg>
      ),
      connect: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      ),
      security: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
      privacy: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
      help: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  const handleItemClick = (item) => navigate(item.path);

  const isActive = (path) => {
    if (path === "/settings") return location.pathname === "/settings";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="settings-page inspira-settings-page">
      <Navbar />
      <div className="home-layout">
        <Sidebar />
        <div className="settings-main-container inspira-settings-main">
          <div className="settings-menu-container inspira-settings-menu">
            <h2 className="inspira-settings-title">Налаштування</h2>
            {settingsMenuItems.map((item) => (
              <button
                key={item.id}
                className={`settings-menu-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => handleItemClick(item)}
              >
                <span className="settings-menu-icon">{getIcon(item.icon)}</span>
                <span className="settings-menu-label">{item.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="settings-arrow">
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </button>
            ))}
            <div className="inspira-settings-gear">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
            </div>
          </div>

          <div className="settings-content-wrapper inspira-settings-content">
            <Routes>
              <Route path="/" element={<GeneralSettings />} />
              <Route path="/account" element={<AccountManagementPlaceholder />} />
              <Route path="/visibility" element={<ProfileVisibilityPlaceholder />} />
              <Route path="/recommendations" element={<RecommendationSettings />} />
              <Route path="/notifications" element={<NotificationsPlaceholder />} />
              <Route path="/security" element={<SecurityPlaceholder />} />
              <Route path="/privacy" element={<PrivacySettings />} />
              <Route path="/help" element={<HelpPlaceholder />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountManagementPlaceholder = () => (
  <div className="inspira-settings-panel">
    <h1>Керування обліковими записами</h1>
    <p className="section-desc">Ви можете змінити персональні дані або тип облікового запису.</p>
    <div className="inspira-settings-block">
      <h3>Ваш обліковий запис</h3>
      <div className="form-row">
        <label>Електронна пошта</label>
        <input type="text" placeholder="email@example.com" readOnly className="inspira-input" />
      </div>
      <div className="form-row actions-row">
        <span>Пароль</span>
        <button className="inspira-btn-primary">Змінити</button>
      </div>
    </div>
    <div className="inspira-settings-block">
      <h3>Перетворіть звичайний обліковий запис на корпоративний</h3>
      <p>З корпоративним обліковим записом ви матимете доступ до таких інструментів, як реклама й аналітика, щоб розвивати свій бізнес у Inspira.</p>
      <button className="inspira-btn-primary">Змінити тип</button>
    </div>
    <div className="inspira-settings-block">
      <h3>Деактивація та видалення</h3>
      <p>Тимчасово приховайте свій профіль, піни й дошки.</p>
      <button className="inspira-btn-primary">Деактивувати обліковий запис</button>
      <p>Остаточно видаліть свої дані й усе, що пов'язано з вашим обліковим записом</p>
      <button className="inspira-btn-primary inspira-btn-danger">Видалити обліковий запис</button>
    </div>
  </div>
);

const ProfileVisibilityPlaceholder = () => (
  <div className="inspira-settings-panel">
    <h1>Видимість профілю</h1>
    <p>Керуйте тим, як інші можуть переглядати ваш профіль у Inspira і за межами платформи.</p>
    <div className="inspira-settings-block">
      <h3>Приватний профіль</h3>
      <p>Якщо у вас приватний профіль, лише схвалені вами люди можуть переглядати ваш профіль, а також піни, дошки, відгуки і групи. <a href="#">Дізнайтеся</a></p>
    </div>
    <div className="inspira-settings-block">
      <h3>Конфіденційність у пошукових системах</h3>
      <p>Приховуйте профіль від пошукових систем (наприклад, Google). <a href="#">Дізнайтеся</a></p>
    </div>
  </div>
);

const NotificationsPlaceholder = () => (
  <div className="inspira-settings-panel">
    <h1>Сповіщення</h1>
    <p>Налаштуйте, які сповіщення ви хочете отримувати.</p>
  </div>
);



const SecurityPlaceholder = () => (
  <div className="inspira-settings-panel">
    <h1>Безпека</h1>
    <p>Використовуйте додаткові заходи безпеки, наприклад, увімкніть двофакторну автентифікацію та перевірте список підключених пристроїв, щоб захистити обліковий запис, піни та дошки. <a href="#">Докладніше</a></p>
    <div className="inspira-settings-block">
      <h3>Вхід у додатки</h3>
      <p>Стежте за тим, де ви використовували для входу свій профіль Inspira. <a href="#">Докладніше</a></p>
      <p className="status">Ви не створили жодного додатка</p>
    </div>
    <div className="inspira-settings-block">
      <h3>Двофакторна автентифікація</h3>
      <p>Це забезпечує додатковий захист вашого облікового запису. <a href="#">Докладніше</a></p>
    </div>
    <div className="inspira-settings-block">
      <h3>Підключені пристрої</h3>
      <p>Ось список пристроїв, з яких ви входили у ваш обліковий запис. <a href="#">Докладніше</a></p>
      <button className="inspira-btn-primary">Показати сеанси</button>
    </div>
  </div>
);

const HelpPlaceholder = () => {
  const helpData = [
    {
      title: "Почніть",
      items: [
        "Отримайте обліковий запис Inspira",
        "Знайдіть свій профіль",
        "Оновіть програму Inspira",
        "Типи відео на Inspira",
      ],
    },
    {
      title: "Керування обліковим записом та налаштуваннями",
      items: [
        "Вхід та вихід із Inspira",
        "Не можу увійти в Inspira",
        "Змінити налаштування персоналізації",
        "Скинути або змінити пароль",
      ],
    },
    {
      title: "Знайдіть і збережіть",
      items: [
        "Відкрийте піни або дошки",
        "Завантажити зображення або відео",
        "Обстежте Inspira",
        "Збереження відео на дошці",
      ],
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredData = helpData.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  const toggleCategory = (title) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const onClickItem = (item) => {
    // instead of a plain alert, show some generated information below
    setSelectedItem(item);
  };

  return (
    <div className="inspira-settings-panel inspira-help-panel">
      <h1>Потрібна допомога?</h1>
      <input
        type="text"
        placeholder="Як ми можемо допомогти?"
        className="inspira-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="help-categories">
        {filteredData.map((cat) => (
          <div key={cat.title} className="help-category">
            <h4 onClick={() => toggleCategory(cat.title)} style={{ cursor: "pointer" }}>
              {cat.title}
            </h4>
            {expanded[cat.title] && (
              <ul>
                {cat.items.map((item) => (
                  <li key={item} onClick={() => onClickItem(item)}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <button
              className="inspira-btn-outline"
              onClick={() => toggleCategory(cat.title)}
            >
              {expanded[cat.title] ? "Згорнути" : "Більше"}
            </button>
          </div>
        ))}
      </div>
      {selectedItem && (
        <div className="help-detail">
          <h2>{selectedItem}</h2>
          <p>
            {helpContent[selectedItem] ||
              `Тут можна розмістити детальну інформацію щодо "${selectedItem}". ` +
              `Це згенерований приклад тексту, щоб продемонструвати, як працює сторінка довідки.`}
          </p>
          <p>
            Для повної документації відвідайте&nbsp;
            <a href="https://example.com/help" target="_blank" rel="noopener noreferrer">
              наш сайт підтримки
            </a>.
          </p>
        </div>
      )}
    </div>
  );
};

// sample help text mapping, could be expanded or replaced with real data
const helpContent = {
  "Отримайте обліковий запис Inspira":
    "Щоб створити обліковий запис, натисніть кнопку реєстрації на головній сторінці і дотримуйтеся інструкцій.",
  "Змінити налаштування персоналізації":
    "Перейдіть до налаштувань свого профілю, щоб оновити персональні уподобання та мовні налаштування.",
  // add more entries as desired
};

export default Settings;
