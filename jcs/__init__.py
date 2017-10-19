import os

from tornado import web
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from notebook.notebookapp import NotebookApp

base_path = os.path.dirname(__file__)
template_path = os.path.join(base_path, 'templates')
static_path = os.path.join(base_path, 'files', 'build')


class JupyterConsoleStandaloneHandler(IPythonHandler):
    @web.authenticated
    def get(self, *args, **kwwargs):
        html = self.render_template('console.html',
                                    config_data={'base_url': self.base_url})
        self.write(html)


def _jupyter_server_extension_paths():
    return [
        {'module': 'jcs'}
    ]


def load_jupyter_server_extension(nb_server_app: NotebookApp):
    web_app = nb_server_app.web_app

    env = web_app.settings['jinja2_env']
    if hasattr(env.loader, 'loaders'):
        loaders = env.loader.loaders
    else:
        loaders = [env.loader]

    for loader in loaders:
        if hasattr(loader, 'searchpath'):
            loader.searchpath.append(template_path)
    web_app.settings['template_path'].append(template_path)

    web_app.settings['static_path'].append(static_path)

    base_url = web_app.settings.get('base_url', '/')
    handlers = [
        (url_path_join(base_url, '/console/'), JupyterConsoleStandaloneHandler,
         {})
    ]

    web_app.add_handlers('.*$', handlers)
