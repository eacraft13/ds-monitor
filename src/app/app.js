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

    /**
     * Repopulate resale cards
     */
    function repopulate(resales) {
        $resales.empty();

        $.each(resales, function (i, resale) {
            $resales.append('<div class="resale" data-id="' + resale.resaleId + '">' + resale.createdAt + '</div>');
        });
    }

});
