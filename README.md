# jupyter-console-standalone

This repository contains a standalone wrapper for the jupyter console. 

## Requirements

This repository requires `npm` to build and expects to be run within a `jupyter` notebook server. 

## Building

Install and bundle the JavaScript sources using `npm` and the `webpack` package: 

```
    npm install
    npm run build
```

## Usage

After having built the sources, run:

```
    jupyter notebook
```

Then you can navigate to [http://localhost:8080/files/index.html]([http://localhost:8080/files/index.html])
This page takes the following `GET` parameters:

* `kernel`: The kernel the page should start, defaults to `python3`. 
* `language`: The language the given kernel should start, defaults to `python`. 
* `state`: An initial command to run on the server. 