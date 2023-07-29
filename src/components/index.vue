<template>
  <div class="mainContainer">
    <el-container>
      <el-header style="margin-bottom: 50px;">
        <h1 style="font-size: 3.2em;line-height: 1.1;">欢迎使用</h1>
      </el-header>
      <el-main style="margin: 0 auto;">
        <el-card class="box-card">
          <el-form ref="formRef" :model="loginForm" :rules="rules" status-icon label-width="100px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" autocomplete="off" placeholder="请输入用户名"
                @keyup.enter="handleUsernameEnter" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" type="password" autocomplete="off" placeholder="请输入密码"
                @keyup.enter="submitForm(formRef)" />
            </el-form-item>
              <el-button type="primary" @click="submitForm(formRef)">登陆账户</el-button>
              <el-button type="info" @click="resetForm(formRef)">重新输入</el-button>
              <el-button type="success" @click="registForm(formRef)">注册账户</el-button>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
    <div>
      <p style="position: fixed;right: 10px;bottom: 0;">当前版本：<span ref="version"></span></p>
      <div id="notification" ref="notification" class="hidden">
        <p ref="message" style="color: #292A2D;"></p>
        <button @click="closeNotification()">下次再说</button>
        <button @click="updateNow()">立即更新</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ipcRenderer } from 'electron'
import { loginApi, registApi } from '@/api/auth'

const router = useRouter();
const version = ref();
const message = ref();
const notification = ref();

const formRef = ref<FormInstance>()
const loginForm = reactive({
  username: '',
  password: '',
})
// 校验规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'change' },
    { min: 3, max: 5, message: '长度为3个到5个字符之间', trigger: ['blur','change'] },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'change' },
    { pattern: /^[A-Za-z0-9_@]+$/, message: '密码只能由大小写字母、数字、下划线组成', trigger: 'blur' }
  ],
})
/**
 * 提交表单数据(登陆系统)
 */
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, _fields) => {
    if (valid) {
      // 跳转聊天界面
      const data = {
        'username': loginForm.username,
        'password': loginForm.password
      }
      loginApi(data).then(res => {
        if (res.code == '500') {
          ElMessage.warning(res.msg);
        } else if (res.code == '200') {
          localStorage.removeItem('username');
          localStorage.removeItem('apikey');
          if (res.data.username) {
            localStorage.setItem('username', res.data.username);
          }
          if (res.data.apikey) {
            localStorage.setItem('apikey',res.data.apikey);
          }
          if (res.data.accessToken) {
            localStorage.setItem('token',res.data.accessToken);
          }
          router.push('/chat');
          ElMessage.success('欢迎您' + res.data.name + '，登陆成功！');
        }
      })
    }
  })
}
/**
 * 提交表单数据(注册账户)
 */
const registForm = async (formEl:FormInstance | undefined ) => {
  if (!formEl) return
  await formEl.validate((valid, _fields) => {
    if (valid) {
      // 跳转聊天界面
      const data = {
        'username': loginForm.username,
        'password': loginForm.password
      }
      registApi(data).then(res => {
        if (res.code == '500') {
          ElMessage.warning(res.msg);
        } else if (res.code == '200') {
          ElMessage.success(res.data);
        }
      })
    }
  })
}
/**
 * 重置表单数据
 */
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
/**
 * 用户名输入框输入完跳转密码框
 */
const handleUsernameEnter = () => {
  (document.querySelector('input[type=password]') as HTMLInputElement).focus();
}
/********************************************************************************************/
// 获取当前版本
ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (event, arg) => {
  ipcRenderer.removeAllListeners('app_version');
  version.value.innerText = arg.version;
});
// 下次再说
function closeNotification() {
  notification.value.classList.add('hidden');
}
// 立即更新
function updateNow() {
  ipcRenderer.send('isUpdateNow');
}
</script>

<style scoped>
.mainContainer {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
}

.box-card {
  width: 480px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #292A2D;
}

.el-form-item {
  margin-bottom: 30px;
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