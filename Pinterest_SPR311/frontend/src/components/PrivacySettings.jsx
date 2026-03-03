import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/auth";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./Settings.css";

const PrivacySettings = () => {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState({
    visibility: "Public",
    searchable: true,
    showEmail: false,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await authService.getSettings();
      setSettings({
        visibility: data.visibility || "Public",
        searchable: data.searchable ?? true,
        showEmail: data.showEmail ?? false,
      });
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Не вдалося завантажити налаштування");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await authService.updatePrivacy({
        visibility: settings.visibility,
        searchable: settings.searchable,
        showEmail: settings.showEmail,
      });

      setMessage("Налаштування приватності збережено!");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(
        err.response?.data?.message || "Не вдалося зберегти налаштування"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <Navbar />
      <div className="home-layout">
        <Sidebar />
        <div className="settings-container">
          <div className="settings-content">
            <h1>Налаштування приватності</h1>

            {message && (
              <div className="settings-message success">{message}</div>
            )}
            {error && <div className="settings-message error">{error}</div>}

            <form onSubmit={handleSave} className="settings-form">
              <div className="settings-section">
                <div className="form-group">
                  <label htmlFor="profileVisibility">Видимість профілю</label>
                  <select
                    id="profileVisibility"
                    value={settings.visibility}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        visibility: e.target.value,
                      })
                    }
                    className="settings-select"
                  >
                    <option value="Public">Публічний</option>
                    <option value="Private">Приватний</option>
                  </select>
                  <small>
                    Публічний профіль видно всім, приватний - тільки вашим
                    друзям
                  </small>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.searchable}
                      onChange={(e) =>
                        setSettings({ ...settings, searchable: e.target.checked })
                      }
                    />
                    <span>Дозволити пошук мого профілю</span>
                  </label>
                  <small>
                    Якщо увімкнено, ваш профіль можна знайти через пошук
                  </small>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, showEmail: e.target.checked })
                      }
                    />
                    <span>Показувати електронну пошту</span>
                  </label>
                  <small>
                    Якщо увімкнено, ваша електронна пошта буде видна в профілі
                  </small>
                </div>
              </div>

              <div className="settings-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Збереження..." : "Зберегти зміни"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
