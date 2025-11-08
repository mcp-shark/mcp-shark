module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the following
    'type-enum': [
      2,
      'always',
      [
        'feat', // A new feature
        'fix', // A bug fix
        'docs', // Documentation only changes
        'style', // Changes that do not affect the meaning of the code
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf', // A code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'build', // Changes that affect the build system or external dependencies
        'ci', // Changes to CI configuration files and scripts
        'chore', // Other changes that don't modify src or test files
        'revert', // Reverts a previous commit
      ],
    ],
    // Type case: must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    // Type cannot be empty
    'type-empty': [2, 'never'],
    // Scope case: must be lowercase
    'scope-case': [2, 'always', 'lower-case'],
    // Subject case: sentence-case (first letter lowercase, rest as written)
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    // Subject cannot be empty
    'subject-empty': [2, 'never'],
    // Subject must end with a period
    'subject-full-stop': [0, 'never'],
    // Header must not exceed 72 characters (disabled, using max line length instead)
    'header-max-length': [2, 'always', 100],
    // Body must start with blank line
    'body-leading-blank': [2, 'always'],
    // Footer must start with blank line
    'footer-leading-blank': [2, 'always'],
  },
};

