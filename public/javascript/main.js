mapboxgl.accessToken = 'pk.eyJ1IjoibWFydmlub2R5IiwiYSI6ImNqdjJqMHQ0NDBjOGc0M2w4cjZ3NThveXIifQ.O6h9z8qT-FLrinnnqFqmBg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/marvinody/cl0e912qa001l16pakwj7435v',
  center: [-77.04, 38.907],
  zoom: 1,
  maxZoom: 12,
  logoPosition: 'bottom-right'
});

const show = (s) => $(s).removeClass('hide')
const hide = (s) => $(s).addClass('hide')

const jqueryAlert = ({ title = '', message, onCloseCallback = () => { } }) => {
  $("<div></div>").text(message).dialog({
    modal: true,
    resizable: false,
    title: title,
    position: { my: "center", at: "center", of: window },
    buttons: {
      [$.i18n('alphatown-general-ok')]: function () {
        $(this).dialog('close');
      }
    },
    close: function () {
      onCloseCallback();
      /* Cleanup node(s) from DOM */
      $(this).dialog('destroy').remove();
    }
  });
}

const getNavigatorLanguage = () => {
  if (navigator.languages && navigator.languages.length) {
    return navigator.languages[0];
  } else {
    return navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';
  }
}

const getLanguage = () => {
  // this may return a format like "en-US" or just "en"
  const navLang = getNavigatorLanguage()

  // but we want just the "en" part and instead of parsing ourselves, let's use this
  const locale = new Intl.Locale(navLang);
  // if no lang detected for w/e reason, let's default to en
  return locale.language || 'en'
}



const canvas = map.getCanvasContainer();

const coordinatesDiv = document.getElementById('coordinates');

const updateCoordText = (c) => $('.trigger-coord-select').text($.i18n('alphatown-pinedit-location-display', c.lng.toFixed(3), c.lat.toFixed(3)))

const updateDropPinText = (s) => $('.drop-pin').text(s)
const updatePinEditTitleText = (s) => $('#pin-edit .title span').text(s)

const sanitizeText = (s) => $('<div>').text(s).html()

const approvePin = async (id) => {
  await axios.post(`/api/pins/admin/${guildId}/${id}/approve`)
}

const apiPointToMapboxDesc = pt => {
  const pieces = [
    `<strong>${sanitizeText(pt.title)}</strong>`
  ]

  if (pt.imageUrl) {
    pieces.push(`<p><a target="_blank" href="${sanitizeText(pt.imageUrl)}"><img src="${sanitizeText(pt.imageUrl)}"></a></p>`)
  }

  if (pt.desc) {
    pieces.push(`<p>${sanitizeText(pt.desc)}</p>`)
  }

  if (pt.approved === false) {
    // jank, need to change this later and iterate over dataset to change it on ui
    // similar to other drag system for drop pin
    pieces.push(`<button onclick="approvePin(${pt.id})">Approve</button>`)
    pieces.push(`<p>UserId:${pt.user.discordId}</p>`)
  }

  return pieces.join('')
}

const apiDataToMapboxFeature = (data, icon) => {
  return {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: data.map(pt => ({
        type: 'Feature',
        properties: {
          description: apiPointToMapboxDesc(pt),
          icon,
        },
        geometry: {
          type: 'Point',
          coordinates: [pt.lng, pt.lat]
        }
      }))
    }
  }
}

const createMapLayerWithPins = (layerName, pins, icon = 'bar-15') => {
  map.addSource(layerName, apiDataToMapboxFeature(pins, icon));
  map.addLayer({
    'id': layerName,
    'type': 'symbol',
    'source': layerName,
    'layout': {
      'icon-image': '{icon}',
      'icon-allow-overlap': true,
      'icon-size': 0.15,
    }
  });

  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', layerName, (e) => {
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
  map.on('mouseenter', layerName, () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', layerName, () => {
    map.getCanvas().style.cursor = '';
  });
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
  const coords = e.lngLat;

  userCoordFeature.features[0].geometry.coordinates = [coords.lng, coords.lat];
  map.getSource('point').setData(userCoordFeature);

  updateCoordText(coords)

  // Unbind mouse/touch events
  map.off('mousemove', onMove);
  map.off('touchmove', onMove);
}

// dependent on style of map, not all support these layout properties...
const changeMapLang = (lang) => {
  map.setLayoutProperty('country-label', 'text-field', [
    'get',
    `name_${lang}`
  ])
  map.setLayoutProperty('state-label', 'text-field', [
    'get',
    `name_${lang}`
  ])
  map.setLayoutProperty('settlement-major-label', 'text-field', [
    'get',
    `name_${lang}`
  ])
  map.setLayoutProperty('settlement-minor-label', 'text-field', [
    'get',
    `name_${lang}`
  ])
  map.setLayoutProperty('settlement-subdivision-label', 'text-field', [
    'get',
    `name_${lang}`
  ])
}


map.on('load', async () => {

  changeMapLang(getLanguage())

  // guildId comes from global pug template data
  const { data } = await axios.get(`/api/pins/${guildId}`);

  map.loadImage(
    '/images/shion.png',
    (error, image) => {
      if (error) throw error;

      // Add the image to the map style.
      map.addImage('shion', image);
      createMapLayerWithPins('approvedPins', data, 'shion')
    }
  )
  // populate map with approved pins

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
    errors.push($.i18n('alphatown-pinedit-title-none'))
  } else if (title.length > 80) {
    errors.push($.i18n('alphatown-pinedit-title-long'))
  }
}

