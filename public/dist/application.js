'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'expense-manager';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.utils'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName) {
      // Create angular module
      angular.module(moduleName, []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
angular.module('core', ['tc.chartjs']);'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('entries');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('widgets');'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise(function () {
      return '/';
    });
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  'Widgets',
  '$state',
  function ($scope, Authentication, Widgets, $state) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.area = Widgets.getArea('home');
    $state.transitionTo('home.widgets');
  }
]);'use strict';
angular.module('core').directive('CustomDp', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'modules/core/views/datepicker.client.view.html'
  };
});'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['user'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic || this.menus[menuId].isPublic,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic || this.menus[menuId].isPublic,
            roles: roles || this.defaultRoles,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
angular.module('core').service('Widgets', [function () {
    // Define a set of default roles
    this.defaultRoles = ['user'];
    // Define the areas object
    this.areas = {};
    // A private function for rendering decision
    var shouldRender = function (user) {
      if (user) {
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate area existance
    this.validateAreaExistance = function (areaId) {
      if (areaId && areaId.length) {
        if (this.areas[areaId]) {
          return true;
        } else {
          throw new Error('Area does not exists');
        }
      } else {
        throw new Error('AreaId was not provided');
      }
      return false;
    };
    // Validate area existance
    this.validateWidgetExistance = function (areaId, widgetId) {
      // Validate that the area exists
      this.validateAreaExistance(areaId);
      if (widgetId && widgetId.length) {
        if (this.areas[areaId].widgets[widgetId]) {
          return true;
        } else {
          throw new Error('Widget does not exists');
        }
      } else {
        throw new Error('WidgetId was not provided');
      }
      return false;
    };
    // Get the area object by area id
    this.getArea = function (areaId) {
      // Validate that the area exists
      this.validateAreaExistance(areaId);
      // Return the area object
      return this.areas[areaId];
    };
    // Add new area object by area id
    this.addArea = function (areaId, isPublic, roles) {
      // Create the new area
      this.areas[areaId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        widgets: {},
        shouldRender: shouldRender
      };
      // Return the area object
      return this.areas[areaId];
    };
    // Remove existing area object by area id
    this.removeArea = function (areaId) {
      // Validate that the area exists
      this.validateAreaExistance(areaId);
      // Return the area object
      delete this.areas[areaId];
    };
    // Add area widget object
    this.addWidget = function (areaId, widgetId, widgetIndex, widgetController, widgetView, widgetClass, isPublic, roles) {
      // Validate that the area exists
      this.validateAreaExistance(areaId);
      // Push new area widget
      this.areas[areaId].widgets[widgetIndex] = {
        id: widgetId,
        class: widgetClass,
        view: widgetView,
        controller: widgetController,
        isPublic: isPublic || this.areas[areaId].isPublic,
        roles: roles || this.defaultRoles,
        shouldRender: shouldRender
      };
      // Return the area object
      return this.areas[areaId];
    };
    // Remove existing area object by area id
    this.removeWidget = function (areaId, widgetId) {
      // Validate that the area exists
      this.validateWidgetExistance(areaId, widgetId);
      // Search for area widget to remove
      for (var widgetIndex in this.areas[areaId].widget) {
        if (this.areas[areaId].widget[widgetIndex].id === widgetId) {
          this.areas[areaId].widget.splice(widgetIndex, 1);
        }
      }
      // Return the area object
      return this.areas[areaId];
    };
    //Adding the home area
    this.addArea('home');
  }]);'use strict';
// Configuring the Entry module
angular.module('entries').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Entries', 'entries', 'dropdown', '/entries(/create)?');
    Menus.addSubMenuItem('topbar', 'entries', 'List Entries', 'entries');
    Menus.addSubMenuItem('topbar', 'entries', 'New Entry', 'entries/create');
  }
]);'use strict';
//Setting up route
angular.module('entries').config([
  '$stateProvider',
  function ($stateProvider) {
    // Entries state routing
    $stateProvider.state('listEntries', {
      url: '/entries',
      templateUrl: 'modules/entries/views/list-entries.client.view.html'
    }).state('createEntry', {
      url: '/entries/create',
      templateUrl: 'modules/entries/views/create-entry.client.view.html'
    }).state('viewEntry', {
      url: '/entries/:entryId',
      templateUrl: 'modules/entries/views/view-entry.client.view.html'
    }).state('editEntry', {
      url: '/entries/:entryId/edit',
      templateUrl: 'modules/entries/views/edit-entry.client.view.html'
    });
  }
]);'use strict';
// Entries controller
angular.module('entries').controller('EntriesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Entries',
  function ($scope, $stateParams, $location, Authentication, Entries) {
    function initFields() {
      $scope.quantity = 0;
      $scope.entry_type = 'expense';
      $scope.date = new Date();
    }
    $scope.authentication = Authentication;
    $scope.categories = [
      'Income',
      'Home Loan',
      'Personal Loan',
      'Credit Cards',
      'Food and drinks',
      'Leisure',
      'Health',
      'Transport',
      'Others'
    ];
    initFields();
    $scope.open = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = !$scope.opened && true;
    };
    // Create new Entry
    $scope.create = function () {
      // Create new Entry object
      var entry = new Entries({
          quantity: this.quantity,
          entry_type: this.entry_type,
          category: this.category,
          date: this.date,
          description: this.description
        });
      // Redirect after save
      entry.$save(function (response) {
        $location.path('entries');
      }, function (errorResponse) {
        /*$scope.errors = [];
				var undefinedAttributes = [];
				angular.forEach(errorResponse.config.data, function(value, key){
					if(value === undefined){
						this.push(key);
						$scope.errors[key] = true;
					}
				}, undefinedAttributes);
				console.log(undefinedAttributes);
				console.log(errorResponse);*/
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      initFields();
    };
    // Remove existing Entry
    $scope.remove = function (entry) {
      if (entry) {
        entry.$remove();
        for (var i in $scope.entries) {
          if ($scope.entries[i] === entry) {
            $scope.entries.splice(i, 1);
          }
        }
      } else {
        $scope.entry.$remove(function () {
          $location.path('entries');
        });
      }
    };
    // Update existing Entry
    $scope.update = function () {
      var entry = $scope.entry;
      entry.$update(function () {
        $location.path('entries');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Entries
    $scope.find = function () {
      $scope.entries = Entries.query();
    };
    // Find existing Entry
    $scope.findOne = function () {
      $scope.entry = Entries.get({ entryId: $stateParams.entryId });
    };
  }
]);'use strict';
angular.module('entries').directive('itemColor', [function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        // Item color directive logic
        // ...
        var color = attrs.itemColor;
        element.css('border-left-width', '5px');
        element.css('border-left-color', color);
        angular.forEach(element.find('h4'), function (value, key) {
          if (value.className.indexOf('list-group-item-heading') < 0)
            return;
          angular.element(value).css('color', color);
        });
      }
    };
  }]);'use strict';
