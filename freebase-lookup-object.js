var View = {

  FREEBASE_API_URL: 'https://www.googleapis.com/freebase/v1/search',
  API_KEY: 'AIzaSyDeTSD9Zppyd23wCWkvrr4GhnjzhCCTHIs',

  current_band_mid: null,
  current_band_name: null,
  song_mid: null,
  song_name: null,

  displaySongSelectView: function(){
    $('div#result').html('<br>Select amongst most popular songs, or type first letters to update the list.');
    $('.songSelectView').show();
    $('input#song_letters').val('');
    this.update_song_list();
  },

  new_letter_callback: function(e){
    if ($('input#song_letters').val().length > 1) {
      this.update_song_list();
    }
  },

  update_song_list: function() {
    var songsLookupParams = {
      'filter':
        '(all type:/music/recording /music/recording/artist:"' + this.current_band_mid + '")',
      'limit': 10,
      'indent': true,
      'spell': 'always',
      'key': this.API_KEY
    };

    var letters = $('input#song_letters').val();
    if (letters.length > 1){
      songsLookupParams['query'] = letters;
      songsLookupParams['prefixed'] = "true";
    };

    console.log('AJAX song lookup');
    $.ajax({
      dataType: "json",
      url: this.FREEBASE_API_URL,
      data: songsLookupParams,
      success: this.populateSelect,
    });

  },

  populateSelect: function(songsLookupResponse){
    var songs = songsLookupResponse.result;
    var newOptions = '';

    songs.forEach(function(song){
      var name = song['name'];
      var mid = song['mid'];
      var newOption = '<option data-name="' + name + '" value="' + mid +'">' + name + '</option>';
      newOptions += newOption;
    });
    $('select#song').html(newOptions);
  },

  songValue: function(){
    View.song_mid = $('select#song').val();
    View.song_title = $('select#song').find("option[value='" + $("select#song").val() + "']").text();
  },

  displayValues: function(){
    $('#newSong').html('selected band mid: ' + this.current_band_mid + '<br>');
    $('#newSong').append('selected band name: ' + this.current_band_name + '<br>');
    $('#newSong').append('selected song mid: ' + this.song_mid + '<br>');
    $('#newSong').append('selected song title: ' + this.song_title + '<br>');
  },

  initialize: function(){
    this.setupAutoComplete();
    $('input#song_letters').on('keyup', this.new_letter_callback.bind(this));
    $('button#songSelected').on('click', this.songValue.bind(this));
    $('button#songSelected').on('click', this.displayValues.bind(this));
  },

  setupAutoComplete: function(){
    var that = this;

    $('input#band').autocomplete({
      source: function( request, response ) {
        $.ajax({
          url: that.FREEBASE_API_URL,
          dataType: "jsonp",
          data: {
            'query': request.term,
            'prefixed': "true",
            'filter': '(all type:/music/artist)',
            'limit': 5,
            'indent': true,
            'key': that.API_KEY

          },
          success: function( data ) {
            console.log('band autocomplete AJAX success');
            response($.map( data.result, function(band) {
              return {
                label: band.name,
                value: band.mid
              };

            }));
          }
        });
      },
      minLength: 2,
      select: function( event, ui ) {
        event.preventDefault();

        $(this).val(ui.item.label);
        console.log("Selected: " + ui.item.label);

        that.current_band_mid = ui.item.value;
        that.current_band_name = ui.item.label;

        that.displaySongSelectView();

      },

      focus: function(event, ui) {
          event.preventDefault();
          $(this).val(ui.item.label);
      },

      open: function() {
        $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
      },
      close: function() {
        $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
      }
    });
  }
};

View.initialize();