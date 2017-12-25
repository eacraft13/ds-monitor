/* global $:true */

'use strict';

$(function () {

    var $menus = $('.menu');
    var $nav = $('header nav > span');
    var $resales = $('.resales');

    /**
     * Close all menus on click
     */
    $('html').on('click', function () {
        $menus.hide('fast');
    });

    /**
     * Navigation
     */
    $nav.on('click', function () {
        $nav.removeClass('active');
        $(this).addClass('active');
    });

    $nav.filter('.listings').on('click', function () {
        $.get('http://store.dropshipping:8011/listings')
        .done(function (data) {
            repopulate(data);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log('Fail on listings');
        });
    });

    /**
     * Settings dropdown
     */
    $('.settings').on('click', function (e) {
        e.stopPropagation();
        $(this).find('.menu').toggle('fast');
    });

    /**
     * Actions dropdown
     */
    $('.actions').on('click', function (e) {
        e.stopPropagation();
        $(this).find('.menu').toggle('fast');
    });

    $('.actions .action.refresh').on('click', function (e) {
        $.ajax({
            url: '/listings/refresh',
            method: 'patch'
        })
        .done(function () {
            $nav.filter('.listings').click();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log('Failed refresh');
        });
    });

    /**
     * Filter search
     */
    $('.dashboard > .search > input').on('keyup', function () {
        var $cards = $resales.find('resale-card');
        var filter = $(this).val();

        if (filter) {
            $cards.filter(function () {
                return containsAll(filter.split(' '), $(this).attr('title'));
            }).slideDown();

            $cards.filter(function () {
                return !containsAll(filter.split(' '), $(this).attr('title'));
            }).slideUp();
        } else {
            $cards.slideDown();
        }
    });

    /**
     * Repopulate resale cards
     */
    function repopulate(resales) {
        var storeUri = 'http://store.dropshipping:8011';

        $resales.empty();

        $.each(resales, function (i, resale) {
            $resales.append(`<resale-card
                resale-id="${resale.resaleId}"
                store-uri="${storeUri}">
                </resale-card>`);
        });
    }

    /**
     * Check if all values in array are in a string
     */
    function containsAll(needles, haystack, isCaseSensitive) {
        var i;
        var flag = isCaseSensitive ? '' : 'i';

        if (!haystack)
            return false;

        for (i = 0; i < needles.length; i++)
            if (!(new RegExp(needles[i], flag)).test(haystack))
                return false;

        return true;
    }

});
