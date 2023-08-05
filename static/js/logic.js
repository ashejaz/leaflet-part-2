// Create map object
let myMap = L.map("map", {
  center: [15.5994, -28.6731],
  zoom: 2
});
  
// Add base maps
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  attribution: '&copy; <a href="https://maps.google.com/">Google Maps</a> contributors'
});
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Add default base layer
street.addTo(myMap);

// Create layer groups for earthquakes and tectonic plates
let earthquakeLayer = L.layerGroup();
let tectonicPlatesLayer = L.layerGroup();
  
// Function to get the color based on depth
function getColor(depth) {
  if (depth >= -10 && depth < 10) {
    return '#00FF00'; // Green
  } else if (depth >= 10 && depth < 30) {
    return '#ADFF2F'; // Green-Yellow
  } else if (depth >= 30 && depth < 50) {
    return '#FFFF00'; // Yellow
  } else if (depth >= 50 && depth < 70) {
    return '#FFA500'; // Orange
  } else if (depth >= 70 && depth < 90) {
    return '#FF4500'; // Orange-Red
  } else {
    return '#FF0000'; // Red
  }
}
    
// Fetch the UGCS earthquake data
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then((data) => {
    // Define properties
    data.features.forEach((earthquake) => {
      const lat = earthquake.geometry.coordinates[1];
      const lon = earthquake.geometry.coordinates[0];
      const depth = earthquake.geometry.coordinates[2];
      const magnitude = earthquake.properties.mag;

      // Calculate marker size based on magnitude
      const markerSize = magnitude * 5;

      // Get marker color based on depth
      const markerColor = getColor(depth);

      // Create the marker with a popup containing additional information
      const marker = L.circleMarker([lat, lon], {
        radius: markerSize,
        fillColor: markerColor,
        color: 'black',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.75,
      });

      // Generate the popup content
      const popupContent = `
        <b>Magnitude:</b> ${magnitude}<br/>
        <b>Depth:</b> ${depth} km<br/>
        <b>Location:</b> ${earthquake.properties.place}<br/>
        <b>Time:</b> ${new Date(earthquake.properties.time)}
      `;

      // Bind the popup to the marker
      marker.bindPopup(popupContent);

      // Add the marker to the earthquake layer
      marker.addTo(earthquakeLayer);
    });

    // Add the earthquakeLayer to the map
    earthquakeLayer.addTo(myMap);
  });

// Fetch tectonic plates data
d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
  .then((data) => {
    L.geoJSON(data, {
      style: {
        color: 'red',
        weight: 2
      }
    }).addTo(tectonicPlatesLayer);
    // Add the tectonicPlatesLayer to the map
    tectonicPlatesLayer.addTo(myMap);
  });

// Create a map legend
let legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  let div = L.DomUtil.create('div', 'info legend');
  let depths = [-10, 10, 30, 50, 70, 90];
  let colors = ['#00FF00', '#ADFF2F', '#FFFF00', '#FFA500', '#FF4500', '#FF0000'];

  // Loop through the depth intervals and generate a label with a colored square for each
  for (let i = 0; i < depths.length; i++) {
    div.innerHTML +=
      '<div><i style="background:' + colors[i] + '"></i>' +
      depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+ km') +
      '</div>';
  }

  return div;
};

// Add the legend to the map
legend.addTo(myMap);

// Create base maps and overlay layers
let baseMaps = {
  "Street": street,
  "Satellite": satellite,
  "Topographic": topo
};

let overlayMaps = {
  "Earthquakes": earthquakeLayer,
  "Tectonic Plates": tectonicPlatesLayer
};

// Add layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);