//
// <span slider="mymodel" sliderUpdate="fn(progress)" />
//
angular.module('Player.Slider', [])
  .directive('slider', ['$timeout', function ($timeout) {
      return {
        scope: {
          slider: '=',
          update: '&sliderUpdate',
          max: '=sliderMax'
        },
        link: function(scope, element, attrs) {
          // prevent applying time changes while user sliding
          var preventChanges = false;

          // update model on the fly, without passing value to update func
          var directApply = (typeof attrs.sliderUpdate === 'undefined');

          element.slider({
            range: 'min',
            start: function() {
              preventChanges = true;
            },
            slide: function(event, ui) {
              if (!directApply) {
                return;
              }

              $timeout(function() {
                scope.slider = ui.value;
              });
            },
            stop: function(event, ui) {
              $timeout(function() {
                preventChanges = false;
                if (directApply) {
                  return;
                }
                scope.update({
                  progress: ui.value
                });
              });
            }
          });

          scope.$watch('slider', function(value) {
            if (preventChanges) {
              return;
            }

            element.slider('option', 'value', value);
          });

          scope.$watch('max', function(current, prev) {
            if (current === prev) {
              return;
            }

            if ( current === Infinity ) {
              element.slider('disable');
            } else {
              element.slider('enable');

              // reset slider value to 0 after enabling
              element.slider('option', 'value', 0);
            }

            element.slider('option', 'max', current);
          });
        }
      };
    }
  ]);
