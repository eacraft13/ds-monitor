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
    $('.dashboard > .search > input')
    .change(function () {
        var $cards = $resales.find('resale-card');
        var filter = $(this).val();

        if (filter) {
            $cards
            .filter(function () {
                if ($(this).attr('title'))
                    return $(this).attr('title').toUpperCase().indexOf(filter.toUpperCase()) > -1;
                return false;
            })
            .slideDown();

            $cards
            .filter(function () {
                if ($(this).attr('title'))
                    return $(this).attr('title').toUpperCase().indexOf(filter.toUpperCase()) === -1;
                return true;
            })
            .slideUp();
        } else {
            $cards.slideDown();
        }
    })
    .keyup(function () {
        $(this).change();
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

});
