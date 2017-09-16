/*

CopyTaskRunner.js (turboCopier)

Performs series of copy tasks specified in their own directory.
By default turboCopier would look inside each subfolder of current working directory 
(eg.  ./task1, ... , ./taskN ) and copy files as per ./taskN/config.json manifest.
Each config.js would be kind of namespaced, ie. you can base each task's paths on 
own '.' folder so that tasks do not mess with each other.

config.json example:

{
    "src":      [
        "%appDATA%/Keypirinha/User/**\/*",
        "!%appDATA%/Keypirinha/User/History.ini"
    ],
    "dest":     "./copied",
    "options":  {
        "confirm": false,
        "backupExistingFiles": true
    }
}

Based on recipe from https://github.com/gulpjs/gulp/blob/4.0/docs/recipes/running-task-steps-per-folder.md

*/




// Gulp module imports
import {src, dest, parallel, series, task} from 'gulp';
import debug from 'gulp-debug';
import globby from 'globby';
import path from 'path';
import del from 'del';
import fs from 'fs';
import merge from 'merge-stream';



const options = {
    tasksRoot:             './',
    tasksDirMask:          '*/',
    tasksConfigFile:       'config.json',
    tasksDestinationPath:  'copied/',    
    
    appendDirGlob:    [ 
        '!**/node_modules/', 
        '!**/.*' 
    ] 
}


let configGlob = options.appendDirGlob.slice()
configGlob.unshift(
    options.tasksRoot + options.tasksDirMask + options.tasksConfigFile
)


const dumpConfigGlob = () => {
  console.log('configGlob is:');
  configGlob.forEach( item => { console.log(item) } )
}

const dumpPaths = () => {}

export const printGlob = () => globby(configGlob)
    .then(paths => { console.log(paths) })
    .then(result => { dumpConfigGlob() })
    .catch(err => {     
             console.log('Error in globby!'); 
             dumpConfigGlob();
    })

    
    

export const copyTasks = () => globby(configGlob)
    .then(paths => paths.map( 
              file => {
                let taskConfig = require(file);
                console.dir(taskConfig);
                const taskDestination = path.join(
                    path.dirname(path.resolve(file)), 
                    taskConfig.dest || options.tasksDestinationPath
                );
                console.log(taskDestination);
                return src(taskConfig.src)
                    .pipe(debug())
                    .pipe(dest(taskDestination))
              }
          ))
    .then(tasks => merge(tasks))
    .catch(err => {     
             console.log('Error in task copyTasks'); 
             dumpConfigGlob();
    })


export default copyTasks
