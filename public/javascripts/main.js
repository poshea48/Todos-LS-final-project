
class Todo {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.month = data.month;
    this.day = data.day;
    this.year = data.year;
    this.description = data.description;
    this.completed = data.completed;
    this.date = this.createDateProperty(data.month, data.year);
  }

  createDateProperty(month, year) {
    if (month === "00" || year === "0000") {
      return 'No Due Date';
    }
    year = year.slice(2);
    return `${month}/${year}`
  }
}

class TodosList {
  constructor(collection) {
    this.allTodos;
    this.dateGroups;      // todos grouped together by month/year
    this.completedGroup;  // grouped of completed todos
    this.currentGroup;    // the todos that are displayed(all or by groups)
    this.createTodosList(collection);
    this.sortTodos();
    this.groupTodosByDate();
    this.createCompletedGroup();
  }

  createTodosList(collection) {
    let date;
    let year;
    this.allTodos =  collection.map(todo => {
      return new Todo(todo)
    });
    this.getAllTodos();
  }

  sortTodos() {
    let completed = [];
    let notCompleted = [];

    this.currentGroup.forEach(todo => {
      if (todo.completed) {
        completed.push(todo);
      } else {
        notCompleted.push(todo);
      }
    });

    completed = this.sortByDate(completed);
    notCompleted = this.sortByDate(notCompleted);
    this.currentGroup = notCompleted.concat(completed);
  }

  sortByDate(group) {
    let date1;
    let date2;
    let noDates = [];
    let dates = []
    group.forEach((todo, index) => {
      if (todo.date === "No Due Date") {
        noDates.push(todo);
      } else {
        dates.push(todo);
      }
    });

    dates.sort((a, b) => {
      date1 = new Date(`${a.month}/${a.day}/${a.year}`)
      date2 = new Date(`${b.month}/${b.day}/${b.year}`)
      return date1 - date2;
    });

    return noDates.concat(dates);
  }

  getTodoById(id) {
    return this.allTodos.filter(todo => {
      return todo.id === id
    })[0];
  }

  groupTodosByDate() {
    let groups = [];
    let added;
    let i;

    this.allTodos.forEach(todo => {
      added = false;
      for (i = 0; i <= groups.length - 1; i += 1) {
        if (groups[i].date === todo.date) {
          groups[i].amount += 1
          added = true;
          if (todo.completed) {
            groups[i].completedAmt += 1;
          }
        }
      }
      if (!added) {
        let amt = todo.completed ? 1 : 0;
        groups.push({date: todo.date, amount: 1, completedAmt: amt})
      }
    });
    this.dateGroups = groups;
  }

  createCompletedGroup() {
    let group = this.dateGroups.filter(group => {
      return group.completedAmt > 0;
    });
    this.completedGroup = group.map(todo => {
      return {date: todo.date, amount: todo.completedAmt}
    });
  }

  getTodosByDate(date) {
    if (date === "All Todos") {
      this.getAllTodos();
      return;
    }
    this.currentGroup = this.allTodos.filter(todo => {
      return todo.date === date;
    });
    this.sortTodos();
  }

  getAllTodos() {
    this.currentGroup = this.allTodos;
    this.sortTodos();
  }

  getAllCompletedTodos() {
    this.currentGroup = this.allTodos.filter(todo => {
      return todo.completed;
    })
  }

  getTodosByCompletedGroup(date) {
    if (date === "Completed") {
      this.getAllCompletedTodos();
      return;
    }

    this.currentGroup = this.allTodos.filter(todo => {
      return (todo.date === date && todo.completed);
    });
  }
}

class TodosManager {
  constructor() {
    this.todosList;
    this.currentNavHighlight = ["all_todos", "All Todos"];
    this.getDomProps();
    this.getTodos();
    this.getTemplates();
    this.bindEvents();
  }

  /**************                ********************/
  /************** DOM MANAGEMENT ********************/
  /**************                ********************/

  getDomProps() {
    this.$nav = $("nav");
    this.$navAll = $("#all_todos");
    this.$navCompleted = $("#completed_todos");
    this.$navAllList = $("#all_todos").find("ul");
    this.$navCompeletedList = $("#completed_todos").find("ul");
    this.$navToggleButton = $("#nav_toggle");
    this.$addIcon = $("a.add_icon");
    this.$overlay = $("#overlay");
    this.$modal = $("#modal");
    this.$toggle = $("#toggle");
    this.$listItems = $("#list_items");
    this.$mainTitle = $("dt#todo_group");
  }

