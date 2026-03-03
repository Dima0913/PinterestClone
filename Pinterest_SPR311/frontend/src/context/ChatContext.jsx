import { createContext, useContext, useState } from "react";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);

  const togglePanel = () => {
    setChatPanelOpen((open) => !open);
    if (chatPanelOpen) {
      // closing panel also clear selected user
      setActiveChatUser(null);
    }
  };

  const openChat = (user) => {
    setActiveChatUser(user);
    setChatPanelOpen(true);
  };

  const closePanel = () => {
    setChatPanelOpen(false);
    setActiveChatUser(null);
  };

  const clearChatUser = () => {
    setActiveChatUser(null);
  };

  return (
    <ChatContext.Provider
      value={{
        chatPanelOpen,
        activeChatUser,
        togglePanel,
        openChat,
        closePanel,
        clearChatUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
