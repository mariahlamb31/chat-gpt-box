import {defineStore} from "pinia";
import {ChatListStore} from "@/types/StoreTypes.ts";
import {useChatTabsStore} from "@/store/ChatTabsStore.ts";
import {v4 as uuidv4} from "uuid";
import _ from "lodash";
import {ChatInfoTypes, ChatOptions, ChatType, DallEChatOptions, GPTChatOptions} from "@/types/chat/ChatInfoTypes.ts";

export const useChatListStore = defineStore("chatList", {
  state: (): ChatListStore => {
    return {
      chatList: [
        {
          id: "default",
          name: "Default Chat",
          prompt: "You are a helpful assistant.",
          chatType: ChatType.CHAT_GPT,
          options: {
            enabled: false,
            apiUrl: "https://api.openai.com/",
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            contextMaxMessage: 1,
            contextMaxTokens: 2048,
            responseMaxTokens: 0
          },
        },
        {
          id: "default1",
          name: "Default Chat GPT-4",
          prompt: "You are a helpful assistant. Please ask me anything.",
          chatType: ChatType.CHAT_GPT,
          options: {
            enabled: true,
            apiUrl: "https://api.openai.com/",
            model: "gpt-4-1106-preview",
            temperature: 0.7,
            contextMaxMessage: 1,
            contextMaxTokens: 2048,
            responseMaxTokens: 0
          },
        },
      ]
    };
  },
  actions: {
    setChatList(chatList: ChatInfoTypes[]) {
      this.chatList = chatList;
    },
    getChatInfo(id: string): ChatInfoTypes | null {
      return _.cloneDeep(this.chatList.find((chat: ChatInfoTypes): boolean => chat.id === id) ?? null);
    },
    setChatInfo<K extends keyof ChatInfoTypes>(id: string, key: K, value: ChatInfoTypes[K]) {
      const index = this.getChatInfoIndex(id);
      if (index < 0) return;
      const chatInfo = this.chatList[index];
      chatInfo[key] = value;
      // If you are modifying the prompt, you need to update the prompt in the chatTabsStore
      const promptKey = "prompt" as keyof ChatInfoTypes;
      if (key === promptKey && chatInfo.chatType === ChatType.CHAT_GPT) {
        useChatTabsStore().setAllTabPromptMessage(id, value as string);
      }
    },
    setGPTChatOptions<K extends keyof GPTChatOptions>(id: string, key: K, value: GPTChatOptions[K]) {
      const index = this.getChatInfoIndex(id);
      if (index < 0) return;
      const chatInfo = this.chatList[index];
      // if current chat type is not GPT, return
      if (chatInfo.chatType !== ChatType.CHAT_GPT) return;
      (chatInfo.options as GPTChatOptions)[key] = value;
    },
    setDallEChatOptions<K extends keyof DallEChatOptions>(id: string, key: K, value: DallEChatOptions[K]) {
      const index = this.getChatInfoIndex(id);
      if (index < 0) return;
      const chatInfo = this.chatList[index];
      if (chatInfo.chatType !== ChatType.DALL_E) return;
      (chatInfo.options as DallEChatOptions)[key] = value;
    },
    setChatOptions<K extends keyof ChatOptions>(id: string, key: K, value: ChatOptions[K]) {
      const index = this.getChatInfoIndex(id);
      if (index < 0) return;
      this.chatList[index].options[key] = value;
    },
    addChat(chatInfo: ChatInfoTypes) {
      chatInfo.id = uuidv4();
      this.chatList.push(chatInfo);
      useChatTabsStore().addDefaultChatTab(chatInfo.id);
    },
    deleteChat(id: string) {
      const index = this.getChatInfoIndex(id);
      if (index < 0) return;
      this.chatList.splice(index, 1);
      useChatTabsStore().removeChatTabs(id);
    },
    getChatInfoIndex(chatInfo: ChatInfoTypes | string): number {
      const chatInfoId: string = typeof chatInfo !== "string" ? chatInfo.id : chatInfo;
      return this.chatList.findIndex((chat: ChatInfoTypes): boolean => chat.id === chatInfoId);
    },
    removeChat(id: string) {
      const index = this.getChatInfoIndex(id);
      if (index < 0) return;
      this.chatList.splice(index, 1);
    },
    updateChat(id: string, newChatInfo: ChatInfoTypes) {
      const index = this.getChatInfoIndex(id);
      if (index < 0) return;
      this.chatList[index] = newChatInfo;
    },
    setChatName(id: string, name: string) {
      const index = this.getChatInfoIndex(id);
      if (index < 0) return;
      this.chatList[index].name = name;
    },
    moveChat(direction: "up" | "down", id: string, size: number) {
      const index = this.getChatInfoIndex(id);
      if (index < 0) return;
      const chat = this.chatList[index];
      this.chatList.splice(index, 1);
      switch (direction) {
        case "up":
          this.chatList.splice(index - size, 0, chat);
          break;
        case "down":
          this.chatList.splice(index + size, 0, chat);
          break;
      }
    },
    getPrevChatInfo(chatInfo: ChatInfoTypes): ChatInfoTypes | null {
      const index = this.getChatInfoIndex(chatInfo);
      if (index <= 0) return null;
      return this.chatList[index - 1];
    },
    getNextChatInfo(chatInfo: ChatInfoTypes): ChatInfoTypes | null {
      const index = this.getChatInfoIndex(chatInfo);
      if (index < 0 || index >= this.chatList.length - 1) return null;
      return this.chatList[index + 1];
    },
    getSwitchChatInfo(chatInfo: ChatInfoTypes): ChatInfoTypes {
      const index = this.getChatInfoIndex(chatInfo);
      if (index < 0 || index >= this.chatList.length - 1) return this.chatList[0];
      return this.chatList[index + 1];
    },
  },
  persist: {
    key: "ChatList",
  },
});