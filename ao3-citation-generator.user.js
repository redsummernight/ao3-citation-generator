// ==UserScript==
// @name         AO3 Citation Generator
// @namespace    https://github.com/redsummernight
// @version      0.0.1
// @description  Cite fan works from AO3
// @author       redsummernight
// @match        *://archiveofourown.org/works/*
// @grant        GM_addStyle
// ==/UserScript==

/* jshint newcap:false */
/* global console:false, GM_addStyle:false */
(function() {
    'use strict';

    var noSelectStyleClass = 'citation-noselect';

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

    function getUnselectableHTML(text) {
        return '<span class="' + noSelectStyleClass + '">' + text + '</span>';
    }

    function getMonthName(index) {
        var monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        return monthNames[index];
    }

    function getInfo() {
        return {
            url: document.URL.split('#')[0],
            title: getText('.title.heading'),
            author: getText('[rel=author]'),
            // Where the string is ISO 8601 date only, the UTC time zone is used to interpret arguments.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
            publishedDate: new Date(getText('dd.published')),
            categories: getTextList('dd.category.tags a.tag'),
            fandoms: getTextList('dd.fandom.tags a.tag'),
            relationships: getTextList('dd.relationship.tags a.tag'),
        };
    }

    function getFandomDescription(fandoms) {
        if (fandoms.length === 0) {
            throw 'No fandom';
        } else if (fandoms.length === 1) {
            return fandoms[0];
        } else if (fandoms.length < 4) {
            return fandoms.join('/') + ' crossover';
        } else {
            return 'Multifandom';
        }
    }

    function getRelationshipDescription(relationship, category) {
        var r = relationship;
        if (category === 'M/M' || category === 'F/F') {
            r += ' slash';
        }
        return r;
    }

    function getCitation(info, style) {
        var c = '';
        switch (style) {
            case 'social-sciences':
                c += info.author + '. ';
                c += info.publishedDate.getUTCFullYear() + '. ';
                c += '"' + info.title + '." ';
                c += getFandomDescription(info.fandoms) + ' fan fiction. ';
                if (info.relationships.length === 1 && info.categories.length === 1) {
                    c += getRelationshipDescription(info.relationships[0], info.categories[0]) + '. ';
                }
                c += '<em>Archive of Our Own</em>, ';
                c += info.publishedDate.getUTCDate() + ' ' + getMonthName(info.publishedDate.getUTCMonth()) + '. ';
                c += '<a href=' + info.url + '>' + info.url + '</a>.';
                break;
            case 'humanities':
                c += info.author + '. ';
                c += '"' + info.title + '." ';
                c += getFandomDescription(info.fandoms) + ' fan fiction. ';
                if (info.relationships.length === 1 && info.categories.length === 1) {
                    c += getRelationshipDescription(info.relationships[0], info.categories[0]) + '. ';
                }
                c += '<em>Archive of Our Own</em>, ';
                c += info.publishedDate.getUTCDate() + ' ' + getMonthName(info.publishedDate.getUTCMonth()) + ' ';
                c += info.publishedDate.getUTCFullYear() + '. ';
                c += '<a href=' + info.url + '>' + info.url + '</a>.';
                break;
            default:
                throw 'Unknown citation style';
        }
        return c;
    }

    function insertCitation() {
        var meta = document.querySelector('dl.work.meta');
        var info = getInfo();

        var dt = document.createElement('dt');
        dt.innerHTML = '<a href="http://www.transformativeworks.org/how-to-cite-fan-works/">Citation</a>: ';
        meta.appendChild(dt);

        var dd = document.createElement('dd');
        var citationHTML = '<p>';
        citationHTML += getUnselectableHTML('Social sciences style: ');
        citationHTML += getCitation(info, 'social-sciences');
        citationHTML += '</p><p>';
        citationHTML += getUnselectableHTML('Humanities style: ');
        citationHTML += getCitation(info, 'humanities');
        citationHTML += '<p>';
        dd.innerHTML = citationHTML;
        meta.appendChild(dd);
    }

    insertCitation();

    // http://stackoverflow.com/a/4407335
    GM_addStyle('.' + noSelectStyleClass + ' {' +
        '-webkit-touch-callout: none; /* iOS Safari */' +
        '-webkit-user-select: none;   /* Chrome/Safari/Opera */' +
        '-khtml-user-select: none;    /* Konqueror */' +
        '-moz-user-select: none;      /* Firefox */' +
        '-ms-user-select: none;       /* Internet Explorer/Edge */' +
        'user-select: none;           /* Non-prefixed version, currently not supported by any browser */'
    );
})();