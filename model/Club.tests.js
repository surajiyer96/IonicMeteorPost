import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import './Club.js';

let testClub = {};
if (Meteor.isServer) {
    describe('Club', () => {
        before(() => {
            // Create a test club
            testClub = {
                name: 'Name1',
                logo: 'logo',
                colorPrimary: '#FFFFFF',
                colorSecondary: '#FFFFFF',
                colorAccent: '#FFFFFF',
                heroesMax: 0
            };
            testClub._id = Clubs.insert(testClub);
        });

        beforeEach(() => {
            // Mock user to include the clubID of the test club we just added
            sinon.stub(global.Meteor, 'user').returns({
                profile : { clubID : testClub._id}
            });
        });

        afterEach(() => {
            sinon.restore(global.Meteor.user);
        });

        it("should throw error while getting non-existing club info", () => {
            // Mock user to include the clubID of the test club we just added
            global.Meteor.user.returns({
                profile : { clubID : 'test'}
            });

            // Retrieving the club
            try {
                result = Meteor.call('getClub');
            } catch (err) {
                assert(false, err.message);
            }
            assert(result == undefined);
        });

        it("should get club info", () => {
            // Retrieving the club
            try {
                result = Meteor.call('getClub');
            } catch (err) {
                assert(false, err.message);
            }

            assert.equal(result._id, testClub._id);
        });

        it("should throw error when updating club with invalid parameters", (done) => {
            // Retrieving the club
            try {
                Meteor.call('updateClub', false);
            } catch (err) {
                done();
            }

            assert.fail();
        });

        it("should update club name", () => {
            // Changing the test club
            testClub.name = 'Name2';

            // Updating the club
            try {
                result = Meteor.call('updateClub', testClub);
            } catch (err) {
                assert(false, err.message);
            }

            assert.equal(result.name, 'Name2');
        });
    });
}