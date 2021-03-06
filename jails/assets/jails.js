(function() {
  'use strict';

  if (window.Jails && typeof window.Jails === 'function') {
    console.warn('Jails was already inited');
    return;
  }

  window.Jails = function(config) {
    var JAILS = {
      models: {}, // Stores model constructors
      viewModels: {}, // Stores data about model associated views and their events
      modelInstances: {}, // Stores all model instances in format "modelName" + id
      index: {}, // Stores array of model ids in format modelName: [1, 2, ..., id]
      events: {
        // CHAT: [
        //   {
        //     method: 'addMessage',
        //     function: function(message) {
        //       console.log('upd chat', message);
        //       $('.chat').append('<p><strong>' + message.user + ':&nbsp;</strong><span>' + message.message + '</span></p>');
        //     }
        //   },
        //   {
        //     method: 'getModel',
        //     function: function(data) {
        //       $('.chat').html('');
        //       data.messages.forEach(function(message) {
        //         $('.chat').append('<p><strong>' + message.user + ':&nbsp;</strong><span>' + message.message + '</span></p>');
        //       });     
        //     }
        //   }
        // ],
        // TANK: [
        //   {
        //     method: 'move',
        //     function(direction) {
        //       console.log(MODELS.TANK.data);
        //       $('#tank1').css({left: MODELS.TANK.data.position.left, top: MODELS.TANK.data.position.top});
        //     }
        //   },
        //   {
        //     method: 'getModel',
        //     function: function(data) {
        //       MODELS.TANK.data = data; 
        //       $('#tank1').css({left: MODELS.TANK.data.position.left, top: MODELS.TANK.data.position.top});   
        //     }
        //   }
        // ]
      } // Events on callback for ws methods
    };

    JAILS.config = CONFIG; // CONFIG is set by backend based on env data

    JAILS.ws = new WebSocket(JAILS.config.ws);

    function log(message) {
      if (config.debug) {
        console.log(message);
      }
    }

    function warn(message) {
      if (config.debug) {
        console.warn(message);
      }
    }

    function error(message) {
      if (config.debug) {
        console.error(message);
      }
    }

    // Not in use
    // JAILS.addInstanceMethods = function(modelName, model) {
    //   if (JAILS[modelName])
    //   return Object.assign(JAILS[modelName].instanceMethods, model);
    // };


    JAILS.bindView = function(modelInstance, config) {
      config.events.forEach(function(event) {

      });
    };


    JAILS.registerModel = function(modelName, data) {

      if (!data) {
        console.warn(modelName + ' is not a registered model!');
        return false;
      }

      var defaults = function(modelName) {
          return {
            create: function(config) {
              var lastId, id, dataKeys;
              data = config.data || {};
              dataKeys = Object.keys(data);
              console.log('creating model', modelName, data);

              if (!Array.isArray(JAILS.index[modelName])) { // Set model index to array if it wasn't
                JAILS.index[modelName] = [];
              }

              if (config.id) {
                id = config.id;
              } else if (JAILS.index[modelName].length > 0) {
                lastId = JAILS.index[modelName][JAILS.index[modelName].length - 1]; // last item in index
                id = lastId + 1;
              } else {
                id = 0;
              }
              JAILS.index[modelName].push(id);

              JAILS.modelInstances[modelName + id] = {
                id: id
              };

              JAILS.modelInstances[modelName + id].protectedMethods = JAILS.models[modelName].instanceMethods(JAILS.modelInstances[modelName + id]);
              JAILS.modelInstances[modelName + id].methods = {};

              var protectedMethodsList = Object.keys(JAILS.modelInstances[modelName + id].protectedMethods);
              protectedMethodsList.forEach(function(method) {
                JAILS.modelInstances[modelName + id].methods[method] = function(data) {
                  var request = {
                    method: 'updateModel',
                    data: {
                      model: modelName + id,
                      method: method,
                      data: data
                    }
                  };

                  JAILS.ws.send(JSON.stringify(request));
                };
              });
              // JAILS.modelInstances[modelName + id].properties = JAILS.models[modelName].instanceProperties; // setting default properties


              JAILS.modelInstances[modelName + id].properties = data; // bottom overriding should be fixed sometime;
              // dataKeys.forEach(function(key) { // overwriting default properties with ones from data for create
              //   var keyValue = data[key];
              //   console.log('keys', JAILS.modelInstances[modelName + id], JAILS.index);
              //   JAILS.modelInstances[modelName + id].properties[key] = keyValue;
              // });
              // console.log('after cyc', JAILS.modelInstances[modelName + id].properties);
              // registering events
              JAILS.modelInstances[modelName + id].on = function(event, callback) {
                console.log('registering event', modelName + id);
                JAILS.events[modelName + id] = JAILS.events[modelName + id] || [];

                JAILS.events[modelName + id].push({
                  method: event,
                  function: callback
                })
              };
              return JAILS.modelInstances[modelName + id];
            },
            update: function(data) {},
            delete: function(data) {},
            find: function(data) {},
            getModel: function(data) {
              var id = data.id;
              JAILS.modelInstances[modelName + id] = {
                id: id
              };

              JAILS.modelInstances[modelName + id].protectedMethods = JAILS.models[modelName].instanceMethods(JAILS.modelInstances[modelName + id]);
              JAILS.modelInstances[modelName + id].methods = {};

              var protectedMethodsList = Object.keys(JAILS.modelInstances[modelName + id].protectedMethods);
              protectedMethodsList.forEach(function(method) {
                JAILS.modelInstances[modelName + id].methods[method] = function(data) {
                  var request = {
                    method: 'updateModel',
                    data: {
                      model: modelName + id,
                      method: method,
                      data: data
                    }
                  };

                  JAILS.ws.send(JSON.stringify(request));
                };
              });
              // JAILS.modelInstances[modelName + id].properties = JAILS.models[modelName].instanceProperties; // setting default properties


              JAILS.modelInstances[modelName + id].properties = data.properties; // bottom overriding should be fixed sometime;
              // dataKeys.forEach(function(key) { // overwriting default properties with ones from data for create
              //   var keyValue = data[key];
              //   console.log('keys', JAILS.modelInstances[modelName + id], JAILS.index);
              //   JAILS.modelInstances[modelName + id].properties[key] = keyValue;
              // });
              // console.log('after cyc', JAILS.modelInstances[modelName + id].properties);
              // registering events
              JAILS.modelInstances[modelName + id].on = function(event, callback) {
                JAILS.events[modelName + id] = JAILS.events[modelName + id] || [];

                JAILS.events[modelName + id].push({
                  method: event,
                  function: callback
                })
              };
              return JAILS.modelInstances[modelName + id];
            }
          }
        },
        defaultKeys = Object.keys(defaults);

      // Exit if model already exists
      if (JAILS.models[modelName]) {
        console.warn('Model ' + modelName + ' already exists! Make sure you use unique names for models');
        return;
      }

      JAILS.models[modelName] = data;


      JAILS.models[modelName].protectedMethods = defaults(modelName);
      JAILS.models[modelName].methods = {};

      var protectedMethodsList = Object.keys(JAILS.models[modelName].protectedMethods);
      protectedMethodsList.forEach(function(method) {
        JAILS.models[modelName].methods[method] = function(data) {
          var request = {
            method: method,
            data: {
              model: modelName,
              data: data
            }
          };

          JAILS.ws.send(JSON.stringify(request));
        };
      });
      // defaultKeys.forEach(function(key) { // setting default Model methods;

      //   if (!JAILS.models[modelName].methods.hasOwnProperty(key)) { // no key in model methods, adding default;
      //     JAILS.models[modelName].methods[key] = defaults.key;
      //   } else {
      //     console.warn('Careful! Overwritten default method ' + key + ' for ' + modelName);
      //   }

      // });

      // Adding events
      JAILS.models[modelName].on = function(event, callback) {
        JAILS.events[modelName] = JAILS.events[modelName] || [];

        JAILS.events[modelName].push({
          method: event,
          function: callback
        })
      };

      return JAILS.models[modelName];

    };

    JAILS.loadModel = function(name) {
      return JAILS.registerModel(name, MODELS[name]); // MODELS object is set by backend;
    };

    // Global JAILS events
    JAILS.on = function(event, callback) {
      JAILS.events[event] = JAILS.events[event] || [];

      JAILS.events[event].push({
        function: callback
      });

    };

    JAILS.getIndex = function() {
      JAILS.socketPromise.then(function() {
        var request = {
          method: 'getIndex'
        };

        JAILS.ws.send(JSON.stringify(request));
      }).catch(e => {
        console.warn('socket fail!', e);
      });
    };

    JAILS.ws.onerror = function(e) {
      console.log('socket error', e);
    };

    JAILS.ws.onmessage = function(event) {
      log({message: 'came', event: event.data});
      var response = JSON.parse(event.data),
        method = response.method,
        data = response.data,
        serverData = response.serverData;

      if (method === 'updateModel') {
        var request = data,
          modelMethod = request.method,
          model = JAILS.modelInstances[request.model],
          modelData = request.data,
          events = JAILS.events[request.model] || [];

        log({serverData: serverData});

        if (!model) {
          return false; // This can come for other instance of Jail and model can be undefined
        }

        model.protectedMethods[modelMethod](modelData, serverData);

        events.forEach(function(event) {
          if (event.method == modelMethod) {
            event.function(modelData, serverData);
          }
        });
      }
      if (method === 'getModel') {
        var request = data,
          model = JAILS.models[request.model],
          modelData = request.data,
          events = JAILS.events[request.model] || [],
          modeLocalData;
        console.log('from get', request);
        model.data = modelData;

        modeLocalData = model.protectedMethods.getModel(modelData, serverData);

        events.forEach(function(event) {
          console.log('searching...', event.method);
          if (event.method == 'getModel') {
            console.log('found!');
            event.function(modeLocalData, serverData);
          }
        });

      }
      if (method === 'create') {
        var request = data,
          model = JAILS.models[request.model],
          modelServerData = request.data,
          properties = request.properties || {},
          events = JAILS.events[request.model] || [],
          modeLocalData;

          modeLocalData = model.protectedMethods.create({
            data: modelServerData.properties,
            id: modelServerData.id // Make sure we use ID from server in case of asynch create calls
          }); // creating new model
          console.log('model local data', JSON.stringify(modeLocalData));

        // TODO: check whether modelServerData and modeLocalData are even
        events.forEach(function(event) {
          if (event.method === 'create') {
            event.function(modeLocalData, serverData);
          }
        });

      }
      if (method === 'getIndex') {
        var request = data,
          index = request.index,
          user = request.user,
          events = JAILS.events.getIndex || [];

        JAILS.index = index;
        JAILS.user = user;

        events.forEach(function(event) {
          event.function(index);
        });

      }
    };

    JAILS.socketPromise = new Promise(function(resolve, reject) {
      JAILS.ws.onopen = resolve;
      JAILS.ws.onerror = reject;
    });

    return JAILS;
  };
})();

/*
    socket.onopen = function() {
      var request = {
        method: 'getModel',
        data: {
          model: 'CHAT'
        }
      };

      socket.send(JSON.stringify(request));

      request = {
        method: 'getModel',
        data: {
          model: 'TANK'
        }
      };

      socket.send(JSON.stringify(request));

    };
*/