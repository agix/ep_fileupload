$(function(){
    var info = {
      action: '../fileUpload/',
      name: 'uploadfile',
      onSubmit: function(file, ext){ // On submit we do nothing, it'd be nice to do something but mheh..
      //console.log('Starting...');
      },
      onComplete: function(file, response){
        // Require the editor..
        var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;

        var fileUri = response.replace(/^\s+|\s+$/g, '');

        // Puts the actual URL in the pad..
        padeditor.ace.replaceRange(undefined, undefined, " " + fileUri + " ");
        // Put the caret back into the pad
        padeditor.ace.focus();
      }
    };

    new AjaxUpload($('#uploadFileSubmit'), info);
});
