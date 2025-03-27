import { defineConfig, presetMini, presetIcons, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetMini(),
    presetIcons(),
  ],
  transformers: [
    transformerDirectives(),
  ]
})