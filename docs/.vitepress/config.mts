import { DefaultTheme, UserConfig, defineConfig } from 'vitepress';
import { configureDiagramsPlugin } from 'vitepress-plugin-diagrams';
import { pagefindPlugin } from 'vitepress-plugin-pagefind';
import { withSidebar } from 'vitepress-sidebar';
import { VitePressSidebarOptions } from 'vitepress-sidebar/types';

// https://vitepress.dev/reference/site-config
const vitePressOptions = {
  title: 'egolia',
  description: 'Utopia of Notes',
  lang: 'en-GB',
  base: '/egolia/',
  srcDir: 'src',
  markdown: {
    theme: {
      light: 'catppuccin-latte',
      dark: 'catppuccin-mocha',
    },
    config: (md) => {
      configureDiagramsPlugin(md, {
        diagramsDir: 'src/public/diagrams',
        publicPath: '/egolia/diagrams',
        excludedDiagramTypes: ['mermaid'],
        krokiServerUrl: process.env.CI
          ? undefined
          : process.env.KROKI_SERVER_URL,
      });
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'Home',
        link: '../',
        target: '_self',
        rel: 'noopener',
      },
      { text: 'Docs', link: '/docs' },
      {
        text: 'Scalar API',
        link: '/api/index.html',
        target: '_blank',
        rel: 'noopener',
      },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/egolia-uit/egolia',
      },
    ],
  },
  vite: {
    plugins: [pagefindPlugin()],
  },
  ignoreDeadLinks: ['/egolia/api/index.html'],
} satisfies UserConfig<NoInfer<DefaultTheme.Config>>;

const vitePressSidebarOptions = {
  documentRootPath: 'src',
  useTitleFromFileHeading: true,
  useTitleFromFrontmatter: true,
  useFolderLinkFromIndexFile: true,
  useFolderTitleFromIndexFile: true,
  sortMenusByFrontmatterOrder: true,
  collapsed: true,
  collapseDepth: 2,
} satisfies VitePressSidebarOptions;

export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarOptions)
);
