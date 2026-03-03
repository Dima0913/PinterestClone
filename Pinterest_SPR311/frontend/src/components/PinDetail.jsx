import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { pinsService } from "../api/pins";
import SavePinModal from "./SavePinModal";
import CreateBoardModal from "./CreateBoardModal";
import CommentsSection from "./CommentsSection";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./PinDetail.css";

const PinDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [createBoardModalOpen, setCreateBoardModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      loadPin();
    }
  }, [id]);

  const loadPin = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pinsService.getPin(id);
      setPin(data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Не вдалося завантажити пін";
      setError(errorMessage);
      console.error("Error loading pin:", err);
      console.error("Error response:", err.response);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="home-layout">
          <Sidebar />
          <div className="pin-detail-loading inspira-main-bg">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !pin) {
    return (
      <>
        <Navbar />
        <div className="home-layout">
          <Sidebar />
          <div className="pin-detail-error inspira-main-bg">
            <p>{error || "Пін не знайдено"}</p>
            <button onClick={() => navigate("/")}>Повернутися</button>
          </div>
        </div>
      </>
    );
  }

  const imageUrl =
    pin.imageUrl?.startsWith("http") || pin.imageUrl?.startsWith("//")
      ? pin.imageUrl
      : `http://localhost:5001${pin.imageUrl}`;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName =
        pin.title?.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "image";
      link.download = `${fileName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading image:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="home-layout">
        <Sidebar />
      <div className="pin-detail-container inspira-pin-detail">
        <div className="pin-detail-content">
          <div className="pin-detail-image-wrapper">
            <img
              src={imageUrl}
              alt={pin.title}
              className={`pin-detail-image ${imageLoaded ? "loaded" : ""}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && <div className="pin-detail-image-placeholder" />}
          </div>
          <div className="pin-detail-info">
            <div className="pin-detail-header">
              <button
                className="pin-detail-close"
                onClick={() => navigate("/")}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="pin-detail-actions">
              {isAuthenticated && (
                <button
                  className="pin-detail-save-btn"
                  onClick={() => setSaveModalOpen(true)}
                >
                  Зберегти
                </button>
              )}
              <button
                className="pin-detail-download-btn"
                onClick={handleDownload}
              >
                <span className="pin-detail-download-icon">⬇</span>
                Завантажити
              </button>
            </div>
            <h1 className="pin-detail-title">{pin.title}</h1>
            {pin.description && (
              <p className="pin-detail-description">{pin.description}</p>
            )}
            <div className="pin-detail-meta">
              <div
                className="pin-detail-author"
                onClick={() => navigate(`/user/${pin.ownerId}`)}
                style={{ cursor: "pointer" }}
              >
                {pin.ownerAvatarUrl ? (
                  <img
                    src={pin.ownerAvatarUrl}
                    alt={pin.ownerUsername}
                    className="pin-detail-avatar"
                  />
                ) : (
                  <div className="pin-detail-avatar-placeholder">
                    {pin.ownerUsername?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="pin-detail-author-info">
                  <span className="pin-detail-author-name">
                    {pin.ownerUsername}
                  </span>
                  {pin.ownerBio && (
                    <span className="pin-detail-author-bio">
                      {pin.ownerBio}
                    </span>
                  )}
                </div>
              </div>
              <div className="pin-detail-stats">
                {pin.likesCount > 0 && (
                  <div className="pin-detail-stat">
                    <span className="pin-detail-stat-icon">❤️</span>
                    <span className="pin-detail-stat-count">
                      {pin.likesCount}
                    </span>
                  </div>
                )}
                {pin.commentsCount > 0 && (
                  <div className="pin-detail-stat">
                    <span className="pin-detail-stat-icon">💬</span>
                    <span className="pin-detail-stat-count">
                      {pin.commentsCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {pin.link && (
              <div className="pin-detail-link">
                <a
                  href={pin.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pin-detail-link-btn"
                >
                  Відвідати сайт
                </a>
              </div>
            )}

            <CommentsSection
              pinId={pin.id}
              initialComments={pin.comments || []}
            />
          </div>
        </div>
      </div>
      </div>

      <SavePinModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        pinId={pin?.id}
        onSuccess={() => {
          console.log("Pin saved successfully");
        }}
        onCreateBoard={() => setCreateBoardModalOpen(true)}
      />
      
      <CreateBoardModal
        isOpen={createBoardModalOpen}
        onClose={() => setCreateBoardModalOpen(false)}
        pinId={pin?.id}
        onSuccess={(createdBoard) => {
          // Закрываем SavePinModal после успешного создания доски и сохранения пина
          setSaveModalOpen(false);
          console.log("Пін успішно збережено в дошку:", createdBoard.name);
        }}
      />
    </>
  );
};

export default PinDetail;
