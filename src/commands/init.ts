import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

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
      const samplePost = `---
title: "Welcome to Your New Blog"
date: "${new Date().toISOString().split('T')[0]}"
slug: "welcome"
---

# Welcome to Your New Blog

This is your first blog post! You can edit this file and add more posts to the \`content/posts\` directory.

## Getting Started

1. Edit \`blog.config.json\` to customize your blog
2. Add more posts to \`content/posts\`
3. Run \`alxblg build\` to generate your blog
4. Run \`alxblg serve\` to start the development server
`;
      
      fs.writeFileSync(samplePostPath, samplePost);
      console.log('Created sample post: content/posts/welcome.md');
    }
    
    console.log('\n✅ Blog project initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Edit blog.config.json to customize your blog');
    console.log('2. Add more posts to content/posts/');
    console.log('3. Run "alxblg build" to generate your blog');
    console.log('4. Run "alxblg serve" to start the development server');
  });