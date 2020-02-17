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

    it('Ignore collections', function() {
        var urlWithCollection = 'https://archiveofourown.org/collections/ichirukimonth/works/20233627';
        var url = 'https://archiveofourown.org/works/20233627';
        expect(ACG.getWorkURL(urlWithCollection)).toBe(url);
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

describe('Generate titles', function() {
    // https://owl.english.purdue.edu/owl/resource/577/02/
    // https://owl.english.purdue.edu/owl/resource/577/03/

    it('with quotation marks', function() {
        expect(ACG.getQuotedTitle('"Title in quotes"')).toBe('"\'Title in quotes\'."');
        expect(ACG.getQuotedTitle('\'Title in quotes\'')).toBe('"\'Title in quotes\'."');
    });

    it('with punctuation', function() {
        expect(ACG.getQuotedTitle('Title, period.')).toBe('"Title, period."');
        expect(ACG.getQuotedTitle('Title yeah!')).toBe('"Title yeah!"');
        expect(ACG.getQuotedTitle('Title what?')).toBe('"Title what?"');
    });

    it('with punctuation and quotation marks', function() {
        expect(ACG.getQuotedTitle('"Title, period."')).toBe('"\'Title, period.\'"');
        expect(ACG.getQuotedTitle('"Title yeah!"')).toBe('"\'Title yeah!\'"');
        expect(ACG.getQuotedTitle('"Title what?"')).toBe('"\'Title what?\'"');
    });
});

describe('Generate citation', function() {
    var info;

    beforeEach(function() {
        info = {
            url: 'http://www.example.com/',
            title: 'Name of Short Story',
            author: 'Author Pseud',
            publishedDate: new Date('2016-01-01'),
            categories: ['Gen'],
            fandoms: ['Media Title'],
            relationships: ['Fullcharname/Fullcharname'],
        };
    });

    it('Check sanity, social sciences style', function() {
        var c = 'Author Pseud. 2016. "Name of Short Story." Media Title fan fiction. Fullcharname/Fullcharname. ' +
            '<em>Archive of Our Own</em>, 1 January. ' +
            '<a href="http://www.example.com/">http://www.example.com/</a>.';
        expect(ACG.getCitation(info, 'social-sciences')).toBe(c);
    });

    it('Check sanity, humanities style', function() {
        var c = 'Author Pseud. "Name of Short Story." Media Title fan fiction. Fullcharname/Fullcharname. ' +
            '<em>Archive of Our Own</em>, 1 January 2016. ' +
            '<a href="http://www.example.com/">http://www.example.com/</a>.';
        expect(ACG.getCitation(info, 'humanities')).toBe(c);
    });

    it('Unknown style', function() {
        expect(function() {
            ACG.getCitation(info, 'super-casual');
        }).toThrow('Unknown citation style');
    });

    it('Ignore ship description for multiple ships', function() {
        info.relationships = ['A/B', 'C/D'];
        var c = 'Author Pseud. "Name of Short Story." Media Title fan fiction. ' +
            '<em>Archive of Our Own</em>, 1 January 2016. ' +
            '<a href="http://www.example.com/">http://www.example.com/</a>.';
        expect(ACG.getCitation(info, 'humanities')).toBe(c);
    });

    it('Ignore ship description for multiple ship types', function() {
        info.categories = ['M/F', 'M/M', 'F/F'];
        var c = 'Author Pseud. "Name of Short Story." Media Title fan fiction. ' +
            '<em>Archive of Our Own</em>, 1 January 2016. ' +
            '<a href="http://www.example.com/">http://www.example.com/</a>.';
        expect(ACG.getCitation(info, 'humanities')).toBe(c);
    });

    it('Slash ships', function() {
        var c = 'Author Pseud. "Name of Short Story." Media Title fan fiction. Fullcharname/Fullcharname slash. ' +
            '<em>Archive of Our Own</em>, 1 January 2016. ' +
            '<a href="http://www.example.com/">http://www.example.com/</a>.';
        info.categories = ['F/F'];
        expect(ACG.getCitation(info, 'humanities')).toBe(c);
        info.categories = ['M/M'];
        expect(ACG.getCitation(info, 'humanities')).toBe(c);
    });

    it('Crossover', function() {
        var c = 'Author Pseud. "Name of Short Story." Title/Title 2 crossover fan fiction. Fullcharname/Fullcharname. ' +
            '<em>Archive of Our Own</em>, 1 January 2016. ' +
            '<a href="http://www.example.com/">http://www.example.com/</a>.';
        info.fandoms = ['Title', 'Title 2'];
        expect(ACG.getCitation(info, 'humanities')).toBe(c);
    });

    it('Mega-crossover', function() {
        var c = 'Author Pseud. "Name of Short Story." Multifandom fan fiction. Fullcharname/Fullcharname. ' +
            '<em>Archive of Our Own</em>, 1 January 2016. ' +
            '<a href="http://www.example.com/">http://www.example.com/</a>.';
        info.fandoms = ['Title', 'Title 2', 'Title 3', 'Title 4'];
        expect(ACG.getCitation(info, 'humanities')).toBe(c);
    });

    it('Titles with quotation marks', function() {
        var c = 'Author Pseud. "\'Title in quotes\'." Media Title fan fiction. Fullcharname/Fullcharname. ' +
            '<em>Archive of Our Own</em>, 1 January 2016. ' +
            '<a href="http://www.example.com/">http://www.example.com/</a>.';
        info.title = '"Title in quotes"';
        expect(ACG.getCitation(info, 'humanities')).toBe(c);
    });
});