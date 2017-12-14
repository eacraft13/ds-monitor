/* global $:true */

'use strict';

$(function () {

    var $menus = $('.menu');
    var $nav = $('header nav > span');

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
