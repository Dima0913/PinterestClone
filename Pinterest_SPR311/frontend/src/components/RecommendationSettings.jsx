import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/auth";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./Settings.css";

const RecommendationSettings = () => {
  const { isAuthenticated } = useAuth();
  const [recommendationsEnabled, setRecommendationsEnabled] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(true);
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
      const settings = await authService.getSettings();
      setRecommendationsEnabled(settings.recommendationsEnabled ?? true);
      setPersonalizedAds(settings.personalizedAds ?? true);
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
      await authService.updateRecommendations({
        recommendationsEnabled: recommendationsEnabled,
        personalizedAds: personalizedAds,
      });

      setMessage("Налаштування рекомендацій збережено!");
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
            <h1>Налаштування рекомендацій</h1>

            {message && (
              <div className="settings-message success">{message}</div>
            )}
            {error && <div className="settings-message error">{error}</div>}

            <form onSubmit={handleSave} className="settings-form">
              <div className="settings-section">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={recommendationsEnabled}
                      onChange={(e) => setRecommendationsEnabled(e.target.checked)}
                    />
                    <span>Увімкнути персоналізовані рекомендації</span>
                  </label>
                  <small>
                    Ми використовуємо ваші інтереси та активність для показу
                    релевантних пінів
                  </small>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={personalizedAds}
                      onChange={(e) => setPersonalizedAds(e.target.checked)}
                    />
                    <span>Персоналізовані рекламні оголошення</span>
                  </label>
                  <small>
                    Дозволити показувати рекламу на основі ваших інтересів
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

export default RecommendationSettings;
