FREEBASE_API_URL = 'https://www.googleapis.com/freebase/v1/search';
API_KEY = 'AIzaSyDeTSD9Zppyd23wCWkvrr4GhnjzhCCTHIs';

var populateSelect = function(songsLookupResponse){
  var songs = songsLookupResponse.result;
  var newOptions = '';

  songs.forEach(function(song){
    var name = song['name'];
    var mid = song['mid'];
    var newOption = '<option value="' + mid +'">' + name + '</option>';
    newOptions += newOption;
  });

  $('select#song').html(newOptions);
}


var retrieveSongs = function(bandLookupResponse) {
  var bands = bandLookupResponse.result;
  if (bands.length < 1){
    $('div#result').html("Can't find that band. Please enter another name.");
    return
  }
  var name = bands[0].name;
  var mid = bands[0].mid;

  $('div#result').html('You selected: ' + name);

  var songsLookupParams = {
    'filter':
      '(all type:/music/recording /music/recording/artist:"' + mid + '")',
    'limit': 50,
    'indent': true,
    'spell': 'always',
    'key': API_KEY
  };
  $.ajax({
    dataType: "json",
    url: FREEBASE_API_URL,
    data: songsLookupParams,
    success: populateSelect,

  });

}

var checkBand = function(){
  // var url = 'https://www.googleapis.com/freebase/v1/search';
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
    success: retrieveSongs
  });

};

var songValue = function(){
  var song_mid = $('select#song').val();
  $('#newSong').html('selected song mid: ' + song_mid);
}

$('button#search').on('click', checkBand)
$('button#send').on('click', songValue)

// thumbnail link:
// https://www.googleapis.com/freebase/v1/image/m/04lxt8?key=AIzaSyCQVC9yA72POMg2VjiQhSJQQP1nf3ToZTs&maxwidth=125&maxheight=125&mode=fillcropmid&errorid=%2Ffreebase%2Fno_image_png
