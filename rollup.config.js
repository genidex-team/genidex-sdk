import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

const inputs = {
  index: 'src/index.ts',
  events: 'src/events/index.ts',
  admin: 'src/admin/index.ts'
};

export default {
  input: inputs,
  output: [
    {
      dir: 'dist',
      entryFileNames: 'cjs/[name].cjs',
      chunkFileNames: 'cjs/[name].cjs',
      format: 'cjs',
      exports: 'auto',
      sourcemap: true,
      exports: 'named'
    },
    {
      dir: 'dist',
      entryFileNames: 'esm/[name].mjs',
      chunkFileNames: 'esm/[name].mjs',
      format: 'esm',
      sourcemap: true
    }
  ],
  context: 'window',
  plugins: [
    resolve({ preferBuiltins: true, extensions: ['.js', '.ts'] }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
      outputToFilesystem: true,
      sourceMap: true,
    }),
    // terser()
  ],
  external: ['ethers']
};