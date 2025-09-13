import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

import { BlogConfig } from '@/interfaces/blog';

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
  .argument('[projectName]', 'Name of the project directory to create')
  .option('-d, --directory <dir>', 'Target directory for the project (overrides projectName)')
  .action((projectName, options) => {
    let targetDir: string;
    
    if (options.directory) {
      // If directory option is provided, use it
      targetDir = path.resolve(options.directory);
    } 
    else if (projectName) {
      // If project name is provided, create a folder with that name
      targetDir = path.resolve(projectName);
    } 
    else {
      // Default to current directory
      targetDir = path.resolve('.');
    }
    
    // Create the target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created project directory: ${path.basename(targetDir)}`);
    }
    
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
      const defaultConfig: BlogConfig = {
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

    if (projectName && !options.directory) {
      console.log(`1. Navigate to your project: cd ${projectName}`);
      console.log('2. Edit blog.config.json to customize your blog');
      console.log('3. Add more posts to content/posts/');
      console.log('4. Run "alxblg build" to generate your blog');
      console.log('5. Run "alxblg serve" to start the development server');
    } 
    else {
      console.log('1. Edit blog.config.json to customize your blog');
      console.log('2. Add more posts to content/posts/');
      console.log('3. Run "alxblg build" to generate your blog');
      console.log('4. Run "alxblg serve" to start the development server');
    }
  });