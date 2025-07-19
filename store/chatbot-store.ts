import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },
  setIsLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}));