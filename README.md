# jupyter-console-standalone

This repository contains a standalone wrapper for the jupyter console. It consists of two components:

1. `jcs/files`: A single page generated using `webpack` that provides the Console UI
2. A `jupyter notebook server extension`

## Requirements

This repository requires `npm` to build and expects to be run within a `jupyter` notebook server. 

## Building the Javascript

Install and bundle the JavaScript sources using `npm` and the `webpack` package: 

```
    cd jcs/files
    npm install
    npm run build
```


### Installing & Enabling the Server extension

```
    python setup.py install
    
    jupyter serverextension enable --py jcs --sys-prefix
```

## Usage

After having built the sources, run:

```
    jupyter notebook
```

Then you can navigate to [http://localhost:8080/console/](http://localhost:8080/console/)
If you are running via JupyterHub you can instead go to [http://localhost:8080/user-redirect/console/](http://localhost:8080/user-redirect/console/)

This page takes the following `GET` parameters:

* `kernel`: The kernel the page should start, defaults to `python3`. 
* `language`: The language the given kernel should start, defaults to `python`. 
* `state`: An initial command to run on the server. 