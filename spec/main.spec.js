/* jshint jasmine:true, node:true */
var ACG = require('../ao3-citation-generator.user.js');

describe('User script test suite', function() {
    it('Parse work link, sanity check', function() {
        var url = 'http://archiveofourown.org/works/7065106';
        expect(ACG.getWorkURL(url)).toBe(url);
    });
});