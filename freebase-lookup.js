FREEBASE_API_URL = 'https://www.googleapis.com/freebase/v1/search';
API_KEY = 'AIzaSyDeTSD9Zppyd23wCWkvrr4GhnjzhCCTHIs';

var current_band_mid;
var current_band_name;
var song_mid;
var song_name;

var bandLoopkup = function(){
  var query = $('#band').val();
  var bandLookupParams = {
    'query': query,
    'filter': '(all type:/music/artist)',
    'limit': 1,
    'indent': true,
    'spell': 'always',
    'key': API_KEY
  };
  console.log('AJAX band lookup');
  $.ajax({
    dataType: "json",
    url: FREEBASE_API_URL,
    data: bandLookupParams,
    success: bandLookUpSuccess
  });

};

var bandLookUpSuccess = function(response){
  var bands = response.result;
  if (bands.length < 1){
    $('div#result').html("Can't find that band. Please enter another name.");
    $('.songSelectView').hide();
    return
  }
  current_band_name = bands[0].name;
  current_band_mid = bands[0].mid;
  displaySongSelectView();
}

var populateSelect = function(songsLookupResponse){
  var songs = songsLookupResponse.result;
  var newOptions = '';

  songs.forEach(function(song){
    var name = song['name'];
    var mid = song['mid'];
    var newOption = '<option data-name="' + name + '" value="' + mid +'">' + name + '</option>';
    newOptions += newOption;
  });
  $('select#song').html(newOptions);
}



var displaySongSelectView = function(){
  $('div#result').html('<br>Select amongst most popular songs, or type first letters to update the list.');
  $('.songSelectView').show();
  $('input#song_letters').val('');
  update_song_list();
}

var new_letter_callback = function(e){
  if ($('input#song_letters').val().length > 1) {
    update_song_list();
  }
}

var update_song_list = function() {
  var songsLookupParams = {
    'filter':
      '(all type:/music/recording /music/recording/artist:"' + current_band_mid + '")',
    'limit': 10,
    'indent': true,
    'spell': 'always',
    'key': API_KEY
  };

  var letters = $('input#song_letters').val();
  if (letters.length > 1){
    songsLookupParams['query'] = letters;
    songsLookupParams['prefixed'] = "true";
  };

  console.log('AJAX song lookup');
  $.ajax({
    dataType: "json",
    url: FREEBASE_API_URL,
    data: songsLookupParams,
    success: populateSelect,
  });

}

var songValue = function(){
  song_mid = $('select#song').val();
  song_title = $('select#song').find("option[value='" + $("select#song").val() + "']").text();
  $('#newSong').html('selected band mid: ' + current_band_mid + '<br>');
  $('#newSong').append('selected band name: ' + current_band_name + '<br>');
  $('#newSong').append('selected song mid: ' + song_mid + '<br>');
  $('#newSong').append('selected song title: ' + song_title + '<br>');
}

$('button#search').on('click', bandLoopkup);
$('input#song_letters').on('keyup', new_letter_callback);
$('button#send').on('click', songValue);

// thumbnail link:
// https://www.googleapis.com/freebase/v1/image/m/04lxt8?key=AIzaSyCQVC9yA72POMg2VjiQhSJQQP1nf3ToZTs&maxwidth=125&maxheight=125&mode=fillcropmid&errorid=%2Ffreebase%2Fno_image_png


$( "input#band" ).autocomplete({
    source: function( request, response ) {
      $.ajax({
        url: FREEBASE_API_URL,
        dataType: "jsonp",
        data: {
          'query': request.term,
          'prefixed': "true",
          'filter': '(all type:/music/artist)',
          'limit': 5,
          'indent': true,
          'key': API_KEY

        },
        success: function( data ) {
          console.log('success');
          response($.map( data.result, function( band ) {
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
      console.log( ui.item ?
        "Selected: " + ui.item.label :
        "Nothing selected, input was " + this.value);
      current_band_mid = ui.item.value;
      current_band_name = ui.item.label;
      $(this).val(ui.item.label);
      displaySongSelectView();

    },
    open: function() {
      $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
    },
    close: function() {
      $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
    }
  });

