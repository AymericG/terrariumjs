//= require libs/Class
//= require_directory ./Actions
//= require_directory ./Enums
//= require_directory ./Framework
//= require Anatomy/Species
//= require Anatomy/MindNerve
//= require Anatomy/OrganismState
//= require Anatomy/AnimalState
//= require Anatomy/PlantState
//= require Anatomy/OrganismMind
//= require Anatomy/AnimalMind
//= require GameEngine/EngineSettings
//= require GameEngine/World
//= require_directory ./Geometry

onmessage = function(e) { eval(e.data); };