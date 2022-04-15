/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/


 myApp.services = {

    /////////////////
    // Task Service //
    /////////////////
    tasks: {
  
      // Creates a new task and attaches it to the pending task list.
      create: function(data) {
        

        
        // Task item template.
        var taskItem = ons.createElement(
          '<ons-list-item tappable category="' + myApp.services.categories.parseId(data.category)+ '">' +
            '<label class="left">' +
             '<ons-checkbox '+data.completed+'>'+'</ons-checkbox>' +
            '</label>' +
            '<div class="center">' +
              data.title +
            '</div>' +
            '<div class="right">' +
              '<ons-icon style="color: grey; padding-left: 4px" icon="ion-ios-trash-outline, material:md-delete"></ons-icon>' +
            '</div>' +
          '</ons-list-item>'
        );
  
        // Store data within the element.
        taskItem.data = data;
        
          // Add 'completion' functionality when the checkbox changes.
        taskItem.data.onCheckboxChange = function(event) {
          myApp.services.animators.swipe(taskItem, function() {
            var listId = (taskItem.parentElement.id === 'pending-list' && event.target.checked) ? '#completed-list' : '#pending-list';
            if(listId == '#completed-list')
              taskItem.data.completed = 'checked';
            else
              taskItem.data.completed = '';
            document.querySelector(listId).appendChild(taskItem);
            // save the new task to localStorage
            myApp.services.savetask();
          });
        };

  
        taskItem.addEventListener('change', taskItem.data.onCheckboxChange);
  
        // Add button functionality to remove a task.
        taskItem.querySelector('.right').onclick = function() {
            ons.notification.confirm(
                {
                title: 'Attention',
                message: 'Êtes-vous sûr de vouloir supprimer la tâche '+data.title+' ?',
                buttonLabels: ['Annuler', 'Supprimer']
              }).then( (bouton) => {
                  if(bouton === 1)
                     myApp.services.tasks.remove(taskItem);
                     myApp.services.fixtures.splice(myApp.services.fixtures.indexOf(data),1);
                     // save in the localstorage
                      myApp.services.savetask();
                }
              );
        
        };
  
        // Add functionality to push 'details_task.html' page with the current element as a parameter.
        taskItem.querySelector('.center').onclick = function() {
          document.querySelector('#myNavigator')
            .pushPage('html/details_task.html',
              {
                animation: 'lift',
                data: {
                  element: taskItem,
                  old_element: data
                }
              }
            );
        };
  
  
        // Add the highlight if necessary.
        if (taskItem.data.highlight) {
          taskItem.classList.add('highlight');
        }
  
        // Insert urgent tasks at the top and non urgent tasks at the bottom.
        var pendingList = document.querySelector('#pending-list');
        pendingList.insertBefore(taskItem, taskItem.data.urgent ? pendingList.firstChild : null);


        console.log(taskItem.data);

        // Insert the task in the complete section or pending section.
        if(taskItem.data.completed === 'checked') 
          document.querySelector('#completed-list').appendChild(taskItem);
        else
          document.querySelector('#pending-list').appendChild(taskItem);


      },
  
      // Modifies the inner data and current view of an existing task.
      update: function(taskItem, data) {
        if (data.title !== taskItem.data.title) {
          // Update title view.
          taskItem.querySelector('.center').innerHTML = data.title;

        }
  
        if (data.category !== taskItem.data.category) {
          // Modify the item before updating categories.
          taskItem.setAttribute('category', myApp.services.categories.parseId(data.category));
          // Check if it's necessary to remove empty categories.
          myApp.services.categories.updateRemove(taskItem.data.category);
  
        }
  
        // Add or remove the highlight.
        taskItem.classList[data.highlight ? 'add' : 'remove']('highlight');
  
        // Store the new data within the element.
        taskItem.data = data;
      },
  
      // Deletes a task item and its listeners.
      remove: function(taskItem) {
        taskItem.removeEventListener('change', taskItem.data.onCheckboxChange);
  
        myApp.services.animators.remove(taskItem, function() {
          // Remove the item before updating the categories.
          taskItem.remove();
          // Check if the category has no items and remove it in that case.
          myApp.services.categories.updateRemove(taskItem.data.category);
        });
      }
    },
  
    /////////////////////
    // Category Service //
    ////////////////////
    categories: {
  
      // Creates a new category and attaches it to the custom category list.
      create: async function() {
    
        let message = "";

          // Insert a message to the user for insering the category name.
        await ons.notification.prompt({
          title: 'Nouvelle Catégorie',
          message: 'Entrez le nom de la catégorie:',
          buttonLabels: ['Valider'],
        }).then(function(categoryLabel) {
          if (categoryLabel.replace(/ /g, "") !== '') {
            
          message = categoryLabel;

          var categoryId = myApp.services.categories.parseId(categoryLabel);

          // Category item template.
          var categoryItem = ons.createElement(
            '<ons-list-item tappable category-id="' + categoryId + '">' +
              '<div class="left">' +
                '<ons-radio name="categoryGroup" input-id="radio-'  + categoryId + '"></ons-radio>' +
              '</div>' +
              '<label class="center" for="radio-' + categoryId + '">' +
                (categoryLabel) +
              '</label>' +
            '</ons-list-item>'
          );
    
          // Adds filtering functionality to this category item.
          myApp.services.categories.bindOnCheckboxChange(categoryItem);
    
          // Attach the new category to the corresponding list.
          document.querySelector('#custom-category-list').appendChild(categoryItem);
          // add the category to the array and save it to localStorage.
          console.log(JSON.parse(myApp.services.categories_array));
          console.log(myApp.services.fixtures);
          myApp.services.categories_array.push({
            label: categoryLabel
            });
          myApp.services.savecategories();
        }
        else{
        // Insert a message to the user for insering the category name.
        ons.notification.alert({
          message: 'Vous devez entrer un nom de catégorie.',
          title: 'Attention',
          buttonLabel: 'OK'
          });
        }
      });
      return  new Promise( (resolutionFunc,rejectionFunc) => {
        resolutionFunc(message);
      });
      },
  
      // On task creation/update, updates the category list adding new categories if needed.
      updateAdd: function(categoryLabel) {
        var categoryId = myApp.services.categories.parseId(categoryLabel);
        var categoryItem = document.querySelector('#menuPage ons-list-item[category-id="' + categoryId + '"]');
  
      },
  
      // On task deletion/update, updates the category list removing categories without tasks if needed.
      updateRemove: function(categoryLabel) {
        var categoryId = myApp.services.categories.parseId(categoryLabel);
        var categoryItem = document.querySelector('#tabbarPage ons-list-item[category="' + categoryId + '"]');
  
        if (!categoryItem) {
          // If there are no tasks under this category, remove it.
          myApp.services.categories.remove(document.querySelector('#custom-category-list ons-list-item[category-id="' + categoryId + '"]'));
        }
      },
  
      // Deletes a category item and its listeners.
      remove: function(categoryItem) {
        if (categoryItem) {
          // Remove listeners and the item itself.
          categoryItem.removeEventListener('change', categoryItem.updateCategoryView);
          categoryItem.remove();
        }
      },
  
      // Adds filtering functionality to a category item.
      bindOnCheckboxChange: function(categoryItem) {
        var categoryId = categoryItem.getAttribute('category-id');
        var allItems = categoryId === null;
  
        categoryItem.updateCategoryView = function() {
          var query = '[category="' + (categoryId || '') + '"]';
  
          var taskItems = document.querySelectorAll('#tabbarPage ons-list-item');
          for (var i = 0; i < taskItems.length; i++) {
            taskItems[i].style.display = (allItems || taskItems[i].getAttribute('category') === categoryId) ? '' : 'none';
          }
        };
  
        categoryItem.addEventListener('change', categoryItem.updateCategoryView);
      },
  
      // Transforms a category name into a valid id.
      parseId: function(categoryLabel) {
        return categoryLabel ? categoryLabel.replace(/\s\s+/g, ' ').toLowerCase() : '';
      }
    },
  
    //////////////////////
    // Animation Service //
    /////////////////////
    animators: {
  
      // Swipe animation for task completion.
      swipe: function(listItem, callback) {
        var animation = (listItem.parentElement.id === 'pending-list') ? 'animation-swipe-right' : 'animation-swipe-left';
        listItem.classList.add('hide-children');
        listItem.classList.add(animation);
  
        setTimeout(function() {
          listItem.classList.remove(animation);
          listItem.classList.remove('hide-children');
          callback();
        }, 950);
      },
  
      // Remove animation for task deletion.
      remove: function(listItem, callback) {
        listItem.classList.add('animation-remove');
        listItem.classList.add('hide-children');
  
        setTimeout(function() {
          callback();
        }, 750);
      }
    },


    // save //
    savetask: () => {
      localStorage.setItem('fixtures', JSON.stringify(myApp.services.fixtures));
    },

    savecategories: () => {
      localStorage.setItem('categories', JSON.stringify(myApp.services.categories_array));
    },

  
    ////////////////////////
    // Initial Data Service //
    ////////////////////////
    fixtures: 
      JSON.parse(localStorage.getItem('fixtures')),

    categories_array:
      JSON.parse(localStorage.getItem('categories'))
    

  };
  