const checkDescriptionErrors = (errors) => {
  const desc = $("textarea[name='desc']").val()
  if (desc.length > 160) {
    errors.push($.i18n('alphatown-pinedit-desc-long'))
  }
}

const checkImageErrors = (errors, hasExistingPin) => {
  const file = $("input[name='image']")[0].files[0]
  const MAX_ALLOWED_SIZE = 9 * 1000 * 1000 // 9 MB
  if (!file && !hasExistingPin) {
    errors.push($.i18n('alphatown-pinedit-image-none'))
  } else if (file && file.size > MAX_ALLOWED_SIZE) {
    errors.push($.i18n('alphatown-pinedit-image-large'))
  }
}

const checkCoordErrors = (errors) => {
  const coords = userCoordFeature.features[0].geometry.coordinates
  if (coords[0] === 0 && coords[1] === 0) {
    errors.push($.i18n('alphatown-pinedit-location-none'))
  }
}

const findFormErrors = (hasExistingPin) => {
  const errors = []
  checkTitleErrors(errors)
  checkDescriptionErrors(errors)
  checkImageErrors(errors, hasExistingPin)
  checkCoordErrors(errors)

  return errors
}

const updateFormData = ({
  lng, lat, title, desc, imageUrl
}) => {
  $("input[name='image']").val('')
  $("input[name='title']").val(title)
  $("textarea[name='desc']").val(desc)
  if (imageUrl) {
    $("#pin-edit img.preview").attr('src', imageUrl)
    show('#pin-edit img.preview')
  }
  userCoordFeature.features[0].geometry.coordinates = [lng, lat]
  updateCoordText({ lng, lat })
}

const sendPinData = async () => {
  const formData = new FormData()
  formData.append('image', $("input[name='image']")[0].files[0])
  formData.append('title', $("input[name='title']").val())
  formData.append('desc', $("textarea[name='desc']").val())

  const [lng, lat] = userCoordFeature.features[0].geometry.coordinates
  formData.append('lng', lng)
  formData.append('lat', lat)
  try {
    await axios.put(`/api/pins/${guildId}`, formData)
    updateDropPinText($.i18n('alphatown-droppin-title-pending'))
    jqueryAlert({
      title: $.i18n('alphatown-alert-notice'),
      message: $.i18n('alphatown-pinedit-submit'),
      onCloseCallback: () => {
        hide('#pin-edit')
        show('.login-actions')

      }
    })
  } catch (err) {
    console.error(err)
    if (axios.isAxiosError) {
      console.error(err.response.data.message)
    }

    jqueryAlert({
      title: $.i18n('alphatown-alert-error'),
      message: $.i18n('alphatown-genericerror'),
    })
  }


}

const setAvatar = (user) => {
  $('.avatar img').attr('src', `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`)
}


const showPendingPins = async () => {
  const { data: pins } = await axios.get(`/api/pins/admin/${guildId}`)
  createMapLayerWithPins('pendingPins', pins, 'shion')
}


(async () => {
  try {
    // make sure this is loaded before doing any shit
    await i18nLoaded



    const { data: user } = await axios.get(`/api/auth/me?guildId=${guildId}`)
    hide('.discord-login')
    show('.login-actions')

    show('.avatar')
    setAvatar(user)

    console.log({ user })

    if (user.pin) {
      updateFormData(user.pin)

      if (user.pin.approved) {
        updateDropPinText($.i18n('alphatown-droppin-title-approved'))
        updatePinEditTitleText($.i18n('alphatown-pinedit-title-update-approved'))
      } else {
        updateDropPinText($.i18n('alphatown-droppin-title-pending'))
        updatePinEditTitleText($.i18n('alphatown-pinedit-title-update-pending'))
      }
    }

    if (user.isAdmin) {
      show('.show-pending')
    }

    // handle showing a preview on file select to show the user something
    $('#pin-edit .image input').on('change', (e) => {
      const files = e.target.files
      if (files.length > 0) {
        let src = URL.createObjectURL(files[0])
        $('#pin-edit .image .preview').attr('src', src)
      }
    })

    // close #pin-edit ui, show .login-actions
    $('.trigger-coord-select').click(() => {
      jqueryAlert({
        message: $.i18n('alphatown-pinedit-location-addresswarn'),
        title: $.i18n('alphatown-alert-warning'),
      })
      hide('#pin-edit')
      // we don't show the login-actions part because we want to only let user choose loc
      // show('.login-actions')
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
      hide('.login-actions')

      if (user.pin && !user.pin.approved) {
        if (user.pin.approved) {

        } else {
          map.setLayoutProperty('point', 'visibility', 'visible')
          map.flyTo({
            speed: 3,
            center: userCoordFeature.features[0].geometry.coordinates,
            zoom: 11.15,
          })
        }
      }
    })


    $('#pin-edit .close-button span').click(() => {
      hide('#pin-edit')
      show('.login-actions')
    })

    $('form#pin-edit').submit(async (e) => {
      console.log("SUBMITTED")
      e.preventDefault();

      const errors = findFormErrors(user.pin !== null)
      if (errors.length > 0) {

        alert(errors.join('\n'))
        return
      }

      await sendPinData();


    })

    $('.show-pending').click(async () => {
      hide('.show-pending')
      // hide current layer
      map.setLayoutProperty('approvedPins', 'visibility', 'none')
      await showPendingPins();

    })
  } catch (err) {
    console.error(err)
  }
})();