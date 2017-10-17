require('es6-promise/auto');
require('@jupyterlab/theme-light-extension/style/embed.css');
require('../index.css');

var CommandRegistry = require('@phosphor/commands').CommandRegistry;
var Widget = require('@phosphor/widgets').Widget;
var ConsolePanel = require('@jupyterlab/console').ConsolePanel;
var editorServices = require('@jupyterlab/codemirror').editorServices;
var rendermime = require('@jupyterlab/rendermime');
var ServiceManager = require('@jupyterlab/services').ServiceManager;

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


function main() {
    // TODO: Get kernel config
    var kernelPreference = {
        name: 'python3',
        language: 'python',
        shouldStart: true,
        canStart: true,
    };
    // TODO: Get state for kernel
    var initialState = 'a = 10\nb = 15';   // This is just a string to execute on kernel!

    var manager = new ServiceManager();
    var panel;
    manager.ready.then(function() {

        var options = setup(manager);
        console.log(options.name);
        options.kernelPreference = kernelPreference;
        panel = new ConsolePanel(options);
        setupCommands(panel);

        Widget.attach(panel, document.body);
        window.onresize = function() { panel.update(); };

        return panel.session.ready;

    }).then(function() {
        return panel.session.kernel.ready;
    }).then(function() {
        let content = {
            code: initialState,
            stop_on_error: false,
            silent: true,
        };
        var initialStateRequest = panel.session.kernel.requestExecute(content);

    });
}


window.onload = main;