//Entries service used to communicate Entries REST endpoints
angular.module('entries').factory('Entries', [
  '$resource',
  function ($resource) {
    return $resource('entries/:entryId', { entryId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/signin.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;
      var user = new Users($scope.user);
      user.$update(function (response) {
        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring widgets
angular.module('widgets').run([
  'Widgets',
  function (Widgets) {
    // Add widgets to home page
    Widgets.addWidget('home', 'rates', 0, RatesWidgetController, 'rates', 'col-md-6');
    Widgets.addWidget('home', 'history', 1, HistoryWidgetController, 'history', 'col-md-6');
    Widgets.addWidget('home', 'distribution', 2, DistributionWidgetController, 'distribution', 'col-md-6');
    Widgets.addWidget('home', 'timeline', 3, TimelineWidgetController, 'timeline', 'col-md-6');
  }
]);'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Home state routing
    $stateProvider.state('home.widgets', {
      views: {
        'history': { templateUrl: 'modules/widgets/views/history-widget.client.view.html' },
        'rates': { templateUrl: 'modules/widgets/views/rates-widget.client.view.html' },
        'distribution': { templateUrl: 'modules/widgets/views/distribution-widget.client.view.html' },
        'timeline': { templateUrl: 'modules/widgets/views/timeline-widget.client.view.html' }
      }
    });
  }
]);'use strict';
/**
 * Entries distribution controller
 * @param {mixed} $scope
 */
function DistributionWidgetController($scope, Entries) {
  function buildEntiesData(data) {
    var data_by_category = {};
    angular.forEach(data, function (value, key) {
      if (value.entry_type === 'income')
        return;
      if (typeof data_by_category[value.category] === 'undefined')
        data_by_category[value.category] = { value: value.quantity };
      else
        data_by_category[value.category].value += value.quantity;
    });
    angular.forEach(data_by_category, function (value, key) {
      var random_number = '#' + Math.floor(Math.random() * 16777215).toString(16);
      $scope.distribution_data.push({
        value: value.value,
        color: 'rgba(151,187,205,0.5)',
        highlight: 'rgba(151,187,205,1)',
        label: key
      });
    });
  }
  $scope.distribution_data = [];
  Entries.query(buildEntiesData);
  $scope.distribution_options = {
    percentageInnerCutout: 65,
    animateRotate: true,
    animateScale: false,
    responsive: true
  };
}
angular.module('widgets').controller('DistributionWidgetController', [
  '$scope',
  'Entries',
  DistributionWidgetController
]);'use strict';
/**
 * Entries history controller
 * @param {mixed} $scope
 * @param {Service} Entries Entry Service
 */
function HistoryWidgetController($scope, Entries) {
  $scope.entries = Entries.query();
}
angular.module('widgets').controller('HistoryWidgetController', [
  '$scope',
  'Entries',
  HistoryWidgetController
]);'use strict';
/**
 * Entries rates controller
 * @param {mixed} $scope
 */
function RatesWidgetController($scope) {
}
angular.module('widgets').controller('RatesWidgetController', [
  '$scope',
  'Entries',
  RatesWidgetController
]);'use strict';
/**
 * Entries timeline controller
 * @param {mixed} $scope
 */
function TimelineWidgetController($scope, Entries) {
  /*function buildEntiesData(data){

        var data_by_category = {};

        angular.forEach(data, function(value, key){
            if(typeof data_by_category[value.category] == 'undefined') {
                data_by_category[value.category] = {
                    value: value.quantity
                }
            }else {
                data_by_category[value.category].value += value.quantity;
            }
        });

        angular.forEach(data_by_category, function(value, key) {

            var random_number = '#'+Math.floor(Math.random()*16777215).toString(16);

            $scope.distribution_data.push({
                value: value.value,
                color: random_number,
                highlight: random_number,
                label: key
            });

        });

    }*/
  $scope.timeline_data = {
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July'
    ],
    datasets: [
      {
        label: 'My First dataset',
        fillColor: 'rgba(220,220,220,0.2)',
        strokeColor: 'rgba(220,220,220,1)',
        pointColor: 'rgba(220,220,220,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(220,220,220,1)',
        data: [
          65,
          59,
          80,
          81,
          56,
          55,
          40
        ]
      },
      {
        label: 'My Second dataset',
        fillColor: 'rgba(151,187,205,0.2)',
        strokeColor: 'rgba(151,187,205,1)',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: [
          28,
          48,
          40,
          19,
          86,
          27,
          90
        ]
      }
    ]
  };
  //Entries.query(buildEntiesData);
  $scope.timeline_options = {
    bezierCurve: false,
    pointDotRadius: 3,
    responsive: true
  };
}
angular.module('widgets').controller('TimelineWidgetController', [
  '$scope',
  'Entries',
  TimelineWidgetController
]);'use strict';
// Widgets controller
angular.module('widgets').controller('WidgetsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Widgets',
  function ($scope, $stateParams, $location, Authentication, Widgets) {
    $scope.authentication = Authentication;
    // Create new Widget
    $scope.create = function () {
      // Create new Widget object
      var widget = new Widgets({ name: this.name });
      // Redirect after save
      widget.$save(function (response) {
        $location.path('widgets/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Widget
    $scope.remove = function (widget) {
      if (widget) {
        widget.$remove();
        for (var i in $scope.widgets) {
          if ($scope.widgets[i] === widget) {
            $scope.widgets.splice(i, 1);
          }
        }
      } else {
        $scope.widget.$remove(function () {
          $location.path('widgets');
        });
      }
    };
    // Update existing Widget
    $scope.update = function () {
      var widget = $scope.widget;
      widget.$update(function () {
        $location.path('widgets/' + widget._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Widgets
    $scope.find = function () {
      $scope.widgets = Widgets.query();
    };
    // Find existing Widget
    $scope.findOne = function () {
      $scope.widget = Widgets.get({ widgetId: $stateParams.widgetId });
    };
  }
]);