# Use Maven/Java 17 image to build
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy the entire backend folder into the build context
COPY medvault-backend /app/medvault-backend

# Set workdir to the backend project for building
WORKDIR /app/medvault-backend

# Give execute permission to mvnw
RUN chmod +x mvnw

# Build the project
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the jar file
CMD ["sh", "-c", "java -jar target/*.jar"]
