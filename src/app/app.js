/* global $:true */

'use strict';

$(function () {

    var $menus = $('.menu');

    /**
     * Close all menus on click
     */
    $('html').on('click', function () {
        $menus.hide('fast');
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

});
