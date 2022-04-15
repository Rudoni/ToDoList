/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

 myApp.controllers = {

  //////////////////////////
  // Tabbar Page Controller //
  //////////////////////////
  tabbarPage: function(page) {
    // Set button functionality to open/close the menu.
    page.querySelector('[component="button/menu"]').onclick = function() {
      document.querySelector('#mySplitter').left.toggle();
    };

    // Set button functionality to push 'new_task.html' page.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-task"]'), function(element) {
      element.onclick = function() {
        document.querySelector('#myNavigator').pushPage('html/new_task.html');
      };

      element.show && element.show(); // Fix ons-fab in Safari.
    });

    // Change tabbar animation depending on platform.
    page.querySelector('#myTabbar').setAttribute('animation', ons.platform.isAndroid() ? 'slide' : 'none');
  },

  ////////////////////////
  // Menu Page Controller //
  ////////////////////////
  menuPage: function(page) {
    // Set functionality for 'No Category' and 'All' default categories respectively.
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item[category-id=""]'));
    myApp.services.categories.bindOnCheckboxChange(page.querySelector('#default-category-list ons-list-item:not([category-id])'));

    // Change splitter animation depending on platform.
    document.querySelector('#mySplitter').left.setAttribute('animation', ons.platform.isAndroid() ? 'overlay' : 'reveal');

    page.querySelector('#button-new-categ').onclick = function() {
      myApp.services.categories.create();
  };
  },

  ////////////////////////////
  // New Task Page Controller //
  ////////////////////////////
  newTaskPage: function(page) {
    // Set button functionality to save a new task.
    Array.prototype.forEach.call(page.querySelectorAll('[component="button/save-task"]'), function(element) {
      element.onclick = function() {
        var newTitle = page.querySelector('#title-input').value;

        if (newTitle.replace(/ /g, "") !== '') {
          // If input title is not empty, create a new task.

          let categ = page.querySelector("#category_chosen").querySelector("select").value === "no_category" ? "" : page.querySelector("#category_chosen").querySelector("select").value;
          console.log(categ);
          data = {
            title: newTitle,
            category: categ,
            description: page.querySelector('#description-input').value,
            highlight: page.querySelector('#highlight-input').checked,
            urgent: page.querySelector('#urgent-input').checked,
            completed: ''
          };

          myApp.services.tasks.create(data);

          // Add the task item to the fixtures and the category to the array.
          myApp.services.fixtures.push(data);
          myApp.services.categories_array.push(data.category);

          

          // save the new task to localStorage
          myApp.services.savetask();

          console.log(myApp.services.fixtures);
          console.log(localStorage.getItem('fixtures'));


          // Set selected category to 'All', refresh and pop page.
          document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
          document.querySelector('#default-category-list ons-list-item').updateCategoryView();
          document.querySelector('#myNavigator').popPage();

        } else {
          // Show alert if the input title is empty.
          ons.notification.confirm(
            {
              title: 'Attention',
              message: 'Veuillez saisir un titre pour pouvoir créer une tâche.',
              buttonLabels: ['ça marche chef']
            }
          );
        }
      };
    });
    page.querySelector("#category_chosen").addEventListener('change' , async function() {
      if (page.querySelector("#category_chosen").querySelector("select").value === "new_category")
      {
        // create  category and get input value
          var newThing= await myApp.services.categories.create();
          $('<option>')
              .text(newThing)
              .attr('value', newThing)
              .insertBefore($('option[value=new_category]', this));
          $(this).val(newThing);
      }
    });

    // Set all categories in the category selector
    console.log(myApp.services.categories_array);
      myApp.services.categories_array.forEach(function(category) {
        var newValue = $('option', this).length;
        $('<option>')
            .text(category.label)
            .attr('value', newValue)
            .insertBefore($('option[value=new_category]', this));
        $(this).val(newValue);
      }); 
    
  },

  ////////////////////////////////
  // Details Task Page Controller //
  ///////////////////////////////
  detailsTaskPage: function(page) {
    
    // Get the element passed as argument to pushPage.
    var element = page.data.element;
    var old_element = page.data.old_element;

    // Fill the view with the stored data.
    console.log(element.data)
    page.querySelector('#title-input').value = element.data.title;
    page.querySelector("#category_chosen").querySelector("select").value = element.data.category;
    page.querySelector('#description-input').value = element.data.description;
    page.querySelector('#highlight-input').checked = element.data.highlight;
    page.querySelector('#urgent-input').checked = element.data.urgent;

    // Set button functionality to save an existing task.
    page.querySelector('[component="button/save-task"]').onclick = function() {
      var newTitle = page.querySelector('#title-input').value;

      if (newTitle.replace(/ /g, "")!== '') {
        // If input title is not empty, ask for confirmation before saving.
        ons.notification.confirm(
          {
            title: 'Êtes-vous sûr de sauvegarder les données ?',
            message: 'Les changements seront définitifs.',
            buttonLabels: ['Annuler', 'Sauvegarder']
          }
        ).then(function(buttonIndex) {
          if (buttonIndex === 1) {

            elementupdated = {
              title: newTitle,
              category: page.querySelector("#category_chosen").querySelector("select").value,
              description: page.querySelector('#description-input').value,
              ugent: element.data.urgent,
              highlight: page.querySelector('#highlight-input').checked,
              completed:old_element.completed
            };

            // If 'Save' button was pressed, overwrite the task.
            myApp.services.tasks.update(element,
              elementupdated
            );

            myApp.services.fixtures.splice(myApp.services.fixtures.indexOf(old_element), 1, elementupdated);  
            // save the new task in the fixtures.
            myApp.services.savetask();

            // Set selected category to 'All', refresh and pop page.
            document.querySelector('#default-category-list ons-list-item ons-radio').checked = true;
            document.querySelector('#default-category-list ons-list-item').updateCategoryView();
            document.querySelector('#myNavigator').popPage();
          }
        });

      } else {
        // Show alert if the input title is empty.
        ons.notification.confirm(
          {
            title: 'Attention',
            message: 'Veuillez saisir un titre.',
            buttonLabels: ['ça marche chef']
          }
        );
      }
    };

    page.querySelector("#category_chosen").addEventListener('change' , async function() {
      console.log("f");
      if (page.querySelector("#category_chosen").querySelector("select").value === "new_category")
      {
        // create  category and get input value
          var newThing= await myApp.services.categories.create();
          console.log(newThing);
          $('<option>')
              .text(newThing)
              .attr('value', newThing)
              .insertBefore($('option[value=new_category]', this));
          $(this).val(newThing);
      }
    });

    // Set all categories in the category selector
    myApp.services.categories_array.forEach(function(category) {
      $('<option>')
          .text(category.label)
          .attr('value', category.label)
          .insertBefore($('option[value=new_category]', this));
      $(this).val(category.label);
    }); 
  }
};
