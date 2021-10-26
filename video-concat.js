const fs = require('fs');
const fsAsync = require('fs').promises;
const path = require('path');
const childProcess = require("child_process");

const probeCheck = require('./probe-check');

module.exports.combineFilesInDirectory = async (directory, deleteOld = false) => {
    console.log(`Combining video files in ${directory}...`);
    const filenames = await makeListOfFilesInDir(directory);
    const success = await runCombinationProcess(directory);
    console.log(`Combination success: ${success}`);
    if (deleteOld && success) await deleteFiles(directory, filenames);
}

function runCombinationProcess(directory, listName = 'files.txt') {
    return new Promise((resolve, reject) => {
        let commandArgs = [
            '-hide_banner',
            '-y',
            '-loglevel', 'warning',
            '-f', 'concat', '-safe', '0', '-i', `${path.join(directory, listName)}`, '-c', 'copy', `${path.join(directory, 'output.mkv')}`];

        log('Running combination command...');
        let ffmpegProcess = childProcess.spawn("ffmpeg", commandArgs, {});

        ffmpegProcess.stdout.on('data', (data) => {
            log('[STDOUT]', data.toString());
        });

        ffmpegProcess.stderr.on('data', (data) => {
            log('[STDERR]', data.toString());
        });

        ffmpegProcess.on('exit', (code) => {
            log(`[EXIT] code ${code}`);
            return resolve(code == 0);
        });
        
        ffmpegProcess.on('error', (err) => {
            log(`[ERROR]`, err);
            return reject(err)
        });
    })
}


function log(message, ...optionalParams) {
    console.log(`${new Date().toISOString()} ${message}`, ...optionalParams);
}

function makeListOfFilesInDir(dir, ext = '.mkv', listName = 'files.txt') {
    return new Promise(async (resolve, reject) => {
        let listOfFiles = getFilesInDir(dir, ext);
        console.log('listOfFiles', listOfFiles);

        listOfFiles = filterFilesBySize(dir, [...listOfFiles]);
        console.log('filterFilesBySize', listOfFiles);

        listOfFiles = await filterFilesByValid(dir, [...listOfFiles]);
        console.log('filterFilesByValid', listOfFiles);

        const listOfFilesFormatted = listOfFiles.map(x => `file '${x}'`);
        console.log(`${listOfFilesFormatted.length} files to combine`);
        const listFilepath = path.join(dir, listName);
        console.log('saving file list', listFilepath)
        const content = listOfFilesFormatted.join('\n');
        fs.writeFile(listFilepath, content, (err) => {
            if (err) {
                console.log(err)
                return reject(err)
            } else {
                console.log('file list saved')
                return resolve(listOfFiles);
            }
        });
    })
}

function getFilesInDir(dir, ext = '.mkv') {
    let listOfFiles = fs.readdirSync(dir);
    listOfFiles = listOfFiles.sort();
    listOfFiles = listOfFiles.filter(x => x.endsWith(ext));
    listOfFiles = listOfFiles.filter(x => x != 'output.mkv');
    return listOfFiles;
}

function filterFilesBySize(dir, filenames, size = 500000) {
    const results = [];
    for (let i = filenames.length - 1; i >= 0; i--) {
        const filename = filenames[i];
        const filepath = path.join(dir, filename);
        const stats = fs.statSync(filepath);
        if (stats.size < size) {
            console.log(`${filename} is too small (${stats.size})`);
        } else {
            results.push(filename)
        }
    }
    return results;
}

async function filterFilesByValid(dir, filenames) {
    const results = [];
    for (let i = filenames.length - 1; i >= 0; i--) {
        const filename = filenames[i];
        const success = await probeCheck.probeSuccess(path.join(dir, filename))
        if (success) {
            results.push(filename);
        }
    }
    return results;
}

async function deleteListOfFilesInDir(dir, listName = 'files.txt') {
    return new Promise((resolve, reject) => {
        const listFilepath = path.join(dir, listName);
        fs.unlink(listFilepath, (err) => {
            if (err) {
                return reject(err)
            } else {
                return resolve();
            }
        });
    })
}

async function deleteFiles(directory, filenames) {
    for (let i = 0; i < filenames.length; i++) {
        const filepath = path.join(directory, filenames[i]);
        await fsAsync.unlink(filepath);
    }
}