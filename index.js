const shiki = require("shiki-nova1751");
const stripIndent = require("strip-indent");
const themes = require("./lib/themes");
const { version } = require("./package.json");
const codeMatch =
  /(?<quote>[> ]*)(?<ul>(-|\d+\.)?)(?<start>\s*)(?<tick>~{3,}|`{3,}) *(?<args>.*)\n(?<code>[\s\S]*?)\k<quote>\s*\k<tick>(?<end>\s*)$/gm;
const config = hexo.config.shiki;
if (!config) return;
const {
  theme,
  line_number,
  beautify,
  highlight_copy,
  highlight_lang,
  highlight_height_limit,
  is_highlight_shrink,
  copy: { success, error, no_support } = {},
} = config;
const codeblockTheme = themes.has(theme) ? theme : "one-dark-pro";
hexo.extend.injector.register("head_end", () => {
  return `
    <style>
      /* scrollbar */
      figure.shiki div.codeblock::-webkit-scrollbar-thumb {
        background: var(--hlscrollbar-bg);
        border-radius: 2.5px;
      }
      figure.shiki div.codeblock::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      /* code block figure */
      figure.shiki .shiki-tools.closed ~ * {
        display: none;
      }
      figure.shiki div.codeblock {
        margin: 0;
      }
      figure.shiki {
        margin: 0 0 24px;
        border-radius: 7px;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        position: relative;
        overflow: auto;
        padding: 0;
        background: var(--hl-bg);
        color: var(--hl-color);
        line-height: 1.6;
      }
      /* highlighttool bar */
      .shiki-tools {
        position: relative;
        display: -webkit-box;
        display: -moz-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: box;
        display: flex;
        -webkit-box-align: center;
        -moz-box-align: center;
        -o-box-align: center;
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
        overflow: hidden;
        min-height: 24px;
        height: 2.15em;
        background: var(--hltools-bg);
        color: var(--hltools-color);
        font-size: 1em;
        user-select: none;
      }
      figure.shiki .shiki-tools .expand {
        right: 0;
        position: absolute;
        padding: 0.57em 0.7em;
        cursor: pointer;
        -webkit-transition: -webkit-transform 0.3s;
        -moz-transition: -moz-transform 0.3s;
        -o-transition: -o-transform 0.3s;
        -ms-transition: -ms-transform 0.3s;
        transition: transform 0.3s;
      }

      figure.shiki .shiki-tools .expand.closed {
        -webkit-transition: all 0.3s;
        -moz-transition: all 0.3s;
        -o-transition: all 0.3s;
        -ms-transition: all 0.3s;
        transition: all 0.3s;
        -webkit-transform: rotate(90deg);
        -moz-transform: rotate(90deg);
        -o-transform: rotate(90deg);
        -ms-transform: rotate(90deg);
        transform: rotate(90deg);
      }
      figure.shiki .shiki-tools .code-lang {
        left: 75px;
        position: absolute;
        text-transform: uppercase;
        font-weight: 700;
        font-size: 1.15em;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      figure.shiki .shiki-tools .expand ~ .copy-notice {
        right: 3.45em;
        position: absolute;
        opacity: 0;
        -webkit-transition: opacity 0.4s;
        -moz-transition: opacity 0.4s;
        -o-transition: opacity 0.4s;
        -ms-transition: opacity 0.4s;
        transition: opacity 0.4s;
      }

      figure.shiki .shiki-tools .expand ~ .copy-button {
        right: 2.1em;
        position: absolute;
        cursor: pointer;
        -webkit-transition: color 0.2s;
        -moz-transition: color 0.2s;
        -o-transition: color 0.2s;
        -ms-transition: color 0.2s;
        transition: color 0.2s;
      }
      .shiki-tools .copy-button:hover {
        color: #49b1f5;
      }
      figure.shiki .shiki-tools:after {
        position: absolute;
        left: 14px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #fc625d;
        -webkit-box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
        box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
        content: " ";
      }
      /* bottom toolbar */
      .code-expand-btn {
        position: absolute;
        display: flex;
        bottom: 0;
        z-index: 10;
        width: 100%;
        background: var(--hlexpand-bg);
        justify-content: center;
        align-items: center;
        font-size: 1em;
        cursor: pointer;
      }
      @-moz-keyframes code-expand-key {
        0% {
          opacity: 0.6;
        }

        50% {
          opacity: 0.1;
        }

        100% {
          opacity: 0.6;
        }
      }

      @-webkit-keyframes code-expand-key {
        0% {
          opacity: 0.6;
        }

        50% {
          opacity: 0.1;
        }

        100% {
          opacity: 0.6;
        }
      }

      @-o-keyframes code-expand-key {
        0% {
          opacity: 0.6;
        }

        50% {
          opacity: 0.1;
        }

        100% {
          opacity: 0.6;
        }
      }

      @keyframes code-expand-key {
        0% {
          opacity: 0.6;
        }

        50% {
          opacity: 0.1;
        }

        100% {
          opacity: 0.6;
        }
      }
      .code-expand-btn i {
        padding: 6px 0;
        color: var(--hlnumber-color);
        -webkit-animation: code-expand-key 1.2s infinite;
        -moz-animation: code-expand-key 1.2s infinite;
        -o-animation: code-expand-key 1.2s infinite;
        -ms-animation: code-expand-key 1.2s infinite;
        animation: code-expand-key 1.2s infinite;
      }
      .code-expand-btn.expand-done > i {
        -webkit-transform: rotate(180deg);
        -moz-transform: rotate(180deg);
        -o-transform: rotate(180deg);
        -ms-transform: rotate(180deg);
        transform: rotate(180deg);
      }
      /* codeblock */
      figure.shiki div.codeblock {
        display: block;
        overflow: auto;
        border: none;
        display: flex;
      }
      figure.shiki div.codeblock div {
        padding: 0;
        border: none;
      }
      figure.shiki .gutter pre {
        padding-right: 10px !important;
        padding-left: 10px !important;
        background-color: var(--hlnumber-bg) !important;
        color: var(--hlnumber-color) !important;
        text-align: right !important;
        user-select: none !important;
      }
      figure.shiki pre {
        margin: 0 !important;
        padding: 8px 0 !important;
        border: none !important;
      }
      figure.shiki pre code {
        background: none !important;
      }
      figure.shiki .codeblock pre * {
        font-size: 1em;
        font-family: Consolas, "Fira Code", "Fira Mono", Menlo, "DejaVu Sans Mono",
          monospace, 宋体;
        overflow: auto !important;
        line-height: 1.6;
      }
      figure.shiki .code pre {
        padding-right: 10px !important;
        padding-left: 10px !important;
        width: 100% !important;
        background: none !important;
      }
      .code-expand-btn:not(.expand-done) ~ pre,
      .code-expand-btn:not(.expand-done) ~ *pre {
        overflow: hidden;
      }
      .code-expand-btn.expand-done + pre,
      .code-expand-btn.expand-done + * pre,
      .code-expand-btn.expand-done + div.codeblock,
      .code-expand-btn.expand-done + * div.codeblock {
        margin-bottom: 1.8em;
      }

      .code-expand-btn:not(.expand-done) ~ div.codeblock,
      .code-expand-btn:not(.expand-done) ~ * div.codeblock {
        overflow: hidden;
        height: ${config.highlight_height_limit}px;
      }
    </style>
  `;
});
hexo.extend.injector.register("head_end", () => {
  return themes.get(codeblockTheme);
});
if (config.highlight_height_limit) {
  hexo.extend.injector.register("head_end", () => {
    return `
      <style>
        .code-expand-btn:not(.expand-done) ~ div.codeblock,
        .code-expand-btn:not(.expand-done) ~ * div.codeblock {
          overflow: hidden;
          height: ${config.highlight_height_limit}px;
        }
      </style>
    `;
  });
}

hexo.extend.injector.register("body_end", () => {
  return `
  <script>
    const CODE_CONFIG = {
      beautify: ${beautify},
      highlightCopy: ${highlight_copy},
      highlightLang: ${highlight_lang},
      highlightHeightLimit: ${highlight_height_limit},
      isHighlightShrink: ${is_highlight_shrink},
      copy: {
        success: '${success}',
        error: '${error}',
        noSupport: '${no_support}',
      }
    };
  </script>
  `;
});

if (beautify) {
  hexo.extend.injector.register("body_end", () => {
    return `
    <script>
      const addHighlightTool = function () {
        const isHidden = (ele) => ele.offsetHeight === 0 && ele.offsetWidth === 0;
        if (!CODE_CONFIG || !CODE_CONFIG.beautify) return;

        const { highlightCopy, highlightLang, highlightHeightLimit } = CODE_CONFIG;
        const isHighlightShrink = CODE_CONFIG.isHighlightShrink;
        const isShowTool =
          highlightCopy || highlightLang || isHighlightShrink !== undefined;
        const $figureHighlight = document.querySelectorAll("figure.shiki");

        if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length))
          return;

        const highlightShrinkClass = isHighlightShrink === true ? "closed" : "";
        const highlightShrinkEle =
          isHighlightShrink !== undefined
            ? '<i class="fa fa-angle-down expand ' + highlightShrinkClass + '"></i>'
            : "";
        const highlightCopyEle = highlightCopy
          ? '<div class="copy-notice"></div><i class="fa fa-paste copy-button" title="Copy Code"></i>'
          : "";

        const copy = async (text, ctx) => {
          const showMsg = (msg) => {
            const prevEle = ctx.previousElementSibling;
            prevEle.textContent = msg;
            prevEle.style.opacity = 1;
            setTimeout(() => {
              prevEle.style.opacity = 0;
            }, 700);
          };
          if (
            document.queryCommandSupported &&
            document.queryCommandSupported("copy")
          ) {
            document.execCommand("copy");
            showMsg(CODE_CONFIG.copy.success);
          } else if (navigator.clipboard) {
            try {
              await navigator.clipboard.writeText(text);
              showMsg(CODE_CONFIG.copy.success);
            } catch {
              showMsg(CODE_CONFIG.copy.error);
            }
          } else {
            showMsg(CODE_CONFIG.copy.noSupport);
          }
        };

        // click events
        const highlightCopyFn = (ele) => {
          const $buttonParent = ele.parentNode;
          $buttonParent.classList.add("copy-true");
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(
            $buttonParent.querySelectorAll('div.codeblock .code pre')[0]
          );
          selection.removeAllRanges();
          selection.addRange(range);
          const text = selection.toString();
          copy(text, ele.lastChild);
          selection.removeAllRanges();
          $buttonParent.classList.remove("copy-true");
        };

        const highlightShrinkFn = (ele) => {
          const $nextEle = [...ele.parentNode.children].slice(1);
          ele.firstChild.classList.toggle("closed");
          if (isHidden($nextEle[$nextEle.length - 1])) {
            $nextEle.forEach((e) => {
              e.style.display = "flex";
            });
          } else {
            $nextEle.forEach((e) => {
              e.style.display = "none";
            });
          }
        };

        const highlightToolsFn = function (e) {
          const $target = e.target.classList;
          if ($target.contains("expand")) highlightShrinkFn(this);
          else if ($target.contains("copy-button")) highlightCopyFn(this);
        };

        const expandCode = function () {
          this.classList.toggle("expand-done");
        };

        function createEle(lang, item, service) {
          const fragment = document.createDocumentFragment();

          if (isShowTool) {
            const hlTools = document.createElement("div");
            hlTools.className = 'shiki-tools ' + highlightShrinkClass;
            hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle;
            hlTools.addEventListener("click", highlightToolsFn);
            fragment.appendChild(hlTools);
          }

          if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
            const ele = document.createElement("div");
            ele.className = "code-expand-btn";
            ele.innerHTML = '<i class="fa fa-angle-double-down"></i>';
            ele.addEventListener("click", expandCode);
            fragment.appendChild(ele);
          }

          if (service === "hl") {
            item.insertBefore(fragment, item.firstChild);
          } else {
            item.parentNode.insertBefore(fragment, item);
          }
        }

        $figureHighlight.forEach(function (item) {
          if (highlightLang) {
            let langName = item.getAttribute("class").split(" ")[1];
            if (langName === "plain" || langName === undefined)
              langName = "PlainText";
            const highlightLangEle = '<div class="code-lang">' + langName + '</div>';
            createEle(highlightLangEle, item, "hl");
          } else {
            createEle("", item, "hl");
          }
        });
      };

      document.addEventListener("pjax:success", addHighlightTool);
      document.addEventListener("DOMContentLoaded", addHighlightTool);
    </script>
    `;
  });
}

return shiki
  .getHighlighter({
    theme,
  })
  .then((hl) => {
    hexo.extend.filter.register("before_post_render", (post) => {
      post.content = post.content.replace(codeMatch, (...argv) => {
        let { quote, ul, start, end, args, code } = argv.pop();
        let result;
        const match = new RegExp(`^${quote.trimEnd()}`, "gm");
        code = code.replace(match, "");
        code = stripIndent(code.trimEnd());
        const arr = code.split("\n");
        let numbers = "";
        let pre = "";
        try {
          pre = hl.codeToHtml(code, { lang: args });
          pre = pre.replace(/<pre[^>]*>/, (match) => {
            return match.replace(/\s*style\s*=\s*"[^"]*"\s*tabindex="0"/, "");
          });
        } catch (error) {
          console.warn(error);
          pre = `<pre><code>${code}</code></pre>`;
        }
        result = `<figure class="shiki${args ? ` ${args}` : ""}">`;
        result += "<div class='codeblock'>";
        if (line_number) {
          for (let i = 0, len = arr.length; i < len; i++) {
            numbers += `<span class="line">${1 + i}</span><br>`;
          }
          result += `<div class="gutter"><pre>${numbers}</pre></div>`;
        }
        result += `<div class="code">${pre}</div>`;
        result += "</div></figure>";
        return `${
          quote + ul + start
        }<hexoPostRenderCodeBlock>${result}</hexoPostRenderCodeBlock>${end}`;
      });
    });
  });
