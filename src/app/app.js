/* global $:true */

'use strict';

$(function () {

    /**
     * Actions dropdown
     */
    $('.actions').on('click', function () {
        $(this).find('.menu').toggle('fast');
    });

});