  getTodos() {
    $.ajax({
      url: '/api/todos',
      dataType: 'json',
      success: res => {
        this.todosList = new TodosList(res);
        this.draw();
      }
    });
  }

  draw() {
    this.displayTodosInMain();
    this.showNav();
  }

  getTemplates() {
    let templates = {};
    let id;
    $("script[type='text/x-handlebars']").each(function() {
      id = this.id;
      if (this.dataset.type === "partial") {
        templates[id] = Handlebars.registerPartial(id, $(this).html())
      } else {
        templates[id] = Handlebars.compile($(this).html())
      }
    });

    this.templates = templates;
  }

  bindEvents() {
    this.$addIcon.on("click", this.createBlankModal.bind(this));
    this.$overlay.on("click", this.hideModal.bind(this));
    this.$navToggleButton.on("change", this.toggleNav.bind(this));
    this.$modal.on("click", "#save", this.saveTodo.bind(this));
    this.$modal.on("click", "#mark_complete", this.markTodoComplete.bind(this));
    this.$listItems.on("click", "td.check_row", this.toggleCheckBox.bind(this));
    this.$listItems.on("click", "td.delete", this.removeTodo.bind(this));
    this.$listItems.on("click", ".check_row label", this.createEditModal.bind(this))
    this.$nav.on("click", "section", this.handleClickedNavElement.bind(this));
  }


  /**************                ********************/
  /************** NAV MANAGEMENT ********************/
  /**************                ********************/

  handleClickedNavElement(e) {
    e.preventDefault();
    let $clickedElement = $(e.target).closest(".highlight");
    let parentId = $(e.target).parents("section").get(0).id;
    let dateGroup = $clickedElement.find('dt').text();
    $(".active").toggleClass("active");
    $clickedElement.toggleClass("active");
    this.currentNavHighlight = [parentId, $clickedElement.find("dt").text()];
    this.displayTodosInMain()
  }

  showNav() {
    this.showAllGroupedInNav();
    this.showCompletedGroupedInNav();
    if (this.todosList.currentGroup.length > 0) {
      this.addActiveClass();
    }
  }

  addActiveClass() {
    let title;
    let parent;
    let activeTitle = this.currentNavHighlight[1];
    let activeParent = this.currentNavHighlight[0];

    let activeElement = $("nav .highlight").filter(function() {
      title = $(this).find("dt").text();
      parent = $(this).parents("section").get(0).id;
      return (parent === activeParent && title === activeTitle);
    })[0];

    if (activeElement) {
      activeElement.classList.add("active");
    } else {
      $("#all_todos header").addClass("active");
      this.todosList.currentGroup = this.todosList.allTodos;
    }
  }

  showAllGroupedInNav() {
    let total = this.todosList.allTodos.length;
    this.$navAll.find(".elipse").text(total);
    this.$navAllList.html(this.templates.grouped_templates({groups: this.todosList.dateGroups}))
  }

  showCompletedGroupedInNav() {
    let total = 0
    this.todosList.completedGroup.forEach(todo => {
      total += todo.amount;
    });
    this.$navCompleted.find(".elipse").text(total);
    this.$navCompeletedList.html(this.templates.grouped_templates({groups: this.todosList.completedGroup}))
  }

  /**************                         ********************/
  /************** MAIN DISPLAY MANAGEMENT ********************/
  /**************                         ********************/

  displayTodosInMain() {
    let groupTitle = this.currentNavHighlight[1];
    let date = this.$mainTitle.text();
    let type = this.currentNavHighlight[0];
    if (type === "all_todos") {
      this.showAllGroupedInMain(groupTitle);
    } else {
      this.showCompletedGroupInMain(groupTitle);
    }

    this.$listItems.html(this.templates.todos_template({todos: this.todosList.currentGroup}));
    this.updateMainElipse();
  }

  updateMainElipse() {
    let num = this.todosList.currentGroup.length;
    $("main header .elipse").text(num);
  }

  showAllGroupedInMain(date) {
    this.todosList.getTodosByDate(date);
    this.$mainTitle.text(date);
  }

  showCompletedGroupInMain(date) {
    this.todosList.getTodosByCompletedGroup(date);
    if (this.currentNavHighlight[1] === "Completed") {
      this.$mainTitle.text(`${date} - All`);
    } else {
      this.$mainTitle.text(`${date} - Completed`);
    }
  }

