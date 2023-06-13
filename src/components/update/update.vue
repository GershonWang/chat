<template>
    <div>
        <Modal v-model="modal" :mask-closable='false' :title="'更新提醒（' + newVersion + '）'" width="400" ok-text="立即更新"
            cancel-text="取消" :closable='false' @on-ok='updataDown'>
            <p v-for='(item, index) in navJson' :key='index + "navJson"'>{{ index + 1 }}、{{ item }}</p>
        </Modal>
        <Modal v-model="Progress" :mask-closable='false' :title="'正在更新（' + newVersion + '）'" width="400" :closable='false'>
            <!-- <Progress :percent="percent" status="active"></Progress> -->
            <div slot="footer"></div>
        </Modal>
    </div>
</template>
 
<script lang="ts">
import { ipcRenderer } from 'electron'
import { ElMessage } from 'element-plus'

export default {
    data() {
        return {
            modal: false,
            Progress: false,
            percent: 0,
            newVersion: '0.0.0',
            isOnMessage: false,
            navJson: []
        }
    },
    created() {
        // 在这里执行之前，可以是登录接口查询到版本不对之后再触发检测更新
        // ...登录api省略了，造数据演示
        let result = {
            newVersion: '2.0.0',
            updateNavJson: '["更新内容1","更新内容2","更新内容3","更新内容4"]'
        }
        this.onUpdateExe(result)
    },
    methods: {
        onUpdateExe(res: { newVersion: any; updateNavJson: any }) {
            if (this.isOnMessage) return
            const { newVersion = '', updateNavJson = "" } = res
            try {
                this.navJson = JSON.parse(updateNavJson) || []
            } catch (error) {
                console.log(error)
            }
            this.isOnMessage = true
            this.newVersion = newVersion
            console.log('收到更新版本号', res, this.navJson)
            // 自动更新过程
            ipcRenderer.on('UpdateMessage', this.updateExe.bind(this))
            // 检查是否需要更新
            ipcRenderer.send('checkForUpdates')
        },
        updateExe(e: any, data: { name: string; text: number }) {
            console.log('渲染层收到消息：', data)
            // 更新提示弹窗
            if (data.name == 'update-available') {
                this.modal = true
            } else if (data.name == 'download-progress') {    // 下载进度
                this.percent = Math.ceil(data.text)
            } else if (data.name == 'update-downloaded') {
                ElMessage.success('下载完成，准备重启')
                setTimeout(() => {
                    ipcRenderer.send('updateSuccess')
                }, 2000)
            }
        },
        //开始升级
        updataDown() {
            this.Progress = true
            ipcRenderer.send('downloadUpdate')
        }
    },
}
</script>
 
<style scoped>
.ivu-modal-body {
    max-height: 120px;
    overflow-y: scroll;
    padding-top: 5px;
}

.ivu-modal-body p {
    line-height: 24px;
    height: 24px;
    font-size: 12px;
}

.ivu-modal-footer button:nth-child(1) {
    display: none;
}
</style>

<!-- <!doctype html>
<html>
  <head>
    <title>my-nuxt</title>
    <meta data-n-head="1" charset="utf-8">
    <style>
        body {
          box-sizing: border-box;
          margin: 0;
          padding: 20px;
          font-family: sans-serif;
          background-color: #eaeaea;
          text-align: center;
        }
        #notification {
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 200px;
          padding: 20px;
          border-radius: 5px;
          background-color: white;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        }
        .hidden {
          display: none;
        }
      </style>
  </head>
  <body>
    <div>当前版本1.0.0</div>
    <p>版本信息：<span id="version"></span></p>
    <div id="notification" class="hidden">
      <p id="message"></p>
      <button id="close-button" onClick="closeNotification()">
        下次再说
      </button>
      <button id="restart-button" onClick="restartApp()" class="hidden">
        重启更新
      </button>
    </div>
  <script>
	const { ipcRenderer } = require('electron');
	const version = document.getElementById('version');
	const notification = document.getElementById('notification');
	const message = document.getElementById('message');
	const restartButton = document.getElementById('restart-button');
	
	//获取当前版本
	ipcRenderer.send('app_version');
	ipcRenderer.on('app_version', (event, arg) => {
	  ipcRenderer.removeAllListeners('app_version');
	  version.innerText =  arg.version;
	});
	//新版本检测
	console.log("开始新版本检测")
	ipcRenderer.send('checkForUpdate');
	//发现新版本
	ipcRenderer.on('checking_for', () => {
	  console.log("进入发现新版本")
	  message.innerText = '发现新版本';
	  notification.classList.remove('hidden');
	});
	
	//发现新版本
	ipcRenderer.on('update_available', () => {
	  console.log("正在下载中...")
	  message.innerText = '正在下载中...';
	  notification.classList.remove('hidden');
	});
	
	//下载成功触发
	ipcRenderer.on('update_downloaded', () => {
	  ipcRenderer.removeAllListeners('update_downloaded');
	  message.innerText = '下载成功！是否更新?';
	  restartButton.classList.remove('hidden');
	  notification.classList.remove('hidden');
	});
	
	function closeNotification() {
	  notification.classList.add('hidden');
	}
	
	function restartApp() {
	  ipcRenderer.send('isUpdateNow');
	}
	
	//下载中触发
	ipcRenderer.on("downloadProgress", (event, progressObj)=> {
	    console.log(progressObj);
	    let downloadPercent = progressObj.percent || 0;
	    message.innerText = "正在下载..." + "downloadPercent";
	});
  </script>
</body>
</html> -->