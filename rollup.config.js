import commonjs from '@rollup/plugin-commonjs';

export default {
  // ...existing code...
  plugins: [
    // ...existing plugins...
    commonjs(), // Add this plugin
  ],
};