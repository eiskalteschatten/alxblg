#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { buildCommand } from './commands/build';
import { serveCommand } from './commands/serve';

const program = new Command();

program
  .name('alxblg')
  .description('A simple blog generator CLI')
  .version('0.1.0');

// Register commands
program.addCommand(initCommand);
program.addCommand(buildCommand);
program.addCommand(serveCommand);

// Parse arguments
program.parse();
