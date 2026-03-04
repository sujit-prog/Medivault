#!/bin/bash
cd medvault-backend
./mvnw clean package -DskipTests
java -jar target/*.jar
