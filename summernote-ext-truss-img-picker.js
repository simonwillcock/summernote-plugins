(function ($) {
  // template, editor
  var tmpl = $.summernote.renderer.getTemplate();
  var editor = $.summernote.eventHandler.getEditor();
  var eventHandler = $.summernote.eventHandler;

  // core functions: range, dom
  var range = $.summernote.core.range;
  var dom = $.summernote.core.dom;

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
   * Show truss image picker
   * @return {Promise} URL of file
   */
  var showTrussImageDialog = function () {
    return $.Deferred(function (deferred) {
      if(plat !== undefined){
        plat.picker.launch('modal-picker-image', deferred, options);
      } else {
        console.log('External code required');
      }
    }).then(function (data) {
      var modal = data.modal;
      modal.on('shown.bs.modal', function () {
        modal.on('picker.linkselected', function (e, link) {
          e.preventDefault();
          deferred.resolve(link.uniqueUrl);
          modal.modal('hide');
        });
      });
    });
  };

  // add image plugin
  $.summernote.addPlugin({
    name: 'truss-image',
    buttons: {

      /**
       * @param {Object} lang
       * @return {String}
       */
      trussimage: function (lang) {
        return tmpl.iconButton('fa fa-picture-o', {
          event: 'showTrussImageDialog',
          title: lang.image.image,
          hide: true
        });
      }
    },

    dialogs: {

      /**
       * @param {Object} lang
       * @param {Object} options
       * @return {String}
       */
      showTrussImage: function (lang, options) {
        var body = '<div class="form-group row-fluid">' +

                     '<input class="note-truss-image-url form-control span12" type="text" />' +
                   '</div>';
        var footer = '<button href="#" class="btn btn-primary note-truss-image-btn disabled" disabled>' + lang.image.insert + '</button>';
        return tmpl.dialog('note-truss-image-dialog', lang.image.insert, body, footer);
      }
    },

    events: {
      /**
       * @param {Object} layoutInfo
       */
      showTrussImageDialog: function (layoutInfo) {
        var $dialog = layoutInfo.dialog(),
            $editable = layoutInfo.editable(),
            text = getTextOnRange($editable);

        // save current range
        editor.saveRange($editable);

        showTrussImageDialog($editable, $dialog, text).then(function (data) {
          // when ok button clicked

          // restore range
          editor.restoreRange($editable);

          // insert image node
          if (typeof data === 'string') {
            // image url
            editor.insertImage($editable, data);
          } else {
            // array of files
            eventHandler.insertImages(layoutInfo, data);
          }
        }).fail(function () {
          // when cancel button clicked
          editor.restoreRange($editable);
        });
      }
    },

    // define language
    langs: {
      'en-US': {
        image: {
          image: 'Image',
          insert: 'Insert Image'
        }
      }
    }
  });
})(jQuery);
