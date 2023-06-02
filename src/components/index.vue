<template>
  <div class="common-layout">
    <el-container>
      <el-header class="box-title">
        <h1>欢迎使用</h1>
      </el-header>
      <el-main class="box-main">
        <el-card class="box-card">
          <el-form ref="loginFormRef" :model="loginForm" :rules="rules" status-icon label-width="100px"
            class="demo-ruleForm">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" type="password" autocomplete="off" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(loginFormRef)">登陆账户</el-button>
              <el-button @click="resetForm(loginFormRef)">重新输入</el-button>
               <el-button type="danger" round><a @click="closeApp">关闭程序</a></el-button>
            </el-form-item>
          </el-form>
        </el-card>
<!--         <el-button type="success" round><router-link to="/demo">测试跳转</router-link></el-button>-->
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
        console.log(res)
        if (res.data.accessToken) {
          router.push('/chat');
          ElMessage.success('登陆成功！')
        }
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  console.log('resetForm---formEl', formEl);
  if (!formEl) return
  formEl.resetFields()
}

// 关闭程序
const closeApp = () => {
  ipcRenderer.send('close-app');
}
</script>

<style scoped>
a {
  font-weight: 500;
  color: white;
  text-decoration: inherit;
}

a:hover {
  color: white;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

ul li {
  list-style: none;
  font-size: 16px;
  font-weight: bold;
}

.box-title {
  margin-bottom: 50px;
}

.box-main {
  margin: 0 auto;
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