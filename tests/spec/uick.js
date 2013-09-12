describe('uick', function() {
    var uick = require('uick');
    var orig_components = ["checkbox", "select", "input-slider"];
    var components = _.map(orig_components, function(c){ return c.replace('-', '_'); });
    uick.register(orig_components);


    beforeEach(function() {
        this.uick = uick('#el');
    });

    afterEach(function() {
        // this.uick.destroy();
        delete this.uick;
    });

    it('should return uick instance', function() {
        expect(this.uick).to.be.an.instanceof(uick.fn.init);
    });

    it('el attr. is a Collection of HTMLElements with at least one element', function() {
        expect(this.uick.el).to.have.length.above(0);
    });

    it('components should be in the uick API', function() {
        _.each(components, function(component) {
            expect(this.uick).to.respondTo(component);
        }, this);
    });

    it('components instances should be setted in the uick instance', function() {
        _.each(components, function(component) {
            this.uick[component]();
            expect(this.uick.components[component]).to.have.length.above(0);
        }, this);
    });


    describe('#api()', function(){

        beforeEach(function() {
            this.uick = uick('#el');

            _.each(components, function(component) {
                this.uick[component]();
            }, this);
        });

        afterEach(function() {
            // this.uick.destroy();
            delete this.uick;
        });

        it('should return component instance when receives arguments: component name and HTMLelement', function() {
            var el = document.querySelector('#el');
            _.each(components, function(component) {
                expect(this.uick.api(component, el)).to.be.an.instanceof(uick.components[component]);
            }, this);
        });

        it('should return component instance when receives arguments: component name and index number', function() {
            var el = document.querySelector('#el');
            _.each(components, function(component) {
                expect(this.uick.api(component, 0)).to.be.an.instanceof(uick.components[component]);
            }, this);
        });

        it('should return an array of component instances when receives argument: component name', function() {
            var el = document.querySelector('#el');
            _.each(components, function(component) {
                expect(this.uick.api(component)).to.have.length.above(0);
                expect(this.uick.api(component)[0]).to.be.an.instanceof(uick.components[component]);
            }, this);
        });

        it('should return an object of component instances when receives no arguments', function() {
            var el = document.querySelector('#el');
            var api = this.uick.api();

            expect(api).to.be.a('object');
            _.each(components, function(component) {
                expect(api).to.have.property(component);
            }, this);
        });
    });

});
