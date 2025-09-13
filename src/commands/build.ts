import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';

interface BlogConfig {
  title: string;
  description: string;
  author: string;
  baseUrl: string;
  postsPerPage: number;
}

interface Post {
  title: string;
  date: string;
  slug: string;
  content: string;
  excerpt?: string;
}

export const buildCommand = new Command('build')
  .description('Build the static blog site')
  .option('-s, --source <dir>', 'Source directory', '.')
  .option('-o, --output <dir>', 'Output directory', 'public')
  .action((options) => {
    const sourceDir = path.resolve(options.source);
    const outputDir = path.resolve(options.output);
    
    console.log(`Building blog from ${sourceDir} to ${outputDir}...`);
    
    // Load config
    const configPath = path.join(sourceDir, 'blog.config.json');
    if (!fs.existsSync(configPath)) {
      console.error('❌ blog.config.json not found. Run "alxblg init" first.');
      process.exit(1);
    }
    
    const config: BlogConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Setup Nunjucks
    nunjucks.configure(path.join(sourceDir, 'templates'), { autoescape: true });
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Load and parse posts
    const postsDir = path.join(sourceDir, 'content/posts');
    const posts: Post[] = [];
    
    if (fs.existsSync(postsDir)) {
      const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
      
      for (const file of postFiles) {
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Parse frontmatter (simple implementation)
        const frontmatterMatch = content.match(/^---\n(.*?)\n---\n(.*)/s);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const postContent = frontmatterMatch[2];
          
          const post: Post = {
            title: '',
            date: '',
            slug: '',
            content: postContent,
          };
          
          // Parse frontmatter fields
          const lines = frontmatter.split('\n');
          for (const line of lines) {
            const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
            if (match) {
              const [, key, value] = match;
              (post as any)[key] = value;
            }
          }
          
          post.excerpt = postContent.split('\n').slice(0, 3).join(' ').substring(0, 200) + '...';
          posts.push(post);
        }
      }
    }
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Create default templates if they don't exist
    const templatesDir = path.join(sourceDir, 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }
    
    const layoutTemplate = path.join(templatesDir, 'layout.html');
    if (!fs.existsSync(layoutTemplate)) {
      const defaultLayout = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}{{ config.title }}{% endblock %}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
        .post { margin-bottom: 40px; }
        .post-meta { color: #666; font-size: 14px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <header>
        <h1><a href="/" style="text-decoration: none; color: inherit;">{{ config.title }}</a></h1>
        <p>{{ config.description }}</p>
    </header>
    
    <main>
        {% block content %}{% endblock %}
    </main>
    
    <footer style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
        <p>&copy; {{ config.author }}</p>
    </footer>
</body>
</html>`;
      fs.writeFileSync(layoutTemplate, defaultLayout);
    }
    
    const indexTemplate = path.join(templatesDir, 'index.html');
    if (!fs.existsSync(indexTemplate)) {
      const defaultIndex = `{% extends "layout.html" %}

{% block content %}
    {% for post in posts %}
        <article class="post">
            <h2><a href="/posts/{{ post.slug }}.html">{{ post.title }}</a></h2>
            <div class="post-meta">{{ post.date }}</div>
            <p>{{ post.excerpt }}</p>
        </article>
    {% endfor %}
{% endblock %}`;
      fs.writeFileSync(indexTemplate, defaultIndex);
    }
    
    const postTemplate = path.join(templatesDir, 'post.html');
    if (!fs.existsSync(postTemplate)) {
      const defaultPost = `{% extends "layout.html" %}

{% block title %}{{ post.title }} - {{ config.title }}{% endblock %}

{% block content %}
    <article>
        <h1>{{ post.title }}</h1>
        <div class="post-meta">{{ post.date }}</div>
        <div class="post-content">
            {{ post.content | safe }}
        </div>
    </article>
    
    <nav style="margin-top: 40px;">
        <a href="/">&larr; Back to all posts</a>
    </nav>
{% endblock %}`;
      fs.writeFileSync(postTemplate, defaultPost);
    }
    
    // Generate index page
    const indexHtml = nunjucks.render('index.html', { config, posts });
    fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
    
    // Generate individual post pages
    const postsOutputDir = path.join(outputDir, 'posts');
    if (!fs.existsSync(postsOutputDir)) {
      fs.mkdirSync(postsOutputDir, { recursive: true });
    }
    
    for (const post of posts) {
      const postHtml = nunjucks.render('post.html', { config, post });
      fs.writeFileSync(path.join(postsOutputDir, `${post.slug}.html`), postHtml);
    }
    
    // Copy assets if they exist
    const assetsDir = path.join(sourceDir, 'assets');
    const outputAssetsDir = path.join(outputDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      copyDirectory(assetsDir, outputAssetsDir);
    }
    
    console.log('✅ Blog built successfully!');
    console.log(`📁 Output: ${outputDir}`);
    console.log(`📝 Generated ${posts.length} posts`);
  });

function copyDirectory(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}