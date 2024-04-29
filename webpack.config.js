import path from 'path';
import glob from 'glob';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to generate HtmlWebpackPlugin instances for each HTML file in the posts directory
const generateHtmlPlugins = (folder) => {
  const htmlFiles = glob.sync(`./${folder}/**/*.html`);
  return htmlFiles.map((filePath) => {
    const fileName = path.basename(filePath);
    return new HtmlWebpackPlugin({
      filename: `${folder}/${fileName}`, // Output path for HTML file
      template: filePath,
      chunks: ['vendor', 'bundle'],
    });
  });
};

export default {
  mode: `production`,
  entry: {
    bundle: glob.sync('./scripts/**/*.js'), // Custom code entry point
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[chunkhash].js',
    publicPath: 'build/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        test: /[\\/]node_modules[\\/]/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader', // Add postcss-loader for CSS optimization
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg|mp4)$/,
        use: [
          'image-webpack-loader',
          {
            loader: 'url-loader',
            options: { limit: 40000 }
          },
        ],
        type: 'asset/resource',
      },
      {
        test: /\.json$/,
        include: path.resolve(__dirname, 'json-files'), // Specify the directory to include
        type: 'asset/resource',
        generator: {
          filename: 'json-files/[name][ext]', // Output directory for JSON files
        },
      },
    ],
  },
  optimization: {
    minimize: true, // Minimize output CSS
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          filename: 'vendor.[contenthash].js', // Specify the filename for the vendor chunk
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css', // Minimized CSS filename
    }),
    ...generateHtmlPlugins('posts'), // Dynamically generate HtmlWebpackPlugin instances for each HTML file in the posts folder
    ...generateHtmlPlugins('pages'), // Dynamically generate HtmlWebpackPlugin instances for each HTML file in the pages folder
  ],
};
console.log('Webpack configuration loaded.');
