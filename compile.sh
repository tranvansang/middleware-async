rm -rf index.d.cts index.cjs index.mjs index.d.mts coverage \
&& yarn tsc -d --skipLibCheck --target esnext --declaration --moduleResolution node --module esnext --outDir . --inlineSourceMap index.ts \
&& mv index.js index.mjs \
&& mv index.d.ts index.d.mts \
&& yarn tsc -d --skipLibCheck --target esnext --declaration --moduleResolution node --module commonjs --outDir . --inlineSourceMap index.ts \
&& mv index.d.ts index.d.cts \
&& mv index.js index.cjs
