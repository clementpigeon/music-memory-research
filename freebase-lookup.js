FREEBASE_API_URL = 'https://www.googleapis.com/freebase/v1/search';
API_KEY = 'AIzaSyDeTSD9Zppyd23wCWkvrr4GhnjzhCCTHIs';
var current_band_mid;

var populateSelect = function(songsLookupResponse){
  var songs = songsLookupResponse.result;
  console.log(songs);
  var newOptions = '';

  songs.forEach(function(song){
    var name = song['name'];
    var mid = song['mid'];
    var newOption = '<option value="' + mid +'">' + name + '</option>';
    newOptions += newOption;
  });

  $('select#song').html(newOptions);
  console.log('populating done');
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
  if ($('input#song_letters').val().length > 1){
    songsLookupParams['query'] = $('input#song_letters').val();
    songsLookupParams['prefixed'] = "true";
  };
  console.log(songsLookupParams);
  $.ajax({
    dataType: "json",
    url: FREEBASE_API_URL,
    data: songsLookupParams,
    success: populateSelect,
  });

}

var bandLookUpSuccess = function(response){
  var bands = response.result;
  if (bands.length < 1){
    $('div#result').html("Can't find that band. Please enter another name.");
    $('.songSelectView').hide();
    return
  }
  var name = bands[0].name;
  current_band_mid = bands[0].mid;

  $('div#result').html('<br>Selected band: '+ name +'<br>Please select the song (type first letters to update list)');
  $('.songSelectView').show();
  update_song_list();
}



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
  $.ajax({
    dataType: "json",
    url: FREEBASE_API_URL,
    data: bandLookupParams,
    success: bandLookUpSuccess
  });

};


var new_letter_callback = function(e){
  var current_letters = $('input#song_letters').val();
  update_song_list();
  console.log(current_letters);
}


var songValue = function(){
  var song_mid = $('select#song').val();
  $('#newSong').html('selected song mid: ' + song_mid);
}


$('button#search').on('click', bandLoopkup);
$('input#song_letters').on('keyup', new_letter_callback);
$('button#send').on('click', songValue);

// thumbnail link:
// https://www.googleapis.com/freebase/v1/image/m/04lxt8?key=AIzaSyCQVC9yA72POMg2VjiQhSJQQP1nf3ToZTs&maxwidth=125&maxheight=125&mode=fillcropmid&errorid=%2Ffreebase%2Fno_image_png
