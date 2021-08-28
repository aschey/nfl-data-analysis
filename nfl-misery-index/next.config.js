module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.aschey.tech/nfl/:path*",
      },
    ];
  },
};
