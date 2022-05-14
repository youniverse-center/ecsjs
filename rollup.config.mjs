import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import eslint from '@rbnlffl/rollup-plugin-eslint';
import dts from 'rollup-plugin-dts';
import { terser } from "rollup-plugin-terser";
import { babel } from "@rollup/plugin-babel";

export default defineConfig([
  {
    plugins: [
        eslint({
        throwOnError: true,
      }),
      typescript({
        tsconfig: 'tsconfig.build.json',
        useTsconfigDeclarationDir: true
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.js', '.ts']
      })
    ],
    input: 'src/index.ts',
    output: [
      ...(['esm', 'cjs'].map((format) => ({
        format,
        file: `dist/yc-ecs-transpiled.${format}.js`
      })))
    ]
  },
  {
    plugins: [
        eslint({
        throwOnError: true,
      }),
      typescript({
        tsconfig: 'tsconfig.build.json',
        useTsconfigDeclarationDir: true
      }),
    ],
    input: 'src/index.ts',
    output: [
      ...(['esm', 'cjs'].map((format) => ({
        format,
        file: `dist/yc-ecs.${format}.js`
      })))
    ]
  },
  {
    plugins: [
      eslint({
        throwOnError: true,
      }),
      typescript({
        tsconfig: 'tsconfig.build.json',
        useTsconfigDeclarationDir: true
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.js', '.ts']
      })
    ],
    input: 'src/index.ts',
    output: [
      {
        format: 'umd',
        file: 'dist/yc-ecs.umd.js',
        name: 'YcEcs',
      },
      {
        format: 'umd',
        file: 'dist/yc-ecs.umd.min.js',
        name: 'YcsEcs',
        sourcemap: true,
        plugins: [terser()],
      }
    ]
  },
  {
    plugins: [dts()],
    input: '@types/index.d.ts',
    output: [{
      file: 'dist/yc-ecs.d.ts',
      format: 'es',
    }],
  }
]);