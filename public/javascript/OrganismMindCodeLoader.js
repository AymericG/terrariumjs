var baseUrl = '/assets/';
importScripts(baseUrl + 'dependencies.js');

onmessage = function(e) { eval(e.data); };