<template>
  <div v-html="renderedMarkdown"></div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import MarkdownIt from 'markdown-it';
import 'highlight.js/styles/atom-one-dark.css'
import hljs from 'highlight.js';

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
  },
  methods: {
    renderMarkdown() {
      const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true,
        // highlight: function (str, lang) {
        //   console.log('str->', str, 'lang->', lang);
        // }
      });
      this.renderedMarkdown = md.render(this.markdown);
      this.$nextTick(()=>{
                document.querySelectorAll('pre code').forEach((el) => {
                    // hljs.highlightElement(el);
                    // console.log(el);
                    hljs.highlightAll();
                });
            })
    },
  },
});
</script>
<style scoped></style>
  