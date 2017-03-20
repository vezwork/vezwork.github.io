"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var newInput = document.getElementById("new-input");
var newButton = document.getElementById("new-button");
var taskArea = document.getElementById("task-list");

var tasks = [];

//Defines a Task, which can be rendered to DOM

var Task = function () {
  function Task(description) {
    var completed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, Task);

    this.description = description;
    this.completed = completed;
  }

  //renders the task to a div


  _createClass(Task, [{
    key: "render",
    value: function render() {
      var _this = this;

      //parent task element
      var taskEl = document.createElement("div");
      taskEl.className = "task";
      taskEl.style.background = this.completed ? "#e2e1e0" : "white";

      var button = document.createElement("button");
      button.innerHTML = "delete";
      button.addEventListener("click", function (_) {
        deleteTask(_this);
      });

      var check = document.createElement("button");
      check.innerHTML = this.completed ? "✘" : "✓";
      check.addEventListener("click", function (_) {
        _this.completed = !_this.completed;
        renderTasks();
      });

      var desc = document.createElement("p");
      desc.innerHTML = this.description;
      desc.contentEditable = true;
      //when enter is pressed the changes to description are saved
      taskEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          _this.description = desc.innerHTML;
          renderTasks();
        }
      });

      taskEl.appendChild(button);
      taskEl.appendChild(check);
      taskEl.appendChild(desc);
      return taskEl;
    }
  }]);

  return Task;
}();

newButton.addEventListener("click", function (_) {
  if (newInput.value !== "") {
    addTask(new Task(newInput.value));
    newInput.value = "";
  }
});

function saveTasks() {
  localStorage.tasks = JSON.stringify(tasks);
}

function loadTasks() {
  if (localStorage.tasks !== undefined) {
    var storedTasks = JSON.parse(localStorage.tasks);
    //add each stored task to main tasks list as a Task
    storedTasks.forEach(function (task) {
      addTask(new Task(task.description, task.completed));
    });
  }
}

//renders the tasks to html
function renderTasks() {
  saveTasks();
  taskArea.innerHTML = "";
  tasks.forEach(function (task) {
    taskArea.appendChild(task.render());
  });
}

function addTask(task) {
  tasks.push(task);
  renderTasks();
}

function deleteTask(task) {
  var taskIndex = tasks.findIndex(function (t) {
    return t == task;
  });
  tasks.splice(taskIndex, 1);
  renderTasks();
}

//load stored tasks on page load
loadTasks();