angular.module('Player.Shortcuts', [
  'Player.Audio',
  'Player.Navigation',
  'Player.Queue',
  'Player.Playlist'
])
.directive('playerShortcuts', ['Audio', 'Navigation', 'Queue', 'Playlist',
                     function ( Audio,   Navigation,   Queue,   Playlist ) {

  // keyboard shortcuts
  return function link(scope) {
    angular.element(document)
      .on('keydown', function(e) {
        scope.$apply(function() {
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
        });
      });
  };
}]);
