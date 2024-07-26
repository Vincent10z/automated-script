# Puppeteer Script for Changing IPS Tags

## Overview

This script uses Puppeteer to automate the process of changing the IPS tags for a list of domains in eNom. The script logs in to eNom, navigates to the Domain Manager, searches for each domain, updates its IPS tag, and handles any dialogs that may appear.

## Features

- Automates the process of logging into eNom
- Searches for domains and changes their IPS tags
- Logs failed domains for later review

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Puppeteer](https://pptr.dev/) library or npm i puppeteer

## Installation

1. **Clone the Repository**

   ```sh
   git clone git@github.com:SalesforgeAI/automated-scripts.git
   ```
   
2. **Update the newIPSTag variable**

   Update the newIPSTag variable with the IPS tag you want to apply to the domains:
   ```sh
   const newIPSTag = '123-TAG';
   ```
3. **Configure Domain List**

   The list of domains to process is defined in the domains array. Add or remove domains as needed:
   ```sh
   const domains = [
     "domain1.com",
     "domain2.com",
     // Add more domains
   ];
   ```

## Usage

1. **Run the Script**

   ```sh
   node src/app.js
   ```
   
1. **Complete 2FA Manually**

   The script will prompt you to complete the 2FA process manually. Follow the instructions in the browser on eNom's login screen to enter the authentication code.

   Once you have completed the 2FA, press login on eNom.
   Navigate to your terminal, and press enter.
   Domains will begin processing in the background.

2. **Script will run automatically**

   The script will run automatically, displaying its process in the terminal

   If any errors are encountered, they will be logged

3. **Failed domains**

   If a domain fails, it will be added to the failed_domains.txt TXT file for investigation

   Typical issues is that the domain was not found, if this is the case they will be added to the TXT file
      
