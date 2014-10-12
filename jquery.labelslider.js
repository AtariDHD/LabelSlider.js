/*
* LabelSlider 1.0
*
* Copyright 2014, Corey Meredith - http://halfduplex.us/
* Released under the GNU GENERAL PUBLIC LICENSE - http://www.gnu.org/licenses/gpl-3.0.txt
*
*/

(function ($) {
    'use strict';

    $.fn.labelSlider = function (options) {
        var settings = {
            initValue: true,
            pixelsPerUnit: 1,
            triggerChangeOnStop: false,
            validate: true
        };
        if (options)
            $.extend(settings, options);
        
        if (!$.isNumeric(settings.pixelsPerUnit) || settings.pixelsPerUnit < 0.01)
            settings.pixelsPerUnit = 1;

        var inputSelector = 'INPUT:not([type]), INPUT[type=text], INPUT[type=number], INPUT[type=range], INPUT[type=slider], INPUT[type=search], INPUT[type=hidden], INPUT[type=date], METER, PROGRESS',
            css = {
                'cursor': 'e-resize',
                'user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                '-webkit-user-select': 'none'
            },
            cssText = '';
        for (var prop in css) {
            cssText += prop + ': ' + css[prop] + '; ';
        }
        

        this.each(function () {
            var $label = $(this),
                $input = [];
            if ($label.attr('for'))
                $input = $('#' + $label.attr('for'));
            if (!$input.length)
                $input = $label.find(inputSelector).first();
            if (!$input.length ||
                !$input.is(inputSelector) ||
                $label.data('labelSliderInstrumented') ||
                ($input.is('INPUT[type=date]') && typeof $input[0].valueAsNumber === 'undefined'))
                return;

            $label.data('labelSliderInstrumented', true);
            $label.data('ls_input', $input);
            $label.css(css);
            if ($input.is('PROGRESS'))
                $input.attr('min', '0');
            $input.data('ls_isdate', $input.is('INPUT[type=date]'));

            if ($input.data('ls_isdate')) {
                $input.data('ls_hasMin', !isNaN(Date.parse($input.attr('min'))));
                $input.data('ls_hasMax', !isNaN(Date.parse($input.attr('max'))));
                if ($input.data('ls_hasMin'))
                    $input.data('ls_min', Date.parse($input.attr('min')));
                if ($input.data('ls_hasMax'))
                    $input.data('ls_max', Date.parse($input.attr('max')));
                $input.data('ls_step', $.isNumeric($input.attr('step')) ? parseInt($input.attr('step')) : 1);
            }
            else {
                $input.data('ls_hasMin', $.isNumeric($input.attr('min')));
                $input.data('ls_hasMax', $.isNumeric($input.attr('max')));
                $input.data('ls_step', $.isNumeric($input.attr('step')) ? parseFloat($input.attr('step')) : 1);
                $input.data('ls_stepPrecision', decimalPlaces($input.data('ls_step')));
            }

            if (settings.initValue)
                validateInput($input);

            if (settings.validate) {
                if (!$input.data('ls_isdate')) {
                    $input.keydown(function (e) {
                        var kc = e.keyCode;
                        if (!((kc >= 48 && kc <= 57) ||
    						  (kc >= 96 && kc <= 105) ||
    						  (kc >= 35 && kc <= 40) ||
    						  (kc == 8 || kc == 9 || kc == 13 || kc == 27 || kc == 45 || kc == 46 || kc == 189 || kc == 190) ||
    						  ((kc == 65 || kc == 67 || kc == 86 || kc == 88) && e.ctrlKey === true)
    					   ))
                                e.preventDefault();
                    }).bind('drop', function (e) {
                        if (isNaN(parseFloat(e.originalEvent.dataTransfer.getData('Text'))))
                            e.preventDefault();
                        else
                            setTimeout(function () { $input.trigger('change'); }, 0);
                    });
                }

                $input.change(function (e) {
                    validateInput($(e.target));
                }).blur(function (e) {
                    $(e.target).trigger('change');
                });
            }

            $label.draggable({
                revert: true,
                revertDuration: 0,
                helper: function () {
                    return '<span style="' +
                            cssText +
							'background: #FFF; ' +
                            'display: inline-block; ' +
                            'filter: alpha(opacity=0); ' +
                            'height: 30px; ' +
                            'opacity: 0; ' +
                            'width: 60px;' +
                            '"></span>';
                },
                cursor: 'e-resize',
                cursorAt: { top: 15, left: 30 },
                start: function(e, ui) {
                    $(this).data('ls_input').addClass('label-slider-sliding');
                },
                drag: function(e, ui) {
                    var $this = $(this),
                        newLeft = Math.round(ui.position.left);

                    if (typeof $this.data('ls_lastLeft') === 'undefined')
                        $this.data('ls_lastLeft', newLeft);

                    var startPos = $this.data('ls_lastLeft'),
                        pixelMoveAmount = newLeft - startPos;
                    
                    if (Math.abs(pixelMoveAmount) < settings.pixelsPerUnit)
                        return;
                    
                    var $input = $this.data('ls_input'),
                        moveAmount = settings.pixelsPerUnit < 1
								   ? Math.round(pixelMoveAmount / settings.pixelsPerUnit)
								   : Math.floor(pixelMoveAmount / settings.pixelsPerUnit);

                    if ($input.data('ls_isdate')) {
                        var startVal = isNaN(Date.parse($input.val())) ? Date.now() : $input[0].valueAsNumber,
                            step = $input.data('ls_step') * 86400000,
                            newVal = parseInt((startVal + (step * moveAmount)));
                    }
                    else {
                        var startVal = $.isNumeric($input.val()) ? parseFloat($input.val()) : 0,
                            step = $input.data('ls_step'),
                            stepPrecision = $input.data('ls_stepPrecision'),
                            startValPrecision = decimalPlaces(startVal),
                            newValPrecision = stepPrecision > startValPrecision ? stepPrecision : startValPrecision,
                            newVal = parseFloat((startVal + (step * moveAmount)).toFixed(newValPrecision));
                    }
                    
                    $this.data('ls_lastLeft', newLeft);
                    validateInput($input, newVal);
                    if (!settings.triggerChangeOnStop)
                        $input.trigger('change');
                },
                stop: function() {
                    var $this = $(this),
                        $input = $this.data('ls_input');

                    $input.removeClass('label-slider-sliding');
                    $this.removeData('ls_lastLeft');
                    if (settings.triggerChangeOnStop)
                        $input.trigger('change');
                }
            });

            function validateInput($input, newVal) {
                if ($input.data('ls_isdate')) {
                    newVal = newVal ? newVal : isNaN(Date.parse($input.val())) ? Date.now() : $input[0].valueAsNumber;
                    if ($input.data('ls_hasMin')) {
                        var min = $input.data('ls_min');
                        if (newVal < min)
                            newVal = min;
                    }
                    if ($input.data('ls_hasMax')) {
                        var max = $input.data('ls_max');
                        if (newVal > max)
                            newVal = max;
                    }
                    $input[0].valueAsNumber = newVal;
                }
                else {
                    newVal = newVal ? newVal : parseFloat($input.val());
                    if (isNaN(newVal))
                        newVal = 0;
                    if ($input.data('ls_hasMin')) {
                        var min = parseFloat($input.attr('min'));
                        if (newVal < min)
                            newVal = min;
                    }
                    if ($input.data('ls_hasMax')) {
                        var max = parseFloat($input.attr('max'));
                        if (newVal > max)
                            newVal = max;
                    }
                    $input.val(newVal);
                }
            }

        });
        
        function decimalPlaces(num) {
            var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
            if (!match)
                return 0;
            return Math.max(
                0,
                // Number of digits right of decimal point.
                (match[1] ? match[1].length : 0)
                // Adjust for scientific notation.
                - (match[2] ? +match[2] : 0)
            );
        }

        return this;
    };

    $(function () {
        $('.label-slider').labelSlider();
    });
})(jQuery);
