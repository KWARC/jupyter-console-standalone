require('es6-promise/auto');
require('@jupyterlab/theme-light-extension/style/embed.css');
require('../index.css');

var CommandRegistry = require('@phosphor/commands').CommandRegistry;
var Widget = require('@phosphor/widgets').Widget;
var ConsolePanel = require('@jupyterlab/console').ConsolePanel;
var editorServices = require('@jupyterlab/codemirror').editorServices;
var rendermime = require('@jupyterlab/rendermime');
var ServiceManager = require('@jupyterlab/services').ServiceManager
var ServerConnection = require('@jupyterlab/services/lib/serverconnection').ServerConnection;


var uuid = require('@jupyterlab/coreutils').uuid;


function setup(manager) {

    var rm = new rendermime.RenderMime({
        initialFactories: rendermime.defaultRendererFactories});

    var editorFactory = editorServices.factoryService.newInlineEditor.bind(
        editorServices.factoryService);
    var contentFactory = new ConsolePanel.ContentFactory({ editorFactory });

    var options = {
        rendermime: rm,
        manager: manager,
        path: uuid(),
        contentFactory,
        mimeTypeService: editorServices.mimeTypeService,
    };
    return options;
}

function setupCommands(consolePanel) {
    // Initialize the command registry with the key bindings.
    var commands = new CommandRegistry();

    // Setup the keydown listener for the document.
    document.addEventListener('keydown', function(event) {
        commands.processKeydownEvent(event);
    });

    var selector = '.jp-ConsolePanel';

    command = 'console:execute';
    commands.addCommand(command, {
        label: 'Execute Prompt',
        execute: function() { consolePanel.console.execute(); }
    });
    commands.addKeyBinding({ command, selector, keys: ['Enter'] });

    command = 'console:execute-forced';
    commands.addCommand(command, {
        label: 'Execute Cell (forced)',
        execute: function() { consolePanel.console.execute(true); }
    });
    commands.addKeyBinding({ command, selector, keys: ['Shift Enter'] });

    command = 'console:linebreak';
    commands.addCommand(command, {
        label: 'Insert Line Break',
        execute: function() { consolePanel.console.insertLinebreak(); }
    });
    commands.addKeyBinding({ command, selector, keys: ['Ctrl Enter'] });

    return commands;
}

/**
 * Gets a query parameter from the current page url
 * @param {string} param Parameter to extract
 * @param {*} def Default value should the parameter be missing
 */
function $_GET(param, def){
    var vars = {};
    window.location.href.replace( location.hash, '' ).replace(
      /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
      function( m, key, value ) { // callback
        vars[key] = value !== undefined ? value : '';
      }
    );

    return vars[param] ? decodeURIComponent(vars[param]) : (def || null);
  }

var DEFAULT_KERNEL_NAME = 'python3'; // the default kernel to fall back to
var DEFAULT_LANGUAGE_NAME = 'python'; // the name of the language to use
var DEFAULT_INITIAL_STATE = ''; // the name of the initial state

function get_config(key){
    return JSON.parse(document.getElementById('config_data').innerHTML)[key];
}

function main() {
    var language = $_GET('language', DEFAULT_LANGUAGE_NAME);

    var kernelPreference = {
        name: $_GET('kernel', DEFAULT_KERNEL_NAME),
        language: language,
        shouldStart: true,
        canStart: true,
    };

    // The initial state: A string to execute in the kernel
    var initialState = $_GET('state', '');

    var baseURL = location.protocol + '//' + location.host + '/' + get_config("base_url");

    // Set up Jupyterlab manager
    var manager = new ServiceManager({'serverSettings': ServerConnection.makeSettings({'baseUrl': baseURL})});
    var panel;
    manager.ready.then(function() {

        // Setup the jupyterlab components we need:
        var options = setup(manager);
        options.kernelPreference = kernelPreference;

        // Create the console:
        panel = new ConsolePanel(options);

        // Register keyboard shortcuts with panel:
        setupCommands(panel);

        // Attach console to document
        document.body.innerHTML = '';
        Widget.attach(panel, document.body);
        window.onresize = function() { panel.update(); };

        // Wait for session and kernel to be ready
        return panel.session.ready;
    }).then(function() {
        return panel.session.kernel.ready;
    }).then(function() {

        // Configure clean-up of kernel:
        var onBeforeUnLoadEvent = false;
        window.onunload = window.onbeforeunload = function() {
            if(!onBeforeUnLoadEvent){
                onBeforeUnLoadEvent = true;
                panel.session.shutdown();
            }
        };

        // Pass initial state to kernel:
        let content = {
            code: initialState,
            stop_on_error: false,
            silent: true,
        };
        var initialStateRequest = panel.session.kernel.requestExecute(content);

    });
}


window.onload = main;
