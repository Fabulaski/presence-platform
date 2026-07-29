import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

export default {
  mode: 'production',
  entry: {
    background: './src/background.ts',
    popup: './src/popup.tsx'
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'src/popup.html', to: 'popup.html' },
        { from: 'src/sidepanel.html', to: 'sidepanel.html' },
        { from: 'public/icons', to: 'icons' }
      ]
    })
  ]
};
