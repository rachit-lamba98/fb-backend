#!/bin/bash
cd websites
read phoneNumber
mkdir "$phoneNumber"
cd "$phoneNumber"
git clone "https://github.com/swaraj961/Business_LandingPage.git"
cd Business_LandingPage
echo "$phoneNumber" >> database.txt
heroku create "cryptx-$phoneNumber"
git push heroku master
cd ..
cd ..
rm "$phoneNumber" -R

