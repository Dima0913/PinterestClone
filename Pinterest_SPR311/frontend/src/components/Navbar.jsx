import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import "./Navbar.css";

const SEARCH_SUGGESTIONS = [
  "Cartoon", "Mountains", "Street style", "Jersey", "Dog wallpaper",
  "Beauty", "Food", "Art", "Travel", "Fashion", "Design", "Nature"
];

const Navbar = () => {
  const {
    isAuthenticated,
    user,
    logout,
    accounts,
    currentAccountId,
    switchAccount,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [addAsNewAccount, setAddAsNewAccount] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchWrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
  };

  const openAuthModal = (mode, asNewAccount = false) => {
    setAuthModalMode(mode);
    setAddAsNewAccount(asNewAccount);
    setAuthModalOpen(true);
    setShowProfileDropdown(false);
  };

  const handleAddAccount = () => {
    openAuthModal("login", true);
  };

  const handleSwitchAccount = async (accountId) => {
    await switchAccount(accountId);
    setShowProfileDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
    setShowSearchSuggestions(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSearchParams({ q: suggestion });
    setShowSearchSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = searchQuery.trim()
    ? SEARCH_SUGGESTIONS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : SEARCH_SUGGESTIONS;

  const displaySuggestions = filteredSuggestions.slice(0, 8);

  return (
    <nav className="navbar inspira-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="logo inspira-logo" onClick={() => navigate("/")}>
            <span className="logo-icon inspira-logo-icon">i</span>
            <span className="logo-text">Inspira</span>
          </div>
        </div>

        <div className="navbar-center search-wrapper" ref={searchWrapperRef}>
          <form className="search-bar" onSubmit={handleSearch}>
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Пошук"
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchSuggestions(true)}
            />
          </form>
          {showSearchSuggestions && (
            <div className="search-suggestions">
              {displaySuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="search-suggestion-item"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7"></path>
                    <path d="M17 7H7v10"></path>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-right" ref={dropdownRef}>
          {isAuthenticated ? (
            <div className="profile-dropdown-wrapper">
              <div
                className="user-avatar inspira-avatar"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{ cursor: "pointer" }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={
                      user.avatarUrl.startsWith("http")
                        ? user.avatarUrl
                        : `http://localhost:5001${user.avatarUrl}`
                    }
                    alt={user?.username || "User"}
                    className="avatar-image"
                  />
                ) : (
                  <span className="avatar-initial">
                    {user?.username ? (user.username[0] + (user.username[1] || user.username[0])).toUpperCase().slice(0, 2) : (user?.email?.[0] || "U") + (user?.email?.[1] || "P")}
                  </span>
                )}
              </div>
              <button
                className="chevron-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{ transform: showProfileDropdown ? "rotate(180deg)" : "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              {showProfileDropdown && (
                <div className="profile-dropdown inspira-dropdown">
                  <div className="dropdown-header">
                    <strong>Вхід в</strong>
                  </div>
                  <div className="user-info-inspira">
                    <div className="user-avatar-small inspira-avatar">
                      {user?.avatarUrl ? (
                        <img
                          src={
                            user.avatarUrl.startsWith("http")
                              ? user.avatarUrl
                              : `http://localhost:5001${user.avatarUrl}`
                          }
                          alt={user?.username}
                        />
                      ) : (
                        <span className="avatar-initial">
                          {user?.username ? (user.username[0] + (user.username[1] || user.username[0])).toUpperCase().slice(0, 2) : "DP"}
                        </span>
                      )}
                    </div>
                    <div className="user-details">
                      <strong>{user?.username || "Користувач"}</strong>
                      <span className="account-type">Персональний</span>
                      <span className="email-verified">
                        {user?.email || ""}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a6640">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {accounts && accounts.length > 0 && (
                    <div className="accounts-list">
                      {accounts.map((account) => (
                        <button
                          key={account.id}
                          className={`account-item ${currentAccountId === account.id ? "active" : ""}`}
                          onClick={() => handleSwitchAccount(account.id)}
                        >
                          <div className="account-avatar-small inspira-avatar">
                            {account.avatarUrl ? (
                              <img src={account.avatarUrl.startsWith("http") ? account.avatarUrl : `http://localhost:5001${account.avatarUrl}`} alt="" />
                            ) : (
                              <span>{account.username?.[0]?.toUpperCase() || "U"}</span>
                            )}
                          </div>
                          <div className="account-info-small">
                            <strong>{account.username}</strong>
                            <span>{account.email}</span>
                          </div>
                        </button>
                      ))}
                      <div className="accounts-divider"></div>
                    </div>
                  )}

                  <button className="dropdown-item" onClick={handleAddAccount}>
                    Додати акаунт
                  </button>
                  <button className="dropdown-item" onClick={() => { navigate("/settings"); setShowProfileDropdown(false); }}>
                    Більше опцій
                  </button>
                  <button className="dropdown-item" onClick={() => { navigate("/settings"); setShowProfileDropdown(false); }}>
                    Налаштування
                  </button>
                  <button className="dropdown-item" onClick={() => { navigate("/settings/help"); setShowProfileDropdown(false); }} type="button">
                    Допомога
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="external-arrow">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </button>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    Вихід
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="nav-button login-btn" onClick={() => openAuthModal("login")}>
                Увійти
              </button>
              <button className="nav-button signup-btn inspira-signup" onClick={() => openAuthModal("register")}>
                Зареєструватися
              </button>
            </>
          )}
        </div>
      </div>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setAddAsNewAccount(false); }}
        initialMode={authModalMode}
        addAsNewAccount={addAsNewAccount}
      />
    </nav>
  );
};

export default Navbar;
