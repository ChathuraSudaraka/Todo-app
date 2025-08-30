
# Todo Application (Full Stack)

This repository contains a full-stack Todo Application with a Java/Hibernate backend and a React Native (Expo) frontend.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Backend Setup (Java/Hibernate)](#backend-setup-javahibernate)
- [Frontend Setup (React Native/Expo)](#frontend-setup-react-nativeexpo)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)

---

## Features
- User authentication (signup/login)
- Create, update, delete, and search todos
- Organize todos by categories
- Light/Dark theme toggle (frontend)
- Responsive mobile UI (Expo/React Native)
- RESTful API (Java Servlets, Hibernate ORM)

---

## Technologies Used

- Java 8
- Hibernate 4.3.1
- MySQL 8.4.0
- Apache Tomcat (Servlet Container)
- Maven/Ant for build management


## Project Structure

```
Todo-app/
├── Backend/           # Java backend (Servlets, Hibernate, Ant)
│   ├── src/           # Java source code
│   ├── web/           # Web resources (WEB-INF, web.xml)
│   ├── lib/           # JAR dependencies
│   └── build.xml      # Ant build file
├── Frontend/          # React Native (Expo) mobile app
│   ├── App.js         # Main app entry
│   ├── components/    # Screens & UI components
│   ├── contexts/      # Theme context
│   ├── utils/         # API base resolver
│   ├── database.sql   # Database schema (for backend)
│   └── package.json   # NPM dependencies
└── README.md          # This file
```

---


## Backend Setup (Java/Hibernate)

### 1. Database Setup
1. Install MySQL Server
2. Create the database using the provided SQL script:
   ```sql
   -- Run the contents of Frontend/database.sql
   ```
3. Update the database connection settings in `Backend/src/java/hibernate.cfg.xml`:
   ```xml
   <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/todo_app</property>
   <property name="hibernate.connection.username">your_username</property>
   <property name="hibernate.connection.password">your_password</property>
   ```

### 2. Build the Backend
#### Using Ant (Recommended)
```sh
cd Backend
ant clean
ant compile
ant dist
```

#### Manual Compilation
```sh
# Compile Java files
javac -cp "lib/*" -d build/classes src/java/**/*.java
# Create WAR file
jar -cvf Backend.war -C web .
```

### 3. Deploy to Tomcat
1. Copy the generated WAR file to Tomcat's `webapps` directory
2. Start Tomcat server
3. Access: [http://localhost:8080/Backend/](http://localhost:8080/Backend/)

---

## Frontend Setup (React Native/Expo)

### 1. Prerequisites
- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### 2. Install Dependencies
```sh
cd Frontend
npm install
```

### 3. Start the App
```sh
npm start
# or
expo start
```
Scan the QR code with Expo Go (iOS/Android) or run on web with `w`.

---

3. Update the database connection settings in `src/java/resources/hibernate.cfg.xml`:
   ```xml
   <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/todo_app</property>
   <property name="hibernate.connection.username">your_username</property>
   <property name="hibernate.connection.password">your_password</property>
   ```

### 2. Build the Project

#### Using Ant (Recommended)
```bash
ant clean
ant compile
ant dist
```

#### Manual Compilation
```bash
# Compile Java files
javac -cp "lib/*" -d build/classes src/java/com/todoapp/**/*.java

# Create WAR file
jar -cvf Backend.war -C web .
```

### 3. Deploy to Tomcat

1. Copy the generated WAR file to Tomcat's webapps directory
2. Start Tomcat server
3. Access the application at: `http://localhost:8080/Backend/`


## API Endpoints (Backend)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `POST /api/users/auth` - Authenticate user (login)

### Todos
- `GET /api/todos` - Get all todos
- `GET /api/todos?userId={id}` - Get todos by user ID
- `GET /api/todos?completed={true/false}` - Get todos by completion status
- `GET /api/todos/{id}` - Get todo by ID
- `POST /api/todos` - Create new todo (form: title, description, userId)

---


## Database Schema

See [`Frontend/database.sql`](Frontend/database.sql) for full schema. Main tables:
- **users**: User accounts
- **categories**: Todo categories
- **todos**: Todo items

---

## Troubleshooting
1. **Database Connection Issues**: Verify MySQL is running and credentials are correct
2. **Compilation Errors**: Ensure all JAR dependencies are in the Backend/lib folder
3. **Servlet Not Found**: Check that the WAR file deployed correctly to Tomcat
4. **CORS Issues**: Verify the CORS filter is properly configured in web.xml
5. **Frontend API Errors**: Ensure backend is running and API_BASE in `Frontend/utils/api.js` is correct for your device

---

## Credits
- Backend: Java, Hibernate, MySQL
- Frontend: React Native, Expo, AsyncStorage, React Navigation

---

## License
MIT
