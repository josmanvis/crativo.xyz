const http = require('http');

// Test the projects page
http.get('http://localhost:3000/projects', (res) => {
  console.log('Projects page status:', res.statusCode);
  res.on('data', () => {});
}).on('error', (err) => {
  console.log('Projects page error:', err.message);
});

// Test the blog page
http.get('http://localhost:3000/blog', (res) => {
  console.log('Blog page status:', res.statusCode);
  res.on('data', () => {});
}).on('error', (err) => {
  console.log('Blog page error:', err.message);
});

// Test the specific blog article
http.get('http://localhost:3000/blog/mtmr-designer-visual-touch-bar-designer', (res) => {
  console.log('MTMR blog article status:', res.statusCode);
  res.on('data', () => {});
}).on('error', (err) => {
  console.log('MTMR blog article error:', err.message);
});