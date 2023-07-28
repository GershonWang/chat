<template>
  <el-container class="container">
    <el-header class="container-title">ChatGPT(G版)</el-header>
    <el-container>
       <el-aside class="container-left-menu">
         <h2 style="text-align: center;">历史问题</h2>
         <div class="compare-container">
           <div class="compare" v-for="questionItem in questionItems" @click="reWriteQues(questionItem.text)">
             <a>{{questionItem.text}}</a>
           </div>
         </div>
       </el-aside>
      <el-container class="container-center-main">
        <el-main class="container-main">
          <div class="containMain" ref="containMainRef">
            <div class="backdrop" v-for="item in state.items" :key="item.id">
              <div class="titleDiv" @mouseover="item.showTip = true;" @mouseout="item.showTip = false;">
                <a class="title">{{ item.title }}</a>
              </div>
              <div class="tooltip" v-if="item.showTip">{{ item.title }}</div>
              <!-- <hr> 添加一条分界线 -->
              <el-divider><el-icon><star-filled /></el-icon></el-divider>
              <div v-if="item.showImage" style="margin-top: 25px;">
                <img :src="item.imageUrl" @click="isShowImage(item.imageUrl)" style="width: 300px;" alt="">
              </div>
              <div v-if="item.showMarkdown">
                <MarkdownRenderer :markdown="item.markdownText" :num="item.id"></MarkdownRenderer>
              </div>
            </div>
            <big-img v-if="showImg" @click="showImg = false" :imgSrc="bigImgSrc"></big-img>
          </div>
        </el-main>
        <el-footer class="container-footer">
          <el-input ref="textareaRef" v-model="textarea" :rows="2" type="textarea" placeholder="请输入您要咨询的问题..."
            @keydown.ctrl.enter="sendQue()" :disabled="isDisabled" :resize="'none'"
            input-style="width:600px;background-color:#2D333B;color:white;margin-right: 30px;" />
          <el-button type="success" @click="sendQue" :disabled="isDisabled"
            style="color: white;font-weight: bold;background-color: blueviolet;">发送(Ctrl+Enter)</el-button>
          <el-button type="danger" @click="stopSend" :disabled="isStopDisabled" style="color: white;font-weight: bold;">停止发送</el-button>
          <el-button @click="reset()" style="color: black;font-weight: bold;">清空</el-button>
        </el-footer>
      </el-container>
      <el-aside class="container-right-menu">
        <div class="bottom-button">
          <el-button @click="router.back()">返回登陆</el-button>
          <el-button type="success"><router-link to="/demo">测试demo</router-link></el-button>
          <el-button type="success"><router-link to="/helloWorld">测试helloWorld</router-link></el-button>
          <el-button type="success"><router-link to="/test_mark">测试test_mark</router-link></el-button>
          <el-button type="danger" round><a @click="closeApp">关闭程序</a></el-button>
        </div>
      </el-aside>
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
import {useRouter} from 'vue-router'
import {nextTick, reactive, ref, Ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {StarFilled} from '@element-plus/icons-vue'
import {EventSourcePolyfill} from "event-source-polyfill";
import {chatApi, closeChatApi} from '@/api/chat'
import {setAPIKeyApi} from '@/api/config'
import MarkdownRenderer from '@/renderer/MarkdownRenderer.vue';
import BigImg from '@/renderer/ImageViewRenderer.vue'
import {ipcRenderer, shell} from "electron";

const router = useRouter();
const textarea: Ref<string> = ref('')
const isDisabled: Ref<boolean> = ref(false)
const isStopDisabled: Ref<boolean> = ref(true)
const containMainRef = ref<InstanceType<typeof HTMLElement>>()
const textareaRef = ref<InstanceType<typeof HTMLElement>>()
const showImg: Ref<boolean> = ref(false)
const bigImgSrc: Ref<string> = ref('')

interface Item {
  id: number;
  title: string;
  showTip: boolean;
  showImage: boolean;
  imageUrl: string;
  showMarkdown: boolean;
  markdownText: string;
}

interface State {
  items: Item[];
}

const state: State = reactive<State>({
  items: []
});

const questionItems = ref([]);

// 获取登陆token
let localToken = localStorage.getItem('token');
// 获取apikey
let localApikey = localStorage.getItem('apikey');
// 获取username
let localUsername = localStorage.getItem('username');
// 获取uid
let localUid = localStorage.getItem('uid');
// 初始化卡片序号
let itemId = 1;

/**
 * 自动滚动
 */
function autoScroll() {
  const contain = containMainRef.value as unknown as HTMLElement;
  if ("scrollTop" in contain) {
    contain.scrollTop = contain.scrollHeight;
  }
}

/**
 * 设置apiKey
 */
function setAPIKey() {
  if(localApikey != null) return;
  ElMessageBox.prompt('请输入openai的apiKey', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /sk-[0-9a-zA-Z]{48}?/,
    inputErrorMessage: 'apiKey格式错误',
  }).then(({ value }) => {
    if(localUsername == null) return;
    setAPIKeyApi({ username: localUsername, apikey: value }).then(_res => {
      localStorage.setItem('apikey',value);
      localApikey = value;
      ElMessage({
        type: 'success',
        message: `您输入的apiKey是:${value}`,
      })
    }).catch(res => {
      console.log("请求设置apikey报错",res);
    })
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '请输入apiKey才能继续使用',
    })
  })
}

