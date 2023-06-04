<template>
  <el-container class="container">
    <el-header class="container-title">聊天界面</el-header>
    <el-container>
      <!-- <el-aside class="container-menu"></el-aside> -->
      <el-container>
        <el-main class="container-main">
          <div class="containMain" ref="containMain">
            <div style="text-align: center;">
              <el-image src="../../../public/logo.svg" style="height: 100px;"></el-image>
            </div>
            <div v-for="item in state.items" :key="item.id">
              <div><a style="color:#008000;font-size:24px;font-weight:bold;">{{ item.text }}</a></div>
              <div ref="child">
                <div v-if="item.showChild"><a style="color:red;">{{ item.warnText }}</a></div>
                <div v-if="item.showImage">
                  <ImageViewRenderer :url="item.imageUrl"></ImageViewRenderer>
                </div>
                <div v-if="item.showMarkdown">
                  <MarkdownRenderer :markdown="item.childText"></MarkdownRenderer>
                </div>
              </div>
            </div>
          </div>
        </el-main>
        <el-footer class="comtainer-footer">
          <el-input ref="textareaRef" v-model="textarea" :rows="2" type="textarea" placeholder="请输入您要咨询的问题..."
            @keydown.ctrl.enter="sendQue()" :disabled="isDisabled"
            input-style="width:600px;background-color:#2D333B;color:white;font-weight:bold;margin-right: 30px;" />
          <el-button type="success" @click="sendQue()" :disabled="isDisabled"
            style="color: white;font-weight: bold;background-color: blueviolet;">发送(Ctrl+Enter)</el-button>
          <el-button @click="router.back()">返回登陆</el-button>
        </el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Ref, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { EventSourcePolyfill } from "event-source-polyfill";
import { chatApi } from '@/api/chat'
import MarkdownRenderer from '@/renderer/MarkdownRenderer.vue';
import ImageViewRenderer from '@/renderer/ImageViewRenderer.vue'

const router = useRouter();

interface Item {
  id: number;
  text: string;
  showChild: boolean;
  warnText: string;
  showImage: boolean;
  imageUrl: string;
  showMarkdown: boolean;
  childText: string;
}

interface State {
  items: Item[];
}

const textarea: Ref<string> = ref('')
const hisMessage: Ref<string> = ref('')
const isDisabled: Ref<boolean> = ref(false)
const containMain: Ref<HTMLElement | null> = ref(null)
const textareaRef: Ref<HTMLElement | null> = ref(null);
const child: Ref<HTMLElement | null> = ref(null);
const state: State = reactive<State>({
  items: []
});

let itemId = 1;

/**
 * 自动滚动
 */
const autoScroll =  () => {
  if (containMain.value != null) {
    // 获取dom元素的高度并赋值给scrollTop,实现滚动条移动到最底部
    (containMain.value as unknown as HTMLElement).scrollTop = (containMain.value as unknown as HTMLElement).scrollHeight;
  }
}

/**
 * 沉睡time时长
 * @param time 时长
 */
const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

/**
 * 获取随机数
 */
const uuid = () => {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";
  s[8] = s[13] = s[18] = s[23] = "-";
  var uuid = s.join("");
  return uuid;
}

/**
 * 同步历史数据到界面中
 */
// const syncHisData = async () => {
//   // 将长度小于等于2000的缓存数据重新展示到页面上
//   const textBody = window.localStorage.getItem('textBody');
//   if (textBody && textBody.length <= 2000) {
//     text.value += textBody;
//     text.value += '------------- <a style="color:#A8ABB2;font-size:12px;">';
//     const oldTitle = '以上为历史数据';
//     for (let index = 0; index < oldTitle.length; index++) {
//       text.value += oldTitle[index];
//       autoScroll(containMain);
//       await sleep(10);
//     }
//     text.value += '</a> -------------\n\n'
//   }
// }
// 同步历史数据到界面中
// syncHisData();

/**
 * 请求查询接口
 */
