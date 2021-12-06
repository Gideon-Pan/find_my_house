# Find My House

Find My House is an apartment finder,
which features the service of
calculating commuting time by public
transport, and helps commuters find the
ideal apartment.

## Demo Account
Website URL: https://find-my-house.site

Demo Account
- Account: demo@demo.com
- Password: demo

## ![Preview](./public/assets/readme/preview.jpeg)




## Table of Contents

- [Demo Account](#Demo-Account)
- [Features](#Features)
- [Architecture](#Architecture)
- [Database Schema](#Database-Schema)
- [Technologies](#Technologies)
- [Contact](#Contact)



## Features

### Apartment Searching

Drag the pin to set the office location.
Modify the options to fit the user's need.

- Time Period:
  - The time period user commutes
- Commute Time:
  - The commute time expected to spend every day
- Transit Mode
  - Supported transits:
    1. Taipei Metro system
    2. Bus network of Greater Taipei Area
- Maximum Walking Distance
  - The maximum distance commuters willing to walk, including the following:
    1. from the apartment to the first transit station
    2. walking distance during transfer
    3. from the last transit station to office
- House Type
- Budget
- Other Preference


![Apartment Searching](./public/assets/readme/search.gif)

### House Info

- Basic House Info
- Life Function Nearby

![House Info](./public/assets/readme/detail.gif)

### Favorite Houses

![Favorite House](./public/assets/readme/favorite.gif)


## Architecture

![Architecture](./public/assets/readme/structure.jpg)

## Database Schema

![Database Schema](./public/assets/readme/schema.png)

## Technologies

### Back-End

- Node.js / Express
- RESTful APIs

### Front-End

- HTML
- CSS
- JavaScript
- jQuery
- Bootstrap
- AJAX

### Data Pipeline

- Crawler with Python
- Crontab

### Database

- MySQL
- MongoDB

### Data Structures

- Directional Graph
- Priority Queue with Binary Heap

### Algorithm

- Dijkstra Algorithm

### Cloud Service (AWS)

- Elastic Compute Cloud (EC2)
- Relational Database Service (RDS)
- Elasticache for Redis

### Third Party APIs

- Google Maps APIs (DrawingManager)
- Public Transport Data Exchange (PTX)

### Networking

- HTTPS
- SSL
- Domain Name System (DNS)
- Nginx

### Test

- Mocha

### Others

- Design Pattern: MVC
- Version Control: Git, GitHub
- Agile: Trello (Scrum)
- Linter: Prettier

### Data Source

- [Public Transport Data Exchange Platform](https://ptx.transportdata.tw)
- [https://rent.591.com.tw](https://rent.591.com.tw/)





## Contact

Gideon Pan @ s00971052s@gmail.com
