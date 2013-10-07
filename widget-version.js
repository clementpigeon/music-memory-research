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


var retrieveSongs = function(band_mid) {

  var songsLookupParams = {
    'filter':
      '(all type:/music/recording /music/recording/artist:"' + band_mid + '")',
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
  var band_mid = $('#band').val();
  console.log(band_mid);
  retrieveSongs();

};

var songValue = function(){
  var song_mid = $('select#song').val();
  $('#newSong').html('selected song mid: ' + song_mid);
}

var bind_song_button = function(band_mid){
  $('input#songs')
    .suggest({
      'key': API_KEY,
      'filter': '(all type:/music/recording /music/recording/artist:"' + band_mid + '")'
      })
    .bind("fb-select", function(e, data) {
       console.log(data.name + ", " + data.mid);
       $('#newSong').html('selected song mid: ' + data.mid);
       });



}






$('input#band')
  .suggest({
    'key': API_KEY,
    'filter': '(all type:/music/artist)'
    })
  .bind("fb-select", function(e, data) {
     console.log(data.name + ", " + data.mid);
     bind_song_button(data.mid);
     // retrieveSongs(data.mid);
     });




$('button#send').on('click', songValue)

// thumbnail link:
// https://www.googleapis.com/freebase/v1/image/m/04lxt8?key=AIzaSyCQVC9yA72POMg2VjiQhSJQQP1nf3ToZTs&maxwidth=125&maxheight=125&mode=fillcropmid&errorid=%2Ffreebase%2Fno_image_png
