import React, { Component } from "react";
import "./App.css";
/* This renders the sidebar including search bar */

class Sidebar extends Component {
  clickedVenue = venue => {
    console.log(venue);
    const { markers } = this.props;
    markers.forEach(marker => {
      if (marker.name === venue) {
        window.google.maps.event.trigger(marker, "click");
      }
    });
  };
  render() {
    const { searchVenues, query, searchedVenues } = this.props;
    return (
      <div className="sidebar-container" role="menu">
        <h1 className="main-heading" aria-label="New York City heading">
          Find Kosher Eats in NYC
        </h1>

        <div className="search-places">
          <div className="search-places-bar">
            <div className="search-places-input" tabIndex="1">
              <input
                type="text"
                placeholder="Search for Kosher Spots in NYC"
                aria-label="Search for kosher spots in New York City"
                role="search"
                value={query}
                onChange={event => searchVenues(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div
          className="sidebar-places-container"
          aria-label="Venue List"
          role="list"
        >
          <ul className="sidebar-places-list">
            {searchedVenues.map(kosherVenue => (
              <li key={kosherVenue.id}>
                <a
                  role="listitem"
                  tabIndex="2"
                  onClick={() => {
                    this.clickedVenue(kosherVenue.name);
                  }}
                >
                  {kosherVenue.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default Sidebar;
