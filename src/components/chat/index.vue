<template>
  <div class="common-layout">
    <el-container class="container">
      <el-header class="container-title">聊天界面</el-header>
      <el-container>
        <!-- <el-aside class="container-menu"></el-aside> -->
        <el-container>
          <el-main class="container-main">
            <div class="containMain" ref="containMain">
              <div class="topic">
                <p style="color:red;">🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟</p>
                <p style="color:red;">🌟 <a style="color: cadetblue;">欢迎使用本chatGPT客户端程序，请在下方输入您要咨询的问题并按回车或者点击发送</a> 🌟</p>
                <p style="color:red;">🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟 🌟</p>
                <br>
              </div>
              <MarkdownRenderer :markdown="text" />
            </div>
          </el-main>
          <el-footer class="comtainer-footer">
            <el-input ref="input_msg" v-model="textarea" :rows="2" type="textarea" placeholder="请输入您要咨询的问题..."
              @keydown.ctrl.enter="sendQue()" :disabled="isDisabled"
              input-style="width:600px;background-color:#2D333B;color:white;font-weight:bold;margin-right: 30px;" />
            <el-button type="success" @click="sendQue()" :disabled="isDisabled"
              style="color: white;font-weight: bold;background-color: blueviolet;">发送(Ctrl+Enter)</el-button>
            <el-button @click="router.back()">返回登陆</el-button>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { EventSourcePolyfill } from "event-source-polyfill";
import axios from 'axios'
import MarkdownRenderer from '../../renderer/MarkdownRenderer.vue';

const router = useRouter();

const text = ref('')
const textarea = ref('')
const isDisabled = ref(false)
const containMain = ref(null)
const input_msg = ref(null)

// 沉睡time时长
const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

const syncHisData = async () => {
  // 将长度小于等于2000的缓存数据重新展示到页面上
  const textBody = window.localStorage.getItem('textBody');
  if (textBody && textBody.length <= 2000) {
    text.value += textBody;
    text.value += '------------- <a style="color:#A8ABB2;font-size:12px;">';
    const oldTitle = '以上为历史数据';
    for (let index = 0; index < oldTitle.length; index++) {
      text.value += oldTitle[index];
      if (containMain.value != null) {
        (containMain.value as unknown as HTMLElement).scrollTop = (containMain.value as unknown as HTMLElement).scrollHeight;
      }
      await sleep(10);
    }
    text.value += '</a> -------------\n\n'
  }
}
// 同步历史数据到界面中
syncHisData();

// 记录请求次数
let requestNum = 0;

/**
 * 获取随机数
 */
function uuid() {
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
 * 建立SSE服务端to客户端通信
 * @param url 请求地址
 * @param uuid_str 要传递的参数
 */
function ssef(url: string, uuid_str: string) {
  // 创建sse对象
  let sse: EventSource | undefined;
  // 建立连接
  const eventSource = new EventSourcePolyfill(url, {
    headers: {
      'uid': uuid_str
    },
    heartbeatTimeout: 60000
  });
  // 打开连接
  eventSource.onopen = (event) => {
    console.log("开始输出后端返回值");
    sse = event.target;
  };
  // 发送消息
  eventSource.onmessage = (event) => {
    if (event.lastEventId == "[TOKENS]") {
      text.value += event.data;
      return;
    }
    if (event.data == "[DONE]") {
      text.value += '\n\n'
      console.log("返回的内容：：", text.value);
      if (sse) {
        sse.close();
      }
      // 重新启用(输入框/发送按钮)
      isDisabled.value = false;
      // 输入框获取焦点
      (input_msg.value as unknown as HTMLElement).focus();
      // 将数据记录到localStorage
      window.localStorage.setItem('textBody', text.value);
      return;
    }
    let json_data = JSON.parse(event.data)
    if (json_data.content == null || json_data.content == 'null') {
      return;
    }
    text.value += json_data.content;
    // 获取dom元素的高度并赋值给scrollTop,实现滚动条移动到最底部
    (containMain.value as unknown as HTMLElement).scrollTop = (containMain.value as unknown as HTMLElement).scrollHeight;
  };
  // 报错时触发函数
  eventSource.onerror = (event) => {
    console.log("onerror", event);
    // 重新启用(输入框/发送按钮)
    isDisabled.value = false;
    // ElMessage.error("服务异常请重试并联系开发者！");
    event.target.close();
  };
  // 监听函数
  eventSource.addEventListener("customEventName", (event) => {
    console.log("Message id is " + event);
  });
}

/**
 * 发送chat请求
 * @param url 请求chat地址
 * @param inputMsg 要请求的参数
 * @param uid 传递的uuid标识
 */
const chatMsg = (url: string, inputMsg: string, uid: string) => {
  const headers = {
    'Content-Type': 'application/json;charset=utf-8',
    'uid': uid
  };
  axios.post(url, JSON.stringify({ msg: inputMsg }), { headers }).then(res => {
    console.log(res);
  }).catch(async res => {
    console.log('接口报错打印', res)
    requestNum++;
    if (requestNum < 3) {
      // 当请求次数不超过3次，重新发起请求
      chatMsg(url, inputMsg, uid);
    } else {
      text.value += '<a style="color:red;">';
      const errorMsg = '请求失败，请再次尝试！</a>';
      for (let i = 0; i < errorMsg.length; i++) {
        text.value += errorMsg[i];
        if (containMain.value != null) {
          (containMain.value as unknown as HTMLElement).scrollTop = (containMain.value as unknown as HTMLElement).scrollHeight;
        }
        await sleep(10);
      }
      text.value += '\n\n';
      // 重新启用(输入框/发送按钮)
      isDisabled.value = false;
      requestNum = 0;
    }
  })
}

/**
 * 请求查询接口
 */
async function sendQue() {
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
  if (text.value != null && text.value != '') {
    text.value += ' --- \n\n';
  }
  text.value += '<a style="color:#008000;font-size:24px;font-weight:bold;">';
  for (let i = 0; i < inputMsg.length; i++) {
    text.value += inputMsg[i];
    if (containMain.value != null) {
      (containMain.value as unknown as HTMLElement).scrollTop = (containMain.value as unknown as HTMLElement).scrollHeight;
    }
    await sleep(100);
  }
  text.value += '</a>\n\n';
  // 创建sse链接，并接收服务器端返回的数据
  ssef('http://www.dongpl.com:8000/createSse', uid);
  // 发送chat
  chatMsg('http://www.dongpl.com:8000/chat', inputMsg, uid);
}
</script>

<style scoped>
.common-layout {
  width: 100%;
  height: 100%;
}

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

.topic {
  text-align: center;
}

.comtainer-footer {
  background-color: #2D333B;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid;
}
</style>