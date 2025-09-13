import { Command } from 'commander';
import express from 'express';
import * as path from 'path';
import * as fs from 'fs';

export const serveCommand = new Command('serve')
  .description('Start a development server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-d, --directory <dir>', 'Directory to serve', 'public')
  .option('-w, --watch', 'Watch for changes and rebuild automatically')
  .action((options) => {
    const port = parseInt(options.port);
    const serveDir = path.resolve(options.directory);
    
    // Check if the serve directory exists
    if (!fs.existsSync(serveDir)) {
      console.log(`📁 Directory ${serveDir} doesn't exist.`);
      console.log('💡 Run "alxblg build" first to generate your blog, or specify a different directory.');
      process.exit(1);
    }
    
    const app = express();
    
    // Serve static files
    app.use(express.static(serveDir));
    
    // Handle SPA routing - serve index.html for unknown routes
    app.get('*', (req, res) => {
      const indexPath = path.join(serveDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('404 - Not Found');
      }
    });
    
    // Start server
    app.listen(port, () => {
      console.log(`🚀 Development server running at http://localhost:${port}`);
      console.log(`📁 Serving: ${serveDir}`);
      
      if (options.watch) {
        console.log('👀 Watching for changes... (feature coming soon)');
        // TODO: Implement file watching and auto-rebuild
        // This could use chokidar to watch source files and automatically run build
      }
      
      console.log('\n💡 Press Ctrl+C to stop the server');
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down development server...');
      process.exit(0);
    });
  });