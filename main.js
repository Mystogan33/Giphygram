/* jshint esversion: 7 */

// Progressive Enhancement
if(navigator.serviceWorker) {
  // Register SW
  navigator.serviceWorker.register('sw.js').catch(console.error);
  // Giphy Cache clean
  function giphyCacheClean(giphys) {
    // Get service worker registration
    navigator.serviceWorker.getRegistration().then((registration) => {
      // Only post message to active SW
      if(registration.active) registration.active.postMessage({action: 'cleanGiphyCache', giphys: giphys})
    });
  }
}


// Giphy API object
const giphy = {
    url: 'https://api.giphy.com/v1/gifs/trending',
    query: {
        api_key: '54452c59b31e4d14aca213ec76014baa',
        limit: 5
    }
};

const latestGiphys = [];

// Update trending giphys
function update() {

    // Toggle refresh state
   $('#update .icon').toggleClass('d-none');

    // Call Giphy API
    $.get( giphy.url, giphy.query)
        // Success
        .done((res) => {

            // Empty Element
            $('#giphys').empty();
            latestGiphys.length = 0;

            // Loop Giphys
            $.each( res.data, function (i, giphy) {

              // Add Giphys to array
              latestGiphys.push(giphy.images.downsized_large.url);

              // Add Giphy HTML
              $('#giphys').prepend(
                  '<div class="col-sm-6 col-md-4 col-lg-3 p-1">' +
                      '<img class="w-100 img-fluid" style="border-radius: 20px" src="' + giphy.images.downsized_large.url + '">' +
                  '</div>'
              );
            });

          if(navigator.serviceWorker) giphyCacheClean(latestGiphys);
        })
        // Failure
        .fail(() => {
            $('.alert').slideDown();
            setTimeout(() => $('.alert').slideUp() , 2000);
        })
        // Complete
        .always(() => $('#update .icon').toggleClass('d-none'));

    // Prevent submission if originates from click
    return false;
}

// Manual refresh
$('#update a').click(update);

// Update trending giphys on load
update();
