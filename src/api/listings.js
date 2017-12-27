'use strict';

var _ = require('lodash');
var config = require('../config/api');
var credentials = require('../../private/ebay'),
    ebay = require('ebay-dev-api')(credentials);
var express = require('express'),
    router = express.Router();
var request = require('request');
var resaleUtil = require('../utils/resale');

/**
 * Sync listings
 */

/**
 * Refresh listing
 */
router.patch('/:id/refresh', function (req, res) {
    var itemId = req.params.id.split('-')[0];
    var specs = req.query.variation; // req.params.id.split('-')[1] -> unhash

    ebay.finding
    .findItemsIneBayStores({
        storeName: credentials.storeName
    })
    .then(function (findingItems) {
        return _.find(findingItems[0].item, function (item) {
            return itemId === item.itemId[0];
        });
    })
    .then(function (findingItem) {
        return ebay.shopping
            .getMultipleItems([itemId])
            .then(function (shoppingItems) {
                // todo - find specific variation
                return shoppingItems[0];
            })
            .then(function (shoppingItem) {
                return {
                    '@ebay_finding': findingItem,
                    '@ebay_shopping': shoppingItem
                };
            });
    })
    .then(function (item) {
        return resaleUtil.createFromFindingAndShopping(item['@ebay_finding'], item['@ebay_shopping']);
    })
    .then(function (item) {
        return new Promise(function (resolve, reject) {
            request({
                body: item,
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
    })
    .then(function (result) {
        return res.status(204).json(result);
    })
    .catch(function (err) {
        return res.error(err);
    });
});

/**
 * Refresh listings
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
        return _.uniqBy(items, function (item) { // remove dups
            return item['@ebay_shopping'].ItemID;
        });
    })
    .then(function (items) {
        return _(items)
            .map(function (item) {
                return resaleUtil.createVariations(item, item['@ebay_finding'], item['@ebay_shopping']);
            })
            .flatten()
            .valueOf();
    })
    .then(function (items) {
        return _.map(items, function (item) {
            return resaleUtil.createFromFindingAndShopping(item['@ebay_finding'], item['@ebay_shopping'], {
                price: item.price,
                quantity: item.quantity,
                sold: item.sold,
                variationSpecifics: item.variationSpecifics
            });
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
