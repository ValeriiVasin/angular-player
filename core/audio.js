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
