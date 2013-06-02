var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    exec = require('child_process').exec,
    dirname = 'mp3';

var songs = fs.readdirSync( dirname )
    .filter(function (file) {
        return (/mp3$/).test(file);
    });

async.map(songs, function (song, callback) {
    var data = song.split(' - '),
        artist = data[0],
        title = data[1].slice(0, -4),
        escapedSong = song.replace(/([^\w\d])/g, '\\$1');

    exec('ffmpeg -i '+ path.join(dirname, escapedSong), function (err, stdout, stderr) {
        var match = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2})/),
            minutes = match && match[2] && Number(match[2]),
            seconds = match && match[3] && Number(match[3]);

        callback(null, {
            artist: artist,
            title: title,
            duration: minutes * 60 + seconds,
            url: 'mp3/' + song
        });
    });
}, function (err, songs) {
    console.log(songs);
    // fs.writeFileSync('data.json', JSON.stringify(songs, null, '    '));
});

