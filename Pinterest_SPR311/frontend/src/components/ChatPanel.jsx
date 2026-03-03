import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { messagesService } from "../api/messages";
import "./ChatPanel.css";

const ChatPanel = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReasons, setReportReasons] = useState({});
  const optionsRef = useRef(null);

  // chat-related state
  const [chats, setChats] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [blockedState, setBlockedState] = useState(false);
  const messagesAreaRef = useRef(null);

  const { user: currentUser } = useAuth();
  const { activeChatUser, closePanel, clearChatUser, openChat } = useChat();

  const reportOptions = [
    "Недоречний вміст",
    "Спам",
    "Неприйнятна поведінка, погрози або ненависні висловлювання",
    "Домагання",
    "Імітація чужої особистості",
    "Зображення оголеного тіла",
    "Насильство",
    "Інше",
    "Самогубство або самоушкодження",
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (action) => {
    setShowOptionsMenu(false);
    if (action === "block") setShowBlockModal(true);
    else if (action === "report") setShowReportModal(true);
  };

  const handleReportSubmit = () => {
    setShowReportModal(false);
    setReportReasons({});
  };

  // Load chat list when panel mounts
  useEffect(() => {
    const loadChats = async () => {
      try {
        const result = await messagesService.getChats();
        setChats(result);
      } catch (err) {
        console.error("Error loading chats", err);
      }
    };
    loadChats();
  }, []);

  // Load conversation when a chat user is selected
  useEffect(() => {
    const loadConversation = async () => {
      if (activeChatUser) {
        try {
          const conv = await messagesService.getConversation(activeChatUser.id);
          setConversation(conv);
            setBlockedState(false);
        } catch (err) {
          console.error("Error loading conversation", err);
          if (err.response?.status === 403) {
            setStatusMessage("Розмова недоступна (хтось заблокував)");
              setConversation([]);
              // do not close panel so user can unblock
              setBlockedState(true);
          }
        }
      } else {
        setConversation([]);
      }
    };
    loadConversation();
  }, [activeChatUser]);

  // when conversation updates scroll to bottom
  useEffect(() => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSelectChat = (chat) => {
    openChat({ id: chat.userId, username: chat.username, avatarUrl: chat.avatarUrl });
  };

  const handleSendMessage = async () => {
    console.log("send button clicked", { message, activeChatUser });
    if (!activeChatUser) {
      console.log("no active chat user");
      return;
    }
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      console.log("message empty, not sending");
      return;
    }
    try {
      setStatusMessage("Надсилаю...");
      const result = await messagesService.sendMessage(activeChatUser.id, trimmed);
      console.log("message send result", result);
      // append from server response if available
      let newMsg = null;
      if (result && result.id) {
        newMsg = result;
      }
      setMessage("");
      const conv = await messagesService.getConversation(activeChatUser.id);
      setConversation(conv);
      const updatedChats = await messagesService.getChats();
      setChats(updatedChats);
      setStatusMessage("Повідомлення надіслано");
      setTimeout(() => setStatusMessage(""), 2000);
    } catch (err) {
      console.error("Error sending message", err);
      const msg = err.response?.data?.message || err.message;
      setStatusMessage("Помилка: " + msg);
      setTimeout(() => setStatusMessage(""), 4000);
      alert("Не вдалося відправити повідомлення: " + msg);
      // fallback: add message locally so user sees it
      const fallbackMsg = {
        id: Date.now(),
        senderId: currentUser?.id,
        receiverId: activeChatUser.id,
        content: trimmed,
        createdAt: new Date().toISOString(),
        senderUsername: currentUser?.username || "",
        receiverUsername: activeChatUser.username,
        senderAvatarUrl: currentUser?.avatarUrl,
        receiverAvatarUrl: activeChatUser.avatarUrl,
      };
      setConversation((prev) => [...prev, fallbackMsg]);
    }
  };

  const handleUnblockFromChat = async () => {
    if (!activeChatUser) return;
    try {
      await messagesService.unblockUser(activeChatUser.id);
      setStatusMessage("Користувач розблокований");
      setBlockedState(false);
      // reload chats and conversation normally
      const updatedChats = await messagesService.getChats();
      setChats(updatedChats);
      const conv = await messagesService.getConversation(activeChatUser.id);
      setConversation(conv);
    } catch (err) {
      console.error("Error unblocking from chat", err);
      alert("Не вдалося розблокувати користувача");
    }
  };

  return (
    <>
      <div className="chat-panel-overlay" onClick={onClose} />
      <div className="chat-panel inspira-chat-panel">
        <div className="chat-panel-header">
          {activeChatUser ? (
            <>
              <button className="chat-back-btn" onClick={clearChatUser} title="Назад">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="chat-header-user">
                <div className="chat-avatar inspira-avatar-small">
                  {activeChatUser.avatarUrl ? (
                    <img
                      src={
                        activeChatUser.avatarUrl.startsWith("http")
                          ? activeChatUser.avatarUrl
                          : `http://localhost:5001${activeChatUser.avatarUrl}`
                      }
                      alt={activeChatUser.username}
                    />
                  ) : (
                    <span>{activeChatUser.username[0]}</span>
                  )}
                </div>
                <span className="chat-user-name">{activeChatUser.username}</span>
              </div>
              <div className="chat-options-wrapper" ref={optionsRef}>
                <button
                  className="chat-options-btn"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  title="Додаткові опції"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="6" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="18" r="1.5" />
                  </svg>
                </button>
                {showOptionsMenu && (
                  <div className="chat-options-dropdown">
                    <button onClick={() => handleOptionClick("block")}>Заблокувати</button>
                    <button onClick={() => handleOptionClick("report")}>Поскаржитись</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="chat-title">Чати</span>
          )}
        </div>
        {statusMessage && <div className="chat-status-message">{statusMessage}</div>}

        {activeChatUser ? (
          <>
                {blockedState && (
                  <div className="chat-status-message">
                    Розмова заблокована.{' '}
                    <button className="chat-send-btn" onClick={handleUnblockFromChat}>
                      Розблокувати
                    </button>
                  </div>
                )}
            <div className="chat-messages-area" ref={messagesAreaRef}>
              {conversation.length === 0 ? (
                <div className="chat-placeholder">
                  <p>Почніть розмову з {activeChatUser.username}</p>
                </div>
              ) : (
                conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.senderId === currentUser?.id ? "sent" : "received"}`}
                  >
                    {msg.content}
                  </div>
                ))
              )}
            </div>
            <form
              className="chat-input-area"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                className="chat-input"
                placeholder="Введіть повідомлення..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="chat-send-btn"
                title="Надіслати"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="chat-list">
            {chats.length === 0 ? (
              <p className="chat-placeholder">Немає чатів</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.userId}
                  className="chat-list-item"
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="chat-avatar inspira-avatar-small">
                    {chat.avatarUrl ? (
                      <img
                        src={
                          chat.avatarUrl.startsWith("http")
                            ? chat.avatarUrl
                            : `http://localhost:5001${chat.avatarUrl}`
                        }
                        alt={chat.username}
                      />
                    ) : (
                      <span>{chat.username[0]}</span>
                    )}
                  </div>
                  <div className="chat-summary">
                    <span className="chat-user-name">{chat.username}</span>
                    <span className="chat-last-message">{chat.lastMessage}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}

      {showBlockModal && (
        <div className="inspira-modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="inspira-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Заблокувати цього користувача {activeChatUser?.username}?</h3>
            <p>Ви не зможете обмінюватися повідомленнями з цим користувачем, і він не зможе надсилати вам повідомлення або бачити ваші повідомлення.</p>
            <div className="inspira-modal-actions">
              <button className="inspira-modal-cancel" onClick={() => setShowBlockModal(false)}>Скасувати</button>
              <button
                className="inspira-modal-primary"
                onClick={async () => {
                  try {
                    await messagesService.blockUser(activeChatUser.id);
                    setShowBlockModal(false);
                    setStatusMessage(`Користувач ${activeChatUser.username} заблокований`);
                    setTimeout(() => setStatusMessage(""), 3000);
                    // refresh chats and close panel
                    const updated = await messagesService.getChats();
                    setChats(updated);
                    clearChatUser();
                    onClose();
                  } catch (err) {
                    console.error("Error blocking user", err);
                    alert("Не вдалося заблокувати користувача");
                  }
                }}
              >Заблокувати</button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="inspira-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="inspira-modal inspira-modal-report" onClick={(e) => e.stopPropagation()}>
            <h3>Скарга на розмову</h3>
            <div className="report-options">
              {reportOptions.map((opt) => (
                <label key={opt} className="report-option">
                  <input
                    type="checkbox"
                    checked={reportReasons[opt] || false}
                    onChange={(e) => setReportReasons((prev) => ({ ...prev, [opt]: e.target.checked }))}
                  />
                  {opt}
                </label>
              ))}
            </div>
            <div className="inspira-modal-actions">
              <button className="inspira-modal-cancel" onClick={() => setShowReportModal(false)}>Скасувати</button>
              <button className="inspira-modal-primary" onClick={handleReportSubmit}>Надіслати</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPanel;
