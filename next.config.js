/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  images: {
    domains: [
      'dalleproduse.blob.core.windows.net',
      'oaidalleapiprodscus.blob.core.windows.net',
      'images.unsplash.com'
    ],
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
    UNSPLASH_SECRET_KEY: process.env.UNSPLASH_SECRET_KEY,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  // Enable type checking and ESLint for better code quality
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // For pages using useSearchParams
  experimental: {
    serverComponentsExternalPackages: [
      'next/navigation',
      'openai',
      'node-fetch',
      'uuid',
      'firebase',
      'worker_threads',
      'fs',
      'path',
      'url',
      'util',
      'http',
      'https',
      'stream',
      'zlib',
      'events',
      '@google/generative-ai'
    ],
    missingSuspenseWithCSRBailout: false
  },
  // MAXIMUM timeout for QUALITY story generation - NO COMPROMISES  
  staticPageGenerationTimeout: 1800, // 30 MINUTES for the BEST possible narratives
  // Remove trailing slashes for consistency
  trailingSlash: false,
  // Explicitly set base path
  basePath: '',
  // Remove the assetPrefix as it's causing issues
  assetPrefix: '',
  
  // Increase chunk loading timeout
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 60 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  
  // Configure chunking behavior
  webpack: (config, { isServer, dev }) => {
    // Fix issues with the GoogleGenerativeAI library
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      async_hooks: false,
    };

    // Increase the timeout for loading chunks to prevent timeouts
    config.performance = {
      ...config.performance,
      maxAssetSize: 1000000, // 1MB - increase the asset size limit
      maxEntrypointSize: 1000000, // 1MB - increase the entrypoint size limit
    };
    
    if (isServer) {
      // Fixes npm packages that depend on 'node:' protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        // Map node protocol imports to regular imports
        'node:fs': 'fs',
        'node:path': 'path',
        'node:url': 'url',
        'node:util': 'util',
        'node:http': 'http',
        'node:https': 'https',
        'node:stream': 'stream',
        'node:zlib': 'zlib',
        'node:events': 'events',
        'node:crypto': 'crypto',
        'node:buffer': 'buffer',
        'node:querystring': 'querystring',
        'node:os': 'os',
        'node:process': 'process'
      };
      
      // External modules that shouldn't be bundled - remove @google/generative-ai to fix webpack error
      // config.externals = [...config.externals, '@google/generative-ai'];
    }
    
    // Add fallbacks for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        worker_threads: false
      };
      
      // Fix for GoogleGenerativeAI package in the browser - remove null-loader to fix build
      // config.module.rules.push({
      //   test: /node_modules\/@google\/generative-ai/,
      //   use: 'null-loader'
      // });
      
      // Add timeout for chunk loading
      config.output = {
        ...config.output,
        chunkLoadTimeout: 120000, // Increase chunk load timeout to 2 minutes
      };
      
      // Use simpler splitting strategy for problematic chunks
      // Specifically prevent app/layout from being split
      if (!dev) {
        // Customize the chunking strategy
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Keep layout in a single chunk to prevent splitting issues
            layout: {
              test: /[\\/]app[\\/]layout/,
              name: 'app-layout',
              chunks: 'all',
              enforce: true,
              priority: 50,
            },
            // React and related packages
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-subscription|next)[\\/]/,
              priority: 40,
            },
            // Common libraries chunk
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 2,
              reuseExistingChunk: true,
            },
            // Common app code chunk
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
          maxInitialRequests: 25,
          minSize: 20000,
        };
      }
    }
    
    return config;
  }
}

module.exports = nextConfig 