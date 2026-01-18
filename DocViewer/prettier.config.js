module.exports = {
  ...require('./.prettierrc'),
  proseWrap: 'never',
  endOfLine: 'lf',
  plugins: [],
  overrides: [
    {
      files: ['*.tsx', '*.ts', '*.js', '*.jsx'],
      options: {
        insertPragma: false,
        requirePragma: false,
        // Custom: Remove all empty lines
        // Prettier does not natively support removing all empty lines, but you can use this workaround with a plugin or a post-processing script.
      },
    },
  ],
};
