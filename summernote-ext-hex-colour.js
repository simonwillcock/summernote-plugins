(function ($) {
  // template, editor
  var tmpl = $.summernote.renderer.getTemplate();
  var editor = $.summernote.eventHandler.getEditor();
  var eventHandler = $.summernote.eventHandler;

  // core functions: range, dom
  var range = $.summernote.core.range;
  var dom = $.summernote.core.dom;

  /**
   * Show hex dialog and set event handlers on dialog controls.
   *
   * @param {jQuery} $dialog
   * @param {jQuery} $dialog
   * @param {Object} text
   * @return {Promise}
   */
  var showHexDialog = function ($editable, $dialog, text) {
    return $.Deferred(function (deferred) {
      var $hexDialog = $dialog.find('.note-hex-dialog');

      var $hexInput = $hexDialog.find('.note-hex-input'),
          $hexBtn = $hexDialog.find('.note-hex-btn');

      $hexDialog.one('shown.bs.modal', function () {
      $hexInput.keyup(function () {
          var isHex = /^(?:[0-9a-fA-F]{3}){1,2}$/g.test($(this).val());
          toggleBtn($hexBtn, isHex);
        }).trigger('keyup').trigger('focus');

        $hexBtn.click(function (event) {
          event.preventDefault();

          deferred.resolve($hexInput.val());
          $hexDialog.modal('hide');
        });
      }).one('hidden.bs.modal', function () {
        $hexInput.off('keyup');
        $hexBtn.off('click');

        if (deferred.state() === 'pending') {
          deferred.reject();
        }
      }).modal('show');
    });
  };
  /**
   * @param {jQuery} $editable
   * @return {String}
   */
  var getTextOnRange = function ($editable) {
    $editable.focus();

    var rng = range.create();

    // if range on anchor, expand range with anchor
    if (rng.isOnAnchor()) {
      var anchor = dom.ancestor(rng.sc, dom.isAnchor);
      rng = range.createFromNode(anchor);
    }

    return rng.toString();
  };

  /**
   * toggle button status
   *
   * @param {jQuery} $btn
   * @param {Boolean} isEnable
   */
  var toggleBtn = function ($btn, isEnable) {
    $btn.toggleClass('disabled', !isEnable);
    $btn.attr('disabled', !isEnable);
  };

  // add video plugin
  $.summernote.addPlugin({
    name: 'hex',
    buttons: {
      /**
       * @param {Object} lang
       * @return {String}
       */
      hex: function (lang, options) {
        var colourButtonLabel = '<i class="fa fa-paint-brush"></i>';
        var colourButton = tmpl.button(colourButtonLabel, {
          className: 'note-recent-hex',
          title: lang.hex.recent,
          event: 'showHexDialog',
          value: '{}'
        });

        return colourButton;
      }
    },

    dialogs: {
      /**
       * @param {Object} lang
       * @param {Object} options
       * @return {String}
       */
      video: function (lang) {
        var body = '<div class="form-group row-fluid">' +
                     '<label>' + lang.hex.hex + '</label>' +
                     '<div class="input-group">'+
                     '<span class="input-group-addon">#</span>'+
                     '<input class="note-hex-input form-control span12" type="text" />' +
                     '</div>'+
                   '</div>';
        var footer = '<button href="#" class="btn btn-primary note-hex-btn disabled" disabled>' + lang.hex.set + '</button>';
        return tmpl.dialog('note-hex-dialog', lang.hex.set, body, footer);
      }
    },

    events: {
      /**
       * @param {Object} layoutInfo
       */
      showHexDialog: function (layoutInfo) {
        var $dialog = layoutInfo.dialog(),
            $editable = layoutInfo.editable(),
            text = getTextOnRange($editable);

        // save current range
        editor.saveRange($editable);

        showHexDialog($editable, $dialog, text).then(function (hex) {
          // when ok button clicked

          // restore range
          editor.restoreRange($editable);

          // insert video node
          editor.color(layoutInfo.editable(),'{"foreColor":"'+hex+'"}');
        }).fail(function () {
          // when cancel button clicked
          editor.restoreRange($editable);
        });
      }
    },

    // define language
    langs: {
      'en-US': {
        hex: {
          hex: 'Hex Colour',
          recent: 'Set hex colour',
          set: 'Set Colour',
        }
      }
    }
  });
})(jQuery);
