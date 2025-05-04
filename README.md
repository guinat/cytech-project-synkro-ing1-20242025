<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]

<br />
<div align="center">
  <a href="https://github.com/guinat/cytech-project-synkro-ing1-20242025">
    <img src="client/public/synkro.svg" alt="Synkro Logo" width="80" height="80" />
  </a>

  <h3 align="center">Synkro</h3>

  <p align="center">
    <br />
    <a href="https://github.com/guinat/cytech-project-synkro-ing1-20242025"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/guinat/cytech-project-synkro-ing1-20242025">View Demo</a>
    ·
    <a href="https://github.com/guinat/cytech-project-synkro-ing1-20242025/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/guinat/cytech-project-synkro-ing1-20242025/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>


<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributors">Contributors</a></li>
  </ol>
</details>


## About The Project

This project was developed as part of a web development course.
It was carried out by a team of 5 students.

The goal of the project is to build a smart digital platform that integrates various services and functionalities for people living in a connected home.
It combines device management, real-time monitoring, user collaboration, gamification, and data export features.

You can find the full project instructions in the repository.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

* [![Django][Django]][Django-url]
* [![Vite][Vite]][Vite-url]
* [![React][React.js]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Getting Started

Follow the steps below to run Synkro locally for development and testing purposes.

### Prerequisites

| Requirement | Minimum Version | Check Command |
|-------------|-----------------|---------------|
| [Python](https://www.python.org/downloads/release/python-3120/) | **3.12** | `python --version` |
| [Node / npm](https://nodejs.org/en/download) | **20.19.1** | `node --version && npm --version` |
| [uv](https://github.com/astral-sh/uv#installation) (optional) | latest | `uv --version` |

> **Tip · Linux users:** If `python --version` prints **2.x** or you receive a "command not found" error for `pip`, use `python3` / `pip3` instead. The commands below show both variants.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/guinat/cytech-project-synkro-ing1-20242025.git
   cd cytech-project-synkro-ing1-20242025
   ```
2. Open **two terminals**—one for the **server** and one for the **client**.

---

#### Server · Terminal 1
```bash
cd server   # path: <repo_root>/server
```
Choose **one** of the following setups:

<details>
<summary><strong>Option A · uv (recommended)</strong></summary>

```bash
# create & activate a virtual environment
uv venv
#  Windows
.\.venv\Scripts\activate
#  Linux/macOS
source ./.venv/bin/activate

# apply database migrations & create admin user
uv run manage.py migrate
uv run manage.py createsuperuser

# start the development server
uv run manage.py runserver
```
</details>

<details>
<summary><strong>Option B · classic pip / venv</strong></summary>

```bash
# create a virtual environment
#  Windows
python -m venv .venv
#  Linux/macOS (add the "3" if required)
python3 -m venv .venv

# activate the environment
#  Windows
.\.venv\Scripts\activate
#  Linux/macOS
source ./.venv/bin/activate

# install dependencies
#  Windows
pip install -r requirements.txt
#  Linux/macOS (add the "3" if required)
pip3 install -r requirements.txt

# apply migrations & create admin user
python manage.py migrate      # or python3 manage.py migrate
python manage.py createsuperuser

# start the development server
python manage.py runserver    # or python3 manage.py runserver
```
</details>

When you see `Starting development server at http://127.0.0.1:8000/` the backend is up and ready.

---

#### Client · Terminal 2

```bash
cd client   # path: <repo_root>/client
npm install  # install frontend dependencies
npm run dev  # start Vite development server
```

Open your browser at <http://localhost:5173> to access the React app.



## Usage

Synkro is a smart home management web application designed to give users full control over their connected devices in a structured and collaborative environment. Here's how you can use the application.

### 🏠 Home and Room Management
- **Create a Home**: Each user can be part of one to three virtual homes within the platform, either by creating them or by joining existing ones.
- **Add Rooms**: Inside a home, users can define various rooms (e.g., living room, kitchen, bedroom).
- **Add Devices**: Within each room, users can add a wide variety of smart devices such as TVs, speakers, ovens, washing machine, and more.

### 👥 User Collaboration
- **Invite Users**: Home owners can invite other users to join their home.
- **Shared Control**: Invited users gain control over all devices within the shared home.

### ⚡ Device Monitoring and Consumption
- **Live Consumption**: The real-time energy consumption of each device is displayed.
- **Total Consumption**: Users can also view the cumulative energy usage of devices since they were added.

### 📊 Statistics and Exporting
- **Graphical Insights**: Synkro presents a detailed graph showing the evolution of energy consumption across different devices over time.
- **Data Export**:
  - Export global consumption data in **CSV** or **PDF** formats.
  - Export individual device consumption history in a **TXT** file.

### 🎯 Gamification and Points System
- **Earn Points**: Users earn points by performing actions within the application, such as creating devices or simply logging in.
- **Unlock Features**: Certain features are accessible only after reaching specific point thresholds, encouraging user engagement and discovery.

### 🔐 Account and Access
- **Free Tour**: Users can explore the available device catalog without signing up.
- **Registration and Login**: To fully access all functionalities, users must create an account and log in.
- **Email Verification**: Upon registration, a verification link is sent to the user to activate the account.

### 🛠️ Admin Panel
- **Administration Tools**: An admin module allows administrators to manage users and maintain the system's overall configuration and health.

### Contributors

<a href="https://github.com/guinat/cytech-project-synkro-ing1-20242025/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=guinat/cytech-project-synkro-ing1-20242025" alt="Contributors graph" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>


[contributors-shield]: https://img.shields.io/github/contributors/guinat/cytech-project-synkro-ing1-20242025.svg?style=for-the-badge
[contributors-url]: https://github.com/guinat/cytech-project-synkro-ing1-20242025/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/guinat/cytech-project-synkro-ing1-20242025.svg?style=for-the-badge
[forks-url]: https://github.com/guinat/cytech-project-synkro-ing1-20242025/network/members
[stars-shield]: https://img.shields.io/github/stars/guinat/cytech-project-synkro-ing1-20242025.svg?style=for-the-badge
[stars-url]: https://github.com/guinat/cytech-project-synkro-ing1-20242025/stargazers
[issues-shield]: https://img.shields.io/github/issues/guinat/cytech-project-synkro-ing1-20242025.svg?style=for-the-badge
[issues-url]: https://github.com/guinat/cytech-project-synkro-ing1-20242025/issues
[Django]: https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white
[Django-url]: https://www.djangoproject.com
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://typescriptlang.org
