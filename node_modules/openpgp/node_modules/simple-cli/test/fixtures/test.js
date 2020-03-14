#!/usr/bin/env node

const args = process.argv.slice(2).join(' ');
if (process.env.FOO) {
  console.log(args, process.env.FOO);
} else if (args.indexOf('--cwd') > -1) {
  console.log(args, process.cwd());
} else if (args.indexOf('--fail') > -1) {
  process.exit(1);
} else {
  console.log(args);
}
