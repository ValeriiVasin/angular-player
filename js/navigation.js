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
