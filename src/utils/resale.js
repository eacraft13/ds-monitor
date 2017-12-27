'use strict';

var _ = require('lodash');
var hash = require('object-hash');
var moment = require('moment');
var resale = {};

/**
 * Generates a unique id for variation
 * @param {string} itemId
 * @param {object} variationSpecifics
 */
resale.generateId = function (itemId, variationSpecifics) {
    var id;

    if (variationSpecifics)
        id = hash.MD5(variationSpecifics);
    else
        id = 0;

    return `${itemId}-${id}`;
};

/**
 * Create all variations from eBay api item
 * @param {object} item - resale
 * @param {object} finding - eBay finding api output
 * @param {object} shopping - eBay shopping api output
 */
resale.createVariations = function (item, finding, shopping) {
    var variations = [];

    if (shopping.Variations) {
        _.each(shopping.Variations.Variation, function (variationSpecs) {
            var list;
            var variation;

            variation = _.assign({}, item, {
                price: variationSpecs.StartPrice.Value,
                quantity: variationSpecs.Quantity,
                sold: variationSpecs.SellingStatus.QuantitySold,
            });

            list = variationSpecs.VariationSpecifics.NameValueList;
            variation.variationSpecifics = {};

            _.each(list, function (nameValue) {
                variation.variationSpecifics[nameValue.Name] = nameValue.Value[0];
            });

            variations.push(variation);
        });
    } else {
        variations.push(item);
    }

    return variations;
};

/**
 * Create a resale store object from eBay api
 * @param {objec} finding - eBay finding api output
 * @param {object} shopping - eBay shopping api output
 * @param {object} overwrites - resale overwrites
 */
resale.createFromFindingAndShopping = function (finding, shopping, overwrites) {
    overwrites = overwrites || {};

    return {
        dateListed: [{
            end: moment(shopping.EndTime).utc(),
            start: moment(shopping.StartTime).utc(),
        }],
        eBayId: shopping.ItemID,
        id: this.generateId(shopping.ItemID, overwrites.variationSpecifics),
        images: shopping.PictureURL,
        link: shopping.ViewItemURLForNaturalSearch,
        price: overwrites.price || shopping.CurrentPrice.Value,
        quantity: overwrites.quantity || shopping.Quantity,
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
        sold: overwrites.sold || shopping.QuantitySold,
        state: shopping.ListingStatus,
        supplies: [],
        tax: 0,
        thumb: shopping.GalleryURL,
        title: shopping.Title,
        variationSpecifics: overwrites.variationSpecifics,
        visits: shopping.HitCount,
        watchers: finding.listingInfo[0].watchCount ? +finding.listingInfo[0].watchCount[0] : 0,
    };
};

module.exports = resale;
