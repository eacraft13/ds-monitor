'use strict';

var _ = require('lodash');
var config = require('../config/api');
var credentials = require('../../private/ebay'),
    ebay = require('ebay-dev-api')(credentials);
var express = require('express'),
    router = express.Router();
var request = require('request');

// eBay api payload
// {
//     "itemId":["292365480201"],
//     "title":["New Oversize Embroidered Western Texas Lone Star Bedding Comforter Set."],
//     "globalId":["EBAY-US"],
//     "primaryCategory":[{
//         "categoryId":["45462"],
//         "categoryName":["Comforters & Sets"]}
//     ],
//     "galleryURL":["http://thumbs1.ebaystatic.com/pict/04040_0.jpg"],
//     "viewItemURL":["http://www.ebay.com/itm/New-Oversize-Embroidered-Western-Texas-Lone-Star-Bedding-Comforter-Set-/292365480201?var=0"],
//     "paymentMethod":["PayPal"],
//     "autoPay":["true"],
//     "postalCode":["52338"],
//     "location":["Swisher, IA, USA"],
//     "country":["US"],
//     "shippingInfo":[{
//         "shippingServiceCost":[{"@currencyId":"USD", "__value__":"0.0"}],
//         "shippingType":["Free"],
//         "shipToLocations":["Worldwide"],
//         "expeditedShipping":["true"],
//         "oneDayShippingAvailable":["false"],
//         "handlingTime":["3"]
//     }],
//     "sellingStatus":[{
//         "currentPrice":[{"@currencyId":"USD","__value__":"111.51"}],
//         "convertedCurrentPrice":[{"@currencyId":"USD","__value__":"111.51"}],
//         "sellingState":["Active"],
//         "timeLeft":["P24DT11H2M6S"]
//     }],
//     "listingInfo":[{
//         "bestOfferEnabled":["false"],
//         "buyItNowAvailable":["false"],
//         "startTime":["2017-12-11T01:17:35.000Z"],
//         "endTime":["2018-01-09T13:17:35.000Z"],
//         "listingType":["FixedPrice"],
//         "gift":["false"],
//         "watchCount":["2"]
//     }],
//     "returnsAccepted":["true"],
//     "condition":[{
//         "conditionId":["1000"],
//         "conditionDisplayName":["New with tags"]
//     }],
//     "isMultiVariationListing":["true"],
//     "topRatedListing":["false"]
// }


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
