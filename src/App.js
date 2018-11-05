import React, { Component } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import Map from './Map';
import ErrorBoundary from './ErrorBoundary';
//import escapeRegExp from 'escape-string-regexp';

/* global google */

//handle potential problems with faulty Google Maps API keys
window.gm_authFailure = function() {
    alert("Oops, something went wrong! Please try again.")
}

class App extends Component {
    state = {
        map: '',
        markers: [],
        query: '',
        coffeeVenues: [],
        searchedVenues: [],
        searchedMarkers: []
    }
/*This sets up the FourSquare. Version is in the form of YYYYMMDD. venueid is id used for coffee shops.  Used Foursquare developer to set this up */

    getFoursquareData = () => {

        const latlng = "40.759057, -73.985131"
        const client_id = "UWC20WUKC14OQHITOGLNC00ODBMDG11LKT54IYOBHMJ2I4PO"
        const client_secret = "PA52KLN40FOQWBWRJP1PWMJJ120DE5DMNW53O0SVR33DXLWG"
        const version = "20181105"
        const venueid = "4c2cd86ed066bed06c3c5209"
        const radius = 5000
        const limit = 10

        fetch(`https://api.foursquare.com/v2/venues/search?ll=${latlng}&client_id=${client_id}&client_secret=${client_secret}&v=${version}&categoryId=${venueid}&radius=${radius}&limit=${limit}`)
            .then(function(response) { return response.json() })
            .then(data => {
                this.setState({ coffeeVenues: data.response.venues,
                                searchedVenues: data.response.venues },

                                () => this.setMarkers())
            })
            .catch(function(error) { console.log(error) })
    }

    componentDidMount() {
        window.initMap = this.initMap
        //async loading of the Google Maps script
        loadJS("https://maps.googleapis.com/maps/api/js?key=AIzaSyBQy4RGw_xIYFBWiBlCZBDeuAlclS4haC0&callback=initMap")
        //gets API data
        this.getFoursquareData()
    }

    //create the map & pull in markers
    initMap = () => {
        const map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 40.759057, lng: -73.985131},
            zoom: 13
        })
        this.setState({map}, () => this.setMarkers())
    }

    setMarkers = () => {
        const { searchedVenues, map } = this.state
        const markers = []
        if (map && searchedVenues.length > 0 && markers.length === 0) {
          searchedVenues.forEach((venue, index) => {
              //initialize animated markers
              const marker = new google.maps.Marker({
                  map: map,
                  position: venue.location,
                  name: venue.name,

                  //animation: google.maps.Animation.DROP,
                  id: index
              })
              //marker is briefly animated when clicked
              marker.addListener('click', function() {
                  if (marker.getAnimation() !== null) {
                      marker.setAnimation(null)
                  } else {
                      marker.setAnimation(google.maps.Animation.BOUNCE)
                      setTimeout(function() {
                          marker.setAnimation(null)
                      }, 100)
                  }
              })
              //marker displays infowindow when clicked
              marker.addListener('click', function() {
                  fillInfoWindow(this, mapInfoWindow)
              })
              //push markers to state
              markers.push(marker)
          })

          //create infowindow
          const mapInfoWindow = new google.maps.InfoWindow()

          //populate infowindow
          function fillInfoWindow (marker, infowindow) {
              const infoWindowContent = `<p>${marker.name}</p>`

              //check whether infowindow is already open
              if (infowindow.marker !== marker) {
                  infowindow.marker = marker
                  infowindow.setContent(infoWindowContent)
                  infowindow.open(map, marker)
                  infowindow.addListener('closeclick', function() {
                      infowindow.setMarker = null
                  })
              }
          }
          this.setState({ markers })
      }
    }

    //filters through points of interest & updates UI based on result
    searchVenues = (query) => {
        this.setState({ query })
        //access state
        const { markers, coffeeVenues } = this.state
        if (query) {

            const match = new RegExp(query, 'i')
          //  markers.forEach((marker) => {
          //      marker.setVisible(false)
          //  })

            this.setState({
                searchedVenues: coffeeVenues.filter((coffeeVenue) => match.test(coffeeVenue.name)),
                searchedMarkers: markers.filter((marker) => match.test(marker.title))
                                        .forEach((marker) => marker.setVisible(true))
            })
        } else {

            markers.map((marker) => marker.setVisible(true))
            this.setState({
                searchedVenues: coffeeVenues,
                searchedMarkers: markers
            })
        }
    }

  render() {
    const { searchedVenues, markers, coffeeVenues } = this.state
    return (
        <div className="app">
            <ErrorBoundary>
                    <div>
<Map/>
                        <Sidebar
                            coffeeVenues={coffeeVenues}
                            searchedVenues={searchedVenues}
                            markers={markers}
                            searchVenues={this.searchVenues.bind(this)} />

                    </div>
             </ErrorBoundary>
        </div>
    )}}

/*SOURCE: https://www.klaasnotfound.com/2016/11/06/making-google-maps-work-with-react/ AND https://github.com/filamentgroup/loadJS*/
function loadJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    ref.parentNode.insertBefore(script, ref);
    script.onerror = function() {
        document.write("Map failed to load correctly. Please try again.")
    }
}

export default App;
