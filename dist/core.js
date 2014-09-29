/**
 * Audio element abstraction
 * http://www.w3schools.com/tags/ref_av_dom.asp
 */
angular.module('Player.Audio', [])
  .factory('Audio', ['$rootScope', function ($rootScope) {
    var player = new Audio(),

        props = {
          src:    null,
          time:   0,
          volume: localStorage.getItem('volume'),

          // currently playing song duration
          duration: 0,

          // initial value: "not playing"
          paused: true,
          muted:  false,
          ended:  false,
          loop:   false
        },

        // last progress range
        // see: http://www.sitepoint.com/essential-audio-and-video-events-for-html5
        // `start` and `end` - seconds
        progress = { start: 0, end: 0 },

        floor = Math.floor,

        factory = {
          play:        play,
          time:        time,
          prop:        prop,
          volume:      volume,
          getProgress: getProgress,
          togglePause: togglePause
        };

    // set initial volume
    volume( props.volume ? Number(props.volume) : 100 );

    /**
     * Get / set music source
     * @private
     */
    function _source(src) {
      if (typeof src === 'undefined') {
        return src;
      }

      player.src = props.src = src;

      // reset progress
      progress = { start: 0, end: 0 };
    }

    /**
     * Get / set volume level: [0..100]
     */
    function volume(vol) {
      if (typeof vol === 'undefined') {
        return props.volume;
      }

      props.volume  = vol;
      player.volume = vol / 100;
      localStorage.setItem('volume', vol);
    }

    function play(src) {
      if (typeof src !== 'undefined') {
        _source(src);
      }

      props.paused = props.ended = false;
      player.play();
    }

    function pause() {
      props.paused = true;
      player.pause();
    }

    /**
     * Toggle pause state
     * @param  {Boolean} state Pause or not. If true: pause
     */
    function togglePause(state) {
      if (typeof state === 'undefined') {
        state = !props.paused;
      }

      if (state) {
        pause();
      } else {
        play();
      }
    }

    /**
     * Get / set time
     */
    function time(value) {
      if (typeof value === 'undefined') {
        return props.time;
      }

      // We could not change time if duration is Infinite
      // Notice: it's for online streams
      if ( prop('duration') === Infinity ) {
        return;
      }

      player.currentTime = props.time = value;
    }

    $(player)

      // preload=auto is needed for progress event
      .attr('preload', 'auto')

      // observe events
      .on({
        timeupdate: function () {
          props.time = floor(player.currentTime);
          $rootScope.$apply();
        },

        ended: function () {
          prop('ended', true);
          $rootScope.$apply();
        },

        durationchange: function () {
          prop('duration', player.duration);
          $rootScope.$apply();
        },

        progress: function () {
          var buffered = player.buffered,
              last     = buffered.length - 1;

          // sometimes nothing is loaded at the moment
          if (buffered.length === 0) {
            return;
          }

          progress = {
            start: buffered.start(last),
            end:   buffered.end(last)
          };

          $rootScope.$apply();
        }
      });

    // props getter/setter
    function prop(name, value) {
      if ( !props.hasOwnProperty(name) ) {
        throw new Error('prop `'+ name +'` does not exist');
      }

      // getter
      if (typeof value === 'undefined') {
        return props[name];
      }

      // setter
      props[name] = value;

      switch (name) {
        case 'loop':
          player.loop = Boolean(value);
          break;
      }
    }

    function getProgress() {
      return progress;
    }

    return factory;
  }]);

angular.module('Player.Duration', [])
  .factory('Utils', function() {
    /**
     * Add leading zeros to number until it will have correct length
     * @param {Number/String} value   Any number or stringified number
     * @param {Number}        length  Needed length
     * @param {String}        symbol  Symbol for padding
     * @return {String}               Value with leading zeros
     */

    function pad(value, length, symbol) {
      length = length || 2;
      symbol = symbol || '0';

      value = value.toString();
      while (value.length < length) {
        value = symbol + value;
      }

      return value;
    }

    return {
      pad: pad
    };
  })

  .filter('duration', ['Utils', function (Utils) {
      return function(duration) {
        if (duration === 0) {
          return '00:00';
        }

        if ( duration === -Infinity || duration === Infinity ) {
          return '∞';
        }

        var result = duration < 0 ? '-' : '';
        duration = Math.abs(duration);
        var minutes = Utils.pad(Math.floor(duration / 60));
        var seconds = Utils.pad(duration % 60);

        result = result + minutes + ':' + seconds;

        return result;
      };
    }
  ]);

