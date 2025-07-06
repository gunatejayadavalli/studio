/** @type {import('next').NextConfig} */

// This function combines the application's base configuration with the
// dynamic context-path configuration required by the Calibo environment.
module.exports = () => {
  // Base configuration for the application
  const appConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
        { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
        { protocol: 'https', hostname: 'cdn.brandfetch.io', port: '', pathname: '/**' },
        { protocol: 'https', hostname: 'upload.wikimedia.org', port: '', pathname: '/**' },
      ],
    },
    // Redirect the root path to the login page. This is the cleanest way to handle the initial route.
    async redirects() {
      return [
        {
          source: '/',
          destination: '/login',
          permanent: true,
        },
      ];
    },
  };

  // This logic is from the Calibo starter repo to handle dynamic context paths.
  let caliboConfig = {};
  if (process.env.context && process.env.context !== '/') {
    // Corrected variable declarations from the provided script.
    let baseUrl;
    let assetBaseUrl;
    let distDirUrl;

    if (process.env.context.startsWith('/')) {
      baseUrl = process.env.context;
      assetBaseUrl = process.env.context;
      distDirUrl = process.env.context;
    } else {
      baseUrl = '/' + process.env.context;
      assetBaseUrl = '/' + process.env.context;
      distDirUrl = '/' + process.env.context;
    }

    caliboConfig = {
      basePath: baseUrl,
      assetPrefix: assetBaseUrl,
      // Note: Setting `distDir` this way is highly specific to the Calibo deployment environment.
      distDir: distDirUrl,
    };
  }

  // Merge the two configurations. Calibo's config can override base settings if needed.
  return {
    ...appConfig,
    ...caliboConfig,
  };
};
