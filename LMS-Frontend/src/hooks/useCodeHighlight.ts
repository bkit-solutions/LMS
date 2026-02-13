import { useEffect } from 'react';
import Prism from 'prismjs';

// Import common language support
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML

/**
 * Hook to apply syntax highlighting to code blocks
 * and add copy buttons
 */
export const useCodeHighlight = (contentRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!contentRef.current) return;

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      if (!contentRef.current) return;

      // Apply Prism syntax highlighting
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        Prism.highlightElement(block as HTMLElement);
      });

      // Add copy buttons to all pre elements
      const preElements = contentRef.current.querySelectorAll('pre');
      preElements.forEach((pre) => {
        // Skip if button already exists
        if (pre.querySelector('.copy-code-button')) return;

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        // Create copy button
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="button-text">Copy</span>
        `;
        
        button.addEventListener('click', async () => {
          const code = pre.querySelector('code')?.textContent || '';
          try {
            await navigator.clipboard.writeText(code);
            button.innerHTML = `
              <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="button-text">Copied!</span>
            `;
            button.classList.add('copied');
            
            setTimeout(() => {
              button.innerHTML = `
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="button-text">Copy</span>
              `;
              button.classList.remove('copied');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy code:', err);
          }
        });

        wrapper.appendChild(button);
      });
    }, 100);

    return () => clearTimeout(timer);
  });
};
