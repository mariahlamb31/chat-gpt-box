<script setup lang="ts">
import {EllipsisOutlined} from "@ant-design/icons-vue";
import router from "@/router/Router.ts";
import {ElMessageBox} from "element-plus";
import {useChatListStore} from "@/store/ChatListStore.ts";
import {ChatInfo, ChatType} from "@/types/chat/ChatInfo.ts";
import {onMounted, ref} from "vue";
import {GoogleGeminiConfig, OpenAiChatGptConfig, OpenAiDallEConfig} from "@/types/chat/BaseConfig.ts";
import {Avatar, Factory, IAvatarProps} from "vue3-avataaars";

type Props = {
  chatInfo: ChatInfo | null,
  activeChatInfo: ChatInfo | null,
  drag: boolean
}

const props = withDefaults(defineProps<Props>(), {
  chatInfo: null,
  activeChatInfo: null,
  drag: false,
});
const modelName = ref("");
const avatarInfo = ref<IAvatarProps>(Factory());
onMounted(() => {
  if (!props.chatInfo) {
    modelName.value = "NONE";
    return;
  }
  switch (props.chatInfo.chatType) {
    case ChatType.CHAT_GPT:
      modelName.value = (props.chatInfo.options as OpenAiChatGptConfig).model;
      break;
    case ChatType.DALL_E:
      modelName.value = (props.chatInfo.options as OpenAiDallEConfig).model;
      break;
    case ChatType.GEMINI:
      modelName.value = (props.chatInfo.options as GoogleGeminiConfig).model;
      break;
  }
  avatarInfo.value = Factory(props.chatInfo.avatar);
});

const editChatClick = (chatInfo: ChatInfo | null) => {
  if (!chatInfo) return;
  router.push({path: `/chat/editor/${chatInfo.id}`});
};

const chatListStore = useChatListStore();
const deleteChatClick = (chatInfo: ChatInfo | null) => {
  if (!chatInfo) return;
  ElMessageBox.confirm(`Are you sure to delete ${chatInfo.name}?`, "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  }).then(() => {
    chatListStore.deleteChat(chatInfo.id);
  }).catch(() => {
  });
};
</script>

<template>
  <div
      class="flex flex-row items-center relative w-full box-border p-2 mb-1 rounded-xl hover:bg-neutral-200 active:bg-neutral-300 dark:hover:bg-neutral-700 dark:active:bg-neutral-600 border dark:border-neutral-900 cursor-pointer"
      :class="{'text-green-500 dark:text-green-400 shadow-md dark:shadow-neutral-900':chatInfo && chatInfo.id === activeChatInfo?.id}"
      @click="$emit('itemClick', chatInfo)"
  >
    <div class="pr-1 flex-1 flex flex-row gap-1 items-center">
      <div class="handle rotate-90" title="Drag to sort" @click.stop>
        <i class="iconfont icon-more" :class="drag?'':'cursor-grab'"/>
      </div>
      <Avatar class="w-8 h-8 rounded-full bg-gray-500 mr-2" v-bind="avatarInfo"/>
      <div class="flex-1 text-md leading-8 select-none overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[12rem]">
        {{ chatInfo?.name }}
      </div>
    </div>
    <el-popover overlayClassName="robot-editor-popover" placement="bottom" trigger="hover">
      <template #default>
        <div class="p-2 m-0">
          <div
              class="cursor-pointer rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 leading-6 box-border py-1 px-2 mb-1"
              @click.stop="editChatClick(chatInfo)"
          >
            {{ $t("chat.editChat.title") }}
          </div>
          <div
              class="cursor-pointer rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 leading-6 box-border py-1 px-2"
              @click.stop="deleteChatClick(chatInfo)"
          >
            {{ $t("chat.deleteChat.title") }}
          </div>
        </div>
      </template>
      <template #reference>
        <div
            class="robot-control-button flex justify-center items-center hover:bg-neutral-300 dark:hover:bg-neutral-600 w-6 h-6 rounded-md"
            @click.stop=""
        >
          <ellipsis-outlined/>
        </div>
      </template>
    </el-popover>
  </div>
</template>