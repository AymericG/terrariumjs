var baseUrl = '/terrarium/js/';
importScripts(baseUrl + 'Dependencies.js');

onmessage = function(e) { eval(e.data); };