import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./Settings.css";

const ConnectedAccounts = () => {
  const { isAuthenticated } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState([
    { provider: "Google", connected: false },
  ]);
  const [message, setMessage] = useState("");

  if (!isAuthenticated) {
    return null;
  }

  const handleConnect = async (provider) => {
    setMessage(`Підключення ${provider}...`);
    // Тут буде логіка підключення акаунта
    setTimeout(() => {
      setConnectedAccounts(
        connectedAccounts.map((acc) =>
          acc.provider === provider ? { ...acc, connected: true } : acc
        )
      );
      setMessage(`${provider} успішно підключено!`);
      setTimeout(() => setMessage(""), 3000);
    }, 1000);
  };

  const handleDisconnect = async (provider) => {
    setMessage(`Відключення ${provider}...`);
    // Тут буде логіка відключення акаунта
    setTimeout(() => {
      setConnectedAccounts(
        connectedAccounts.map((acc) =>
          acc.provider === provider ? { ...acc, connected: false } : acc
        )
      );
      setMessage(`${provider} відключено`);
      setTimeout(() => setMessage(""), 3000);
    }, 1000);
  };

  return (
    <div className="settings-page">
      <Navbar />
      <div className="home-layout">
        <Sidebar />
        <div className="settings-container">
          <div className="settings-content">
            <h1>Зв'язано з Pinterest</h1>

            {message && (
              <div className="settings-message success">{message}</div>
            )}

            <div className="settings-section">
              <p className="section-description">
                Підключіть інші акаунти для швидшого входу та синхронізації
                даних
              </p>

              {connectedAccounts.map((account) => (
                <div key={account.provider} className="connected-account-item">
                  <div className="account-info">
                    <div className="account-icon">
                      {account.provider === "Google" && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      )}
                    </div>
                    <div className="account-details">
                      <strong>{account.provider}</strong>
                      <span>
                        {account.connected
                          ? "Підключено"
                          : "Не підключено"}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`account-button ${
                      account.connected ? "disconnect" : "connect"
                    }`}
                    onClick={() =>
                      account.connected
                        ? handleDisconnect(account.provider)
                        : handleConnect(account.provider)
                    }
                  >
                    {account.connected ? "Відключити" : "Підключити"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectedAccounts;
