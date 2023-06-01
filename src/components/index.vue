<template>
  <div class="common-layout">
    <el-container>
      <el-header class="box-title">
        <h1>欢迎使用</h1>
      </el-header>
      <el-main class="box-main">
        <el-card class="box-card">
          <el-form ref="ruleFormRef" :model="formLabelAlign" :rules="rules" status-icon label-width="100px" class="demo-ruleForm">
            <el-form-item label="用户名" prop="name">
              <el-input v-model="formLabelAlign.name"/>
            </el-form-item>
            <el-form-item label="密码" prop="region">
              <el-input v-model="formLabelAlign.region" type="password" autocomplete="off" />
            </el-form-item>
            <el-form-item label="验证码" prop="type">
              <el-input v-model="formLabelAlign.type" type="password" autocomplete="off" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)">Create</el-button>
              <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
              <el-button type="danger" round><a @click="closeApp">关闭程序</a></el-button>
            </el-form-item>
          </el-form>
          <!-- <el-button type="success" round><a @click="toGPT('/chat')">GPT问答</a></el-button> -->
          <!-- <el-button type="success" round><router-link to="/demo">测试跳转</router-link></el-button> -->
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ipcRenderer } from 'electron'

const router = useRouter();

const ruleFormRef = ref<FormInstance>()

const formLabelAlign = reactive({
  name: '',
  region: '',
  type: '',
})

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 5, message: '长度为3个到5个字符之间', trigger: 'blur' },
  ],
  region: [{required: true,message: '密码不能为空',trigger: 'change'}],
  type: [{required: true,message: '两次密码不相同',trigger: 'change'}]
})

const submitForm = async (formEl: FormInstance | undefined) => {
  console.log('formLabelAlign',formLabelAlign);
  console.log('submitForm---formEl',formEl);
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      console.log('fields',fields);
      // 跳转聊天界面
      router.push('/chat');
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  console.log('resetForm---formEl',formEl);
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
}
</style>