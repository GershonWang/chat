<template>
    <div ref="container">
        <div v-for="item in state.items" :key="item.id">
            <div>
                {{ item.text }}
            </div>
            <div ref="child" v-if="item.showChild">
                <MarkdownRenderer :markdown="item.childText"></MarkdownRenderer>
            </div>
        </div>
    </div>
    <el-input v-model="message" style="width: 250px;"></el-input>
    <button @click="addItem">发送消息</button>
    <button @click="updateChildText()">修改第二层DOM元素</button>
</template>

<script setup lang="ts">
import MarkdownRenderer from '../../renderer/MarkdownRenderer.vue';
import { Ref, reactive, ref } from 'vue';

interface Item {
    id: number;
    text: string;
    showChild: boolean;
    childText: string;
}

interface State {
    items: Item[];
}

const child: Ref<HTMLElement | null> = ref(null);
const message = ref('')

const state: State = reactive<State>({
    items: []
});

let itemId = 1;

const addItem = (): void => {
    const newItem: Item = {
        id: itemId,
        text: message.value,
        showChild: true,
        childText: ''
    };
    state.items.push(newItem);
    itemId++;
};

const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

const updateChildText = async () => {
    const msg = '# 修改后的第二层DOM元素';
    for(let i=0;i < msg.length;i++){
        const item = state.items.at(state.items.length-1);
        (item as Item).childText += msg[i];
        await sleep(1000);
    }
    console.log('state.items',state.items);
    console.log('state.items.length',state.items.length);
    console.log('lastItem',state.items.at(state.items.length-1));
};
</script>

<style scoped></style>