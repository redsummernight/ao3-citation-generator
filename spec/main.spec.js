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

describe('Generate fandom', function() {
    it('No fandom, what', function() {
        expect(function() {
            ACG.getFandomDescription([]);
        }).toThrow('No fandom');
    });
    it('One fandom', function() {
        var fandom = 'Overwatch (Video Game)';
        expect(ACG.getFandomDescription([fandom])).toBe(fandom);
    });
    it('2+ fandoms', function() {
        var f1 = 'The Avengers (Marvel Movies)',
            f2 = 'Bishoujo Senshi Sailor Moon | Pretty Guardian Sailor Moon',
            f3 = 'Mahou Shoujo Madoka Magika | Puella Magi Madoka Magica',
            f4 = 'Young Avengers';
        expect(ACG.getFandomDescription([f1, f2])).toBe(f1 + '/' + f2 + ' crossover');
        expect(ACG.getFandomDescription([f1, f2, f3])).toBe(f1 + '/' + f2 + '/' + f3 + ' crossover');
        expect(ACG.getFandomDescription([f1, f2, f3, f4])).toBe('Multifandom');
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