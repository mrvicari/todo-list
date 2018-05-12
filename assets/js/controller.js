var myApp = angular.module("myApp", ['ngRoute', 'ngSanitize', 'mgcrea.ngStrap', 'ngResource']);

// Assign different partials and controllers to the different urls
myApp.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/tasks', {
    controller: 'indexCtrl',
    templateUrl: '/assets/partials/tasks.html',
    cmd: 'tasks',
    title: 'All Tasks'
  })
  $routeProvider.when('/tasks/add', {
    controller: 'addCtrl',
    templateUrl: '/assets/partials/addTask.html'
  })
  $routeProvider.when('/task/:id', {
    controller : 'taskCtrl',
    templateUrl: '/assets/partials/task.html'
  })
  $routeProvider.when('/tasks/uncompleted', {
    controller : 'indexCtrl',
    templateUrl: '/assets/partials/tasks.html',
    cmd: 'tasks/uncompleted',
    title: 'Uncompleted'
  })
  $routeProvider.when('/tasks/completed', {
    controller : 'indexCtrl',
    templateUrl: '/assets/partials/tasks.html',
    cmd: 'tasks/completed',
    title: 'Completed'
  });

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
});

// Application-wide controller
myApp.controller('appCtrl', function($scope, $location) {
  // Re-direct to /tasks page when search button is clicked
  $scope.startSearch = function() {
    $location.path('/tasks');
  };
});

// Controller for handling tasks
myApp.controller('indexCtrl', function($scope, tasks, $alert, $http, $route) {
  // Get the tasks from the appropriate url, e.g. /tasks/completed
  $scope.tasks = tasks.get($route.current.$$route.cmd, '');

  // Get the title for the page
  $scope.title = $route.current.$$route.title;

  // Sort by any variable 'sort'
  $scope.myOrderBy = function(sort) {
    $scope.mySort = sort;
  }

  // Mark task as completed
  $scope.complete = function(task) {
    task.completed = true;
    task.$update();
  }

  // Remove task from the server
  $scope.delete = function(task) {
    tasks.destroy(task.id);
    $scope.tasks.splice($scope.tasks.indexOf(task), 1);
  };
});

// Add task controller
myApp.controller('addCtrl', function($scope, tasks) {
  // Create a task object and commit to the server
  $scope.task = tasks.create();

  $scope.submit = function() {
    $scope.task.$save();
    $scope.task = tasks.create();
    console.log(status);
    $scope.added = true;
  };
});

// Individual task view controller
myApp.controller('taskCtrl', function($timeout, $scope, $routeParams, tasks) {
  var response = tasks.get('task/', $routeParams.id);

  // Get the task's data
  response.$promise.then(function(data) {
    $scope.task = data[0];
  }, function(error) {
  });

  // Listen for 'saved' and update the task's data
  $scope.$on('saved', function() {
    $timeout(function() {
    $scope.task.$update({id: $routeParams.id});
    }, 0);
  });
});

// Factory Service to store data
myApp.factory('tasks', function($resource) {
  // Store as a resource with mdynamic url and custom HTTP verb PUT
  var resource = $resource('http://localhost:5000/:cmd:id', {cmd: '@cmd', id: '@id'}, {
    update: {method: 'PUT', url: 'http://localhost:5000/task/:id'}
  });

  // Take parameters for the standard HTTP verbs
  return {
    get: function(cmd, id) {
      return resource.query({cmd: cmd, id: id});
    },
    find: function(cmd, id) {
      return resource.query({cmd: cmd, id: id});
    },
    create: function() {
      return new resource({cmd: 'tasks'});
    },
    destroy: function(id) {
      resource.delete({cmd: 'task/', id: id});
    }
  };
});

// editable Directive to allow the editing of tasks
myApp.directive('editable', function() {
  return {
    restrict : 'A',
    templateUrl: '/assets/partials/editable.html',
    scope: {
      value: '=editable',
      field: '@fieldtype'
    },
    // Show or hide the editor as necessary
    controller: function($scope) {
      $scope.editor = {
        showing: false,
        value: $scope.value
      };
      $scope.toggleEditor = function() {
        $scope.editor.showing = !$scope.editor.showing;
      };
      $scope.field = ($scope.field) ? $scope.field : 'text';

      // Emit 'saved' when changes are to be committed
      $scope.save = function() {
        $scope.value = $scope.editor.value;
        $scope.toggleEditor();
        $scope.$emit('saved');
      }
    }
  };
});
