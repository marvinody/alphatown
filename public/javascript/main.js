mapboxgl.accessToken = 'pk.eyJ1IjoibWFydmlub2R5IiwiYSI6ImNqdjJqMHQ0NDBjOGc0M2w4cjZ3NThveXIifQ.O6h9z8qT-FLrinnnqFqmBg';


const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-77.04, 38.907],
  zoom: 11.15,
  maxZoom: 12,
  logoPosition: 'bottom-right'
});

const canvas = map.getCanvasContainer();

const coordinatesDiv = document.getElementById('coordinates');

const updateCoordText = (c) => $('.trigger-coord-select').text(`(${c.lng.toFixed(3)}, ${c.lat.toFixed(3)}) - Click to change`)

const updateDropPinText = (s) => $('.drop-pin span').text(s)

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
          coordinates: [pt.lng, pt.lat]
        }
      }))
    }
  }
}


const userCoordFeature = {
  'type': 'FeatureCollection',
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [0, 0]
      }
    }
  ]
}

const onMove = (e) => {
  const coords = e.lngLat;

  // Set a UI indicator for dragging.
  canvas.style.cursor = 'grabbing';

  // Update the Point feature in `geojson` coordinates
  // and call setData to the source layer `point` on it.
  userCoordFeature.features[0].geometry.coordinates = [coords.lng, coords.lat];
  map.getSource('point').setData(userCoordFeature);

  updateCoordText(coords)
}


const onUp = (e) => {
  // const coords = e.lngLat;

  // // Print the coordinates of where the point had
  // // finished being dragged to on the map.
  // coordinatesDiv.style.display = 'block';
  // coordinatesDiv.innerHTML = `Longitude: ${coords.lng}<br />Latitude: ${coords.lat}`;
  // canvas.style.cursor = '';

  // Unbind mouse/touch events
  map.off('mousemove', onMove);
  map.off('touchmove', onMove);
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

  // Add a single point to the map.
  map.addSource('point', {
    'type': 'geojson',
    'data': userCoordFeature,
  });

  map.addLayer({
    'id': 'point',
    'type': 'circle',
    'source': 'point',
    'paint': {
      'circle-radius': 10,
      'circle-color': '#F84C4C' // red color
    },
    layout: {
      visibility: 'none'
    }
  });

  // When the cursor enters a feature in
  // the point layer, prepare for dragging.
  map.on('mouseenter', 'point', () => {
    map.setPaintProperty('point', 'circle-color', '#3bb2d0');
    canvas.style.cursor = 'move';
  });

  map.on('mouseleave', 'point', () => {
    map.setPaintProperty('point', 'circle-color', '#3887be');
    canvas.style.cursor = '';
  });

  map.on('mousedown', 'point', (e) => {
    // Prevent the default map drag behavior.
    e.preventDefault();

    canvas.style.cursor = 'grab';

    map.on('mousemove', onMove);
    map.once('mouseup', onUp);
  });

  map.on('touchstart', 'point', (e) => {
    if (e.points.length !== 1) return;

    // Prevent the default map drag behavior.
    e.preventDefault();

    map.on('touchmove', onMove);
    map.once('touchend', onUp);
  });

});

const checkTitleErrors = (errors) => {
  const title = $("input[name='title']").val()
  if (title.length === 0) {
    errors.push('You must give a title.')
  } else if (title.length > 80) {
    errors.push('Your title is too long. 80 chars max')
  }
}

const checkDescriptionErrors = (errors) => {
  const desc = $("textarea[name='desc']").val()
  if (desc.length > 160) {
    errors.push('Your desc is too long. 160 chars max')
  }
}

const checkImageErrors = (errors) => {
  const file = $("input[name='image']")[0].files[0]
  const MAX_ALLOWED_SIZE = 9 * 1000 * 1000 // 9 MB
  if (!file) {
    errors.push('You must select an image to be associated with your pin')
  } else if (file.size > MAX_ALLOWED_SIZE) {
    errors.push('You must select an image smaller than 9 MB')
  }
}

const checkCoordErrors = (errors) => {
  const coords = userCoordFeature.features[0].geometry.coordinates
  if (coords[0] === 0 && coords[1] === 0) {
    errors.push("You must select a location for your pin")
  }
}

const findFormErrors = () => {
  const errors = []
  checkTitleErrors(errors)
  checkDescriptionErrors(errors)
  checkImageErrors(errors)
  checkCoordErrors(errors)

  return errors
}

const updateFormData = ({
  lng, lat, title, desc, imageUrl
}) => {
  $("input[name='image']").val('')
  $("input[name='title']").val(title)
  $("textarea[name='desc']").val(desc)
  userCoordFeature.features[0].geometry.coordinates = [lng, lat]
  updateCoordText({ lng, lat })
}

const sendPinData = () => {
  const formData = new FormData()
  formData.append('image', $("input[name='image']")[0].files[0])
  formData.append('title', $("input[name='title']").val())
  formData.append('desc', $("textarea[name='desc']").val())

  const [lng, lat] = userCoordFeature.features[0].geometry.coordinates
  formData.append('lng', lng)
  formData.append('lat', lat)
  axios.put(`/pins/${guildId}`, formData)

  updateDropPinText('Pending Pin')
}


(async () => {
  try {

    const show = (s) => $(s).removeClass('hide')
    const hide = (s) => $(s).addClass('hide')

    const { data: user } = await axios.get('/auth/me')
    hide('.discord-login')
    show('.drop-pin')

    if (user.pin) {
      updateFormData(user.pin)

      if (user.pin.approved) {
        updateDropPinText('Update Pin')
      } else {
        updateDropPinText('Pending Pin')
      }
    }

    // close #pin-edit ui, show .drop-pin
    $('.trigger-coord-select').click(() => {
      alert("Do not select your actual address, pick a general place.")
      hide('#pin-edit')
      // we don't show the drop-pin part because we want to only let user choose loc
      // show('.drop-pin')
      // next click, set coords of location & display
      map.once('click', (e) => {
        const coords = e.lngLat

        map.setLayoutProperty('point', 'visibility', 'visible')
        const coordsArr = [coords.lng, coords.lat];

        userCoordFeature.features[0].geometry.coordinates = coordsArr
        map.getSource('point').setData(userCoordFeature);

        map.flyTo({
          center: coordsArr,
          zoom: 11.15,
        })

        // update the text to show the user's selection
        updateCoordText(coords)

        show('#pin-edit')
      })
    })

    $('.drop-pin').click(() => {
      show('#pin-edit')
      hide('.drop-pin')

      if (user.pin && !user.pin.approved) {
        if (user.pin.approved) {

        } else {
          map.setLayoutProperty('point', 'visibility', 'visible')
          map.flyTo({
            center: userCoordFeature.features[0].geometry.coordinates,
            zoom: 11.15,
          })
        }
      }
    })


    $('#pin-edit .close-button span').click(() => {
      hide('#pin-edit')
      show('.drop-pin')
    })

    $('form#pin-edit').submit(e => {
      console.log("SUBMITTED")
      e.preventDefault();

      const errors = findFormErrors()
      if (errors.length > 0) {
        alert(errors.join('\n'))
        return
      }

      sendPinData()
    })
  } catch (err) {
    console.error(err)
  }
})();