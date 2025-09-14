import { execSync } from 'node:child_process';

const getGitCommit = () => {
  try {
    // execSync executes a command in the shell and returns its output
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    console.error('Error getting git commit:', error);
    return 'N/A';
  }
};

export const buildInfo = {
  /** The time the site was built in ISO format */
  time: new Date().toISOString(),
  /** The latest git commit hash */
  commit: getGitCommit(),
  repo: 'idawnlight/blog-astro',
};