'use strict';

var _ = require('lodash');
var config = require('../config/api');
var credentials = require('../../private/ebay'),
    ebay = require('ebay-dev-api')(credentials);
var express = require('express'),
    router = express.Router();
var moment = require('moment');
var request = require('request');

/**
 * Refresh listing(s)
 */
router.patch('/refresh', function (req, res) {
    ebay.finding
    .findItemsIneBayStores({
        storeName: credentials.storeName
    })
    .then(function (x) {
        var ids = _(x[0].item)
            .map(function (itemX) {
                return itemX.itemId[0];
            })
            .uniq()
            .valueOf();

        return ebay.shopping.getMultipleItems(ids)
            .then(function (y) {
                return _.map(x[0].item, function (itemX) {
                    var itemY = _.find(y, { ItemID: itemX.itemId[0] });

                    return {
                        '@ebay_finding': itemX,
                        '@ebay_shopping': itemY
                    };
                });
            });
    })
    .then(function (items) {
        return _.map(items, function (item) {
            var finding = item['@ebay_finding'];
            var shopping = item['@ebay_shopping'];

            return {
                dateListed: [{
                    end: moment(shopping.EndTime).utc(),
                    start: moment(shopping.StartTime).utc(),
                }],
                eBayId: shopping.ItemID,
                images: [ finding.galleryURL[0] ].concat(shopping.PictureURL),
                link: shopping.ViewItemURLForNaturalSearch,
                price: shopping.CurrentPrice.Value,
                quantity: shopping.Quantity,
                rank: {
                    isTopRated: finding.topRatedListing[0],
                },
                shipping: {
                    cost: +finding.shippingInfo[0].shippingServiceCost[0].__value__,
                    estimatedDelivery: {
                        max: +finding.shippingInfo[0].handlingTime[0] + finding.shippingInfo[0].expeditedShipping === 'true' ? 3 : 5,
                        min: +finding.shippingInfo[0].handlingTime[0] + finding.shippingInfo[0].expeditedShipping === 'true' ? 1 : 3,
                    },
                    excludes: shopping.ExcludeShipToLocation,
                    handlingTime: shopping.HandlingTime,
                    isGlobal: shopping.GlobalShipping,
                    service: finding.shippingInfo[0].shippingType[0].replace(/([a-z])([A-Z])/g, '$1 $2'),
                },
                snipes: [],
                sold: shopping.QuantitySold,
                state: shopping.ListingStatus,
                supplies: [],
                tax: 0,
                title: shopping.Title,
                visits: shopping.HitCount,
                watchers: finding.listingInfo[0].watchCount ? +finding.listingInfo[0].watchCount[0] : 0,
            };
        });
    })
    .then(function (listings) {
        return _.map(listings, function (listing) {
            return new Promise(function (resolve, reject) {
                request({
                    body: listing,
                    json: true,
                    method: 'post',
                    uri: 'http://' + config.uri + ':' + config.port + '/listings',
                }, function (err, res, body) {
                    if (err)
                        return reject(new Error(err));

                    if (res.statusCode !== 201 && res.statusCode !== 204)
                        return reject(new Error(JSON.stringify(body)));

                    return resolve(body);
                });
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
