importScripts("SDK/libs/Class.js");
importScripts("SDK/Actions/Action.js");
importScripts("SDK/Actions/AttackAction.js");
importScripts("SDK/Actions/DefendAction.js");
importScripts("SDK/Actions/EatAction.js");
importScripts("SDK/Actions/MoveToAction.js");
importScripts("SDK/Actions/PendingActions.js");
importScripts("SDK/Actions/ReproduceAction.js");
importScripts("SDK/Enums.js");
importScripts("SDK/Exceptions.js");
importScripts("SDK/EngineSettings.js");
importScripts("SDK/Anatomy/Species.js");
importScripts("SDK/Anatomy/MindNerve.js");
importScripts("SDK/Anatomy/OrganismState.js");
importScripts("SDK/Anatomy/AnimalState.js");
importScripts("Anatomy/PlantState.js");
importScripts("SDK/Anatomy/OrganismMind.js");
importScripts("SDK/Anatomy/AnimalMind.js");
importScripts("SDK/Geometry/MathUtils.js");
importScripts("SDK/Geometry/MovementVector.js");
importScripts("SDK/Geometry/Point.js");
importScripts("SDK/Geometry/Rectangle.js");

onmessage = function(e) { eval(e.data); };