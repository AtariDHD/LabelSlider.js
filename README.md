# Introducing LabelSlider.js
A jQuery plugin for converting form labels into Photoshop-style range slider controls for numeric and date inputs.

LabelSlider adds the power and conveniance of clicking and dragging HTML form labels to adjust values to your web pages.
[Check out the demo page](http://ifugu.github.io/LabelSlider.js/demo.html)

## How Do I Use It?
Include jQuery 1.x, jQuery UI 1.x and LabelSlider.js on your page and add the class, label-slider, to your labels.

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js"></script>
<script src="path/to/jquery.labelslider.min.js"></script>
<script>
  $(document).ready(function(){
    // You only need to call labelSlider() yourself if you need to pass options and/or select elements instead of adding the standard .label-silder class.
    // Target your label or other element containing text associated with your input
    $('LABEL').labelSlider();
  });
</script>
```

## Compatible Browsers

IE6+, Chrome, Firefox, Safari, Opera.
