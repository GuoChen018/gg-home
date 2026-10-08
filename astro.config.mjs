import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import astroOGImage from "astro-og-image";

function externalLinksInNewTab() {
    const visit = (node) => {
        if (node.type === 'element' && node.tagName === 'a' && /^https?:\/\//.test(node.properties?.href ?? '')) {
            node.properties.target = '_blank';
            node.properties.rel = ['noopener', 'noreferrer'];
        }
        node.children?.forEach(visit);
    };
    return visit;
}

// https://astro.build/config
export default defineConfig({
    site: 'https://www.guochen.design',
    integrations: [react()],
    markdown: {
      rehypePlugins: [externalLinksInNewTab],
      shikiConfig: {
        // Choose from Shiki's built-in themes (or add your own)
        // https://shiki.style/themes
        theme: 'github-light',
        // Alternatively, provide multiple themes
        // https://shiki.style/guide/dual-themes
        themes: {
          light: 'github-light',
          dark: 'github-light',
        },
        // Add custom languages
        // Note: Shiki has countless langs built-in, including .astro!
        // https://shiki.style/languages
        langs: [],
        // Enable word wrap to prevent horizontal scrolling
        wrap: true,
        // Add custom transformers: https://shiki.style/guide/transformers
        // Find common transformers: https://shiki.style/packages/transformers
        transformers: [],
      },
    },
});