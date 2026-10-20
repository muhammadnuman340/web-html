import esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['tests/conversion.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/conversion.test.mjs'
})
console.log('✅ Built tests/conversion.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['tests/routing.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/routing.test.mjs'
})
console.log('✅ Built tests/routing.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['tests/seo.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/seo.test.mjs'
})
console.log('✅ Built tests/seo.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['scripts/generate-sitemap.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'scripts/generate-sitemap.mjs'
})
console.log('✅ Built scripts/generate-sitemap.mjs successfully.')

