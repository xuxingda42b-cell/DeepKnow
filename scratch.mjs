import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

const markedInstance = new Marked();

markedInstance.use(markedHighlight({
  emptyLangClass: 'hljs',
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
}));

const md = `\`\`\`ts\nconsole.log("hello")\n\`\`\``;
console.log(markedInstance.parse(md, { breaks: true, gfm: true }));
