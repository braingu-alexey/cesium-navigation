import MarkdownIt from 'markdown-it';
import MarkdownItSanitizer from 'markdown-it-sanitizer';

const htmlTagRegex = /<html(.|\s)*>(.|\s)*<\/html>/im;

const md = new MarkdownIt({
  html: true,
  linkify: true
});

md.use(MarkdownItSanitizer, {
  imageClass: '',
  removeUnbalanced: false,
  removeUnknown: false
});

export const KnockoutMarkdownBinding = {
  register(_knockoutEle) {
    const knockoutEle = _knockoutEle;
    knockoutEle.bindingHandlers.markdown = {
      init() {
        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
        return { controlsDescendantBindings: true };
      },
      update(_element, valueAccessor) {
        const element = _element;
        // Remove existing children of this element.
        while (element.firstChild) {
          knockoutEle.removeNode(element.firstChild);
        }

        const rawText = knockoutEle.unwrap(valueAccessor());

        // If the text contains an <html> tag, don't try to interpret it as Markdown because
        // we'll probably break it in the process.
        let html;
        if (htmlTagRegex.test(rawText)) {
          html = rawText;
        } else {
          html = md.render(rawText);
        }

        const nodes = knockoutEle.utils.parseHtmlFragment(html, element);
        element.className = `${element.className} markdown`;

        for (const i = 0; i < nodes.length; ++i) {
          const node = nodes[i];
          setAnchorTargets(node);
          element.appendChild(node);
        }
      }
    };
  }
};

function setAnchorTargets(_element) {
  const element = _element;
  if (element instanceof HTMLAnchorElement) {
    element.target = '_blank';
  }

  if (element.childNodes && element.childNodes.length > 0) {
    for (const i = 0; i < element.childNodes.length; ++i) {
      setAnchorTargets(element.childNodes[i]);
    }
  }
}
