module.exports = function override(config) {
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      '@mui/material': '@mui/material/esm',
      '@mui/icons-material': '@mui/icons-material/esm',
      '@mui/x-data-grid': '@mui/x-data-grid/esm',
    },
  };
  return config;
};