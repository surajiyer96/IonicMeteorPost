angular.module('userAccountControllers', [])
/**
 *  Register Controller: provides all functionality for the register screen of the app
 */
// .controller('registerCtrl', function ($scope, $meteor, $state) {
//     /**
//      * Credentials of the user
//      */
//     $scope.user = {
//         email: '',
//         password: ''
//     };
//     /**
//      * @summary Function to register a new user
//      */
//     $scope.register = function () {
//         if (!$scope.user.email)
//             throw new Meteor.Error('Account registration error: e-mail is not valid');
//         var newUser = {
//             email: $scope.user.email,
//             password: $scope.user.password,
//             profile: {
//                 firstName: "p",
//                 lastName: "1",
//                 type: "player",
//                 clubID: "club",
//                 teamID: "team1"
//             }
//         };
//         Meteor.call('addUser', newUser, function (err, result) {
//             if (err || !Match.test(result, String))
//                 throw new Meteor.Error('Account registration error: ' + err.reason);
//             Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
//                 if (error) throw new Meteor.Error(error.reason);
//                 $state.go('menu.feed'); // Redirect user if registration succeeds
//             });
//         });
//     };
// })

    /**
     *  Login Controller: provides all functionality for the login screen of the app
     */
    .controller('loginCtrl', function ($scope, $meteor, $state, CommonServices, $translate) {
        /**
         * Credentials of the user
         */
        $scope.user = {
            email: '',
            password: ''
        };

        /**
         * @summary Function for a user to login
         */
        $scope.login = function () {

            var INCORRECT_CREDENTIALS;
            var NOT_AUTHORIZED;
            var ERROR;


            $translate('INCORRECT_CREDENTIALS').then(function (result) {
              INCORRECT_CREDENTIALS=result;
            });
             $translate('NOT_AUTHORIZED').then(function (result) {
              NOT_AUTHORIZED=result;
            });
            $translate('ERROR').then(function (result) {
              ERROR=result;
            });


            try {
                check($scope.user.email, String);
            } catch (e) {
              $translate('MISSING_VALID_EMAIL_MESSAGE').then(function (result) {
                CommonServices.showAlert('Error', result);
              });
            }

            try {
                check($scope.user.password, Match.Where(function (x) {
                    check(x, String);
                    return x.length > 0;
                }));
            } catch (e) {

                  $translate('MISSING_PASSWORD').then(function (result) {
                  CommonServices.showAlert(ERROR, result);
            });



            }

            Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    // Show error message
                    if (error.error == 400 || error.error == 403) {
                        return CommonServices.showAlert(ERROR, INCORRECT_CREDENTIALS);
                    } else {
                        return CommonServices.showAlert(error.error + ' ' + error.reason, error.message);
                    }
                }

                // Check if user is a PR user
                if (Meteor.user().profile.type == 'pr') {
                    Meteor.logout();
                    return CommonServices.showAlert(ERROR, NOT_AUTHORIZED);
                }

                // Go to feed
                $state.go('menu.feed');
            });
        };

        /**
         * @summary Function to show the forgot password page
         */
        $scope.forgotPassword = function () {
            $state.go('forgotPassword');
        };
    })

    /**
     *  Forgot Password Controller: provides functionality for restoring forgotten password
     */
    .controller('forgotPasswordCtrl', function ($scope, $state, CommonServices, $translate) {
        /**
         * Information of the user who forgot his password
         */
        $scope.user = {
            email: ''
        };

        /**
         * @summary Function to send email to user to reset password
         */


        $scope.forgotPassword = function () {
            if (!SimpleSchema.RegEx.Email.test($scope.email)) {
                $translate(['ERROR', 'MISSING_VALID_EMAIL']).then(function (translations) {
                  head = translations.ERROR;
                  content = translations.MISSING_VALID_EMAIL;
                  CommonServices.showAlert(head, content);
                });
            }

            Accounts.forgotPassword({email: $scope.email}, function () {
                $translate(['ERROR', 'EMAILSENDFORPASSRESET']).then(function (translations) {
                  head = translations.ERROR;
                  content = translations.EMAILSENDFORPASSRESET;
                  CommonServices.showAlert(head, content);
                });

                
                $state.go('login');
            });
        };
    })

    /**
     *  Reset Password Controller: provides all functionality for the reset password screen of the app
     */
    .controller('resetPasswordCtrl', function ($scope, $meteor, $state, $stateParams, CommonServices) {
        /**
         * Information of the user who forgot his password
         */
        $scope.user = {
            email: '',
            token: '',
            newPassword: '',
            confirmNewPassword: ''
        };

        /**
         * @summary Function to reset the users password
         */
        $scope.resetPassword = function () {
            if (!$scope.user.newPassword) {
                CommonServices.showAlert('Error', 'No new password specified');
            } else if (!$scope.user.confirmNewPassword) {
                CommonServices.showAlert('Error', 'Please confirm your new password');
            } else if ($scope.user.newPassword != $scope.user.confirmNewPassword) {
                CommonServices.showAlert("Error", "New passwords don't match");
            } else if (!CommonServices.checkPassword($scope.user.newPassword)) {
                CommonServices.showAlert('Weak Password', 'Password not strong enough. ' +
                    'It should contain at least 8 characters of which at least one alphabetical and one numeric.');
            } else {
                $meteor.resetPassword($stateParams.token, $scope.user.newPassword, function () {
                    $state.go('menu.feed');
                });
            }
        }
    })

    /**
     *  Profile Controller: provides all functionality for the Profile screen of the app
     */
    .controller('profileCtrl', function ($scope, $meteor, $state, CommonServices, $translate) {
        /**
         * Profile information
         */
        $scope.user = {
            email: '',
            firstName: '',
            lastName: ''
        };

        /**
         * Password information
         */
        $scope.password = {
            oldPass: '',
            newPass: '',
            newPassCheck: ''
        };

        /**
         * @summary Function to change the password
         */
        $scope.changePassword = function () {
            if ($scope.password.newPass != $scope.password.newPassCheck) {
                $translate(['ERROR', 'PASS_NO_MATCH']).then(function (translations) {
                  head = translations.ERROR;
                  content = translations.PASS_NO_MATCH;
                  CommonServices.showAlert(head, content);
                });
            }
            
            $meteor.changePassword($scope.password.oldPass, $scope.password.newPass).then(function () {

                $translate(['SUCCESS', 'PASS_RESET_SUCCESS']).then(function (translations) {
                  head = translations.ERROR;
                  content = translations.PASS_RESET_SUCCESS;
                  CommonServices.showAlert(head, content);
                });
                Meteor.logout(function () {
                      //Some cleanup code
                      Object.keys(Session.keys).forEach(function(key){
                        Session.set(key, undefined);
                      });
                      Session.keys = {} // remove session keys
                      $scope.password.oldPass = '';
                      $scope.password.newPass = '';
                      $scope.password.newPassCheck = '';
                    $state.go('login');
                });
            }, function (error) {
                return CommonServices.showAlert('Error', error.reason);
            });
        };
    })