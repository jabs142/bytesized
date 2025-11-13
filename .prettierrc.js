export default {
  // Match existing ByteSized code style
  semi: true, // Use semicolons
  singleQuote: true, // Single quotes for JS
  tabWidth: 2, // 2-space indentation
  useTabs: false, // Spaces, not tabs
  trailingComma: 'es5', // Trailing commas where valid in ES5

  // Formatting preferences
  printWidth: 100, // 100 char line width (reasonable for modern screens)
  bracketSpacing: true, // { foo: bar }
  arrowParens: 'always', // Always parens on arrow functions
  endOfLine: 'lf', // Unix line endings

  // HTML/CSS behavior
  htmlWhitespaceSensitivity: 'css',

  // File-specific overrides
  overrides: [
    {
      files: '*.css',
      options: {
        singleQuote: false, // CSS uses double quotes
      },
    },
    {
      files: '*.html',
      options: {
        printWidth: 120, // HTML can be wider
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80, // Markdown narrower for readability
        proseWrap: 'always',
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 80,
        trailingComma: 'none', // JSON doesn't support trailing commas
      },
    },
  ],
};