  toggleNav(e) {
    e.preventDefault();
    $("nav").toggle(this.checked)
  }

  /**************                  ****************/
  /************** Modal Management ****************/
  /**************                  ****************/

  createBlankModal(e) {
    e.preventDefault();
    this.$modal.html(this.templates.modal_template());
    this.displayModal();
  }

  createEditModal(e) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    e.preventDefault();
    let id = Number($(e.target).parents("tr").get(0).dataset.id);
    let todo = this.todosList.getTodoById(id);
    todo.month = months[Number(todo.month) - 1] || "Month";
    todo.day = Number(todo.day) || "Day";
    todo.year = Number(todo.year) || "Year";
    this.$modal.html(this.templates.modal_template(todo));
    this.addSelectedTagsToHTML(todo);
    this.displayModal();
  }

  displayModal() {
    this.$overlay.show();
    this.$modal.fadeIn(300);
  }

  hideModal() {
    this.$overlay.hide();
    this.$modal.fadeOut(300);
  }

  addSelectedTagsToHTML(todo) {
    let $editForm = $("#edit_form");
    let dateArray = [todo.day, todo.month, todo.year];
    let dayValue = todo.day;
    let monthValue = todo.month;
    let yearValue = todo.year;
    let option;

    dateArray.forEach(date => {
      option = $("#edit_form option").filter(function() {
        return $(this).text() === String(date);
      }).attr("selected", true);
    })
  }

  /**************                     ****************/
  /************** CRUD TODOManagement ****************/
  /**************                     ****************/

  saveTodo(e) {
    e.preventDefault();
    let $form = $(e.target).parents("form");
    if ($form.find("input").val().length < 3) {
      alert("You must enter a title at least 3 characters long.");
      return;
    }
    let data = this.createObjectFromFormData($form.serializeArray());
    data.description = $form.find("textarea").val();
    let id = e.target.dataset.id;

    if (id) {
      let todo = this.todosList.getTodoById(Number(id))
      data.completed = todo.completed;
      this.updateTodo(data, id)
    } else {
      this.addTodo(data);
    }
    this.hideModal();
  }

  addTodo(data) {
    let method = "POST"
    let url = "/api/todos"
    this.$mainTitle.text("All Todos");
    this.currentNavHighlight = ["all_todos", "All Todos"];
    this.sendDataToServer(method, url, data);
  }

  updateTodo(data, id) {
    let method = "PUT";
    let url = `/api/todos/${id}`;
    this.sendDataToServer(method, url, data);
  }

  removeTodo(e) {
    e.preventDefault();
    let id = Number(e.currentTarget.dataset.id);
    let data = this.todosList.getTodoById(id);
    let method = "DELETE";
    let url = `/api/todos/${id}`
    this.sendDataToServer(method, url, data);
  }

  markTodoComplete(e) {
    e.preventDefault();
    if ($(e.target).parents("form").get(0).id === "blank_form") {
      alert("Cannot mark as complete as item has not been created yet!");
      return;
    }
    let id = Number(e.target.dataset.id);
    this.toggleCompletedTodo(id);
    this.hideModal();
  }

  toggleCheckBox(e) {
    e.preventDefault();
    let className = e.target.className;
    if (!className) { return } // ensures that clicking on label will not toggle the checkbox
    let id = Number($(e.target).parents('tr').get(0).dataset.id);
    let data = this.todosList.getTodoById(id);
    this.toggleCompletedTodo(id);
  }

  toggleCompletedTodo(id) {
    let method = "POST";
    let url = `/api/todos/${id}/toggle_completed`;
    this.sendDataToServer(method, url)
  }

  sendDataToServer(method, url, data) {
    $.ajax({
      method: method,
      url: url,
      data: data,
      success: res => {
        this.getTodos();
      }
    });
  }

  createObjectFromFormData(data) {
    let obj = {};
    data.forEach(input => {
      if (input.value === 'Day') {
        obj[input.name] = '00';
      } else if (input.value === 'Year') {
        obj[input.name] = '0000';
      } else if (input.value === 'Month') {
        obj[input.name] = '00';
      } else {
        obj[input.name] = input.value;
      }
    });
    obj.completed = false
    return obj;
  }
}

$(function() {
  const todos = new TodosManager();
})
