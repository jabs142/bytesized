export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': true,

    // Color enforcement - warn about named colors (allow for now)
    'color-named': null, // Allow named colors for now (white, black, etc.)

    // ByteSized-specific: Encourage CSS variables
    // Allow common patterns in codebase
    'custom-property-pattern': null, // Don't enforce strict pattern, too many variations

    // Formatting - disabled as Prettier handles these
    'selector-class-pattern': null, // Allow any class names
    'selector-id-pattern': null, // Allow camelCase IDs from JS
    'keyframes-name-pattern': null, // Allow any keyframe names

    // Import enforcement - encourage @import of shared variables
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind'], // In case any project uses it
      },
    ],

    // Warnings for potential issues
    'no-descending-specificity': null, // Too strict for our use case
    'no-duplicate-selectors': null, // Allow duplicates (may be intentional for overrides)
    'declaration-block-no-redundant-longhand-properties': true,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'], // Allow :global for scoped styles
      },
    ],
  },
};
