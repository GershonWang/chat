<template>
  <el-container class="container">
    <el-header class="container-title">ChatGPT(G版)</el-header>
    <el-container>
      <el-aside class="container-menu"></el-aside>
      <el-container>
        <el-main class="container-main">
          <div class="containMain" ref="containMain">
            <div class="backdrop" v-for="item in state.items" :key="item.id">
              <div class="titleDiv" @mouseover="item.showTip = true;" @mouseout="item.showTip = false;">
                <a class="title">{{ item.text }}</a>
              </div>
              <div class="tooltip" v-if="item.showTip">{{ item.text }}</div>
              <!-- <hr> 添加一条分界线 -->
              <el-divider>
                <el-icon><star-filled /></el-icon>
              </el-divider>
              <div ref="child">
                <div v-if="item.showChild" style="margin-top: 25px;">
                  <a style="color:red;">{{ item.warnText }}</a>
                </div>
                <div v-if="item.showImage" style="margin-top: 25px;">
                  <img :src="item.imageUrl" @click="isShowImage(item.imageUrl)" style="width: 300px;">
                </div>
                <div v-if="item.showMarkdown">
                  <MarkdownRenderer :markdown="item.childText"></MarkdownRenderer>
                </div>
              </div>
            </div>
            <big-img v-if="showImg" @click="showImg = false" :imgSrc="bigImgSrc"></big-img>
          </div>
        </el-main>
        <el-footer class="comtainer-footer">
          <el-input ref="textareaRef" v-model="textarea" :rows="2" type="textarea" placeholder="请输入您要咨询的问题..."
            @keydown.ctrl.enter="sendQue()" :disabled="isDisabled" :resize="'none'"
            input-style="width:600px;background-color:#2D333B;color:white;margin-right: 30px;" />
          <el-button type="success" @click="sendQue()" :disabled="isDisabled"
            style="color: white;font-weight: bold;background-color: blueviolet;">发送(Ctrl+Enter)</el-button>
          <el-button @click="router.back()">返回登陆</el-button>
          <el-button type="danger" round><a @click="closeApp">关闭程序</a></el-button>
        </el-footer>
      </el-container>
      <el-aside class="container-menu"></el-aside>
    </el-container>
    <div class="bottom-title">
      <div class="run-title">
        本作者是后台开发从业者，前端页面是一边学习一边开发，如有不足之处，敬请提<a href="https://github.com/GershonWang/chat/issues"
          target="_blank">issue</a>，作者尽能力改善！！
      </div>
    </div>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Ref, reactive, ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { StarFilled } from '@element-plus/icons-vue'
import { ipcRenderer } from 'electron'
import { EventSourcePolyfill } from "event-source-polyfill";
import { chatApi } from '@/api/chat'
import MarkdownRenderer from '@/renderer/MarkdownRenderer.vue';
import BigImg from '@/renderer/ImageViewRenderer.vue'

const router = useRouter();

interface Item {
  id: number;
  text: string;
  showTip: boolean;
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
const containMain = ref<InstanceType<typeof HTMLElement>>()
const textareaRef: Ref<HTMLElement | null> = ref(null)
const child: Ref<HTMLElement | null> = ref(null)
const showImg: Ref<boolean> = ref(false)
const bigImgSrc: Ref<string> = ref('')

const state: State = reactive<State>({
  items: []
});

let itemId = 1;

/**
 * 自动滚动
 */
const autoScroll = () => {
  // 获取dom元素的高度并赋值给scrollTop,实现滚动条移动到最底部
  const contain = containMain.value as unknown as HTMLElement;
  if(contain != null) {
    contain.scrollTop = contain.scrollHeight;
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

const isShowImage = (imageUrl: string) => {
  showImg.value = true;
  bigImgSrc.value = imageUrl;
}

/**
 * 请求查询接口
 */
const sendQue = async () => {
  /* 1.获取缓存中的uuid,并判断是否为空 */
  let uid: string | null = localStorage.getItem('uid');
  if (uid == null) {
    ElMessage.success("获取缓存中的uuid失败！");
    return;
  }
  console.log("请求chat时获取到的uid", uid);
  /* 2.获取输入框内容,并判断是否为空 */
  let inputMsg = textarea.value;
  if (inputMsg === null || inputMsg === '') {
    ElMessage.success("发送内容不能为空！");
    return;
  }
  textarea.value = '' // 将输入框的内容置空
  isDisabled.value = true; // 禁用(输入框/发送按钮)
  const newItem: Item = {
    id: itemId,
    text: inputMsg,
    showTip: false,
    showChild: false,
    warnText: '',
    showImage: false,
    imageUrl: '',
    showMarkdown: false,
    childText: ''
  };
  state.items.push(newItem)
  state.items = [...state.items] // 强制更新

  nextTick(() => {
    autoScroll() // 自动滚动
  });

  itemId++; // itemId加1
  /* 3.建立SSE网络连接,并将缓存中的uid传入请求头 */
  const eventSource = new EventSourcePolyfill(import.meta.env.VITE_BASE_URL + '/createSse', {
    headers: { 'uid': uid },
    heartbeatTimeout: 60000
  });
  /* 3.1 打开连接 */
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
        state.items = [...state.items] // 强制更新
        autoScroll() // 自动滚动
        await sleep(10);
      }
      event.target.close(); // 关闭sse连接
      isDisabled.value = false; // 重新启用(输入框/发送按钮)
      (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
    })
    ////////////////////////////////// 发送提问chat请求 /////////////////////////////////
  };
  /* 3.2 发送消息 */
  eventSource.onmessage = (event) => {
    // console.log('onmessage', event);
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
      state.items = [...state.items] // 强制更新
      autoScroll() // 自动滚动
      await sleep(10);
    }
    event.target.close();
    isDisabled.value = false; // 重新启用(输入框/发送按钮)
    (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
  };
}

/**
 * 关闭程序
 */
const closeApp = () => {
  ipcRenderer.send('close-app');
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}

.container-title {
  background-color: #2D333B;
  font-size: 24px;
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

.backdrop {
  width: 90%;
  border-radius: 15px;
  backdrop-filter: blur(20px);
  color: #fff;
  box-shadow: 0 0 30px 10px rgba(0, 0, 0, 0.3);
  margin: 30px auto;
  padding: 15px;
}

.titleDiv {
  white-space: nowrap;
  /* 防止文字换行 */
  overflow: hidden;
  /* 超出宽度部分隐藏 */
  text-overflow: ellipsis;
  /* 超出宽度部分显示省略号 */
}

.title {
  color: #008000;
  font-size: 18px;
  font-weight: bold;
}

.tooltip {
  position: absolute;
  width: 95%;
  background-color: white;
  font-weight: bold;
  color: #000;
  border-radius: 15px;
  z-index: 99;
  padding: 5px 10px;
  overflow-wrap: break-word;
}

.comtainer-footer {
  background-color: #2D333B;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid;
}

.bottom-title {
  border: solid;
  padding: 5px;
  width: 99%;
  height: 24px;
  overflow: hidden;
}

.run-title {
  animation: scroll 50s linear infinite;
  display: inline-block;
  text-align: left;
  width: max-content;
}

.run-title:hover {
  animation-play-state: paused;
}

.run-title:not(:hover) {
  animation-play-state: running;
}

@keyframes scroll {
  0% {
    transform: translateX(180%);
  }

  100% {
    transform: translateX(-180%);
  }
}
</style>