'use strict';

var _ = require('lodash');
var config = require('../config/api');
var credentials = require('../../private/ebay'),
    ebay = require('ebay-dev-api')(credentials);
var express = require('express'),
    router = express.Router();
var request = require('request');

/**
 * Refresh listing(s)
 */
// todo: should be patch and body should contain resale ids to refresh (with 'all' option)
// router.patch('/refresh', function (req, res) {
router.get('/refresh', function (req, res) {
    ebay.finding
    .findItemsIneBayStores({
        storeName: credentials.storeName
    })
    .then(function (result) {
        return _.map(result[0], function (resale) {
            // { itemId: [ '292365546850' ],
            // title: [ 'Over The Toilet Bathroom Storage Organizer Tower Rack Shelfs Space Saver Bronze' ],
            // globalId: [ 'EBAY-US' ],
            // primaryCategory: [ [Object] ],
            // galleryURL: [ 'http://thumbs3.ebaystatic.com/m/mAX1jeBjQIETGyTsQpN-nqA/140.jpg' ],
            // viewItemURL: [ 'http://www.ebay.com/itm/Over-Toilet-Bathroom-Storage-Organizer-Tower-Rack-Shelfs-Space-Saver-Bronze-/292365546850' ],
            // paymentMethod: [ 'PayPal' ],
            // autoPay: [ 'true' ],
            // postalCode: [ '52338' ],
            // location: [ 'Swisher,IA,USA' ],
            // country: [ 'US' ],
            // shippingInfo: [ [Object] ],
            // sellingStatus: [ [Object] ],
            // listingInfo: [ [Object] ],
            // returnsAccepted: [ 'true' ],
            // condition: [ [Object] ],
            // isMultiVariationListing: [ 'false' ],
            // topRatedListing: [ 'false' ] },
            return new Promise(function (reject, resolve) {
                request({
                    uri: config.uri + '/listings/' + result.itemId,
                    port: config.port,
                    method: 'patch',
                    body: {
                        dateListed: [{
                            start: null,
                            end: null
                        }],
                        eBayId: result.itemId,
                        images: [ result.galleryURL ],
                        link: resale.viewItemURL,
                        price: null,
                        rank: {
                            product: null,
                            title: null
                        },
                        shipping: {
                            cost: null,
                            estimatedDelivery: {
                                max: null,
                                min: null
                            },
                            handlingtime: null,
                            isGlobal: null,
                            service: null
                        },
                        snipes: [{
                            active: null,
                            snipeId: null
                        }],
                        sold: null,
                        supplies: [null],
                        tax: null,
                        visits: null,
                        watchers: null
                    }
                }, function (err, res, body) {
                    if (err)
                        return reject(new Error(err));

                    if (res.statusCode !== 201 || res.statusCode !== 204)
                        return reject(new Error(res.errorMessage));

                    return resolve(body);
                });
            });
        });
    })
    .then(function (promises) {
        return Promise.all(promises);
    })
    .then(function (result) {
        return res.json(result);
    })
    .catch(function (err) {
        return res.error(err);
    });
});

router.post('/add', function (req, res) {
    // TODO
    return res.json('adding');
});

module.exports = router;
