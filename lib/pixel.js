// https://segment.com/docs/destinations/facebook-pixel/#timestamps
var dateFields = [
  'checkinDate',
  'checkoutDate',
  'departingArrivalDate',
  'departingDepartureDate',
  'returningArrivalDate',
  'returningDepartureDate',
  'travelEnd',
  'travelStart'
];

// https://segment.com/docs/destinations/facebook-pixel/#pii-blacklisting
var piiBlacklist = [  
  'email',
  'firstName',
  'lastName',
  'gender',
  'city',
  'country',
  'phone',
  'state',
  'zip',
  'birthday'
];

// holds the configuration from pixel settings page for "Whitelist PII Properties"
var piiWhitelist = [
  'email'
];

// holds configuration from pixel setting for "Map Your Events to Standard FB Events"
var standardEventMap = {
  'Product List Viewed': 'ViewContent'
}

// scraped from FB pixel configuration in Segment
var standardEvents = [
  'ViewContent',
  'Search',
  'AddToCart', 
  'AddToWishlist', 
  'InitiateCheckout', 
  'AddPaymentInfo', 
  'Purchase', 
  'Lead', 
  'CompleteRegistration', 
  'Contact', 
  'CustomizeProduct', 
  'Donate', 
  'FindLocation', 
  'Schedule', 
  'StartTrial', 
  'SubmitApplication', 
  'Subscribe'
];

export class Pixel {
  constructor() {}

  /**
   * Used to create a tracking event formatted for FB pixel
   * 
   * @param {Object} track 
   */
  track(track) {
    let trackEvent = standardEventMap[track.event] ? standardEventMap[track.event] : track.event;
    let eventName = !standardEvents.includes(trackEvent) ? 'trackCustom' : 'track';
    let payload = this.createPayload(track);

    return this.sendEvent(eventName, trackEvent, payload);
  }

  /**
   * Sends the event to FB pixel
   * 
   * @param {string} eventName
   * @param {string} trackEvent 
   * @param {Object} payload 
   */
  sendEvent(eventName, trackEvent, payload) {
    return window.fbq(eventName, trackEvent, payload);
  }

  /**
   * Creates the event payload by removing PII and parsing date fields if necessary
   * 
   * @param {Object} track - the json captured by Segment 
   */
  createPayload(track) {
    let payload = {};
    let validPiiPropertyKeys = this.removePii(Object.keys(track.properties), piiBlacklist, piiWhitelist);

    payload.properties = validPiiPropertyKeys.reduce((acc, property) => {
      let propertyValue = track.properties[property];

      if (this.isDate([property, propertyValue])) {
        acc[property] = this.formatDate(propertyValue);

        return acc;
      }

      acc[property] = track.properties[property];

      return acc;
    }, {});

    return payload;
  }

  /**
   * Removes PII by combining the blacklist and whitelist
   * 
   * @param {Object[]} properties 
   * @param {string[]} blacklist 
   * @param {string[]} whitelist 
   */
  removePii(properties, blacklist, whitelist) {
    let piiProperties = blacklist.filter(item => !whitelist.includes(item));

    return properties.filter(item => !piiProperties.includes(item));
  }

  /**
   * Checks if the key exists in the date fields that are automatically parsed 
   * and if the value is a Date object
   * 
   * @param {Array} dateField 
   */
  isDate(dateField) {
    let [ key, value ] = dateField;
  
    return dateFields.includes(key) && Object.prototype.toString.call(value) === "[object Date]"; 
  }

  /**
   * Transforms the Date into ISO 8601 string without timezone
   * which is expected by FB Pixel
   * 
   * @param {Date} dateValue 
   */
  formatDate(dateValue) {
    return dateValue.toISOString().split('T')[0];
  }
}


/*
  - Example usage:

    // First load the FB pixel init script: https://developers.facebook.com/docs/facebook-pixel/implementation/#base-code

    const pixel = new Pixel();
    pixel.track(pixelJson);

  - Eventual fbq function

    fbq('track', 'ViewContent',  {
      "category": "Deals",
      "list_id": "hot_deals_1",
      "products": [
        {
          "category": "Games",
          "name": "Monopoly: 3rd Edition",
          "position": 1,
          "price": 19,
          "product_id": "507f1f77bcf86cd799439011",
          "sku": "45790-32",
          "url": "https://www.example.com/product/path"
        },
        {
          "category": "Games",
          "name": "Uno Card Game",
          "position": 2,
          "price": 3,
          "product_id": "505bd76785ebb509fc183733",
          "sku": "46493-32"
        }
      ]
    });
*/