// ==UserScript==
// @name         AO3 Citation Generator
// @namespace    https://github.com/redsummernight
// @version      1.0.1
// @description  Cite fan works from AO3
// @author       redsummernight
// @match        *://archiveofourown.org/works/*
// @match        *://archiveofourown.org/chapters/*
// @match        *://*.archiveofourown.org/works/*
// @match        *://*.archiveofourown.org/chapters/*
// @grant        GM_addStyle
// @downloadURL  https://rawgit.com/redsummernight/ao3-citation-generator/master/ao3-citation-generator.user.js
// @supportURL   https://github.com/redsummernight/ao3-citation-generator/issues
// @website      https://github.com/redsummernight/ao3-citation-generator
// @homepageURL  https://github.com/redsummernight/ao3-citation-generator
// ==/UserScript==

/* jshint newcap:false */
/* global console:false, GM_addStyle:false, module:false */
var ACG = (function() {
    'use strict';

    var m = {};

    function getMonthName(index) {
        var monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        return monthNames[index];
    }

    m.getWorkURL = function(url) {
        var re = /(.*\/works\/\d+)*/;
        url = url.split('#')[0];
        return re.exec(url)[1];
    };

    m.getFandomDescription = function(fandoms) {
        if (fandoms.length === 0) {
            throw 'No fandom';
        } else if (fandoms.length === 1) {
            return fandoms[0];
        } else if (fandoms.length < 4) {
            return fandoms.join('/') + ' crossover';
        } else {
            return 'Multifandom';
        }
    };

    m.getRelationshipDescription = function(relationship, category) {
        var r = relationship;
        if (category === 'M/M' || category === 'F/F') {
            r += ' slash';
        }
        return r;
    };

    m.getQuotedTitle = function(title) {
        var t = title.replace(/"/g, '\'');

        var titleWithoutQuotes = t.replace(/["']/g, ''),
            lastCharWithoutQuotes = titleWithoutQuotes.charAt(titleWithoutQuotes.length - 1);
        if (['.', '?', '!'].indexOf(lastCharWithoutQuotes) === -1) {
            t += '.';
        }

        return '"' + t + '"';
    };

    m.getCitation = function(info, style) {
        if (style !== 'social-sciences' && style !== 'humanities') {
            throw 'Unknown citation style';
        }

        var c = '';
        c += info.author + '. ';
        if (style === 'social-sciences') {
            c += info.publishedDate.getUTCFullYear() + '. ';
        }
        c += m.getQuotedTitle(info.title) + ' ';
        c += m.getFandomDescription(info.fandoms) + ' fan fiction. ';
        if (info.relationships.length === 1 && info.categories.length === 1) {
            c += m.getRelationshipDescription(info.relationships[0], info.categories[0]) + '. ';
        }
        c += '<em>Archive of Our Own</em>, ';
        c += info.publishedDate.getUTCDate() + ' ' + getMonthName(info.publishedDate.getUTCMonth());
        if (style === 'social-sciences') {
            c += '. ';
        } else if (style === 'humanities') {
            c += ' ' + info.publishedDate.getUTCFullYear() + '. ';
        }
        c += '<a href="' + info.url + '">' + info.url + '</a>.';
        return c;
    };

    return m;
})();

if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    // Export Node module for testing
    module.exports = ACG;
}

if (typeof document !== "undefined") {
    // In browser: start user script
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

        function getInfo() {
            var url = document.URL;
            var entireWork = document.querySelector('.chapter.entire a');
            if (entireWork !== null) {
                url = 'http://archiveofourown.org' + entireWork.getAttribute('href');
            }
            return {
                url: ACG.getWorkURL(url),
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

        function insertCitation() {
            var meta = document.querySelector('dl.work.meta');
            var info = getInfo();

            var dt = document.createElement('dt');
            dt.innerHTML = '<a href="http://www.transformativeworks.org/how-to-cite-fan-works/">Citation</a>: ';
            meta.appendChild(dt);

            var dd = document.createElement('dd');
            var citationHTML = '<p>';
            citationHTML += getUnselectableHTML('Social sciences style: ');
            citationHTML += ACG.getCitation(info, 'social-sciences');
            citationHTML += '</p><p>';
            citationHTML += getUnselectableHTML('Humanities style: ');
            citationHTML += ACG.getCitation(info, 'humanities');
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
}