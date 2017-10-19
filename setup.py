import setuptools

jcs = 'jcs'

setuptools.setup(name=jcs,
                 version='1.0.0',
                 description='Jupyter Console Standalone',
                 long_description='',
                 author='Tom Wiesing',
                 author_email='tom.wiesing@fau.de',
                 url='https://github.com/tkw1536/jupyter_console_standalone',
                 packages=[jcs],
                 install_requires=[],
                 license='MIT License',
                 zip_safe=False,
                 package_data={jcs: ['files/build/*.*', 'templates/*.html']},
                 classifiers=['Packages'])
