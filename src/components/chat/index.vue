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
                            <tbody id="chat"></tbody>
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
import { chatApi } from '../../api/chat'
// import EventSource from 'event-source-polyfill'

const textarea = ref('')
const router = useRouter();

// 返回上一页面
function reback() {
    router.back();
}


// function setText(text, uuid_str) {
//     let content = document.getElementById(uuid_str)
//     content.innerHTML = marked(text);
// }

// function sse() {
//     let sse;
//     let text = '';
//     let uuid_str = window.localStorage.getItem('uid');
//     //创建sse
//     const eventSource = new EventSource('/createSse', {
//         headers: {
//             'uid': window.localStorage.getItem('uid')
//         }
//     });
//     eventSource.onopen = (event) => {
//         console.log("开始输出后端返回值");
//         sse = event.target;
//     };
//     eventSource.onmessage = (event) => {
//         if (event.lastEventId == "[TOKENS]") {
//             text = text + event.data;
//             setText(text, uuid_str)
//             text = ''
//             return;
//         }
//         if (event.data == "[DONE]") {
//             if (sse) {
//                 sse.close();
//             }
//             return;
//         }
//         let json_data = JSON.parse(event.data)
//         if (json_data.content == null || json_data.content == 'null') {
//             return;
//         }
//         text = text + json_data.content;
//         setText(text, uuid_str)
//     };
//     eventSource.onerror = (event) => {
//         console.log("onerror", event);
//         alert("服务异常请重试并联系开发者！")
//         if (event.readyState === EventSource.CLOSED) {
//             console.log('connection is closed');
//         } else {
//             console.log("Error occured", event);
//         }
//         event.target.close();
//     };
//     eventSource.addEventListener("customEventName", (event) => {
//         console.log("Message id is " + event.lastEventId);
//     });
//     eventSource.addEventListener("customEventName", (event) => {
//         console.log("Message id is " + event.lastEventId);
//     });
// }

// 请求查询接口
function sendQue() {

    // let disconnectBtn = document.getElementById("disconnectSSE");
    // let messageElement = document.getElementById("message");
    // let chat = document.getElementById("chat");

    // sse();

    let inputMsg = textarea.value;
    if (inputMsg === null || inputMsg === '') {
        ElMessage.success("请求失败，发送内容不能为空！");
        return;
    }
    chatApi({ msg: inputMsg }).then(res => {
        console.log(res)
        ElMessage.success('请求成功')
        //新增问题框
        // chat.innerHTML += '<tr><td style="height: 30px;">' + messageElement.value + '<br/><br/> tokens：' + res.question_tokens + '</td></tr>';
        // messageElement.value = null
        //新增答案框
        // chat.innerHTML += '<tr><td><article id="' + uuid_str + '" class="markdown-body"></article></td></tr>';
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

p{
    width: 120px;
    text-indent: 2em;
}

.container-main {
    border: solid;
}

.comtainer-footer {
    /* background-color: blue; */
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