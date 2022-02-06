mapboxgl.accessToken = 'pk.eyJ1IjoibWFydmlub2R5IiwiYSI6ImNqdjJqMHQ0NDBjOGc0M2w4cjZ3NThveXIifQ.O6h9z8qT-FLrinnnqFqmBg';


const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-77.04, 38.907],
  zoom: 11.15
});

const apiPointToMapboxDesc = pt => {
  const pieces = [
    `<strong>${pt.title}</strong>`
  ]

  if (pt.imageUrl) {
    pieces.push(`<p><a target="_blank" href="${pt.imageUrl}"><img src="${pt.imageUrl}"></a></p>`)
  }

  if (pt.desc) {
    pieces.push(`<p>${pt.desc}</p>`)
  }

  return pieces.join('')
}

const apiDataToMapboxFeature = data => {
  return {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: data.map(pt => ({
        type: 'Feature',
        properties: {
          description: apiPointToMapboxDesc(pt),
          icon: 'bar-15',
        },
        geometry: {
          type: 'Point',
          coordinates: [pt.lat, pt.lng]
        }
      }))
    }
  }
}


map.on('load', async () => {

  // guildId comes from global pug template data
  const { data } = await axios.get(`/pins/${guildId}`);
  map.addSource('places', apiDataToMapboxFeature(data));
  // Add a layer showing the places.
  map.addLayer({
    'id': 'places',
    'type': 'symbol',
    'source': 'places',
    'layout': {
      'icon-image': '{icon}',
      'icon-allow-overlap': true
    }
  });

  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', 'places', (e) => {
    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'places', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'places', () => {
    map.getCanvas().style.cursor = '';
  });

})