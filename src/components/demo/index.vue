<template>
  <div>
    <a @click="$router.back()">跳回首页</a>
    <h3>当前计数为 {{ counterStore.counter }} 双倍值 {{ counterStore.doubleCount }}</h3>
    <ul>
      <li><router-link to="/helloWorld" style="color: white;margin-bottom: 5px">跳转到hello页面</router-link></li>
    </ul>
    <div>
      <div ref="container">
        <div v-for="item in state.items" :key="item.id">
          <div ref="child" v-if="item.showChild">
            {{ item.childText }}
            <button @click="updateChildText(item.id)">修改第二层DOM元素</button>
          </div>
        </div>
      </div>
      <button @click="addItem">追加第一层DOM元素</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useCounterStore} from '../../store/counterStore'
import {reactive, Ref, ref} from "vue";

const counterStore = useCounterStore();

interface Item {
  id: number;
  showChild: boolean;
  childText: string;
}

interface State {
  items: Item[];
}

const container: Ref<HTMLElement | null> = ref(null);
const child: Ref<HTMLElement | null> = ref(null);

const state: State = reactive<State>({
  items: []
});

let itemId = 1;

const addItem = (): void => {
  const newItem: Item = {
    id: itemId,
    showChild: false,
    childText: '第二层DOM元素'
  };
  state.items.push(newItem);
  itemId++;
  if (itemId > 3){
    const ite =  state.items.at(itemId-2);
    (ite as Item).showChild = true;
  }
};

const updateChildText = (id: number): void => {
  const item = state.items.find((item) => item.id === id);
  if (item) {
    item.childText = '修改后的第二层DOM元素';
  }
};
</script>

<style scoped>
ul {
  list-style: none;
}
</style>