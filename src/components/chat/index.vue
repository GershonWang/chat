<template>
    <el-button class="reback" @click="reback()">返回首页</el-button>
    <div class="common-layout">
        <el-container class="container">
            <el-header class="container-title">聊天界面</el-header>
            <el-container>
                <el-aside class="container-menu">
                    <p>默认保持连接5分钟，默认上下文保持10个，5分钟无请求上下文会话销毁。</p>
                </el-aside>
                <el-container>
                    <el-main class="container-main">
                        <table style="border: 1;">
                            <tbody v-html="chatMsg"></tbody>
                        </table>
                    </el-main>
                    <el-footer class="comtainer-footer">
                        <el-input id="msg" v-model="textarea" :rows="2" type="textarea" placeholder="请输入您要咨询的问题..."
                            input-style="width:510px" />
                        <el-button class="send" type="success" plain round @click="sendQue()">发送</el-button>
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

const textarea = ref('')
const router = useRouter();
const chatMsg = ref('')
const article = ref('')

// 返回上一页面
function reback() {
    router.back();
}

// function setText(text, uuid_str) {
//     let content = document.getElementById(uuid_str)
//     content.innerHTML = marked(text);
// }

function ssef(url: string, uuid_str: string) {
  let sse;
  let text = '';
  //创建sse
  const eventSource = new EventSourcePolyfill(url, {
    headers: {
      'uid': uuid_str
    },
    heartbeatTimeout: 60000
  });
  eventSource.onopen = (event) => {
    console.log("开始输出后端返回值");
    sse = event.target;
  };
  eventSource.onmessage = (event) => {
    console.log("onmessage", event);
    if (event.lastEventId == "[TOKENS]") {
      text = text + event.data;
    //   let content = document.getElementById(uuid_str);
      article.value = text;
    //   content.innerHTML = marked(text);
      console.log(uuid_str, text);
      text = ''
      return;
    }
    if (event.data == "[DONE]") {
      if (sse) {
        sse.close();
      }
      return;
    }
    let json_data = JSON.parse(event.data)
    if (json_data.content == null || json_data.content == 'null') {
      return;
    }
    text = text + json_data.content;
    article.value = text;
    console.log(uuid_str, text);
  };
  eventSource.onerror = (event) => {
    console.log("onerror", event);
    ElMessage.error("服务异常请重试并联系开发者！");
    // if (event.readyState === EventSource.CLOSED) {
    // console.log('connection is closed');
    // } else {
    // console.log("Error occured", event);
    // }
    event.target.close();
  };
  eventSource.addEventListener("customEventName", (event) => {
    // console.log("Message id is " + event.lastEventId);
    console.log("Message id is " + event);
  });
}

// 请求查询接口
function sendQue() {
    let uid = <string>window.localStorage.getItem('uid');
    console.log("请求chat时获取到的uid",uid);
    let inputMsg = textarea.value;
    if (inputMsg === null || inputMsg === '') {
        ElMessage.success("请求失败，发送内容不能为空！");
        return;
    }
    // 创建sse链接
    ssef('http://localhost:8000/createSse', uid);
    // 发送chat
    const url = 'http://localhost:8000/chat';
    const data = {
        msg: inputMsg
    }
    const headers = {
        'Content-Type': 'application/json;charset=utf-8',
        'uid': uid
    };
    axios.post(url, JSON.stringify(data), { headers }).then(res => {
        console.log(res);
        //新增问题框
        chatMsg.value += '<el-divider><el-icon><star-filled /></el-icon></el-divider>';
        chatMsg.value += '<tr><td style="height: 30px;">' + inputMsg + '<br/> tokens：' + res.data.question_tokens + '</td></tr>';
        //新增答案框
        chatMsg.value += '<tr><td><article id="' + window.localStorage.getItem('uid') + '" v-html="article" class="markdown-body"></article></td></tr>';
    })
    textarea.value = ''
}
</script>

<style scoped>
.reback {
    border-radius: 50px;
    background-color: darkgray;
    font-size: 12px;
    color: #333;
    font-weight: bold;
    margin-bottom: 20px;
}

.common-layout {
    width: 700px;
    height: 460px;
    border: solid 3px rgb(250, 248, 248)
}

.container {
    width: 100%;
    height: 100%;
}

.container-title {
    background-color: cornflowerblue;
    font-size: 32px;
    font-weight: bold;
}

.container-menu {
    width: 120px;
    /* background-color: cadetblue; */
    border: solid;
    text-align: left;
}

p {
    width: 120px;
    text-indent: 2em;
}

.container-main {
    height: 340px;
    text-align: left;
    border: solid;
}

.comtainer-footer {
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: solid;
}

.el-textarea__inner {
    width: 510px;
}

.send {
    margin-left: 1px;
    margin-right: 1px;
}
</style>