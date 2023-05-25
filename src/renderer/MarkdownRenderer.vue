<template>
  <div v-html="renderedMarkdown"></div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import MarkdownIt from 'markdown-it';

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
        breaks: true
      });
      this.renderedMarkdown = md.render(this.markdown);
    },
  },
});
</script>
<style scoped>

</style>
  