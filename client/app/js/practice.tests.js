import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import 'controllers/controllers';
import 'services/services';
import 'routes';
import '/model/Feed';

import { feedItemTypesSchema } from '/imports/schemas/feedItems';

import '/model/ItemTypes'

var scope, meteor, state, ctrl;
//van 3 tot 5

function setupTesting(ctrlName) {
    beforeEach(angular.mock.module('angular-meteor'));
    beforeEach(angular.mock.module('app.services'));
    beforeEach(angular.mock.module('app.controllers'));
    beforeEach(angular.mock.module('ui.router'));
    beforeEach(angular.mock.module('app.routes'));
    beforeEach(inject(($rootScope, $controller, $meteor, $state) => {
        scope = $rootScope;
        meteor = $meteor;
        state = $state;

        ctrl = $controller(ctrlName, {
            $scope: scope,
            $meteor: meteor,
            $state: state
        });
    }));
}

describe('feedCtrl', () => {
    setupTesting('feedCtrl');
    var accessControl;

    beforeEach(inject((AccessControl) => {
        accessControl = AccessControl;
    }));

    // Add schema to Items
    TypesCollection.attachSchema(feedItemTypesSchema);
    
    TypesCollection.deny( {
        insert: sinon.stub().returns(false)
    });
    
    TypesCollection.allow( {
        insert: sinon.stub().returns(true)
    });

    // Create item without type
    testType = {
        _id: '1',
        name: 'testType',
        icon: 'testType.ClubNet'
    };

    // Adding the custom type
    try {
        //TypesCollection.remove({});
        TypesCollection.insert(testType);
        console.log('in try: ' + TypesCollection.find().fetch());
    } catch (err) {
        console.log(err);
    }

    //Kevin
    it("Should print ItemTypes", (done) => {
        
        scope.itemTypes = '';
        scope.updateItemTypes();
        setTimeout(() => {
            console.log('afterUpdate')
            console.log(scope.itemTypes);
            done();
        }, 500);
    });
});