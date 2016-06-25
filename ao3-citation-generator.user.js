// ==UserScript==
// @name         AO3 Citation Generator
// @namespace    https://github.com/redsummernight
// @version      0.0.1
// @description  Cite fan works from AO3: http://www.transformativeworks.org/how-to-cite-fan-works/
// @author       redsummernight
// @match        *://archiveofourown.org/works/*
// @grant        none
// ==/UserScript==

/* global console:false */
(function() {
    'use strict';

    function getText(selector) {
        return document.querySelector(selector).textContent.trim();
    }

    function getTextList(selector) {
        var r = [],
            elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            r.push(elements[i].textContent.trim());
        }
        return r;
    }

    function getInfo() {
        return {
            url: document.URL.split('#')[0],
            title: getText('.title.heading'),
            author: getText('[rel=author]'),
            publishedDate: getText('dd.published'),
            categories: getTextList('dd.category.tags a.tag'),
            fandoms: getTextList('dd.fandom.tags a.tag'),
            relationships: getTextList('dd.relationship.tags a.tag'),
        };
    }

    console.log(getInfo());
})();