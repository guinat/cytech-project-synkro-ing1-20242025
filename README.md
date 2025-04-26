<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]

<br />
<div align="center">
  <a href="https://github.com/guinat/cytech-project-synkro-ing1-20242025">
    <img src="client/public/synkro.svg" alt="Synkro Logo" width="80" height="80" />
  </a>

  <h3 align="center">Synkro</h3>

  <p align="center">
    TODO:
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

TODO:

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

TODO: 

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