const sendQue = async () => {
  // 每次跳转到聊天界面，重新刷新一次uuid
  let uid = uuid();
  console.log("请求chat时获取到的uid", uid);
  // 获取输入框内容
  let inputMsg = textarea.value;
  if (inputMsg === null || inputMsg === '') {
    ElMessage.success("发送内容不能为空！");
    return;
  }
  textarea.value = ''
  // 禁用(输入框/发送按钮)
  isDisabled.value = true;
  // 预打印输入参数
  if (hisMessage.value != null && hisMessage.value != '') {
    hisMessage.value += ' --- \n\n';
  }
  const newItem: Item = {
    id: itemId,
    text: inputMsg,
    showChild: false,
    warnText: '',
    showImage: false,
    imageUrl: '',
    showMarkdown: false,
    childText: ''
  };
  state.items.push(newItem)
  itemId++;
  // 记录问题到缓存
  hisMessage.value += inputMsg;
  state.items = [...state.items] // 强制更新
  // 创建sse对象
  let sse: EventSource | undefined;
  // 建立连接
  const eventSource = new EventSourcePolyfill('http://www.dongpl.com:8000/createSse', {
    headers: { 'uid': uid },
    heartbeatTimeout: 60000
  });
  // 打开连接
  eventSource.onopen = (event) => {
    console.log("开始输出后端返回值");
    sse = event.target;
    ////////////////////////////////// 发送提问chat请求 /////////////////////////////////
    chatApi({ msg: inputMsg }, uid).then(async res => {
      console.log('chatApi响应结果', res);
      const question_tokens = res.data.question_tokens;
      const imageurl = res.data.imageUrl;
      if (question_tokens == '0' && imageurl != null) {
        newItem.imageUrl = new URL(imageurl, import.meta.url).href;
        newItem.showImage = true;
        autoScroll() // 自动滚动
        state.items = [...state.items] // 强制更新
        isDisabled.value = false; // 重新启用(输入框/发送按钮)
        (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
      }
    }).catch(async res => {
      console.log('接口报错打印', res)
      newItem.showChild = true;
      const errorMsg = '网络请求异常，请再次尝试!';
      for (let i = 0; i < errorMsg.length; i++) {
        newItem.warnText += errorMsg[i];
        await sleep(10);
      }
      state.items = [...state.items] // 强制更新
      autoScroll() // 自动滚动
      isDisabled.value = false; // 重新启用(输入框/发送按钮)
      (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
    })
    ////////////////////////////////// 发送提问chat请求 /////////////////////////////////
  };
  // 发送消息
  eventSource.onmessage = (event) => {
    const item = state.items.at(state.items.length - 1);
    // if (event.lastEventId == "[TOKENS]") {
    //   text.value += event.data;
    //   return;
    // }
    if (event.data == "[DONE]") {
      // console.log('hisMessage', hisMessage.value);
      if (sse) {
        sse.close();
      }
      // 重新启用(输入框/发送按钮)
      isDisabled.value = false;
      // 输入框获取焦点
      (textareaRef.value as HTMLElement).focus();
      // 将数据记录到localStorage
      // window.localStorage.setItem('textBody', text.value);
    }
    let json_data = JSON.parse(event.data)
    if (json_data.content == null || json_data.content == 'null') {
      return;
    }
    (item as Item).showMarkdown = true;
    (item as Item).childText += json_data.content;
    state.items = [...state.items] // 强制更新
    autoScroll() // 自动滚动
    hisMessage.value += json_data.content;
  };
  // 报错时触发函数
  eventSource.onerror = async (event) => {
    console.log("onerror", event);
    event.target.close();
  };
  // 监听函数
  eventSource.addEventListener("customEventName", (event) => {
    console.log("Message id is " + event);
  });
  eventSource.addEventListener("error", (event) => {
    console.log("error Message id is ",event);
  });
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}

.container-title {
  background-color: #2D333B;
  font-size: 32px;
  font-weight: bold;
  line-height: var(--el-header-height);
}

.container-menu {
  width: 15%;
  border: solid;
  text-align: left;
}

.container-main {
  background-color: #242424;
  height: 340px;
  text-align: left;
  border: solid;
  padding-right: 5px;
}

.containMain {
  height: 100%;
  overflow: auto;
  padding-right: 20px;
}

.comtainer-footer {
  background-color: #2D333B;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid;
}
</style>