const lightCodeTheme = require('./custom-code-theme');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'LouisGo的个人主页',
  tagline: '欢迎来到 LouisGo 的个人主页，希望你能有所收获:)',
  url: 'http://louisgo.top',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'LouisGo', // Usually your GitHub org/user name.
  projectName: '个人主页', // Usually your repo name.
  themeConfig: {
    // algolia: {
    //   contextualSearch: true,
    // },
    navbar: {
      title: 'LouisGo',
      logo: {
        alt: 'LouisGo logo',
        src: 'https://i.loli.net/2021/07/10/sfmijBHXGraYDTA.jpg',
      },
      // items: [
      //   {
      //     type: 'localeDropdown',
      //     position: 'right',
      //   },
      // ],
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: '创作',
        },
        { to: '/blog', label: '博客', title: '全部', position: 'left' },
        // {
        //   href: 'https://github.com/facebook/docusaurus',
        //   label: 'GitHub',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: '赞赏码',
        src: 'https://i.loli.net/2021/07/10/XyxYZwn4FDJarls.png',
      },
      // links: [
      //   {
      //     title: 'Docs',
      //     items: [
      //       {
      //         label: 'Tutorial',
      //         to: '/docs/intro',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'Community',
      //     items: [
      //       {
      //         label: 'Stack Overflow',
      //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //       },
      //       {
      //         label: 'Discord',
      //         href: 'https://discordapp.com/invite/docusaurus',
      //       },
      //       {
      //         label: 'Twitter',
      //         href: 'https://twitter.com/docusaurus',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'More',
      //     items: [
      //       {
      //         label: 'Blog',
      //         to: '/blog',
      //       },
      //       {
      //         label: 'GitHub',
      //         href: 'https://github.com/facebook/docusaurus',
      //       },
      //     ],
      //   },
      // ],
      copyright: `LouisGo 的个人主页 打开微信扫描 ↑ 二维码即可进行打赏哦 ❤ Built with Docusaurus ❤`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      prism: {
        additionalLanguages: ['java'],
      },
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // 改成自己的github地址.
          editUrl: 'https://github.com/LouisGo/articles/tree/publish/',
        },
        blog: {
          showReadingTime: false,
          // 改成自己的github地址.
          editUrl: 'https://github.com/LouisGo/articles/blob/publish/',
          // 以下内容由@docusaurus/plugin-content-blog解锁配置，官网没有，https://www.wenjiangs.com/doc/y1j0lb9p
          blogTitle: 'LouisGo的博客',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: '所有博客',
        },
        theme: {
          customCss: [
            require.resolve('./src/css/custom.css'),
            // require.resolve('./src/css/viewer.css'),
          ],
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },
  clientModules: [require.resolve('./img-preview.js')],
  // plugins: [
  //   function myPlugin(context, options) {
  //     return {
  //       name: 'myPlugin',
  //       getClientModules() {
  //         return [
  //           require.resolve('./img-preview.js')
  //         ]
  //       }
  //     }
  //   }
  // ]
};