angular.module('Player.Navigation', ['Player.Playlist'])
  .factory('Navigation', ['Playlist', function (Playlist) {
    var factory  = {
      next:  next,
      prev:  prev,
      set:   set,
      reset: reset,
      index: 0
    };

    /**
     * Set current index
     * @param {Number} index Playlist index
     */
    function set(index) {
      factory.index = index;
    }

    function reset() {
      factory.index = 0;
    }

    function next() {
      factory.index = Playlist.nextIndex(factory.index);
    }

    function prev() {
      factory.index = Playlist.prevIndex(factory.index);
    }

    return factory;
  }]);

/**
 * @example
 *   // Get url before play:
 *   Playlist.beforePlay = function (song) {
 *
 *     // request some remote server for song url
 *     VK.Api.call('audio.search', {q: song.title}, function (response) {
 *       song.url = response[1].url;
 *     });
 *   };
 */
angular.module('Player.Playlist', ['Player.Audio', 'Player.Queue'])
  .factory('Playlist', ['$q', 'Audio', 'Queue',
              function ( $q,   Audio,   Queue ) {

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

      // @todo: is this really used
      if (typeof song === 'number') {
        song = _songsMap[song];
      }

      if ( typeof factory.beforePlay === 'function' ) {

        // wrap to promise if non-promise value is returned
        $q.when( factory.beforePlay(song) )
          .then(function () {
            factory.currentSong = song;
            Audio.play( song.url );
          });
      } else {
        factory.currentSong = song;
        Audio.play( song.url );
      }
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

angular.module('Player.Queue', [])
  .factory('Queue', [function () {
    var _next = [], // FIFO
        _prev = []; // LIFO

    /**
     * Getter setter of next song
     * @param {Number} [index] If provided, index is added to next queue,
     *                         otherwise: retrieve index from next queue
     */
    function next(index) {
      if (typeof index === 'undefined') {
        return _next.shift();
      }

      _next.push(index);
    }

    /**
     * Add to next queue / or remove from it
     * @param  {Number} index Song uniq index
     */
    function toggleNext(index) {
      if ( _isInNextQueue(index) ) {
        removeFromNext(index);
      } else {
        next(index);
      }
    }

    /**
     * Remove from next queue
     * @param   {Number} index  Song uniq index
     */
    function removeFromNext(index) {
      if ( _isInNextQueue(index) ) {
        _next.splice( position(index) , 1);
      }
    }

    /**
     * Position in the next queue
     * @return {Number|null} Position inside the next queue or null, if is not in queue
     */
    function position(index) {
      var _position = _next.indexOf(index);

      return _position === -1 ? null : _position;
    }

    /**
     * Check song presence in next queue
     *
     * @param  {Number}  index Song uniq index
     * @return {Boolean}       Result of check
     */
    function _isInNextQueue(index) {
      return _next.indexOf(index) !== -1;
    }

    /**
     * Get / add to prev queue
     */
    function prev(index) {
      if (typeof index === 'undefined') {
        return _prev.pop();
      }

      _prev.push(index);
    }

    // reset queue
    function reset() {
      _next = [];
      _prev = [];
    }

    return {
      addToNext: next,
      next: next,
      position: position,
      removeFromNext: removeFromNext,
      toggleNext: toggleNext,
      addToPrev: prev,
      prev: prev,
      reset: reset
    };
  }]);

// keyboard shortcuts for the player
angular.module('Player.Shortcuts', [
  'Player.Audio',
  'Player.Navigation',
  'Player.Queue',
  'Player.Playlist'
])
.directive('playerShortcuts', ['$document', 'Audio', 'Navigation', 'Queue', 'Playlist',
                     function ( $document,   Audio,   Navigation,   Queue,   Playlist ) {

  return  {
    restrict: 'A',
    link: function ($scope) {
      function onKeydown(e) {
        var song;

        switch (e.which) {
          case 81:
            // Q - queue
            Queue.toggleNext(
              Playlist.getSong(Navigation.index)._index
            );
            e.preventDefault();
            break;
          case 32:
            // Space - pause/unpause current song
            Audio.togglePause();
            e.preventDefault();
            break;
          case 40:
            // Down - select next item in the list
            Navigation.next();
            e.preventDefault();
            break;
          case 38:
            // Up - select prev item in the list
            Navigation.prev();
            e.preventDefault();
            break;
          case 13:
            // Enter - play currently selected item
            song = Playlist.getSong(Navigation.index);
            Queue.prev(song._index);
            Playlist.play( song );

            e.preventDefault();
            break;
          case 84:
            // T - search box
            break;

            // no defaults
        }

        $scope.$apply();
      }

      $document.on('keydown', onKeydown);
      $scope.$on('$destroy', function () {
        $document.off('keydown', onKeydown);
      });
    }
  };
}]);
