angular.module('Player.Playlist', ['Player.Audio', 'Player.Queue'])
  .factory('Playlist', ['Audio', 'Queue', function (Audio, Queue) {
    var _playlists = {};

    // all songs array
    var _songsMap  = [];

    // playlists counter
    var count = 0;

    var current = { songs: [], name: null };

    var factory = {
      add: add,
      use: use,
      has: has,

      // current: {name, songs, length}
      current: current,

      // currently playing song
      currentSong: null,
      getSong: getSong,

      prevIndex: prevIndex,
      nextIndex: nextIndex,

      play: play,
      next: next,
      prev: prev,
      playByPosition: playByPosition
    };

    /**
     * Use playlist
     * @param  {String}  name Playlist name
     */
    function add(name, songs) {
      if ( has(name) ) {
        throw new Error('Playlist with name `' + name + '` exists');
      }

      songs = angular.copy(songs);

      // add index
      songs.forEach(function (song) {
        var length = _songsMap.push(song);

        // save index into song instance
        song._index = length - 1;
      });

      _playlists[name] = songs;
      count += 1;

      // if it's first playlist - use it
      if ( count === 1 ) {
        use(name);
      }

      return factory;
    }

    /**
     * Use playlist
     * @param  {String}  name Playlist name
     * @return {Boolean}      Return result:
     *                        true if playlist exist and could be used, otherwise: false
     */
    function use(name) {
      if ( !has(name) ) {
        return false;
      }

      // playlist is currently in use
      if ( current.name === name ) {
        return;
      }

      current.name = name,
      current.songs = _playlists[name];
      current.length = _playlists[name].length;
      factory.currentSong = getSong(0);

      return true;
    }

    /**
     * Check playlist existance
     * @param  {String}  name Playlist name
     * @return {Boolean}      Result: true if playlist exist, otherwise: false
     */
    function has(name) {
      return _playlists.hasOwnProperty(name);
    }

    //
    // Playing interface
    //

    function getSong(position) {
      return current.songs[position];
    }

    function nextIndex(index) {
      var next;

      if ( typeof index === 'undefined' ) {
        index =  current.songs.indexOf(factory.currentSong);

        if (index === -1) {
          index = 0;
        }
      }

      next = index + 1;
      return next < current.length ? next : 0;
    }

    function prevIndex(index) {
      var prev;

      if ( typeof index === 'undefined' ) {
        index =  current.songs.indexOf(factory.currentSong);
        if (index === -1) {
          index = 0;
        }
      }

      prev = index - 1;
      return prev >= 0 ? prev : current.length - 1;
    }

    // Play song
    function play(song) {
      if (typeof song === 'number') {
        song = _songsMap[song];
      }

      factory.currentSong = song;
      Audio.play( song.url );
    }

    function playByPosition(position) {
      var song = getSong(position);

      Queue.prev(song._index);
      play( song );
    }

    /**
     * Play next song
     */
    function next() {
      var index = Queue.next(),
          song;

      // next queue is empty
      if (typeof index === 'undefined') {
        song = getSong( nextIndex() );

        // save to prev queue
        Queue.prev(song._index);
        play( song );
        return;
      }

      Queue.prev(index);
      play(index);
    }

    /**
     * Play prev song
     */
    function prev() {
      var index = Queue.prev(),
          song;

      if (typeof index === 'undefined') {
        // prev queue is empty
        song = getSong( prevIndex() );

        play( song );
        return;
      }

      play(index);
    }

    return factory;
  }]);
