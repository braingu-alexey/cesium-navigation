module.exports = {
  extends: ['@znemz/eslint-config-react'],
  env: {
    browser:true,
    jest: true
  },
  rules: {
    'func-names': 0, // for now to get things building quick
    'no-multi-assign': 0,
    'no-return-assign': 0,
    'no-restricted-syntax': 0
  }
};
