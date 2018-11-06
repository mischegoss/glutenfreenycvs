import React, { Component } from "react";
import "./App.css";
import Sidebar from "./Sidebar";
import Map from "./Map";
import ErrorBoundary from "./ErrorBoundary";

/* global google */

//handle potential problems with faulty Google Maps API keys
window.gm_authFailure = () => {
  alert("Oops, something went wrong! Please try again.");
};

class App extends Component {
  state = {
    map: null,
    markers: [],
    infoWindow: null,
    query: "",
    coffeeVenues: [],
    searchedVenues: [],
    searchedMarkers: []
  };
  /*This sets up the FourSquare. Version is in the form of YYYYMMDD. venueid is id used for coffee shops.  Used Foursquare developer to set this up */

  getFoursquareData = () => {
    const latlng = "40.759057, -73.985131";
    const client_id = "UWC20WUKC14OQHITOGLNC00ODBMDG11LKT54IYOBHMJ2I4PO";
    const client_secret = "PA52KLN40FOQWBWRJP1PWMJJ120DE5DMNW53O0SVR33DXLWG";
    const version = "20181105";
    const venueid = "52e81612bcbc57f1066b79fc";
    const radius = 5000;
    const limit = 10;

    fetch(
      `https://api.foursquare.com/v2/venues/search?ll=${latlng}&client_id=${client_id}&client_secret=${client_secret}&v=${version}&categoryId=${venueid}&radius=${radius}&limit=${limit}`
    )
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.setState(
          {
            coffeeVenues: data.response.venues,
            searchedVenues: data.response.venues
          },

          () => this.setMarkers()
        );
      })
      .catch(error => {
        console.log(error);
      });
  };

  componentDidMount() {
    window.initMap = this.initMap;
    //async loading of the Google Maps script
    loadJS(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyBQy4RGw_xIYFBWiBlCZBDeuAlclS4haC0&callback=initMap"
    );
    //gets API data
    this.getFoursquareData();
  }

  //create the map & pull in markers
  initMap = () => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 40.759057, lng: -73.985131 },
      zoom: 13
    });
    const mapInfoWindow = new window.google.maps.InfoWindow();

    this.setState(
      {
        map,
        infoWindow: mapInfoWindow
      },
      () => this.setMarkers()
    );
  };

  setMarkers = () => {
    const { searchedVenues, map } = this.state;
    const markers = [];
    if (map && searchedVenues.length > 0 && markers.length === 0) {
      searchedVenues.forEach((venue, index) => {
        const marker = new window.google.maps.Marker({
          map: map,
          position: new window.google.maps.LatLng(
            venue.location.lat,
            venue.location.lng
          ),
          name: venue.name,
          id: index,
          animation: window.google.maps.Animation.DROP
        });

        marker.addListener("click", () => {
          console.log(marker);
          if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          } else {
            this.fillInfoWindow(marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
              marker.setAnimation(null);
            }, 100);
          }
        });

        markers.push(marker);
      });
    }
    this.setState({ markers });
  };

  fillInfoWindow = marker => {
    const { infoWindow, map } = this.state;
    const infoWindowContent = `<p>${marker.name}</p>`;

    if (infoWindow.marker !== marker) {
      infoWindow.marker = marker;
      infoWindow.setContent(infoWindowContent);
      infoWindow.open(map, marker);
      infoWindow.addListener("closeclick", () => {
        infoWindow.setMarker = null;
      });
    }
  };

  searchVenues = query => {
    this.setState({ query });

    const { markers, coffeeVenues } = this.state;
    if (query) {
      const match = new RegExp(query, "i");
      markers.forEach(marker => {
        marker.setVisible(false);
      });

      this.setState({
        searchedVenues: coffeeVenues.filter(coffeeVenue =>
          match.test(coffeeVenue.name)
        ),
        searchedMarkers: markers
          .filter(marker => match.test(marker.name))
          .forEach(marker => marker.setVisible(true))
      });
    } else {
      markers.map(marker => marker.setVisible(true));
      this.setState({
        searchedVenues: coffeeVenues,
        searchedMarkers: markers
      });
    }
  };

  render() {
    const { searchedVenues, markers, coffeeVenues } = this.state;
    return (
      <div className="app">
        <ErrorBoundary>
          <div>
            <Map />
            <Sidebar
              coffeeVenues={coffeeVenues}
              searchedVenues={searchedVenues}
              markers={markers}
              searchVenues={this.searchVenues}
            />
          </div>
        </ErrorBoundary>
      </div>
    );
  }
}

function loadJS(src) {
  var ref = window.document.getElementsByTagName("script")[0];
  var script = window.document.createElement("script");
  script.src = src;
  script.async = true;
  ref.parentNode.insertBefore(script, ref);
  script.onerror = function() {
    document.write("Map failed to load correctly. Please try again.");
  };
}

export default App;
