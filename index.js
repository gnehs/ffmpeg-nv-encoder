const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();
// folder
let inputDir = process.argv[2]
let outputDir = path.resolve(inputDir, '/output/');
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
        ffmpeg(path.join(inputDir, filename))
            .videoCodec(encoder)
            .audioCodec('copy')
            .on('error', (err) => {
                console.error(`[ffmpeg] error: \n${err.message}`);
                reject(err);
            })
            .on('end', () => {
                console.log(`[ffmpeg] ${file} finished.`);
                resolve();
            })
            .save(path.join(outputDir, filename))
    });
    for (let file of fs.readdirSync(inputDir)) {
        console.log(`[ffmpeg] ${file} proccesing...`);
        await parseVideo(file)
    }
})();