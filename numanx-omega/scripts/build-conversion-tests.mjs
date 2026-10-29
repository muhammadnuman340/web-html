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
  entryPoints: ['tests/pwa.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/pwa.test.mjs'
})
console.log('✅ Built tests/pwa.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['tests/financial-resilience.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/financial-resilience.test.mjs'
})
console.log('✅ Built tests/financial-resilience.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['tests/schema-graph.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/schema-graph.test.mjs'
})
console.log('✅ Built tests/schema-graph.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['tests/faq-parity.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/faq-parity.test.mjs'
})
console.log('✅ Built tests/faq-parity.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['tests/internal-linking-query-state.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/internal-linking-query-state.test.mjs'
})
console.log('✅ Built tests/internal-linking-query-state.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['tests/pseo-aeo-content.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/pseo-aeo-content.test.mjs'
})
console.log('✅ Built tests/pseo-aeo-content.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['tests/authority-entity.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/authority-entity.test.mjs'
})
console.log('✅ Built tests/authority-entity.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['tests/ai-discovery.test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'tests/ai-discovery.test.mjs'
})
console.log('✅ Built tests/ai-discovery.test.mjs successfully.')

await esbuild.build({
  entryPoints: ['scripts/generate-sitemap.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'scripts/generate-sitemap.mjs'
})
console.log('✅ Built scripts/generate-sitemap.mjs successfully.')

await esbuild.build({
  entryPoints: ['scripts/prerender-seo.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'scripts/prerender-seo.mjs'
})
console.log('✅ Built scripts/prerender-seo.mjs successfully.')

await esbuild.build({
  entryPoints: ['scripts/generate-llms-full.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'scripts/generate-llms-full.mjs'
})
console.log('✅ Built scripts/generate-llms-full.mjs successfully.')
