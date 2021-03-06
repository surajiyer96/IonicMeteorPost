angular.module('app.services', [])

    .service('CommonServices', function ($ionicPopup) {
        /**
         * Regular expressions for checking passwords. It should contain at least one alphabetical
         * and numeric character. Furthermore it should have a length of at least 8.
         */
        const passwordRegex = new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{8,})");
        return {
            /**
             * @summary Check whether a password is strong enough
             */
            checkPassword: function (password) {
                return passwordRegex.test(password);
            },
            showAlert: function (reason, message) {
                var alertPopup = $ionicPopup.alert({
                    title: reason,
                    template: message
                });

                alertPopup.then(function (res) {
                });
            }
        }
    })

    .service('AccessControl', function () {
        /**
         * @summary Check if user is permitted to get access to various aspects of the service.
         * @param itemType the item for which permission is being requested
         * @param permission the type of permission being requested for the item: create, view, edit or delete.
         * @param callback function to call with the result as argument
         */
        this.getPermission = function (itemType, permission, callback) {
            Meteor.call('checkRights', itemType, permission, function (err, result) {
                if (err) throw new Meteor.Error(err.message);
                if (typeof result !== 'boolean')
                    throw new Meteor.Error('Unexpected result type');
                callback(result);
            });
        }
    })

    .service('Chat', function (AccessControl) {
        /**
         * To check if user has permission to view chats
         * @type {ReactiveVar} Reactive boolean
         */
        var showChat = new ReactiveVar(false);
        AccessControl.getPermission('Chat', 'view', (result) => {
            showChat.set(result);
            if (result) {
                Meteor.subscribe('Chats');
            }
        });

        /**
         * Used to display the chat notification on the menu when unread messages are present
         * @type {ReactiveVar}
         */
        var showChatNotification = new ReactiveVar(false);

        /**
         * Returns a reactive variable that updates
         * @returns {66}
         */
        const canViewChat = function () {
            return showChat.get();
        };

        /**
         * @summary Get messages of a given chat
         * @param chatID String id of the chat
         */
        const getMessages = function (chatID) {
            return Messages.find({chatID: chatID}, {sort: {createdAt: 1}});
        };

        /**
         * Get message of given message Id
         * @param chatId String Id of chat to which the message belongs
         * @param messageId String Id of requested message
         * @param callback method to execute with retrieved message as a parameter
         * @returns {any}
         */
        const getMessage = function (chatId, messageId, callback) {
            check(messageId, String);

            // Check if user has permission to view messages
            AccessControl.getPermission('Messages', 'view', function (hasPermission) {
                if (!hasPermission) throw new Meteor.Error('Insufficient permissions');

                // Get message
                Meteor.subscribe('Messages', {chatId: chatId, messageId: messageId}, () => {
                    var message = Messages.find({_id: messageId}).fetch()[0];
                    if (!message) return;

                    // Check if logged-in user is part of the chat
                    var chat = Chats.find({_id: message.chatID}).fetch()[0];
                    var isPartOfChat = _.contains(chat.users, Meteor.userId());
                    if (!isPartOfChat) throw new Meteor.Error('Insufficient permissions');

                    callback(message);
                });
            });
        };

        /**
         * @summary Creates a chat between the currently logged-in user
         * and another recipient user
         * @param userId String id of the recipient user
         * @returns {any}
         */
        const createChat = function (userId) {
            return Chats.insert({
                users: [Meteor.userId(), userId]
            });
        };

        const deleteChat = function (chatId, done) {
            Meteor.call('deleteChat', chatId, () => {
                if (done) done();
            });
        };

        /**
         * Get all chats sorted on most recently used.
         */
        const getChats = function () {
            return Chats.find({}, {sort: {lastMessage: -1}});
        };

        /**
         * Load chat info into passed object with given chat ID
         * @param chatID String id of the chat
         * @returns {Object|any} chat info
         */
        const getChat = function (chatID) {
            var currentChat = Chats.find({_id: chatID}).fetch()[0];
            if (!currentChat) return;

            // Get recipient user
            var recipient = currentChat.users[0];
            if (recipient == Meteor.userId()) recipient = currentChat.users[1];
            recipient = Meteor.users.find({_id: recipient}).fetch()[0];
            if (!recipient) return;

            // Load the chat title to the recipient name
            currentChat.title = recipient.profile.firstName + " " + recipient.profile.lastName;

            // Load the chat picture
            currentChat.picture = 'https://cdn0.iconfinder.com/data/icons/sports-and-fitness-flat-colorful-icons-svg/137/Sports_flat_round_colorful_simple_activities_athletic_colored-03-512.png';

            // Get the last message
            // getMessage(currentChat._id, currentChat.lastMessage, function (message) {
            //     currentChat.lastMessage = message;
            //     if (done) done();
            // });

            return currentChat;
        };

        /**
         * Get chats associated with the given recipient userId
         * @param userId String id of the recipient user
         * @returns {any}
         */
        const getChatByUserId = function (userId) {
            return Chats.find({users: userId}).fetch()[0];
        };

        /**
         * Adds a message to the chat with the given chatId
         * @param chatId String Id of the chat
         * @param message String message
         * @returns {any}
         */
        const sendMessage = function (chatId, message) {
            check(chatId, String);
            check(message, String);

            // Add the message to the database
            var messageId = Messages.insert({chatID: chatId, message: message});
            // If added correctly, update last message of chat
            if (messageId) {
                Chats.update(chatId, {$set: {lastMessage: messageId}});
            }

            return messageId;
        };

        /**
         * Change the status of the chat
         * @param chatId String id of chat
         * @param newStatus String status message
         * @param done Optional callback with error object (if any) as first parameter
         */
        const updateChatStatus = function (chatId, newStatus, done) {
            Chats.update({_id: chatId}, {$set: {status: newStatus}}, done);
        };

        return {
            canViewChat: canViewChat,
            getMessages: getMessages,
            getOneMessage: getMessage,
            createChat: createChat,
            deleteChat: deleteChat,
            getChats: getChats,
            getChatByUserId: getChatByUserId,
            getOneChat: getChat,
            sendMessage: sendMessage,
            updateChatStatus: updateChatStatus,
            showChatNotification: showChatNotification
        }
    })