/**
 * 获取随机数
 */
function uuid() {
  const array = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    const number = Math.floor(Math.random() * 0x10);
    array[i] = hexDigits.slice(number,number + 1);
  }
  array[14] = "4";
  array[8] = array[13] = array[18] = array[23] = "-";
  return array.join("");
}

/**
 * 初始化加载
 */
setAPIKey();
/**
 * 初始化设置uid
 */
localStorage.setItem('uid', uuid());
localUid = localStorage.getItem('uid');

/**
 * 是否大图显示图片
 * @param imageUrl 图片地址
 */
function isShowImage(imageUrl: string) {
  showImg.value = true;
  bigImgSrc.value = imageUrl;
}

/**
 * 请求查询接口
 */
 async function sendQue() {
  /* 1.校验token */
  if(localToken == null) {
    router.back();
    ElMessage.error("token丢失，返回登陆界面！");
    return;
  }
  /* 2.校验apiKey是否存在，当不存在时重新输入，否则无法使用 */
  setAPIKey();
  /* 3.校验localApikey为空就返回 */
  if (localApikey == null) {
    ElMessage.warning("获取缓存中的apikey失败！")
    return;
  }
  /* 4.获取缓存中的uuid,并判断是否为空 */
  if (localUid == null) {
    ElMessage.warning("获取缓存中的uuid失败！");
    return;
  }
  /* 5.获取输入框内容,并判断是否为空 */
  let inputMsg = textarea.value;
  if (inputMsg == null || inputMsg === '') {
    ElMessage.warning("发送内容不能为空！");
    return;
  }
  /* 6.初始化一些属性参数 */
  // 6.1 将输入框的内容置空
  textarea.value = '';
  // 6.2 禁用(输入框/发送按钮)
  isDisabled.value = true; 
  // 6.3 创建卡片默认属性对象
  const newItem: Item = {
    id: itemId,
    title: inputMsg,
    showTip: false,
    showImage: false,
    imageUrl: '',
    showMarkdown: false,
    markdownText: ''
  };
  // 6.4 将对象导入数组中
  state.items.push(newItem)
  // 6.5 强制更新
  state.items = [...state.items] 
  // 6.6 自动滚动
  await nextTick(() => {
    autoScroll()
  });
  // 6.7 itemId加1
  itemId++; 
  // 6.8 左侧菜单追加问题内容
  const questionItem = {
    text: inputMsg
  }
  questionItems.value.push(questionItem)

  /* 7.建立SSE网络连接,并将缓存中的uid传入请求头 */
  const eventSource = new EventSourcePolyfill(import.meta.env.VITE_BASE_URL + '/createSse', {
    headers: { 'uid': localUid },
    heartbeatTimeout: 60000
  });
  /* 8. 打开连接 */
  eventSource.onopen = (event) => {
    // 启用停止按钮
    isStopDisabled.value = false 
    // 发送提问chat请求
    chatApi({ msg: inputMsg }, localUid).catch(() => {
      ElMessage.error('网络请求异常，请再次尝试!');
      event.target.close(); // 关闭sse连接
      isDisabled.value = false; // 重新启用(输入框/发送按钮)
      isStopDisabled.value = true; // 禁用停止按钮
      (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
    })
  }
  /* 9. 发送消息 */
  eventSource.onmessage = async (event) => {
    if (event.lastEventId == "[IMG]") {
      newItem.imageUrl = new URL(event.data, import.meta.url).href;
      newItem.showImage = true;
      // 强制更新
      state.items = [...state.items] 
      // 自动滚动
      await nextTick(() => {
        autoScroll()
      });
      return;
    }
    // 获取token
    if (event.lastEventId == "[TOKENS]") {
      newItem.markdownText += event.data;
      // 强制更新
      state.items = [...state.items]
      // 自动滚动
      await nextTick(() => {
        autoScroll()
      });
      return;
    }
    // 判断结尾
    if (event.lastEventId == "[DONE]") {
      newItem.markdownText += event.data;
      const lastIndex = newItem.markdownText.lastIndexOf(event.data);
      newItem.markdownText = newItem.markdownText.substring(0,lastIndex) + "（BPE）";
      // 关闭sse连接
      event.target.close()
      // 强制更新
      state.items = [...state.items]
      // 自动滚动
      await nextTick(() => {
        autoScroll()
      })
      isDisabled.value = false; // 重新启用(输入框/发送按钮)
      isStopDisabled.value = true; // 禁用停止按钮
      (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
      return
    }
    let json_data = JSON.parse(event.data)
    if (json_data.content == null || json_data.content == "null") {
      return
    }
    newItem.showMarkdown = true;
    newItem.markdownText += json_data.content;
    // 强制更新
    state.items = [...state.items]
    // 自动滚动
    await nextTick(() => {
      autoScroll()
    })
  };
  // 10. 报错时触发函数
  eventSource.onerror = async (event) => {
    console.log("onerror", event);
    ElMessage.error('网络异常，请稍后再次尝试!');
    event.target.close();
    isDisabled.value = false; // 重新启用(输入框/发送按钮)
    isStopDisabled.value = true; // 禁用停止按钮
    (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
  };
}

/**
 * 关闭正在进行中的会话
 */
function stopSend() {
  /* 1.获取缓存中的uuid,并判断是否为空 */
  if (localUid == null) {
    ElMessage.success("获取缓存中的uuid失败！");
    return;
  }
  console.log("请求关闭会话时获取到的uid", localUid);
  closeChatApi(localUid);
}

/**
 * 重置uuid以及数据
 */
 function reset() {
  localStorage.setItem('uid', uuid());
  localUid = localStorage.getItem('uid');
  state.items = [];
  itemId = 1;
}

function reWriteQues(questionMsg) {
  textarea.value = questionMsg;
  (textareaRef.value as HTMLElement).focus(); // 输入框获取焦点
}

/**
 * 添加监听
 */
document.addEventListener('click', (event: MouseEvent) => {
  if (event.target != null) {
    const target = event.target as HTMLAnchorElement;
    if (target.tagName === 'A' && target.href.startsWith('http') && target.href.startsWith('https')) {
      event.preventDefault()
      shell.openExternal(target.href)
    }
  }
})
/**
 * 发送信息到主线程执行关闭程序
 */
const closeApp = () => {
  ipcRenderer.send('close-app');
}
</script>

<style scoped>
/******************** 整体宽高 ********************/
.container {
  width: 100%;
  height: 100%;
}
/********************* 标题栏 *********************/
.container-title {
  background-color: #2D333B;
  font-size: 24px;
  font-weight: bold;
  line-height: var(--el-header-height);
  display: none;
}
/******************** 左侧菜单 ********************/
.container-left-menu {
  width: 15%;
  border: solid;
  position: relative;
  text-align: left;
}
.compare {
  margin: 10px;
  padding: 5px;
  border-radius: 10px;
  display: flex;
  overflow-wrap: anywhere;
  animation: rainbow 8s infinite;
}
.compare:hover {
  cursor: grabbing;
}
.compare a {
  color: white;
  font-size: 14px;
  font-weight: bold;
}
.compare-container {
  height: 90%;
  overflow: auto;
}
/****************** 中间内容 *****************/
.container-center-main {
  background-color: white;
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
.titleDiv {
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden; /* 超出宽度部分隐藏 */
  text-overflow: ellipsis; /* 超出宽度部分显示省略号 */
}
.title {
  color: #008000;
  font-size: 18px;
  font-weight: bold;
}
.container-footer {
  background-color: #2D333B;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid;
}
/*********************** 右侧菜单 ***********************/
.container-right-menu {
  width: 15%;
  border: solid;
  position: relative;
  text-align: left;
}
.bottom-button {
  position: absolute;
  bottom: 20px;
  text-align: center;
}
.bottom-button button {
  margin-top: 10px;
}
/********************* 底部滚动字幕 *********************/
.bottom-title {
  border: solid;
  padding: 5px;
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
@keyframes rainbow {
  0% { background-color: red; }
  14% { background-color: orange; }
  28% { background-color: yellow; }
  42% { background-color: green; }
  57% { background-color: blue; }
  71% { background-color: indigo; }
  85% { background-color: violet; }
  100% { background-color: red; }
}
</style>