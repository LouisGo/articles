'use strict';

// Original: https://github.com/sdras/night-owl-vscode-theme
// Converted automatically using ./tools/themeFromVsCode
var theme = {
  plain: {
    color: '#110000',
    backgroundColor: '#fefefe',
  },
  styles: [
    {
      types: ['changed'],
      style: {
        color: 'rgb(162, 191, 252)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['deleted'],
      style: {
        color: 'rgb(209, 77, 77)',
      },
    },
    {
      types: ['inserted'],
      style: {
        color: 'rgb(47, 156, 10)',
      },
    },
    {
      types: ['comment'],
      style: {
        color: '#97a69a',
        fontStyle: 'italic',
      },
    },
    {
      types: ['imports'],
      style: {
        color: '#7b30d0',
      },
    },
    {
      types: ['string', 'char', 'url'],
      style: {
        color: '#A44185',
      },
    },
    {
      types: ['builtin'],
      style: {
        color: '#dc3eb7',
      },
    },
    {
      types: ['constant'],
      style: {
        color: '#174781',
      },
    },
    {
      types: ['variable'],
      style: {
        color: '#2F86D2',
      },
    },
    {
      types: ['number'],
      style: {
        color: '#174781',
      },
    },
    {
      // This was manually added after the auto-generation
      // so that punctuations are not italicised
      types: ['punctuation'],
      style: {
        color: '#0460b1',
      },
    },
    {
      types: ['function', 'selector', 'doctype'],
      style: {
        color: '#7eb233',
        fontStyle: 'italic',
      },
    },
    {
      types: ['class-name'],
      style: {
        color: '#DC3EB7',
      },
    },
    {
      types: ['maybe-class-name'],
      style: {
        color: '#0444ac',
      },
    },
    {
      types: ['tag'],
      style: {
        color: '#0444AC',
      },
    },
    {
      types: ['operator', 'property', 'keyword'],
      style: {
        color: '#7B30D0',
      },
    },
    {
      types: ['namespace'],
      style: {
        color: '#0991b6',
      },
    },
    {
      types: ['property', 'attr-name'],
      style: {
        color: '#df8618',
      },
    },
    {
      types: ['property-access'],
      style: {
        color: '#2f86d2',
      },
    },
    {
      types: ['boolean'],
      style: {
        color: '#174781',
        fontStyle: 'italic',
      },
    },
  ],
};

module.exports = theme;
