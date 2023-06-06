<template>
  <div class="mainContainer">
    <el-container>
      <el-header style="margin-bottom: 50px;">
        <h1 style="font-size: 3.2em;line-height: 1.1;">欢迎使用</h1>
      </el-header>
      <el-main style="margin: 0 auto;">
        <el-card class="box-card">
          <el-form ref="loginFormRef" :model="loginForm" :rules="rules" status-icon label-width="100px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" autocomplete="off" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" type="password" autocomplete="off" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(loginFormRef)">登陆账户</el-button>
              <el-button @click="resetForm(loginFormRef)">重新输入</el-button>
              <el-button type="danger" round><a @click="closeApp">关闭程序</a></el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <!-- <el-button type="success" round><router-link to="/demo">测试跳转</router-link></el-button> -->
        <!-- <el-button type="success" round><router-link to="/test_mark">测试mark</router-link></el-button> -->
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ipcRenderer } from 'electron'
import { loginApi } from '../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter();

const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  username: '',
  password: '',
})

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 5, message: '长度为3个到5个字符之间', trigger: 'blur' },
  ],
  password: [{ required: true, message: '密码不能为空', trigger: 'change' }],
})
/**
 * 提交表单数据(登陆系统)
 */
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      // 跳转聊天界面
      const data = {
        'username': loginForm.username,
        'password': loginForm.password
      }
      loginApi(data).then(res => {
        console.log('loginApi', res)
        if (res.data.code == '500') {
          ElMessage.warning(res.data.message);
        } else if (res.data.code == '000') {
          localStorage.setItem('access_token', res.data.accessToken as string);
          router.push('/chat');
          ElMessage.success('欢迎您' + res.data.username + '，登陆成功！');
        }
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}
/**
 * 重置表单数据
 */
const resetForm = (formEl: FormInstance | undefined) => {
  console.log('resetForm---formEl', formEl);
  if (!formEl) return
  formEl.resetFields()
}
/**
 * 关闭程序
 */
const closeApp = () => {
  ipcRenderer.send('close-app');
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
</style>