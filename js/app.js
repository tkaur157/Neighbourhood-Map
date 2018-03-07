//Model
var parks = [{
        name: "Las Palmas Park",
        lat: 37.3646,
        lng: -122.0373,
        venueid: "4b9d61d4f964a5206ba836e3"
    }, {
        name: "Ponderosa Park",
        lat: 37.3622,
        lng: -122.0062,
        venueid: "4bb2981635f0c9b68e86bb83"
    }, {
        name: "Baylands Park",
        lat: 37.4132,
        lng: -121.9988,
        venueid: "4cd8a8ba1647a0938d23e34c"
    }, {
        name: "Ortega Park",
        lat: 37.3422,
        lng: -122.0256,
        venueid: "4a1f0984f964a520f97b1fe3"
    }, {
        name: "Fair Oaks Park",
        lat: 37.3845,
        lng: -122.0147,
        venueid: "4b8b172ff964a520699232e3"
    }

];
var destination = function(item) {
    this.name = item.name;
    this.lat = item.lat;
    this.lng = item.lng;
    this.venueid = item.venueid;
    this.marker = item.marker;
};

//View
var map, infoWindow;

//Initializes the map
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 37.3688,
            lng: -122.0363
        },
        zoom: 12
    });
    infoWindow = new google.maps.InfoWindow();

    for (var i = 0; i < parks.length; i++) {
        var lat = parks[i].lat;
        var lng = parks[i].lng;
        var name = parks[i].name;
        var venueID = parks[i].venueid;
        var marker = new google.maps.Marker({
            map: map,
            position: {
                lat,
                lng
            },
            name: name,
            animation: google.maps.Animation.DROP,
            id: venueID
        });
        parks[i].marker = marker;

        marker.addListener('click', function() {
            toggleBounce(this, marker);
            showInfoWindow(this, marker);


        });
    }
    // Activate knockout
    ko.applyBindings(new viewModel());
}
//Creates bounce animation on marker when location is clicked
var toggleBounce = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);

    }, 1000);
}


//ajax request for Foursquare API
var showInfoWindow = function(marker) {
    $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + marker.id + '?client_id=WFEKDE0PWZUNSM4N2YDX14XNHWLLQS1UYOJYD2TB4N2BZOSW&client_secret=C34FVR5N14S3F5CVK053GHCHHDT3D42WDE5UTN5MDNUJXPMF&v=20170612',
        dataType: "json",
        success: function(data) {
            // add likes and ratings to marker
            marker.rating = data.response.venue.rating;
            marker.likes = data.response.venue.likes.count;
            marker.hours = data.response.venue.hours;
            populateWindow(marker, infoWindow);

        },
        //alert if there is error
        error: function() {
            alert("Something went wrong");
        }
    });

}

// populates infowindow with information about marker
var populateWindow = function(marker, infowindow) {

    infowindow.setContent('<div>' + marker.name +
        '<p>' + 'Likes: ' + marker.likes + '</div>' +
        '<p>' + 'Rating: ' + marker.rating.toString());
    infowindow.open(map, marker)

};
//View Model
var viewModel = function() {

    var self = this;
    this.parkList = ko.observableArray([]);
    parks.forEach(function(parkLocation) {
        self.parkList.push(new destination(parkLocation));
    });

    this.showMarker = function(location) {
        google.maps.event.trigger(location.marker, 'click');
    }

    //Filter
    this.filter = ko.observable("");

    self.filteredLocations = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            ko.utils.arrayForEach(self.parkList(), function(item) {
                item.marker.setVisible(true);
            });
            return self.parkList();
        } else {
            return ko.utils.arrayFilter(self.parkList(), function(item) {
                // set all markers visible (false)
                var result = (item.name.toLowerCase().indexOf(filter) > -1)
                item.marker.setVisible(result);
                return result;
            });
        }
    });
    var errorMsg = function(error) {

        alert("Error in map");
    }

}