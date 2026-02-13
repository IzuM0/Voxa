
  /// <reference types="node" />
  import { defineConfig, loadEnv } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  function openaiTtsProxyPlugin() {
    return {
      name: "openai-tts-proxy",
      configureServer(server: any) {
        server.middlewares.use("/api/tts", async (req: any, res: any) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          const apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error:
                  "Missing OPENAI_API_KEY. Create a .env file with OPENAI_API_KEY=...",
              })
            );
            return;
          }

          try {
            const chunks: Uint8Array[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
            const body = Buffer.concat(chunks).toString("utf-8");

            const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com").replace(/\/$/, "");
            const upstream = await fetch(`${baseUrl}/v1/audio/speech`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body,
            });

            res.statusCode = upstream.status;
            const contentType = upstream.headers.get("content-type");
            if (contentType) res.setHeader("Content-Type", contentType);
            const cacheControl = upstream.headers.get("cache-control");
            if (cacheControl) res.setHeader("Cache-Control", cacheControl);

            if (!upstream.ok) {
              const text = await upstream.text();
              res.setHeader("Content-Type", "application/json");
              res.end(text);
              return;
            }

            if (!upstream.body) {
              res.statusCode = 502;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Upstream returned no body" }));
              return;
            }

            for await (const chunk of upstream.body as any) {
              res.write(chunk);
            }
            res.end();
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err?.message || "Proxy error" }));
          }
        });
      },
    };
  }

  export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    // Make env available to server middleware (do NOT expose to client).
    process.env.OPENAI_API_KEY ??= env.OPENAI_API_KEY;
    process.env.OPENAI_BASE_URL ??= env.OPENAI_BASE_URL;

    return {
    plugins: [openaiTtsProxyPlugin(), react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/ff4765ca525ad369eb89dbe52a4e550d18fcb78d.png': path.resolve(__dirname, './src/assets/ff4765ca525ad369eb89dbe52a4e550d18fcb78d.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});