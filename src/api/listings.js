'use strict';

var _ = require('lodash');
var config = require('../config/api');
var credentials = require('../../private/ebay'),
    ebay = require('ebay-dev-api')(credentials);
var express = require('express'),
    router = express.Router();
var request = require('request');

// eBay api payload
// { itemId: [ '292361418400' ],
//   title: [ 'Camouflage Realtree Bedding Comforter Set w/SHAMS Camo Twin Full Queen King NEW' ],
//   globalId: [ 'EBAY-US' ],
//   primaryCategory: [ { categoryId: [Object], categoryName: [Object] } ],
//   galleryURL: [ 'http://thumbs1.ebaystatic.com/pict/2923614184004040_1.jpg' ],
//   viewItemURL: [ 'http://www.ebay.com/itm/Camouflage-Realtree-Bedding-Comforter-Set-w-SHAMS-Camo-Twin-Full-Queen-King-NEW-/292361418400?var=591247384991' ],
//   paymentMethod: [ 'PayPal' ],
//   autoPay: [ 'true' ],
//   postalCode: [ '52338' ],
//   location: [ 'Swisher,IA,USA' ],
//   country: [ 'US' ],
//   shippingInfo:
//    [ { shippingServiceCost: [Object],
//        shippingType: [Object],
//        shipToLocations: [Object],
//        expeditedShipping: [Object],
//        oneDayShippingAvailable: [Object],
//        handlingTime: [Object] } ],
//   sellingStatus:
//    [ { currentPrice: [Object],
//        convertedCurrentPrice: [Object],
//        sellingState: [Object],
//        timeLeft: [Object] } ],
//   listingInfo:
//    [ { bestOfferEnabled: [Object],
//        buyItNowAvailable: [Object],
//        startTime: [Object],
//        endTime: [Object],
//        listingType: [Object],
//        gift: [Object] } ],
//   returnsAccepted: [ 'true' ],
//   condition: [ { conditionId: [Object], conditionDisplayName: [Object] } ],
//   isMultiVariationListing: [ 'true' ],
//   topRatedListing: [ 'false' ] }


/**
 * Refresh listing(s)
 */
// todo: should be patch and body should contain resale ids to refresh (with 'all' option) - if passing resaleIds, then move out of /listings/refresh and just do /refresh
router.patch('/refresh', function (req, res) {
    ebay.finding
    .findItemsIneBayStores({
        storeName: credentials.storeName
    })
    .then(function (result) {
        return _.map(result[0].item, function (listing) {
            return {
                dateListed: [{
                    start: listing.listingInfo[0].startTime[0],
                    end: listing.listingInfo[0].endTime[0]
                }],
                eBayId: listing.itemId[0],
                images: [ listing.galleryURL[0] ],
                link: listing.viewItemURL[0],
                price: listing.sellingStatus[0].currentPrice[0].__value__,
                rank: {
                    product: null,
                    title: null,
                    topRated: listing.topRatedListing[0]
                },
                shipping: {
                    cost: listing.shippingInfo[0].shippingServiceCost[0].__value__,
                    estimatedDelivery: {
                        max: +listing.shippingInfo[0].handlingTime + listing.shippingInfo[0].expeditedShipping === 'true' ? 3 : 5,
                        min: +listing.shippingInfo[0].handlingTime
                    },
                    handlingTime: listing.shippingInfo[0].handlingTime[0],
                    isGlobal: listing.shippingInfo[0].shipToLocations[0] === 'Worldwide',
                    service: listing.shippingInfo[0].shippingType[0]
                },
                snipes: [],
                sold: null,
                state: listing.sellingStatus[0].sellingState[0],
                supplies: [],
                tax: null,
                title: listing.title[0],
                visits: null,
                watchers: listing.listingInfo[0].watchCount ? listing.listingInfo[0].watchCount[0] : 0
            };
        });
    })
    .then(function (listings) {
        return _.map(listings, function (listing) {
            return function () {
                return new Promise(function (reject, resolve) {
                    request({
                        body: listing,
                        json: true,
                        method: 'post',
                        uri: 'http://' + config.uri + ':' + config.port + '/listings',
                    }, function (err, res, body) {
                        if (err)
                            return reject(new Error(err));

                        if (res.statusCode !== 201 && res.statusCode !== 204)
                            return reject(new Error(res.errorMessage));

                        return resolve(body);
                    });
                });
            };
        });
    })
    .then(function (promises) {
        return Promise.all(promises);
    })
    .then(function (result) {
        return res.status(204).json(result);
    })
    .catch(function (err) {
        return res.error(err);
    });
});

/**
 * Create a listing
 */
router.post('/add', function (req, res) {
    // TODO
    return res.json('adding');
});

module.exports = router;
