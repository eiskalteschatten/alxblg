import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

function copyDefaultPost(targetPath: string): void {
  const defaultPostPath = path.join(__dirname, '..', '..', 'templates', 'welcome.md');
  if (fs.existsSync(defaultPostPath)) {
    let postContent = fs.readFileSync(defaultPostPath, 'utf8');
    // Replace the date placeholder with current date
    const currentDate = new Date().toISOString().split('T')[0];
    postContent = postContent.replace('{{DATE}}', currentDate);
    
    fs.writeFileSync(targetPath, postContent);
    console.log('Created sample post: content/posts/welcome.md');
  } 
  else {
    console.warn('Warning: Default post template not found, creating basic post');
    // Fallback to basic post if template is missing
    const fallbackPost = `---
title: "Welcome to Your New Blog"
date: "${new Date().toISOString().split('T')[0]}"
slug: "welcome"
---

# Welcome to Your New Blog

This is your first blog post!
`;
    fs.writeFileSync(targetPath, fallbackPost);
    console.log('Created sample post: content/posts/welcome.md');
  }
}

export const initCommand = new Command('init')
  .description('Initialize a new blog project')
  .option('-d, --directory <dir>', 'Target directory for the project', '.')
  .action((options) => {
    const targetDir = path.resolve(options.directory);
    
    console.log(`Initializing new blog project in ${targetDir}...`);
    
    // Create basic directory structure
    const directories = [
      'content/posts',
      'templates',
      'assets/css',
      'assets/js',
      'public'
    ];
    
    directories.forEach(dir => {
      const fullPath = path.join(targetDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
    
    // Create basic config file
    const configPath = path.join(targetDir, 'blog.config.json');
    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        title: 'My Blog',
        description: 'A simple blog generated with alxblg',
        author: 'Your Name',
        baseUrl: 'http://localhost:3000',
        postsPerPage: 10
      };
      
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('Created blog.config.json');
    }
    
    // Create sample post
    const samplePostPath = path.join(targetDir, 'content/posts/welcome.md');
    if (!fs.existsSync(samplePostPath)) {
      copyDefaultPost(samplePostPath);
    }
    
    console.log('\n✅ Blog project initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Edit blog.config.json to customize your blog');
    console.log('2. Add more posts to content/posts/');
    console.log('3. Run "alxblg build" to generate your blog');
    console.log('4. Run "alxblg serve" to start the development server');
  });