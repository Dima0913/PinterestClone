import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/auth";
import "./Settings.css";

const GeneralSettings = () => {
  const { isAuthenticated, user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    avatarUrl: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadUserData();
    else setLoading(false);
  }, [isAuthenticated]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      const parts = (data.username || "").split(" ");
      setUserData({
        username: data.username || "",
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || "",
      });
      if (data.avatarUrl) {
        setAvatarPreview(
          data.avatarUrl.startsWith("http") ? data.avatarUrl : `http://localhost:5001${data.avatarUrl}`
        );
      }
    } catch (err) {
      setError("Не вдалося завантажити дані користувача");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024) {
      setAvatarFile(file);
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const result = await authService.updateProfile({
        username: [userData.firstName, userData.lastName].filter(Boolean).join(" ") || userData.username,
        bio: userData.bio || "",
        avatarFile,
        avatarUrl: avatarFile ? null : userData.avatarUrl || null,
      });
      setUserData((prev) => ({
        ...prev,
        username: result.username,
        bio: result.bio,
        avatarUrl: result.avatarUrl,
      }));
      if (result.avatarUrl) {
        setAvatarPreview(result.avatarUrl.startsWith("http") ? result.avatarUrl : `http://localhost:5001${result.avatarUrl}`);
      }
      setAvatarFile(null);
      if (updateUser) await updateUser();
      setMessage(result.message || "Налаштування успішно збережено!");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Не вдалося зберегти налаштування");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || loading) return null;

  return (
    <div className="inspira-settings-panel">
      <h1>Редагування профілю</h1>
      <p className="section-desc">
        Будь ласка, зберігайте конфіденційність своєї особистої інформації. Інформація, яку ви додаєте тут, буде видимою для всіх користувачів, які можуть переглядати ваш профіль.
      </p>

      {message && <div className="settings-message success">{message}</div>}
      {error && <div className="settings-message error">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="inspira-profile-avatar-row">
          <div className="avatar-preview inspira-avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" />
            ) : (
              <span className="avatar-initial-placeholder">
                {(userData.username?.[0] || userData.firstName?.[0] || "U").toUpperCase()}
              </span>
            )}
          </div>
          <label className="inspira-btn-change">
            Змінити
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleAvatarChange} hidden />
          </label>
        </div>

        <div className="form-row">
          <label>Ім'я</label>
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleInputChange}
            className="inspira-input"
            placeholder="Ім'я"
          />
        </div>
        <div className="form-row">
          <label>Прізвище</label>
          <input
            type="text"
            name="lastName"
            value={userData.lastName}
            onChange={handleInputChange}
            className="inspira-input"
            placeholder="Прізвище"
          />
        </div>
        <div className="form-row">
          <label>Про себе</label>
          <input
            type="text"
            name="bio"
            value={userData.bio}
            onChange={handleInputChange}
            className="inspira-input"
            placeholder="Про себе"
          />
        </div>

        <div className="settings-actions" style={{ marginTop: 24 }}>
          <button type="submit" className="inspira-btn-primary save-btn" disabled={saving}>
            {saving ? "Збереження..." : "Зберегти"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;
