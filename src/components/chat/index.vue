<template>
  <el-container class="container">
    <el-header class="container-title">聊天界面</el-header>
    <el-container>
      <!-- <el-aside class="container-menu"></el-aside> -->
      <el-container>
        <el-main class="container-main">
          <div class="containMain" ref="containMain">
            <div class="backdrop" v-for="item in state.items" :key="item.id">
              <div><a class="title">{{ item.text }}</a></div>
              <hr> <!-- 添加一条分界线 -->
              <!-- <div class="divider"></div> -->
              <div ref="child">
                <div v-if="item.showChild" style="margin-top: 25px;">
                  <a style="color:red;">{{ item.warnText }}</a>
                </div>
                <div v-if="item.showImage" style="margin-top: 25px;">
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
            @keydown.ctrl.enter="sendQue()" :disabled="isDisabled" :resize="'none'"
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
const autoScroll = () => {
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

localStorage.setItem('uid', uuid());

/**
 * 请求查询接口
 */
const sendQue = async () => {
  // 获取缓存中的uuid
  let uid: string | null = localStorage.getItem('uid');
  if (uid == null) {
    ElMessage.success("获取缓存中的uuid失败！");
    return;
  }
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
  state.items = [...state.items] // 强制更新
  // 建立连接
  const eventSource = new EventSourcePolyfill('http://www.dongpl.com:8000/createSse', {
    headers: { 'uid': uid },
    heartbeatTimeout: 60000
  });
  // 打开连接
  eventSource.onopen = (event) => {
    console.log("开始输出后端返回值", event);
    ////////////////////////////////// 发送提问chat请求 /////////////////////////////////
    if (uid == null) {
      ElMessage.success("获取缓存中的uuid失败！");
      isDisabled.value = false; // 重新启用(输入框/发送按钮)
      (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
      return;
    }
    chatApi({ msg: inputMsg }, uid).then(async res => {
      console.log('chatApi响应结果', res);
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
      event.target.close(); // 关闭sse连接
      isDisabled.value = false; // 重新启用(输入框/发送按钮)
      (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
    })
    ////////////////////////////////// 发送提问chat请求 /////////////////////////////////
  };
  // 发送消息
  eventSource.onmessage = (event) => {
    console.log('onmessage', event);
    // const item = state.items.at(state.items.length - 1);
    if (event.lastEventId == "[DONE]") {
      event.target.close(); // 关闭sse连接
      state.items = [...state.items] // 强制更新
      autoScroll() // 自动滚动
      isDisabled.value = false; // 重新启用(输入框/发送按钮)
      (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
      return;
    }
    let json_data = JSON.parse(event.data)
    if (json_data.content == null || json_data.content == 'null') {
      return;
    }
    if (event.lastEventId == '' && json_data.content.includes('https')) {
      newItem.imageUrl = new URL(json_data.content, import.meta.url).href;
      newItem.showImage = true;
      state.items = [...state.items] // 强制更新
      autoScroll() // 自动滚动
      return;
    }
    // (item as Item).showMarkdown = true;
    // (item as Item).childText += json_data.content;
    newItem.showMarkdown = true;
    newItem.childText += json_data.content;
    state.items = [...state.items] // 强制更新
    autoScroll() // 自动滚动
  };
  // 报错时触发函数
  eventSource.onerror = async (event) => {
    console.log("onerror", event);
    newItem.showChild = true;
    const errorMsg = '网络异常，创建连接失败，请再次尝试!';
    for (let i = 0; i < errorMsg.length; i++) {
      newItem.warnText += errorMsg[i];
      await sleep(10);
    }
    state.items = [...state.items] // 强制更新
    event.target.close();
    isDisabled.value = false; // 重新启用(输入框/发送按钮)
    (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
  };
  // 监听函数
  // eventSource.addEventListener("customEventName", (event) => {
  //   console.log("Message id is " + event);
  // });
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

.divider {
  position: relative;
  height: 20px;
  margin: 20px 0;
}

.divider::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23f8f9fa' fill-opacity='1' d='M0,192L60,208C120,224,240,256,360,256C480,256,600,224,720,192C840,160,960,128,1080,138.7C1200,149,1320,203,1380,229.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: cover;
  z-index: -1;
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

.backdrop {
  width: 90%;
  border-radius: 15px;
  backdrop-filter: blur(20px);
  color: #fff;
  box-shadow: 0 0 30px 10px rgba(0, 0, 0, 0.3);
  margin: 30px auto;
  padding: 15px;
}

.title {
  color: #008000;
  font-size: 24px;
  font-weight: bold;
}

.comtainer-footer {
  background-color: #2D333B;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid;
}
</style>