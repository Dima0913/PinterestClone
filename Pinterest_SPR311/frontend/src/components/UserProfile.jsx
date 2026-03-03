import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { usersService } from "../api/users";
import { messagesService } from "../api/messages";
import PinCard from "./PinCard";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import FollowersModal from "./FollowersModal";
import "./UserProfile.css";
import "./PinGrid.css";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuth();
  const { openChat } = useChat();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("pins");
  const [pins, setPins] = useState([]);
  const [savedPins, setSavedPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (id) {
      loadProfile();
    }
  }, [id]);

  useEffect(() => {
    if (profile) {
      setFollowing(profile.isFollowing);
      if (activeTab === "pins") {
        loadPins();
      } else if (activeTab === "saved" && profile.isOwnProfile) {
        loadSavedPins();
      }
        // clear any status message when profile changes
        setStatusMessage("");
    }
  }, [profile, activeTab]);

  const loadProfile = async () => {
    if (!id) {
      setError("ID користувача не вказано");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Loading profile for user ID:", id);
      const data = await usersService.getUserProfile(id);
      console.log("Profile loaded successfully:", data);
      setProfile(data);
    } catch (err) {
      console.error("Error loading profile:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.message || "Не вдалося завантажити профіль";
      if (err.response?.status === 404) {
        setError("Профіль не знайдено");
      } else if (err.response?.status === 403) {
        setError("Немає доступу до цього профілю. Профіль може бути приватним.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPins = async () => {
    try {
      const data = await usersService.getUserPins(id, 1, 50);
      setPins(data.pins || []);
    } catch (err) {
      console.error("Error loading pins:", err);
    }
  };

  const loadSavedPins = async () => {
    try {
      const data = await usersService.getUserSavedPins(id, 1, 50);
      setSavedPins(data.pins || []);
    } catch (err) {
      console.error("Error loading saved pins:", err);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    try {
      if (following) {
        await usersService.unfollowUser(id);
        setFollowing(false);
        setProfile((prev) => ({
          ...prev,
          followersCount: prev.followersCount - 1,
          isFollowing: false,
        }));
      } else {
        await usersService.followUser(id);
        setFollowing(true);
        setProfile((prev) => ({
          ...prev,
          followersCount: prev.followersCount + 1,
          isFollowing: true,
        }));
      }
    } catch (err) {
      console.error("Error following/unfollowing:", err);
    }
  };

  const handleUnblock = async () => {
    try {
      await messagesService.unblockUser(profile.id);
      setStatusMessage("Користувач розблокований");
      // refresh profile to update flags
      await loadProfile();
      // update chats list in background
      try {
        const chats = await messagesService.getChats();
        // if we have chat context methods we could update; ignore for now
      } catch {}
    } catch (err) {
      console.error("Error unblocking user", err);
      alert("Не вдалося розблокувати користувача");
    }
  };


  if (loading) {
    return (
      <div className="home-container inspira-home">
        <Navbar />
        <div className="home-layout">
          <Sidebar />
          <main className="home-main inspira-main">
            <div className="user-profile-loading">
              <div className="loading-spinner"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="home-container inspira-home">
        <Navbar />
        <div className="home-layout">
          <Sidebar />
          <main className="home-main inspira-main">
            <div className="user-profile-error">{error || "Профіль не знайдено"}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container inspira-home">
      <Navbar />
      <div className="home-layout">
        <Sidebar />
        <main className="home-main inspira-main">
          <div className="user-profile">
            {statusMessage && (
              <div className="user-profile-status-message">{statusMessage}</div>
            )}
            <div className="user-profile-header">
              <div className="user-profile-avatar">
                {profile.avatarUrl ? (
                  <img
                    src={
                      profile.avatarUrl?.startsWith("http") ||
                      profile.avatarUrl?.startsWith("//")
                        ? profile.avatarUrl
                        : `http://localhost:5001${profile.avatarUrl}`
                    }
                    alt={profile.username}
                  />
                ) : (
                  <div className="user-profile-avatar-placeholder">
                    {profile.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="user-profile-info">
                <h1 className="user-profile-username">{profile.username}</h1>
                {profile.bio && (
                  <p className="user-profile-bio">{profile.bio}</p>
                )}
                <div className="user-profile-stats">
                  <div className="user-profile-stat">
                    <span className="user-profile-stat-value">{profile.pinsCount}</span>
                    <span className="user-profile-stat-label">пінів</span>
                  </div>
                  <div
                    className="user-profile-stat clickable"
                    onClick={() => setFollowersModalOpen(true)}
                  >
                    <span className="user-profile-stat-value">{profile.followersCount}</span>
                    <span className="user-profile-stat-label">підписників</span>
                  </div>
                  <div
                    className="user-profile-stat clickable"
                    onClick={() => setFollowingModalOpen(true)}
                  >
                    <span className="user-profile-stat-value">{profile.followingCount}</span>
                    <span className="user-profile-stat-label">підписок</span>
                  </div>
                </div>
                {!profile.isOwnProfile && isAuthenticated && (
                  <div className="user-profile-actions">
                    {profile.isBlockedByMe ? (
                      <button className="user-profile-unblock-btn" onClick={handleUnblock}>
                        Розблокувати
                      </button>
                    ) : profile.hasBlockedMe ? (
                      <span className="user-profile-blocked-note">Вас заблоковано</span>
                    ) : (
                      <>
                        <button
                          className={`user-profile-follow-btn ${following ? "following" : ""}`}
                          onClick={handleFollow}
                        >
                          {following ? "Відписатися" : "Підписатися"}
                        </button>
                        <button
                          className="user-profile-write-btn"
                          onClick={() => openChat({ id: profile.id, username: profile.username, avatarUrl: profile.avatarUrl })}
                        >
                          Написати
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="user-profile-tabs">
              <button
                className={`user-profile-tab ${activeTab === "pins" ? "active" : ""}`}
                onClick={() => setActiveTab("pins")}
              >
                Створені
              </button>
              {profile.isOwnProfile && (
                <button
                  className={`user-profile-tab ${activeTab === "saved" ? "active" : ""}`}
                  onClick={() => setActiveTab("saved")}
                >
                  Збережені
                </button>
              )}
            </div>

            <div className="user-profile-content">
              {activeTab === "pins" ? (
                pins.length === 0 ? (
                  <div className="user-profile-empty">
                    <p>У цього користувача поки немає пінів</p>
                  </div>
                ) : (
                  <div className="pin-grid">
                    {pins.map((pin) => (
                      <PinCard key={pin.id} pin={pin} />
                    ))}
                  </div>
                )
              ) : (
                savedPins.length === 0 ? (
                  <div className="user-profile-empty">
                    <p>У вас поки немає збережених пінів</p>
                  </div>
                ) : (
                  <div className="pin-grid">
                    {savedPins.map((pin) => (
                      <PinCard key={pin.id} pin={pin} />
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </main>
      </div>
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        userId={parseInt(id)}
        type="followers"
      />
      <FollowersModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        userId={parseInt(id)}
        type="following"
      />
    </div>
  );
};

export default UserProfile;

