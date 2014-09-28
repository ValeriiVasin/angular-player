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
