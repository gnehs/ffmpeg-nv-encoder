const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();
const replaceExt = require('replace-ext');
// folder
let inputDir = process.argv[2]
let outputDir = path.resolve(inputDir, './output/');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
// encoder & decoder
let list2console = list => list.map((x, i) => (`${i + 1}. ${x}`)).join('\n')
let encoderList = ['hevc_nvenc', 'h264_nvenc']
let decoderList = ['h264_cuvid', 'hevc_cuvid', 'mpeg4_cuvid', 'vc1_cuvid', 'vp8_cuvid', 'vp9_cuvid', 'h263_cuvid', 'mjpeg_cuvid', 'mpeg1_cuvid', 'mpeg2_cuvid', 'cpu']

console.log(`===\nDecoder list:\n${list2console(decoderList)}`);
let decoder = decoderList[parseInt(prompt('Choose decoder: ')) - 1] || '';

console.log(`===\nEncoder list:\n${list2console(encoderList)}`);
let encoder = encoderList[parseInt(prompt('Choose encoder: ')) - 1] || '';
// gogogo
(async function () {
    console.log(`inputDir : ${inputDir}`)
    console.log(`outputDir: ${outputDir}`)
    console.log(`decoder  : ${decoder}`)
    console.log(`encoder  : ${encoder}`)

    let parseVideo = filename => new Promise((resolve, reject) => {
        let outputFilePath = replaceExt(path.resolve(outputDir, filename), '.mp4');
        // inputOptions
        let inputOptions = []
        if (decoder != 'cpu') inputOptions.push('-hwaccel cuvid', `-c:v ${decoder}`)
        // check file exists
        if (!fs.existsSync(outputFilePath)) {
            ffmpeg(fs.createReadStream(path.resolve(inputDir, filename))
                .inputOptions(inputOptions)
                .outputOptions(['-profile:v main10', '-preset slow'])
                .videoCodec(encoder)
                .audioCodec('copy')
                .on('start', commandLine => {
                    console.log('\n[ffmpeg] Spawned FFmpeg with command: \n' + commandLine + '\n');
                })
                .on('progress', ({ percent, frames, currentFps, currentKbps, targetSize, timemark }) => {
                    console.log(`[ffmpeg] Processing: ${parseInt(percent)}%, ${currentFps}fps, ${timemark}`);
                })
                .on('error', function (err, stdout, stderr) {
                    console.log('[ffmpeg] Cannot process video: ' + err.message);
                    reject(err.message)
                })
                .on('end', () => {
                    console.log(`[ffmpeg] ${filename} finished.`);
                    resolve();
                })
                .save(outputFilePath)
        }
        else {
            resolve();
        }

    });
    for (let filename of fs.readdirSync(inputDir)) {
        try {
            // check if it is a file
            if (fs.lstatSync(path.resolve(inputDir, filename)).isFile()) {
                await parseVideo(filename)
            }
        } catch (e) {
            console.error(`[ffmpeg] error: \n${e.message}`);
        }
    }
})();