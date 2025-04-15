/* eslint-env node */
import {defaultUploadLocation, defineConfig} from 'viteburner';
import {resolve} from 'path';

defaultUploadLocation('myfile');
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '/src': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
  },
  viteburner: {
    watch: [
      {
        pattern: 'src/**/*.{js,ts}',
        transform: true,
        location: (file) => {
          const match = file.match(/^src\/([^\/]+)\/(.*)$/);
          if (match) {
            return [{ server: match[1], filename: defaultUploadLocation(match[2]) }];
          }
          return null;
        },
      },
      { pattern: 'src/**/*.{txt}' },
    ],
    download: {
      server: ['home'],
      // `file` is the file path on the server without a starting slash.
      location: (file, server) => {
        return `src/${server}/${file}`;
      },
      ignoreTs: true,
    },
    sourcemap: 'inline',
  },
});
