import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/conflux-portal-onboarding.bundle.js',
    format: 'iife',
    name: 'ConfluxPortalOnboarding',
  },
  plugins: [
    resolve(),
  ],
}
