var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
var statsTemplate = require('./templates/stats-template-tpl.hbs');
var TodoView = require('./templates/item-template-tpl.hbs');
var TodoList = require('./../collections/TodoList');

var ENTER_KEY = 13;

var Todos = new TodoList();

// The Application
// ---------------

// Our overall **AppView** is the top-level piece of UI.
module.exports = Backbone.View.extend({

  // Instead of generating a new element, bind to the existing skeleton of
  // the App already present in the HTML.
  el: '#todoapp',

  // Our template for the line of statistics at the bottom of the app.
  statsTemplate: _.template( statsTemplate() ),

  // New
  // Delegated events for creating new items, and clearing completed ones.
  events: {
    'keypress #new-todo': 'createOnEnter',
    'click #clear-completed': 'clearCompleted',
    'click #toggle-all': 'toggleAllComplete'
  },

  // At initialization we bind to the relevant events on the `Todos`
  // collection, when items are added or changed. Kick things off by
  // loading any preexisting todos that might be saved in *localStorage*.
  initialize: function() {
    this.allCheckbox = this.$('#toggle-all')[0];
    this.$input = this.$('#new-todo');
    this.$footer = this.$('#footer');
    this.$main = this.$('#main');

    this.listenTo(Todos, 'add', this.addOne);
    this.listenTo(Todos, 'reset', this.addAll);

    // New
    this.listenTo(Todos, 'change:completed', this.filterOne);
    this.listenTo(Todos,'filter', this.filterAll);
    this.listenTo(Todos, 'all', this.render);

    Todos.fetch();
  },

  // New
  // Re-rendering the App just means refreshing the statistics -- the rest
  // of the app doesn't change.
  render: function() {
    var completed = Todos.completed().length;
    var remaining = Todos.remaining().length;

    if ( Todos.length ) {
      this.$main.show();
      this.$footer.show();

      this.$footer.html(this.statsTemplate({
        completed: completed,
        remaining: remaining
      }));

      this.$('#filters li a')
        .removeClass('selected')
        // .filter('[href="#/' + ( TodoFilter || '' ) + '"]')
        .addClass('selected');
    } else {
      this.$main.hide();
      this.$footer.hide();
    }

    this.allCheckbox.checked = !remaining;
  },

  // Add a single todo item to the list by creating a view for it, and
  // appending its element to the `<ul>`.
  addOne: function( todo ) {
    var view = new TodoView({
      completed: todo.get('completed'),
      title: todo.get('title')
    });
    debugger;
    $('#todo-list').append( view );
  },

  // Add all items in the **Todos** collection at once.
  addAll: function() {
    this.$('#todo-list').html('');
    Todos.each(this.addOne, this);
  },

  // New
  filterOne : function (todo) {
    todo.trigger('visible');
  },

  // New
  filterAll : function () {
    Todos.each(this.filterOne, this);
  },


  // New
  // Generate the attributes for a new Todo item.
  newAttributes: function() {
    return {
      title: this.$input.val().trim(),
      order: Todos.nextOrder(),
      completed: false
    };
  },

  // New
  // If you hit return in the main input field, create new Todo model,
  // persisting it to localStorage.
  createOnEnter: function( event ) {
    if ( event.which !== ENTER_KEY || !this.$input.val().trim() ) {
      return;
    }

    Todos.create( this.newAttributes() );
    this.$input.val('');
  },

  // New
  // Clear all completed todo items, destroying their models.
  clearCompleted: function() {ff
    _.invoke(Todos.completed(), 'destroy');
    return false;
  },

  // New
  toggleAllComplete: function() {
    var completed = this.allCheckbox.checked;

    Todos.each(function( todo ) {
      todo.save({
        'completed': completed
      });
    });
  }
});
