# Dynamic Image Processing Service

This project implements a dynamic image processing service using Node.js and Express. The service is designed to manage a collection of image files stored locally, allowing users to request images at various resolutions through HTTP endpoints. It offers on-the-fly image resizing, caching to improve performance, and insights into usage and response statistics.

### Prerequisites:

Before installing and running the dynamic image processing service, ensure you have the following prerequisites:

1. **Node.js**: Make sure you have Node.js installed on your system. You can download and install Node.js from the official website: [Node.js Downloads](https://nodejs.org/en/download/).
2. **npm (Node Package Manager)**: npm comes bundled with Node.js installation. However, ensure that you have npm installed and available in your command-line environment.
4. **Docker (optional)**: If you plan to use Docker for containerization and deployment, ensure that Docker is installed on your system. You can download and install Docker Desktop from the official website: [Docker Desktop](https://www.docker.com/products/docker-desktop).
5. **Redis (optional)**: If you plan to run the project using Redis, ensure that Redis is installed and running on your system. You can install Redis via package managers like apt, brew, or by downloading from the official website: [Redis Downloads](https://redis.io/download). Without using docker, you will have to start and connect the Redis server yourself.


### Installing Node.js:

#### Windows:

1. **Download Installer:**
   - Go to the official Node.js website: [Node.js Downloads](https://nodejs.org/en/download/).
   - Download the Windows Installer (.msi) for your system architecture (32-bit or 64-bit).

2. **Run Installer:**
   - Double-click the downloaded .msi file to start the installation process.
   - Follow the prompts in the installation wizard.
   - Accept the license agreement and choose the installation directory.
   - Click "Next" and then "Install" to begin the installation.
   - Once the installation is complete, click "Finish" to exit the wizard.

3. **Verify Installation:**
   - Open Command Prompt (cmd.exe).
   - Run the following command to check if Node.js and npm are installed:
     ```
     node -v
     npm -v
     ```

#### Linux (Ubuntu/Debian):

1. **Install using Package Manager:**
   - Open Terminal.
   - Update the package index:
     ```
     sudo apt update
     ```
   - Install Node.js and npm:
     ```
     sudo apt install nodejs npm
     ```

2. **Verify Installation:**
   - After installation, you can verify Node.js and npm versions by running:
     ```
     node -v
     npm -v
     ```

### Installing Docker:

#### Windows:

1. **Download Installer:**
   - Go to the official Docker website: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop).
   - Download the Docker Desktop for Windows installer.

2. **Run Installer:**
   - Double-click the downloaded installer to start the installation process.
   - Follow the prompts in the installation wizard.
   - During installation, you may be prompted to enable Hyper-V and Containers features. Allow them if prompted.
   - Once the installation is complete, Docker Desktop will launch automatically.

3. **Verify Installation:**
   - Open Command Prompt or PowerShell.
   - Run the following command to verify Docker installation:
     ```
     docker --version
     ```

#### Linux (Ubuntu/Debian):

1. **Download Repository Key:**
   - Open Terminal.
   - Download Docker's official GPG key:
     ```
     curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
     ```

2. **Add Docker Repository:**
   - Add the Docker repository to APT sources:
     ```
     sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
     ```

3. **Install Docker Engine:**
   - Update the package index:
     ```
     sudo apt update
     ```
   - Install Docker Engine:
     ```
     sudo apt install docker-ce
     ```

4. **Verify Installation:**
   - After installation, verify that Docker Engine is installed correctly:
     ```
     sudo systemctl status docker
     ```

## Installing and using the project

### Installation:

1. **Clone the Repository:**
   - Clone the project repository from GitHub using Git:
     ```bash
     git clone https://github.com/bogdanhatisi/image-processing.git
     ```

2. **Navigate to Project Directory:**
   - Change directory to the project directory:
     ```bash
     cd image-processing
     ```

3. **Install Dependencies:**
   - Install project dependencies using npm:
     ```bash
     npm install
     ```

5. **Start the service:**
   - Use docker to start both the Redis server and the backend:
     ```bash
     docker-compose up -d
     ```

6. **Access the Service:**
   - Once the server is running, you can access the service through HTTP endpoints as specified in the Usage section of the README.md file.

## Usage:

1. **Endpoints:**
   - The service exposes the following endpoints:
     - `/images/:filename`: Retrieves the original image.
     - `/images/:filename?resolution=<width>x<height>`: Retrieves the image resized to the specified resolution.
     - `/stats/usage-stats`: Retrieves the service usage stats.
     - `/stats/response-stats`: Retrieves the service response stats.


### Examples of requests/responses
1a. **Example Request to resize an image:**
   - Example HTTP request to resize an image:
     ```http
     GET /images/netflix.jpg?resolution=1920x1080 
     Host: http://localhost:3000
     ```

1b. **Example Response for existing image:**
   - Example HTTP response:
     ```json
     {
       "status": "200 OK",
       "headers": {
         "Connection": "keep-alive",
         "Content-Length": "88431",
          "Content-Type": "image/jpg",
         ...
       }
     }
     ```
1c. **Example Response for missing image:**
   - Example HTTP response:
     ```json
     {
       "status": "404 Not Found",
       "headers": {
          "Content-Type": "text/html",
         ...
       },  
        "body":{
         Image not found
       }
     }
     ```     
     
2a. **Example Request to get usage stats:**
   - Example HTTP request to get the service usage stats:
     ```http
     GET /stats/usage-stats 
     Host: http://localhost:3000
     ```

2b. **Example Response:**
   - Example HTTP response:
     ```json
     {
       "status": "200 OK",
       "headers": {
          "Content-Type": "application/json",
         ...
       },
       "body":{
          "totalOriginalImages": 7,
          "imagesResizedCount": "6",
          "cacheHitRatio": "64.71%",
          "cacheMissRatio": "35.29%"
       }
     }
     ```
     
3a. **Example Request to get response stats:**
   - Example HTTP request to get the service response stats:
     ```http
     GET /stats/response-stats 
     Host: http://localhost:3000
     ```

3b. **Example Response:**
   - Example HTTP response:
     ```json
     {
       "status": "200 OK",
       "headers": {
          "Content-Type": "application/json",
         ...
       },
       "body":{
          "averageResponseTime": "46.94 ms",
          "successfulResponses": "17",
          "errorResponses": "0",
          "totalResponses": 17,
          "errorRate": "0.00%"
       }
     }
     ```

### Testing:

- To run the tests with coverage, execute the following command:
  ```bash
  npx jest --coverage
![image](https://github.com/bogdanhatisi/image-processing/assets/62288167/115b714a-ccc0-49d6-b940-cf985023a3a8)

<h1>Thank you for viewing the project, I hope you found it interesting! 😊</h1>
