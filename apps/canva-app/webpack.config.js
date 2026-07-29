const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Puerto del backend Express de @presence/canva-extension (POST /api/inspiration).
const BACKEND_PORT = process.env.BACKEND_PORT || 3005;

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  // En desarrollo el bundle vive en el mismo origen HTTPS que el dev server, asi
  // que usamos rutas relativas y dejamos que el proxy de abajo hable HTTP con el
  // backend: sin mixed content y sin CORS.
  // En produccion Canva sirve la app desde su propio dominio, por lo que hace
  // falta una URL absoluta y obligatoriamente HTTPS.
  const backendHost = isProduction ? process.env.BACKEND_HOST || "" : "";

  if (isProduction) {
    if (!backendHost) {
      console.warn(
        "[canva-app] BACKEND_HOST no esta definido: las llamadas a /api usaran rutas relativas y fallaran dentro de Canva."
      );
    } else if (!backendHost.startsWith("https://")) {
      console.warn(
        `[canva-app] BACKEND_HOST="${backendHost}" no es HTTPS: el iframe de Canva bloqueara las peticiones por mixed content.`
      );
    }
  }

  return {
    entry: "./src/index.tsx",
    // Canva sirve la app dentro de un iframe con CSP sin `unsafe-eval`.
    // El devtool por defecto de modo development (`eval`) envuelve cada modulo
    // en eval() y hace que el bundle entero falle antes de registrar el intent.
    devtool: "source-map",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
      library: {
        type: "umd",
        export: "default",
      },
      globalObject: "this",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new webpack.DefinePlugin({
        BACKEND_HOST: JSON.stringify(backendHost),
      }),
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    devServer: {
      server: 'https',
      static: path.resolve(__dirname, "dist"),
      port: 8081,
      // HMR/live-reload inyectan codigo evaluado y un WebSocket a localhost que
      // la CSP del iframe de Canva bloquea. Recarga manual con F5 en el editor.
      hot: false,
      liveReload: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Security-Policy": "frame-ancestors https://*.canva.com https://*.canva.site https://*.canva-apps.com",
      },
      allowedHosts: "all",
      // El backend habla HTTP; el iframe de Canva es HTTPS. El proxy termina el
      // TLS aqui para que el navegador nunca vea una peticion HTTP.
      proxy: [
        {
          context: ["/api"],
          target: `http://localhost:${BACKEND_PORT}`,
          changeOrigin: true,
          secure: false,
        },
      ],
    },
  };
};
