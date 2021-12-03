# Find My House

Find My House is an apartment finder,
which features the service of
calculating commuting time by public
transport, and helps commuters find the
ideal apartment.

Website URL: https://find-my-house.site

![Preview](./public/assets/readme/preview.jpeg)
---

## Table of Contents
* [Technologies](#Technologies)
* [Architecture](#Architecture)
* [Database Schema](#Database-Schema)
* [Data Pipeline](#Database-Pipeline)
* [Features](#Features)
* [Demo Account](#Demo-Account)
* [Contact](#Contact)

## Technologies
### Back-End
* Node.js / Express
* RESTful API
* Nginx

### Front-End
* HTML
* CSS
* JavaScript
* jQuery
* Bootstrap
* AJAX

### Data Pipeline
* crawler
* crontab

### DevOps
*  Docker

### Database
* MySQL
* MongoDB

### Design Pattern
* MVC

### Data Structures
* Directional Graph
* Priority Queue with Binary Heap

### Algorithm
* Dijkstra Algorithm

### Cloud Service (AWS)
* Elastic Compute Cloud (EC2)
* Relational Database Service (RDS)
* Elasticache for Redis

### Networking
* HTTPS
* SSL
* Domain Name System (DNS)

### Test
* Mocha

### Data Source
* [Public Transport Data Exchange Platform](https://ptx.transportdata.tw)
* [591 offical website](https://rent.591.com.tw/)

## Architecture
![Architecture](./public/assets/readme/architecture.jpg)

## Database Schema
![Database Schema](./public/assets/readme/schema.png)

## Data Pipeline

## Features
### Apartment Searching
Drag the pin to set the office location.
Modify the options to fit the user's need.
  * Time Period:
    * The time period user commutes
  * Commute Time:
    * The commute time expected to spend from the
  * Transit Mode
    * Supported transits:
	     1. Taipei Metro system
	     2. Bus network of Greater Taipei Area
  * Number of Transfers
    * The specified number of transfers between different routes or different transits.
  * Maximum Walking Distance
    * The maximum distance commuters willing to walk, including the following:
	     1. from the apartment to the first transit station
       2. walking distance during transfer  
	     3. from the last transit station to office
  * House Type
    * Three diffent house type available, including ndependant suite, shared suite and studio
  * Budget
    * The budget of renting an apartment per month
  * Other Preference
    * Check boxes for preference such as equipped for cooking, keeping pets and short-term rental


![Apartment Searching](./public/assets/readme/reachable_area.gif)
 
### House Info
  * basic house info
  * life function nearby
  * Favorite houses

![House Info](./public/assets/readme/place_info.gif)

## Demo Account
  * Account: demo@demo.com
  * Password: demo

## Contact
Gideon Pan @ s00971052s@gmail.com