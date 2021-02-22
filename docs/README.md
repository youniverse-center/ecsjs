# ECSJs

The Entity Component System for JavaScript. Crafted with Typescript in mind.

## The registry

Registry is the hearth of this system. It keeps track what entites have what components.
With registry you create entities and add components to them. You also query for so called views,
what will return list of entites having a set of required and optional components you are interested in.

## Entity

Entity in the ECS is a identity represent by number. In this library you will see an Entity class.
This is a simple wrapper class that siplifies interaction with the registry.

## Component

Component on the other hand is a simple data structure nothing more, nothing less.
Any component can be added to any entity.

## System

System is your logic. You chould build them in a way you want.
What you will use in this code is probably the view returned by the registry.

## Instalation

```bash
npm install @youniverse-center/ecsjs
```
