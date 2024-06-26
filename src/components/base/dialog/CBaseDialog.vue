<script setup lang="ts">
import CDialog from "@/components/base/dialog/CDialog.vue";
import {getCurrentInstance, ref} from "vue";
import {ShowOption} from "@/types/base/CSettingDialog.ts";

const dialogOptions = ref<ShowOption>({
  type: "input",
  title: "None",
  content: "",
});
const defaultOption: ShowOption = {
  type: "input",
  title: "None",
  description: "",
  placeholder: "",
  content: "",
  inputOptions: {
    type: "text",
    min: 0,
    max: 0,
    size: "small",
  },
  expandButtons: [],
};

const showDialog = ref(false);
let resolveFunc: ((value: string | number | PromiseLike<string | number>) => void) | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rejectFunc: ((reason?: any) => void) | null = null;
const show = (option: ShowOption): Promise<string | number> => {
  dialogOptions.value = {
    ...defaultOption,
    ...option,
  };
  showDialog.value = true;
  return new Promise<string | number>((resolve, reject) => {
    resolveFunc = resolve;
    rejectFunc = reject;
  });
};
const hide = () => {
  showDialog.value = false;
};
defineExpose({
  show,
  hide,
});

const instance = getCurrentInstance();
const ok = () => {
  if (!instance) return;
  instance.emit("okClick");
  if (!resolveFunc) return;
  resolveFunc(dialogOptions.value.content);
};
const cancel = () => {
  if (!instance || !rejectFunc) return;
  showDialog.value = false;
  instance.emit("cancelClick");
  rejectFunc();
};
const expandClick = (key: string) => {
  if (!instance) return;
  instance.emit("expand-click", dialogOptions.value.content, key);
};

defineEmits(["okClick", "cancelClick", "expandClick"]);
</script>

<template>
  <CDialog
      v-model:visible="showDialog"
      :title="dialogOptions.title"
      :description="dialogOptions.description"
      :expand-buttons="dialogOptions.expandButtons"
      @cancelClick="cancel"
      @okClick="ok()"
      @expand-click="expandClick"
  >
    <div class="px-2 w-full">
      <el-input
          v-if="dialogOptions.type === 'input'"
          v-model="dialogOptions.content"
          :type="dialogOptions.inputOptions?.type??'text'"
          :min="dialogOptions.inputOptions?.min"
          :max="dialogOptions.inputOptions?.max"
          :placeholder="dialogOptions.placeholder"
      />
      <el-slider
          v-else-if="dialogOptions.type === 'slider'"
          v-model="dialogOptions.content"
          :min="dialogOptions.sliderOptions?.min"
          :max="dialogOptions.sliderOptions?.max"
          :step="dialogOptions.sliderOptions?.step"
          show-input
          size="small"
      />
      <el-select v-else-if="dialogOptions.type === 'select'" v-model="dialogOptions.content">
        <el-option
            v-for="item in dialogOptions.selectOptions?.list"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </div>
  </CDialog>
</template>
