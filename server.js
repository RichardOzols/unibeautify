// server.js
var express  = require('express');
var path     = require('path');
var cors     = require('cors');
var { createProxyMiddleware } = require('http-proxy-middleware');

var app = express();

// 1) Serve your React/Unibeautify build
app.use(express.static(path.join(__dirname, 'dist')));

// 2) Enable CORS on all routes so the browser can talk to us
app.use(cors());

// 3) Proxy /playground/* to the real AWS endpoint
app.use(
  '/playground',
  createProxyMiddleware({
    target: 'https://z446o1y0w8.execute-api.us-east-1.amazonaws.com/prod',
    changeOrigin: true,
    pathRewrite: {
      '^/playground': '/playground'
    },
    onProxyReq: function(proxyReq, req, res) {
      // you can add headers here if you need
    }
  })
);

// 4) Always return index.html so client-side routing works
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 5) Start the server
var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('🚀 Server listening on port', port);
});
