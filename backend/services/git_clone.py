import os
import subprocess
from urllib.parse import urlparse
from pathlib import Path

from core.logging import server_log, server_error

# Base directory where all projects live
BASE_PROJECT_PATH = Path(__file__).parents[2] / "data" / "projects"


def extract_project_name_from_url(url: str) -> str:
    """
    Extract the repo name (without .git) from a Git URL.
    E.g. https://github.com/foo/bar.git → "bar"
    """
    parsed = urlparse(url)
    name = os.path.splitext(os.path.basename(parsed.path))[0]
    return name


def clone_repo(repo_url: str) -> str:
    """
    Clone the given repo into data/projects/{project_name}/repo.
    Returns the project name on success.
    Raises FileExistsError if destination already exists.
    Raises RuntimeError on git errors.
    """
    project_name = extract_project_name_from_url(repo_url)
    dest = BASE_PROJECT_PATH / project_name / "repo"

    if dest.exists():
        raise FileExistsError(f"Project '{project_name}' already exists on disk.")

    try:
        server_log(f"Cloning {repo_url} → {dest}")
        dest.parent.mkdir(parents=True, exist_ok=True)

        subprocess.run(
            ["git", "clone", repo_url, str(dest)],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        server_log("Clone succeeded")
        return project_name

    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode().strip()
        server_error("Git clone failed", stderr)
        raise RuntimeError(f"Git clone error: {stderr}")

    except Exception as e:
        server_error("Unexpected error during clone", e)
        raise


def is_project_cloned(repo_url: str) -> bool:
    """
    Return True if data/projects/{project_name}/repo already exists.
    """
    project_name = extract_project_name_from_url(repo_url)
    repo_path = BASE_PROJECT_PATH / project_name / "repo"
    return repo_path.exists()
