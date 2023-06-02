<template>
  <div>
    <a @click="$router.back()">跳回首页</a>
    <h3>当前计数为 {{ counterStore.counter }} 双倍值 {{ counterStore.doubleCount }}</h3>
    <ul>
      <li><router-link to="/helloWorld" style="color: white;margin-bottom: 5px">跳转到hello页面</router-link></li>
      <li><a @click="goTo()">点击</a></li>
    </ul>
    <el-input v-model="input" style="width: 400px;height: 80px" @change="changeInput"></el-input>
    <div>
      <div ref="container">
        <div ref="child">
          <div ref="grandchild" v-if="showGrandchild">{{ grandchildText }}</div>
        </div>
      </div>
      <button @click="appendGrandchild">追加第三层DOM元素</button>
      <button @click="updateGrandchild">修改第三层DOM元素</button>
    </div>
    <div ref="mainTest"></div>
  </div>
</template>

<script setup lang="ts">
import {useCounterStore} from '../../store/counterStore'
import {reactive, Ref, ref} from "vue";

const counterStore = useCounterStore();

const input = ref('')
const mainTest = ref(null);
const hello = ref(null)

function goTo() {
  console.log('点击事件触发了')
  const newElement = document.createElement('div')
  newElement.textContent = '新元素'
  mainTest.value.appendChild(newElement)
}

const changeInput = ()=>{
  console.log('input',input.value)
  console.log('hello',hello.value)
}

interface State {
  showGrandchild: boolean;
  grandchildText: string;
}

const container: Ref<HTMLElement | null> = ref(null);
const child: Ref<HTMLElement | null> = ref(null);
const grandchild: Ref<HTMLElement | null> = ref(null);

const state: State = reactive<State>({
  showGrandchild: false,
  grandchildText: '第三层DOM元素'
});

const appendGrandchild = (): void => {
  state.showGrandchild = true;
};

const updateGrandchild = (): void => {
  state.grandchildText = '修改后的第三层DOM元素';
};
</script>

<style scoped>
ul {
  list-style: none;
}
</style>