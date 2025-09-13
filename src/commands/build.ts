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

function copyTemplateIfNotExists(templateName: string, sourceDir: string, templatesDir: string): void {
  const templatePath = path.join(templatesDir, templateName);
  if (!fs.existsSync(templatePath)) {
    // Look for default template in the CLI package's templates directory
    const defaultTemplatePath = path.join(__dirname, '..', 'templates', templateName);
    if (fs.existsSync(defaultTemplatePath)) {
      fs.copyFileSync(defaultTemplatePath, templatePath);
      console.log(`Created template: templates/${templateName}`);
    } 
    else {
      console.warn(`Warning: Default template ${templateName} not found at ${defaultTemplatePath}`);
    }
  }
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
    
    // Copy default templates from src/templates if they don't exist
    copyTemplateIfNotExists('layout.html', sourceDir, templatesDir);
    copyTemplateIfNotExists('index.html', sourceDir, templatesDir);
    copyTemplateIfNotExists('post.html', sourceDir, templatesDir);
    
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