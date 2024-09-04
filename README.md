<p align="center">
  <img src="https://github.com/user-attachments/assets/d1968468-41bd-432e-af7e-4b9843cc1172" alt="animated" />
</p>

<h1 align="center">🎬 Watch Party Website</h1>

This project provides a platform for enjoying movies with friends and family in perfect sync. If you’ve struggled to find a good, free service for synchronized movie watching, you’ve found the right place! 🎉

## 🚀 Motivation

This project was inspired by the challenge of finding a free, reliable way to watch movies synchronously with friends and family. Many existing services either lacked essential features or were not freely available. I aimed to build a solution that makes it easy to enjoy movies together, no matter where you are.

## ✨ Features

-   **Offline Movie Watching:** Watch movies from a local file with your friends. 🖥️
-   **Online Streaming:** Stream videos using a video file or m3u8 URL for a seamless online experience. 🌐
-   **Real-Time Chat:** Engage in real-time conversations with friends while watching. 💬
-   **Reaction Bar:** React to scenes with emojis, making the movie-watching experience more interactive. 😄😂😱
-   **Multiple Subtitles:** Support for multiple subtitles, available both offline and online, to accommodate different languages and preferences. 🗣️📜

## 🛠️ Tech Stack

-   **Node.js:** Manages server-side logic and backend operations. 🔧
-   **Socket.io:** Facilitates real-time communication and synchronization between users. 🔗
-   **Vue.js:** Handles the client-side interface, providing a responsive and user-friendly experience. 🎨

## 📂 Project Structure

-   **Root Directory:** Contains the frontend part of the application.
-   **`api` Directory:** Houses the backend code and server logic.

## 🌐 Live Demo

Invite your friends and come over to our live demo at https://party-streaming.ahmedsobhy.net! See the features in action and enjoy a movie night together!

## 🚧 Getting Started

Follow these steps to get the project up and running locally:

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/AhmedSobhy01/watch-party.git
    cd watch-party
    ```

2. **Create the .env File:**
   Copy the .env.example file to create a new .env file:

    ```bash
    cp .env.example .env
    ```

3. **Install Frontend Dependencies:**
   Navigate to the root directory and run:

    ```bash
    npm install
    ```

4. **Install Backend Dependencies:**
   Navigate to the `api` directory and run:

    ```bash
    cd api
    npm install
    ```

5. **Create the .env File:**
   Copy the .env.example file to create a new .env file:

    ```bash
    cp .env.example .env
    ```

6. **Start the Backend Server:**

    ```bash
    npm start
    ```

7. **Start the Frontend Application:**
   In another terminal, return to the root directory and run:

    ```bash
    npm run build
    npm start
    ```

8. **Open Your Browser:**
   Visit `http://localhost:3000` to start using the watch party website. 🍿

## ⚙️ Configuration

Customize settings such as server port and other environment variables in the `.env` file. Refer to the `.env.example` file for guidance on setting up your environment.

## 📜 License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.
