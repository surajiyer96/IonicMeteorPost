angular.module('userAccountControllers', [])

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
         * @summary Function for validating user login input
         */
        var validateInput = function (x) {
            check(x, String);
            return x.length > 0;
        };

        var ERROR = 'Error';

        /**
         * @summary Function used to login to the application which checks the user credentials and gives a meaningful
         * response.
         */
        $scope.login = function () {

            //Check that determines wheter an email is present.
            try {
                check($scope.user.email, Match.Where(validateInput));
            } catch (e) {
                $translate('MISSING_VALID_EMAIL_MESSAGE').then(function (result) {
                    CommonServices.showAlert(ERROR, result);
                });
                return;
            }

            //Check that determines wheter there is a valid password inserted
            try {
                check($scope.user.password, Match.Where(validateInput));
            } catch (e) {
                $translate('MISSING_PASSWORD').then(function (result) {
                    CommonServices.showAlert(ERROR, result);
                });
                return;
            }

            //The actual login process starts here.
            //The meteor 'loginWithPassword()' method is called and takes 2 arguments:
            // The user's email and the user's password.
            Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    $translate('INCORRECT_CREDENTIALS').then(function (result) {
                        // Show error message
                        if (error.error == 400 || error.error == 403) {
                            CommonServices.showAlert(ERROR, result);
                        } else {
                            CommonServices.showAlert(error.error + ' ' + error.reason, error.message);
                        }
                    });
                    return;
                }

                // Check if user is a PR user
                if (Meteor.user().profile.type == 'pr') {
                    Meteor.logout();
                    $translate('NOT_AUTHORIZED').then(function (result) {
                        CommonServices.showAlert(ERROR, result);
                    });
                    return;
                }

                // Go to feed
                window.location.replace("/");
            });
        };

        /**
         * @summary Function to show the forgot password page
         */
        $scope.forgotPassword = function () {
            $state.go('forgotPassword');
        };

        /**
         * @summary Function to show the enrollment page
         */
        $scope.enrollment = function () {
            $state.go('enroll');
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
         * @summary Function to send email to user to reset password.
         */
        $scope.forgotPassword = function () {
            if (!SimpleSchema.RegEx.Email.test($scope.user.email)) {
                $translate(['ERROR', 'MISSING_VALID_EMAIL']).then(function (translations) {
                    head = translations.ERROR;
                    var content = translations.MISSING_VALID_EMAIL;
                    CommonServices.showAlert(head, content);
                });
                return;
            }

            //Call meteor function that handles the forgotPassword flow
            Accounts.forgotPassword({email: $scope.user.email}, function (err) {
                if(!err) {
                    $translate(['SUCCESS', 'PWD_RECOVERY_EMAIL_SENT']).then(function (translations) {
                        head = translations.SUCCESS;
                        var content = translations.PWD_RECOVERY_EMAIL_SENT;
                        CommonServices.showAlert(head, content);
                    });
                    //Change state to login, so the user will be routed to the loginpage
                    $state.go('login');
                } else {
                    $translate(['ERROR', 'MISSING_VALID_EMAIL']).then(function (translations) {
                        head = translations.ERROR;
                        var content = translations.MISSING_VALID_EMAIL;
                        CommonServices.showAlert(head, content);
                    });
                }
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

        var ERROR = 'Error';

        /**
         * @summary Function to reset the user's password.
         */
        $scope.resetPassword = function () {
            if (!$scope.user.newPassword) {
                return CommonServices.showAlert(ERROR, 'No new password specified');
            } else if (!$scope.user.confirmNewPassword) {
                return CommonServices.showAlert(ERROR, 'Please confirm your new password');
            } else if ($scope.user.newPassword != $scope.user.confirmNewPassword) {
                return CommonServices.showAlert(ERROR, "New passwords don't match");
            } else if (!CommonServices.checkPassword($scope.user.newPassword)) {
                return CommonServices.showAlert('Weak Password', 'Password not strong enough. ' +
                    'It should contain at least 8 characters of which at least one alphabetical and one numeric.');
            } else {
                $meteor.resetPassword($scope.user.token, $scope.user.newPassword, function (err) {
                    if(err) {
                        $translate('ERROR').then(function (ERROR) {
                            CommonServices.showAlert(ERROR, error.reason);
                        });
                        return;
                    }
                    $state.go('menu.feed');
                });
            }
        }
    })

    /**
     *  Profile Controller: provides all functionality for the Profile screen of the app
     *  This includes changing the password with its coherent logical operations.
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
         * Password information from the form
         */
        $scope.password = {
            oldPass: '',
            newPass: '',
            newPassCheck: ''
        };

        /**
         * @summary Function to change the user's password. First it checks if passwords match and then call the back-end
         * to change the password.
         */
        $scope.changePassword = function () {
            //Check wheteter the password and the password confirmation are equal.
            //If not, an error will be thrown.
            if ($scope.password.newPass != $scope.password.newPassCheck) {
                $translate(['ERROR', 'PWD_NOT_MATCH']).then(function (translations) {
                    head = translations.ERROR;
                    var content = translations.PWD_NOT_MATCH;
                    CommonServices.showAlert(head, content);
                });
                return;
            }

            //The newly entered password is checked wheter it complies with the set requirements.
            var testPassword = CommonServices.checkPassword($scope.password.newPass);
            if (!testPassword) {
                $translate(['ERROR', 'PWD_NOT_VALID']).then(function (translations) {
                    head = translations.ERROR;
                    var content = translations.PWD_NOT_VALID;
                    CommonServices.showAlert(head, content);
                });
                return;
            }

            //The actual password change takes place here. A build-in Meteor method is called that 
            //requires 2 parameters to be present: 'the old password and the new password'.
            // Here the new password is validated against a control field.
            $meteor.changePassword($scope.password.oldPass, $scope.password.newPass).then(function () {
                $translate(['SUCCESS', 'PWD_RESET_SUCCESS']).then(function (translations) {
                    head = translations.SUCCESS;
                    var content = translations.PWD_RESET_SUCCESS;
                    CommonServices.showAlert(head, content);
                });
                Meteor.logout(function () {
                    $state.go('login');
                });
            }, function (error) {
                $translate('ERROR').then(function (ERROR) {
                    CommonServices.showAlert(ERROR, error.reason);
                });
            });
        };
    })