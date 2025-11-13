import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/.venv/**',
      '**/venv/**',
      '**/__pycache__/**',
      '**/coverage/**',
      '**/htmlcov/**',
      '**/.coverage',
      '**/.pytest_cache/**',
      '**/data/**',
      '**/dist/**',
      '**/build/**',
      '**/*.egg-info/**',
      '**/.vscode/**',
      '**/.idea/**',
      '**/*.log',
    ],
  },

  // Base config for all JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        // External library globals
        d3: 'readonly', // D3.js loaded via script tag
        Phaser: 'readonly', // Phaser.js for games
        Chart: 'readonly', // Chart.js if used
        topojson: 'readonly', // TopoJSON library
        scrollama: 'readonly', // Scrollama library
        // Application globals (loaded from other scripts)
        audioManager: 'readonly',
        Animations: 'readonly',
        scrollHint: 'readonly',
        LifeStatsCalculator: 'readonly',
        renderTherapeuticTimeline: 'readonly',
        renderTherapeuticPeaksChart: 'readonly',
        loadUniqueInsightsData: 'readonly',
        renderPoissonTests: 'readonly',
        renderTimeline: 'readonly',
        renderUniqueInsights: 'readonly',
        // Event object
        event: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,

      // Code Quality - Strict enforcement
      'no-console': ['error', { allow: ['error', 'warn'] }], // Block console.log but allow error/warn
      'no-debugger': 'error', // No debuggers in prod
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-var': 'error', // Use let/const only
      'prefer-const': 'warn', // Prefer const when possible

      // Import/Export
      'no-duplicate-imports': 'error',

      // Best Practices
      eqeqeq: ['warn', 'always'], // === instead of ==
      curly: ['warn', 'all'], // Always use braces (warn for now)
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-alert': 'warn', // Warn on alert/confirm/prompt
      'no-case-declarations': 'warn', // Warn about declarations in case blocks

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },

  // Web Components - allow customElements
  {
    files: ['**/shared/components/*.js'],
    languageOptions: {
      globals: {
        customElements: 'readonly',
        HTMLElement: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },

  // Test files - allow console
  {
    files: ['**/*.test.js', '**/tests/**/*.js', '**/test/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // Config files (ES modules)
  {
    files: ['*.config.js', '.prettierrc.js', '.stylelintrc.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
];
