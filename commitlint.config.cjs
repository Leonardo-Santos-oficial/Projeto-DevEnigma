module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'never', ['sentence-case']],
    'footer-max-line-length': [1, 'always', 200]
  }
};