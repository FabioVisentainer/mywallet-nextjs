import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["react", "react-dom", "next"],
    // O Button usa "use client". Bundlers removem essa diretiva ao juntar os
    // arquivos — sem ela, o Next trata o pacote como Server Component e quebra.
    banner: { js: '"use client";' },
    onSuccess: "cp src/tokens.css dist/tokens.css",
});