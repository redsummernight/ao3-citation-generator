/* jshint jasmine:true, node:true */
var ACG = require('../ao3-citation-generator.user.js');

describe('Parse work link', function() {
    it('Check sanity', function() {
        var url = 'http://archiveofourown.org/works/7065106';
        expect(ACG.getWorkURL(url)).toBe(url);
        expect(ACG.getWorkURL(url + '/')).toBe(url);
    });
    it('Ignore chapters', function() {
        var url = 'http://archiveofourown.org/works/7034479';
        expect(ACG.getWorkURL(url + '/chapters/16005091')).toBe(url);
    });
    it('Ignore GET parameters', function() {
        var url = 'http://archiveofourown.org/works/7034479';
        expect(ACG.getWorkURL(url + '?view_full_work=true')).toBe(url);
    });
    it('Ignore fragments', function() {
        var url = 'http://archiveofourown.org/works/7276459';
        expect(ACG.getWorkURL(url + '#work_endnotes')).toBe(url);
    });
});

describe('Generate ship', function() {
    // Not enough info to parse multiple ships: which is slash?
    // Only try to parse one ship
    var ship = 'A/B';
    it('F/F slash', function() {
        expect(ACG.getRelationshipDescription(ship, 'F/F')).toBe(ship + ' slash');
    });
    it('M/M slash', function() {
        expect(ACG.getRelationshipDescription(ship, 'M/M')).toBe(ship + ' slash');
    });
    it('Others', function() {
        expect(ACG.getRelationshipDescription(ship, 'Gen')).toBe(ship);
        expect(ACG.getRelationshipDescription(ship, 'F/M')).toBe(ship);
        expect(ACG.getRelationshipDescription(ship, 'Multi')).toBe(ship);
        expect(ACG.getRelationshipDescription(ship, 'Other')).toBe(ship);
    });
});