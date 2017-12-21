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
//         "categoryName":["Comforters & Sets"]
//     }],
//     "galleryURL":["http://thumbs2.ebaystatic.com/pict/292365480201404000000001_1.jpg"],
//     "viewItemURL":["http://www.ebay.com/itm/New-Oversize-Embroidered-Western-Texas-Lone-Star-Bedding-Comforter-Set-/292365480201?var=591249780274"],
//     "paymentMethod":["PayPal"],
//     "autoPay":["true"],
//     "postalCode":["52338"],
//     "location":["Swisher,IA,USA"],
//     "country":["US"],
//     "shippingInfo":[{
//         "shippingServiceCost":[{
//             "@currencyId":"USD",
//             "__value__":"0.0"
//         }],
//         "shippingType":["Free"],
//         "shipToLocations":["Worldwide"],
//         "expeditedShipping":["true"],
//         "oneDayShippingAvailable":["false"],
//         "handlingTime":["3"]
//     }],
//     "sellingStatus":[{
//         "currentPrice":[{
//             "@currencyId":"USD",
//             "__value__":"166.37"
//         }],
//         "convertedCurrentPrice":[{
//             "@currencyId":"USD",
//             "__value__":"166.37"
//         }],
//         "sellingState":["Active"],
//         "timeLeft":["P18DT16H59M7S"]
//     }],
//     "listingInfo":[{
//         "bestOfferEnabled":["false"],
//         "buyItNowAvailable":["false"],
//         "startTime":["2017-12-10T13:17:35.000Z"],
//         "endTime":["2018-01-09T13:17:35.000Z"],
//         "listingType":["FixedPrice"],
//         "gift":["false"],
//         "watchCount":["1"]
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
                        max: +listing.shippingInfo[0].handlingTime[0] + listing.shippingInfo[0].expeditedShipping === 'true' ? 3 : 5,
                        min: +listing.shippingInfo[0].handlingTime[0] + listing.shippingInfo[0].expeditedShipping === 'true' ? 1 : 3,
                    },
                    handlingTime: listing.shippingInfo[0].handlingTime[0],
                    isGlobal: listing.shippingInfo[0].shipToLocations[0] === 'Worldwide',
                    service: listing.shippingInfo[0].shippingType[0].replace(/([a-z])([A-Z])/g, '$1 $2'),
                },
                snipes: [],
                sold: null,
                state: listing.sellingStatus[0].sellingState[0],
                supplies: [],
                tax: 0,
                title: listing.title[0],
                visits: null,
                watchers: listing.listingInfo[0].watchCount ? listing.listingInfo[0].watchCount[0] : 0
            };
        });
    })
    .then(function (listings) {
        return _.map(listings, function (listing) {
            request({
                body: listing,
                json: true,
                method: 'post',
                uri: 'http://' + config.uri + ':' + config.port + '/listings',
            }, function (err, res, body) {
                if (err)
                    return Promise.reject(new Error(err));

                if (res.statusCode !== 201 && res.statusCode !== 204)
                    return Promise.reject(new Error(res.errorMessage));

                return Promise.resolve(body);
            });
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
