import {spawn} from 'node:child_process';
const args=process.argv.slice(2).filter(a=>a!=='--strictPort');
const child=spawn(process.execPath,['node_modules/@angular/cli/bin/ng.js','serve',...args],{stdio:'inherit'});
process.on('SIGTERM',()=>child.kill('SIGTERM'));process.on('SIGINT',()=>child.kill('SIGINT'));child.on('exit',code=>process.exit(code??0));
