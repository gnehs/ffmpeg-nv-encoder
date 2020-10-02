const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();
// folder
let inputDir = process.argv[2]
let outputDir = path.resolve(inputDir, './output/');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
// encoder & decoder
let list2console = list => list.map((x, i) => (`${i + 1}. ${x}`)).join('\n')
let encoderList = ['hevc_nvenc', 'h264_nvenc']
/*
let decoderList = ['h264_cuvid', 'hevc_cuvid', 'mpeg4_cuvid', 'vc1_cuvid', 'vp8_cuvid', 'vp9_cuvid', 'h263_cuvid', 'mjpeg_cuvid', 'mpeg1_cuvid', 'mpeg2_cuvid', 'cpu']
console.log(`===\nDecoder list:\n${list2console(decoderList)}`);
let decoder = decoderList[parseInt(prompt('Choose decoder: ')) - 1] || '';
*/
console.log(`===\nEncoder list:\n${list2console(encoderList)}`);
let encoder = encoderList[parseInt(prompt('Choose encoder: ')) - 1] || '';
// gogogo
(async function () {
    console.log(`inputDir : ${inputDir}`)
    console.log(`outputDir: ${outputDir}`)
    //console.log(`decoder  : ${decoder}`)
    console.log(`encoder  : ${encoder}`)

    let parseVideo = filename => new Promise((resolve, reject) => {
        ffmpeg(path.resolve(inputDir, filename))
            .videoCodec(encoder)
            .audioCodec('copy')
            .on('start', commandLine => {
                console.log('\nSpawned FFmpeg with command: \n' + commandLine);
            })
            .on('error', function (err, stdout, stderr) {
                console.log('Cannot process video: ' + err.message);
            })
            .on('end', () => {
                console.log(`[ffmpeg] ${filename} finished.`);
                resolve();
            })
            .save(path.resolve(outputDir, filename))

    });
    for (let filename of fs.readdirSync(inputDir)) {
        console.error(`[ffmpeg] 開始轉換: \n${filename}`);
        try {
            // check if file exists
            if (!fs.existsSync(path.resolve(outputDir, filename))) {
                await parseVideo(filename)
            }
        } catch (e) {
            console.error(`[ffmpeg] error: \n${e.message}`);
        }
    }
})();