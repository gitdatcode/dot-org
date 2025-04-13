import antfu from '@antfu/eslint-config'
import tailwind from "eslint-plugin-tailwindcss";

export default antfu({
  formatters: true,
  astro: true,
  semi: false,
  quotes: 'single',
  ...tailwind.configs["flat/recommended"],
})

