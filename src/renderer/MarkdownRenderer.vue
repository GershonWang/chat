<!-- markdown的样式功能组件 -->
<template>
  <div v-html="renderedMarkdown"></div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import MarkdownIt from 'markdown-it';
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';
import { shell } from 'electron';

export default defineComponent({
  props: {
    markdown: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      renderedMarkdown: '',
    };
  },
  mounted() {
    this.renderMarkdown();
  },
  watch: {
    markdown() {
      this.renderMarkdown();
    },
    openDefaultBrower() {
      document.addEventListener('click', (event: MouseEvent) => {
        if (event.target != null) {
          const target = event.target as HTMLAnchorElement;
          if (target.tagName === 'A' && target.href.startsWith('http')) {
            event.preventDefault()
            shell.openExternal(target.href)
          }
        }
      })
    }
  },
  methods: {
    renderMarkdown() {
      const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true,
      });
      this.renderedMarkdown = md.render(this.markdown);
      this.$nextTick(() => {
        // 拿取所有的code代码元素，进行赋值高亮模式
        document.querySelectorAll('code').forEach((el) => {
          hljs.highlightElement(el as HTMLElement);
        });
        // 代码高亮
        // document.querySelectorAll('pre code').forEach((el) => {
        //   hljs.highlightElement(el as HTMLElement);
        // });
        // 拿取所有的a标签元素，增加跳转默认浏览器，不使用内置浏览器打开  target="_blank"
        document.querySelectorAll('a').forEach((el) => {
          if (el.hasAttribute("href")) {
            el.setAttribute('target','_blank');
          }
        });
      })
    },
  },
});
</script>
<style scoped>
/* 语法高亮 */
.hljs-container {
  position: relative;
  display: block;
  display: flex;
  width: max-content;
  margin-left: 100px;
  padding: 30px 10px 2px 0;
  overflow-x: hidden;
  font-size: 14px;
  line-height: 24px;
  text-align: left;
  background: #21252b;
  box-shadow: 0 10px 30px 0 rgb(0 0 0 / 40%);
}

/** 3个点 */
.hljs-container::before {
  position: absolute;
  top: 10px;
  left: 15px;
  width: 12px;
  height: 12px;
  overflow: visible;
  font-weight: 700;
  font-size: 16px;
  line-height: 12px;
  white-space: nowrap;
  text-indent: 75px;
  background-color: #fc625d;
  border-radius: 16px;
  box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
  content: attr(codetype);
}

/** 滚动条 */
:deep(.hljs) {
  overflow-x: auto;
}

:deep(.hljs::-webkit-scrollbar) {
  width: 12px !important;
  height: 12px !important;
}

:deep(.hljs::-webkit-scrollbar-thumb) {
  height: 30px !important;
  background: #d1d8e6;
  background-clip: content-box;
  border: 2px solid transparent;
  border-radius: 19px;
  opacity: 0.8;
}

:deep(.hljs::-webkit-scrollbar-thumb:hover) {
  background: #a5b3cf;
  background-clip: content-box;
  border: 2px solid transparent;
}

:deep(.hljs::-webkit-scrollbar-track-piece) {
  width: 30px;
  height: 30px;
  background: #333;
}

::-webkit-scrollbar-button {
  display: none;
}

/** 行数样式 */
.hljs-code-number {
  padding: 17px 10px 0;
  color: #d1d8e6;
  font-size: 12px;
  list-style: none;
  border-right: 1px solid #d1d8e6;
}

/** 复制样式 */
.hljs-copy {
  position: absolute;
  top: 50px;
  right: 30px;
  display: none;
  padding: 0 10px;
  color: #66a9ff;
  font-size: 10px;
  background-color: #ecf5ff;
  border-radius: 3px;
  cursor: pointer;
}
</style>
  