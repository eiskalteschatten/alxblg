---
title: "Welcome to Your New Blog"
date: "{{DATE}}"
slug: "welcome"
---

# Welcome to Your New Blog

This is your first blog post! You can edit this file and add more posts to the `content/posts` directory.

## Getting Started

1. Edit `blog.config.json` to customize your blog
2. Add more posts to `content/posts`
3. Run `alxblg build` to generate your blog
4. Run `alxblg serve` to start the development server

## Code Sample

This is some sample code with syntax highlighting:

```javascript
const app = express();
    
// Serve static files
app.use(express.static(serveDir));

// Handle SPA routing - serve index.html for unknown routes
app.get('/{*page}', (req, res) => {
  const indexPath = path.join(serveDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } 
  else {
    res.status(404).send('404 - Not Found');
  }
});
```