//= require SDK/libs/Class
//= require_directory ./SDK/Actions
//= require ./SDK/Enums
//= require ./SDK/Exceptions
//= require ./SDK/EngineSettings
//= require SDK/Anatomy/Species
//= require SDK/Anatomy/MindNerve
//= require SDK/Anatomy/OrganismState
//= require SDK/Anatomy/AnimalState
//= require Anatomy/PlantState
//= require SDK/Anatomy/OrganismMind
//= require SDK/Anatomy/AnimalMind
//= require_directory ./SDK/Geometry

onmessage = function(e) { eval(e.data); };