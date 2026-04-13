import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const raw = `
<p class="mb-4">最近在重构</p>
<pre class="bg-slate-800"><code class="language-javascript">const globalState</code></pre>
*test*
`;

marked.setOptions({ breaks: true });
console.log("Marked Output:", marked.parse(raw));
console.log("DOMPurify Output:", purify.sanitize(marked.parse(raw)));
