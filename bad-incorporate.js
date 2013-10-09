MP.Views.NewPinView = Backbone.View.extend({

  template1: JST['pins/new1'],
  template2: JST['pins/new2'],

  className: 'newPin',

  render: function () {

    var that = this;
    that.$el.html(that.template1());
    this.setupAutocomplete();
    return that;
  },

  initialize: function(){
    console.log('init');

  },

  events: {
    'click button.songSelected' : 'songSelected',
    'submit form' : 'createPin',
    'click button#search': 'bandLoopkup',
    'keyup input#song_letters': 'new_letter_callback',
    'click button#send': 'songValue'


    // $('button#search').on('click', bandLoopkup);
    // $('input#song_letters').on('keyup', new_letter_callback);
    // $('button#send').on('click', songValue);
  },

  songSelected: function(e){
    e.preventDefault();
    e.currentTarget.remove();
    this.$el.find('form').append(this.template2());
  },

  createPin: function(event){
    var that = this;
    event.preventDefault();

    var formData = $(event.target).serializeJSON();
    var current_user_id = JSON.parse($("#bootstrapped_current_user_id").html());
    formData["pin"]["user_id"] = current_user_id;

    var newPin = {
      pin : {
        user_id: current_user_id,
        link: formData["pin"]["link"],
        text: formData["pin"]["text"]
      }
    };
    this.getBandIdOrCreateBand(formData, function(band_id){
      that.getSongIdOrCreateSong(formData, band_id, function(song_id){
        newPin.pin.song_id = song_id;
        var pin = new MP.Models.Pin(newPin);
        pin.save(null, {
          success: function(pin){
            console.log('pin creation success!')
            that.returnToFeed();
          }
        });
      })
    });

  },

  getBandIdOrCreateBand: function(formData, callback){
    var bands = new MP.Collections.Bands();
    bands.fetch({
      success: function(data){

        var foundBand = bands.findWhere({ mid: formData.pin.band_mid });

        if (foundBand) {
          callback(foundBand.get('id'));
        }

        else {
          console.log('creating new band')
          bands.create({
            mid: formData.pin.band_mid,
            name: formData.pin.band_name
          }, {
            success: function(band_data){
              callback(band_data.get('id'));
            }
          })
        }

      }
    });
  },

  getSongIdOrCreateSong: function(formData, band_id, callback){
    var songs = new MP.Collections.Songs();
    songs.fetch({
      success: function(data){

        var foundSong = songs.findWhere({ mid: formData.pin.song_mid });

        if (foundSong) {
          callback(foundSong.get('id'));
        }

        else {
          console.log('creating new song')
          songs.create({
            band_id: band_id,
            mid: formData.pin.song_mid,
            title: formData.pin.song_title

          }, {
            success: function(data){
              callback(data.get('id'));
            }
          })
        }

      }
    });
  },

  returnToFeed: function(){
    this.remove();
    MP.router.navigate("/", {trigger: true});
  },

  FREEBASE_API_URL: 'https://www.googleapis.com/freebase/v1/search',

  API_KEY: 'AIzaSyDeTSD9Zppyd23wCWkvrr4GhnjzhCCTHIs',

  current_band_mid : null,

  current_band_name  : null,

  song_mid : null,

  song_name : null,

  bandLoopkup: function(){
    var query = $('#band').val();
    var bandLookupParams = {
      'query': query,
      'filter': '(all type:/music/artist)',
      'limit': 1,
      'indent': true,
      'spell': 'always',
      'key': this.API_KEY
    };
    console.log('AJAX band lookup');
    $.ajax({
      dataType: "json",
      url: this.FREEBASE_API_URL,
      data: bandLookupParams,
      success: bandLookUpSuccess
    });

  },

  bandLookUpSuccess: function(response){
    var bands = response.result;
    if (bands.length < 1){
      $('div#result').html("Can't find that band. Please enter another name.");
      $('.songSelectView').hide();
      return
    }
    this.current_band_name = bands[0].name;
    this.current_band_mid = bands[0].mid;
    displaySongSelectView();
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


  displaySongSelectView: function(){
    $('div#result').html('<br>Select amongst most popular songs, or type first letters to update the list.');
    $('.songSelectView').show();
    $('input#song_letters').val('');
    update_song_list();
  },

  new_letter_callback : function(e){
    if ($('input#song_letters').val().length > 1) {
      update_song_list();
    }
  },

  update_song_list: function() {
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

  },

  songValue: function(){
    song_mid = $('select#song').val();
    song_title = $('select#song').find("option[value='" + $("select#song").val() + "']").text();
    $('#newSong').html('selected band mid: ' + current_band_mid + '<br>');
    $('#newSong').append('selected band name: ' + current_band_name + '<br>');
    $('#newSong').append('selected song mid: ' + song_mid + '<br>');
    $('#newSong').append('selected song title: ' + song_title + '<br>');
  },



  // thumbnail link:
  // https://www.googleapis.com/freebase/v1/image/m/04lxt8?key=AIzaSyCQVC9yA72POMg2VjiQhSJQQP1nf3ToZTs&maxwidth=125&maxheight=125&mode=fillcropmid&errorid=%2Ffreebase%2Fno_image_png

  setupAutocomplete: function(){
    this.$("input#band" ).autocomplete({
      source: function( request, response ) {
        console.log('autocomplete fetching');
        $.ajax({
          url: this.FREEBASE_API_URL,
          dataType: "json",
          data: {
            'query': request.term,
            'prefixed': "true",
            'filter': '(all type:/music/artist)',
            'limit': 5,
            'indent': true,
            'key': this.API_KEY
          },
          success: function( returned_data ) {
            console.log('success');
            console.log(returned_data);
            response($.map( returned_data.result, function( band ) {
              return {
                label: band.name,
                value: band.mid
              };
            }));
          },
          error: function(data){
            console.log('failure');
            console.log(data);
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
  }


});
